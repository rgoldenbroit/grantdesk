// Research Office API: the customer's "existing system" that stays on Google Cloud.
// It owns lab, grant, and draft records. GrantDesk on Vercel calls it across the boundary.
import express from "express";
import { Firestore } from "@google-cloud/firestore";
import { createRemoteJWKSet, jwtVerify } from "jose";

const TEAM = process.env.VERCEL_TEAM_SLUG; // e.g. "russ-sa-demo"
const PROJECT = process.env.VERCEL_PROJECT ?? "grantdesk";
// DECISION: Team issuer mode by default; set VERCEL_ISSUER to https://oidc.vercel.com for Global mode.
const ISSUER = process.env.VERCEL_ISSUER ?? `https://oidc.vercel.com/${TEAM}`;
const AUDIENCE = process.env.VERCEL_AUDIENCE ?? `https://vercel.com/${TEAM}`;
// DECISION: demo accepts all three Vercel environments so local dev and previews work.
// Production would accept only "production".
const ALLOWED_ENVS = (process.env.ALLOWED_ENVS ?? "production").split("|");

// DECISION: a dedicated named database keeps demo records apart from anything else in the project.
const db = new Firestore({ databaseId: process.env.FIRESTORE_DATABASE ?? "(default)" });
const app = express();
app.use(express.json({ limit: "200kb" }));

// ---- Seed data (fictional). Written once, on first start, if the labs collection is empty.
const SEED_LABS = [
  { id: "protein-design", name: "Protein Design Lab", pi: "Dr. Maya Chen", department: "Chemistry",
    focus: "computational design of enzymes that break down PET plastic" },
  { id: "neuro-imaging", name: "Neuro Imaging Lab", pi: "Dr. Samuel Okafor", department: "Neuroscience",
    focus: "MRI biomarkers for early detection of Alzheimer's disease" },
];
const SEED_GRANTS = [
  { id: "R01-GM-0421", labId: "protein-design", title: "Engineering thermostable PET hydrolases",
    sponsor: "NIH NIGMS", mechanism: "R01", status: "Resubmission in progress", nextDeadline: "2027-02-05" },
  { id: "R21-GM-0388", labId: "protein-design", title: "Machine-learned stability scoring for enzyme variants",
    sponsor: "NIH NIGMS", mechanism: "R21", status: "Active", nextDeadline: "2027-06-16" },
  { id: "R01-AG-0912", labId: "neuro-imaging", title: "Diffusion MRI markers of preclinical Alzheimer's disease",
    sponsor: "NIH NIA", mechanism: "R01", status: "New submission planned", nextDeadline: "2027-06-05" },
];

async function seedIfEmpty() {
  const existing = await db.collection("labs").limit(1).get();
  if (!existing.empty) return;
  const batch = db.batch();
  for (const { id, ...lab } of SEED_LABS) batch.set(db.collection("labs").doc(id), lab);
  for (const { id, ...grant } of SEED_GRANTS) batch.set(db.collection("grants").doc(id), grant);
  await batch.commit();
  console.log("Seeded labs and grants");
}

// ---- Auth: only short-lived OIDC tokens that Vercel signs for our project.
// DECISION: no shared secret exists, so there is nothing to leak or rotate.
let jwks;
async function getJwks() {
  if (!jwks) {
    // Discover the key URL from the issuer instead of hard-coding it.
    const res = await fetch(`${ISSUER}/.well-known/openid-configuration`);
    if (!res.ok) throw new Error(`OIDC discovery failed: ${res.status}`);
    const { jwks_uri } = await res.json();
    jwks = createRemoteJWKSet(new URL(jwks_uri));
  }
  return jwks;
}

async function requireVercelCaller(req, res, next) {
  try {
    const token = (req.headers.authorization ?? "").replace(/^Bearer /, "");
    if (!token) return res.status(401).json({ error: "missing bearer token" });
    const { payload } = await jwtVerify(token, await getJwks(), { issuer: ISSUER, audience: AUDIENCE });
    // sub looks like owner:<team>:project:<project>:environment:<env>
    const parts = String(payload.sub).split(":");
    const project = parts[3];
    const env = parts[5];
    if (project !== PROJECT || !ALLOWED_ENVS.includes(env)) {
      return res.status(403).json({ error: `caller ${project}/${env} not allowed` });
    }
    req.caller = { project, env };
    next();
  } catch (err) {
    res.status(401).json({ error: "invalid token", detail: String(err.message ?? err) });
  }
}

// ---- Routes
app.get("/health", (_req, res) => res.json({ ok: true }));

app.get("/labs/:labId", requireVercelCaller, async (req, res) => {
  const doc = await db.collection("labs").doc(req.params.labId).get();
  if (!doc.exists) return res.status(404).json({ error: "lab not found" });
  res.json({ id: doc.id, ...doc.data() });
});

app.get("/labs/:labId/grants", requireVercelCaller, async (req, res) => {
  const snap = await db.collection("grants").where("labId", "==", req.params.labId).get();
  res.json({ grants: snap.docs.map((d) => ({ id: d.id, ...d.data() })) });
});

app.post("/drafts", requireVercelCaller, async (req, res) => {
  const key = req.get("idempotency-key");
  if (!key || key.length < 16) return res.status(400).json({ error: "Idempotency-Key header required" });
  const { labId, grantId, section, markdown } = req.body ?? {};
  if (!labId || !grantId || !section || !markdown) return res.status(400).json({ error: "missing fields" });

  // DECISION: the API, not the agent, enforces that a grant belongs to the lab.
  const grant = await db.collection("grants").doc(grantId).get();
  if (!grant.exists || grant.data().labId !== labId) {
    return res.status(403).json({ error: "grant does not belong to this lab" });
  }

  // DECISION: the draft ID comes from the idempotency key, so a retried write
  // returns the same draft instead of creating a second one.
  const id = `D-${key.slice(0, 8).toUpperCase()}`;
  const ref = db.collection("drafts").doc(id);
  const draft = { labId, grantId, section, markdown, savedBy: req.caller, savedAt: new Date().toISOString() };
  try {
    await ref.create(draft);
    res.status(201).json({ id, ...draft, duplicate: false });
  } catch (err) {
    if (err.code === 6) { // ALREADY_EXISTS: this exact write already happened
      const existing = await ref.get();
      return res.status(200).json({ id, ...existing.data(), duplicate: true });
    }
    throw err;
  }
});

app.get("/drafts/:id", requireVercelCaller, async (req, res) => {
  const doc = await db.collection("drafts").doc(req.params.id).get();
  if (!doc.exists) return res.status(404).json({ error: "draft not found" });
  res.json({ id: doc.id, ...doc.data() });
});

const port = Number(process.env.PORT ?? 8080);
// DECISION: start serving first, then seed, so a slow first Firestore call never blocks startup.
app.listen(port, () => {
  console.log(`Research Office API on :${port}`);
  seedIfEmpty().catch((err) => console.error("Seeding failed", err));
});
