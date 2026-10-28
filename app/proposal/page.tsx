import type { Metadata } from "next";
import type { ReactNode } from "react";
import { LogoMark } from "@/app/_components/logo-mark";

// DECISION: the proposal is a fully static page in the same app. It is public
// (see proxy.ts), prerendered at build time, and prints cleanly to PDF.
export const metadata: Metadata = {
  title: "GrantDesk proposal",
  description: "Running Eastbrook University's grant-writing agent on Vercel while research data stays on Google Cloud.",
};

const DEMO_URL = "https://grantdesk-one.vercel.app";
const REPO_URL = "https://github.com/rgoldenbroit/grantdesk";
// Fill in from AI Gateway → Logs after running demo prompt 2 on production, e.g. "$0.03".
const COST_PER_DRAFT: string | null = null;

const SECTIONS = [
  ["problem", "Problem"],
  ["architecture", "Architecture"],
  ["choices", "Vercel choices"],
  ["demo", "Demo"],
  ["rollout", "Rollout"],
  ["success", "Success measures"],
  ["risks", "Risks"],
  ["tooling", "Tooling"],
  ["feedback", "Feedback"],
] as const;

export default function ProposalPage() {
  return (
    <main className="min-h-dvh bg-background text-foreground print:bg-white">
      <style>{"@media print { html, body { background: #fff !important; } @page { margin: 0.5in; } }"}</style>
      <div className="mx-auto max-w-4xl px-5 py-12 sm:px-8">
        <header className="space-y-4 border-border border-b pb-10">
          <p className="text-muted-foreground text-sm">Proposal for Eastbrook University, Office of Research · October 2026</p>
          <h1 className="flex items-center gap-3 font-semibold text-4xl tracking-tight sm:text-5xl">
            <LogoMark className="size-9 text-primary" />
            GrantDesk on Vercel
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            Run the grant-writing agent on Vercel so long runs survive failures and every dollar of AI spend is
            charged to the right lab. Research data, identity, and Vertex AI stay on Google Cloud.
          </p>
          <div className="flex flex-wrap gap-3 pt-2 text-sm print:hidden">
            <a className="rounded-md bg-primary px-4 py-2 text-primary-foreground" href={DEMO_URL}>
              Open the live demo
            </a>
            <a className="rounded-md border border-border px-4 py-2" href={REPO_URL}>
              View the code
            </a>
          </div>
          <p className="hidden text-sm print:block">
            Demo: {DEMO_URL} · Code: {REPO_URL}
          </p>
          <nav className="flex flex-wrap gap-x-4 gap-y-1 pt-4 text-muted-foreground text-sm print:hidden">
            {SECTIONS.map(([id, label], i) => (
              <a className="hover:text-foreground" href={`#${id}`} key={id}>
                {i + 1}. {label}
              </a>
            ))}
          </nav>
        </header>

        <Section id="problem" n={1} title="The problem">
          <Lead>
            About 40 Eastbrook labs use GrantDesk to search literature and draft grant sections. Runs fail at the worst
            moments, and AI cost can't be charged back to grants, so the pilot can't grow to the whole university.
          </Lead>
          <Table
            head={["What breaks today", "What it costs Eastbrook"]}
            rows={[
              ["Long agent runs die when an instance recycles or a deploy lands. Two engineers maintain homemade checkpoint code.", "Researchers redo 20–40 minute runs. Engineers maintain plumbing instead of features."],
              ["One model, wired to one SDK. Quota errors spike in NIH deadline weeks.", "Outages hit when proposals are due. A missed NIH cycle can mean a four-month wait."],
              ["No AI cost per lab or grant.", "Central IT can't charge spend back to grants, so it can't fund growth past the pilot."],
              ["No preview environments, no quality checks before release, slow rollback.", "One prompt change can quietly degrade drafts for every lab at once."],
              ["The agent can write to the research office system without a human sign-off.", "Compliance risk on records the university is accountable for."],
            ]}
          />
          <p className="text-muted-foreground text-sm">Eastbrook is a fictional composite. Figures are assumptions to confirm in discovery.</p>
          <h3 className="font-medium">Questions for our first meeting</h3>
          <ul className="list-disc space-y-1 pl-5 text-sm">
            <li>What happens today when a run fails at minute 25? Who notices, and who restarts it?</li>
            <li>Who must approve anything written to the research office system?</li>
            <li>Do you have a Google Cloud spend commitment to keep using?</li>
            <li>Is any data barred from leaving a provider or region?</li>
          </ul>
        </Section>

        <Section id="architecture" n={2} title="Current and target architecture">
          <Lead>
            Augment, not replace: Vercel takes over only the layer that hurts, the agent runtime and release path.
            Google Cloud stays the system of record, the identity provider, and the primary model provider.
          </Lead>
          <Figure caption="Today: one Cloud Run service does everything, with homemade durability and no failover.">
            <CurrentDiagram />
          </Figure>
          <Figure caption="Target: only two lines cross into Google Cloud — tool calls with a Vercel OIDC token, and model calls routed to Vertex first.">
            <TargetDiagram />
          </Figure>
          <h3 className="font-medium">What stays on Google Cloud, and why</h3>
          <Table
            head={["Stays", "Why"]}
            rows={[
              ["Lab, grant, and draft records (Firestore)", "System of record, with its existing access controls and audit trail"],
              ["Research Office API (Cloud Run)", "Owns the business rules for writing records"],
              ["University single sign-on", "Identity belongs to central IT"],
              ["Vertex AI as a model provider", "Spend commitment and data terms. AI Gateway routes to it, not around it."],
              ["Any patient or clinical data", "Out of scope. It never reaches this agent."],
            ]}
          />
          <h3 className="font-medium">How the boundary is crossed</h3>
          <ul className="list-disc space-y-1 pl-5 text-sm">
            <li>
              <strong>In the demo:</strong> every call to the Research Office API carries a short-lived Vercel OIDC token
              signed for this project and environment. The API checks it against Vercel&apos;s public keys. There is no
              shared secret.
            </li>
            <li>
              <strong>In production:</strong> the same token goes through Google Workload Identity Federation, so Cloud
              Run&apos;s own IAM does the check, and traffic leaves Vercel from Static IPs on a firewall allowlist.
            </li>
          </ul>
        </Section>

        <Section id="choices" n={3} title="Vercel choices">
          <Lead>Four pieces, each mapped to a pain above. eve runs on Vercel Workflows and calls models through AI Gateway.</Lead>
          <Table
            head={["Piece", "Its job here", "Why it beats today", "Trade-off"]}
            rows={[
              ["eve on Vercel Workflows", "Runs the agent: durable sessions, tools, approvals, traces, evals", "Each step is saved, so a crash or deploy resumes where it stopped. Waiting for approval costs no compute.", "Public beta; versions are pinned"],
              ["AI Gateway", "One endpoint for every model call", "Gemini on Vertex first, automatic fallback to Claude, spend tagged per lab", "One more network hop"],
              ["Next.js on Fluid Compute", "Login, chat, and this page; hosts the agent", "Bills active CPU, which suits an agent that mostly waits on models and APIs", "Function limits and region choice still apply"],
              ["Preview Deployments, Rolling Releases, Instant Rollback", "Every change gets a URL; production rolls out 10% → 50% → 100%", "Replaces push-to-production from Cloud Build", "Rolling Releases needs the Pro plan"],
            ]}
          />
          <h3 className="font-medium">Model routing per lab</h3>
          <Table
            head={["Policy", "Primary", "Fallback", "Rule"]}
            rows={[
              ["standard", "Gemini Flash", "Claude Sonnet", "Try Vertex first, then other providers"],
              ["vertex-only", "Gemini Flash", "Claude Sonnet", "Vertex only, for labs whose data terms require it"],
            ]}
          />
          <p className="text-muted-foreground text-sm">
            Every model call is tagged with the lab and environment, so AI Gateway reports spend per lab: the chargeback
            Eastbrook is missing.
          </p>
        </Section>

        <Section id="demo" n={4} title="Working demo">
          <Lead>A deployed slice that crosses the boundary: the agent on Vercel reads and writes real records on Google Cloud.</Lead>
          <Table
            head={["", ""]}
            rows={[
              ["Live demo", DEMO_URL],
              ["Code", REPO_URL],
              ["Logins", "pi.protein@eastbrook.edu (standard policy) and pi.neuro@eastbrook.edu (Vertex only). Password in the email."],
            ]}
          />
          <h3 className="font-medium">Try it in 90 seconds</h3>
          <ol className="list-decimal space-y-1 pl-5 text-sm">
            <li>Sign in as the protein lab PI and click the first prompt: it reads the lab&apos;s grants from Google Cloud.</li>
            <li>Click the second prompt: it searches PubMed and drafts a Significance section with real PMID links.</li>
            <li>Click the third prompt: the agent pauses for your approval, then saves the draft to the Research Office API.</li>
            <li>Sign out and in as the neuro lab PI: different lab data and a Vertex-only model policy, same code.</li>
          </ol>
        </Section>

        <Section id="rollout" n={5} title="Rollout plan">
          <Lead>Five stages, each with a gate to pass before the next. Rollback is practiced before launch, not during an incident.</Lead>
          <Table
            head={["Stage", "What happens", "Gate to move on"]}
            rows={[
              ["1. Preview (week 1)", "IT and two friendly labs use preview URLs. Evals run on every pull request.", "All evals pass; no failed writes"],
              ["2. Validation (weeks 2–3)", "Five labs on production. Track completion rate, cost per draft, and PI rating.", "99%+ runs complete; cost per draft within budget"],
              ["3. Canary", "Rolling Releases at 10%, then 50%, then 100%, comparing error rates between versions", "New version is no worse"],
              ["4. Cutover", "The GrantDesk domain points at Vercel. The old Cloud Run app stays up for two weeks.", "Two stable weeks"],
              ["5. Rollback", "Instant Rollback for the app, abort any active rollout, write-back off by flag", "Rehearsed once before launch"],
            ]}
          />
          <p className="text-sm">
            Rehearsed on Oct 27, 2026: a change went to 10% of traffic, completed, and was rolled back in about three
            seconds.{" "}
            <a className="underline" href={`${REPO_URL}/blob/main/docs/release-rehearsal.md`}>
              Rehearsal log
            </a>
            .
          </p>
        </Section>

        <Section id="success" n={6} title="Success measures">
          <Lead>Targets to agree in discovery, and what the demo already shows.</Lead>
          <Table
            head={["Outcome", "Today (assumed)", "Target", "How we measure it"]}
            rows={[
              ["Runs that finish without a restart", "~85%", "99%+", "Completed vs started sessions"],
              ["Recovery from a model outage", "Manual, hours", "Automatic, seconds", "AI Gateway logs show the fallback"],
              ["AI spend attributed to a lab", "0%", "100%", "AI Gateway report grouped by lab tag"],
              ["Rollback time", "~15 min redeploy", "Under 1 min", "Instant Rollback"],
              ["Writes without human approval", "Possible", "Zero", "Every write tool requires approval"],
              ["Literature review + first draft", "2–3 days", "Same day", "Pilot-lab survey"],
            ]}
          />
          <h3 className="font-medium">Measured in the demo</h3>
          <ul className="list-disc space-y-1 pl-5 text-sm">
            <li>4 of 4 behavior evals pass in strict mode; the AI judge scores writing quality at 91%.</li>
            <li>Rollback to the previous version took about three seconds.</li>
            {COST_PER_DRAFT ? <li>One full draft session cost {COST_PER_DRAFT} in model spend.</li> : null}
          </ul>
        </Section>

        <Section id="risks" n={7} title="Known limitations and risks">
          <Lead>What we would tell Eastbrook before kickoff.</Lead>
          <ul className="list-disc space-y-2 pl-5 text-sm">
            <li><strong>eve is in public beta.</strong> APIs may change before general availability. We pin versions and plan an upgrade window.</li>
            <li><strong>Rollbacks and sessions.</strong> In-flight sessions finish on the version that started them. After an eve upgrade, a session that already moved to the new version can&apos;t move back.</li>
            <li><strong>Using the Google commitment needs BYOK.</strong> The demo uses Vercel&apos;s model credentials. Billing Vertex to Eastbrook&apos;s account means adding their own credentials to AI Gateway.</li>
            <li><strong>The demo API is reachable on the internet,</strong> protected by the token check in its own code. Production adds Cloud Run IAM through Workload Identity Federation and Static IPs.</li>
            <li><strong>The API trusts the app for lab scoping.</strong> The agent takes the lab from the login, and the API refuses saves to another lab&apos;s grant. Production would also pass the user&apos;s identity to the API.</li>
            <li><strong>Login is not session ownership.</strong> Production needs an owner check on each conversation, plus the university&apos;s single sign-on.</li>
            <li><strong>Data retention.</strong> Conversation history lives in Vercel Workflows. Decide retention for unpublished research; eve can delete run data when a session ends.</li>
            <li><strong>AI output still needs a PI.</strong> Citations come only from PubMed results, but scientific claims are the PI&apos;s responsibility.</li>
          </ul>
        </Section>

        <Section id="tooling" n={8} title="Development tooling and AI validation">
          <ul className="list-disc space-y-2 pl-5 text-sm">
            <li><strong>Built with</strong> Claude Code (with Vercel&apos;s plugin) and eve&apos;s terminal chat for local runs. Every trade-off is marked with a DECISION comment in the code.</li>
            <li><strong>Code review:</strong> Claude Code reviewed the agent code before commit and found five issues, including a draft-ID collision and an unchecked PubMed error. All five were fixed.</li>
            <li>
              <strong>Behavior evals</strong> with eve and tool stubs: the agent reads the lab first, never saves without approval, cites only PMIDs the search returned, and explains an API outage instead of guessing.{" "}
              <a className="underline" href={`${REPO_URL}/blob/main/docs/eval-results.md`}>Results</a>.
            </li>
            <li><strong>Quality score:</strong> an AI judge grades the drafting and the outage message as soft checks.</li>
            <li><strong>Regression gate:</strong> <code>npx eve eval --strict</code> runs before changes go to production.</li>
          </ul>
        </Section>

        <Section id="feedback" n={9} title="Platform feedback">
          <div className="grid gap-6 text-sm sm:grid-cols-3">
            <div className="space-y-2">
              <h3 className="font-medium">Worked well</h3>
              <ul className="list-disc space-y-1 pl-5">
                <li>One file per tool; human approval was one line</li>
                <li>Evals with tool stubs</li>
                <li>OIDC across clouds with no shared secret</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Slowed me down</h3>
              <ul className="list-disc space-y-1 pl-5">
                <li><code>vercel env pull</code> silently writes placeholders for Secrets</li>
                <li>Local OIDC token expiry surfaced as a cryptic error</li>
                <li>Small docs drift (rolling-release <code>fetch</code>, Vertex provider name)</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Suggestions</h3>
              <ul className="list-disc space-y-1 pl-5">
                <li>List placeholder keys after <code>env pull</code></li>
                <li>A preflight check in <code>eve init</code></li>
              </ul>
            </div>
          </div>
          <p className="text-sm">
            <a className="underline" href={`${REPO_URL}/blob/main/FEEDBACK.md`}>Full feedback</a>
          </p>
        </Section>

        <footer className="border-border border-t pt-6 text-muted-foreground text-sm">
          Prepared by Russ Goldenbroit · October 2026
        </footer>
      </div>
    </main>
  );
}

function Section({ id, n, title, children }: { id: string; n: number; title: string; children: ReactNode }) {
  return (
    <section className="scroll-mt-6 space-y-5 border-border border-b py-12 print:border-0 print:py-6" id={id}>
      <h2 className="break-after-avoid font-semibold text-2xl tracking-tight">
        <span className="mr-2 text-muted-foreground">{n}.</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function Lead({ children }: { children: ReactNode }) {
  return <p className="max-w-3xl text-base leading-relaxed">{children}</p>;
}

function Table({ head, rows }: { head: readonly string[]; rows: readonly (readonly string[])[] }) {
  const hasHead = head.some((h) => h.length > 0);
  return (
    <div className="overflow-x-auto rounded-lg border border-border break-inside-avoid">
      <table className="w-full border-collapse text-left text-sm">
        {hasHead ? (
          <thead className="bg-muted">
            <tr>
              {head.map((h) => (
                <th className="px-3 py-2 font-medium" key={h}>{h}</th>
              ))}
            </tr>
          </thead>
        ) : null}
        <tbody>
          {rows.map((row) => (
            <tr className="border-border border-t first:border-t-0" key={row.join("|")}>
              {row.map((cell, i) => (
                <td className={i === 0 ? "px-3 py-2 align-top font-medium" : "px-3 py-2 align-top"} key={`${i}-${cell}`}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Figure({ caption, children }: { caption: string; children: ReactNode }) {
  return (
    <figure className="space-y-2 break-inside-avoid">
      <div className="rounded-lg border border-border bg-card p-3">{children}</div>
      <figcaption className="text-muted-foreground text-sm">{caption}</figcaption>
    </figure>
  );
}

const line = "var(--muted-foreground)";
const accent = "var(--primary)";

function Box({ x, y, w, h, strong = false }: { x: number; y: number; w: number; h: number; strong?: boolean }) {
  return (
    <rect
      fill={strong ? accent : "var(--card)"}
      fillOpacity={strong ? 0.08 : 1}
      height={h}
      rx={8}
      stroke={strong ? accent : line}
      strokeWidth={strong ? 2 : 1.25}
      width={w}
      x={x}
      y={y}
    />
  );
}

function Arrowhead({ id }: { id: string }) {
  return (
    <defs>
      <marker id={id} markerHeight={6} markerWidth={6} orient="auto-start-reverse" refX={9} refY={5} viewBox="0 0 10 10">
        <path d="M0 0L10 5L0 10z" fill={line} />
      </marker>
    </defs>
  );
}

function CurrentDiagram() {
  return (
    <svg aria-label="Current architecture on Google Cloud" className="h-auto w-full" fill="currentColor" fontSize={13} role="img" viewBox="0 0 760 296">
      <Arrowhead id="cur-arrow" />
      <rect fill="var(--muted)" height={196} rx={8} stroke={line} strokeWidth={1.25} width={712} x={24} y={80} />
      <text fontWeight={600} x={40} y={102}>Google Cloud (everything today)</text>
      <g fill="none" stroke={line} strokeWidth={1.25}>
        <path d="M300 60V120" markerEnd="url(#cur-arrow)" />
        <path d="M392 136H432" markerEnd="url(#cur-arrow)" />
        <path d="M392 192H432" markerEnd="url(#cur-arrow)" />
        <path d="M392 248H432" markerEnd="url(#cur-arrow)" />
      </g>
      <Box h={40} w={200} x={200} y={20} />
      <text textAnchor="middle" x={300} y={44}>Researcher in a browser</text>
      <Box h={136} w={344} x={48} y={120} />
      <text fontWeight={600} x={64} y={146}>Cloud Run: one Python service</text>
      <text fill="var(--muted-foreground)" fontSize={11.5} x={64} y={172}>Chat UI and agent loop in one app</text>
      <text fill="var(--muted-foreground)" fontSize={11.5} x={64} y={192}>Homemade checkpoints for long runs</text>
      <text fill="var(--muted-foreground)" fontSize={11.5} x={64} y={212}>Calls Gemini directly with the Vertex SDK</text>
      <text fill="var(--muted-foreground)" fontSize={11.5} x={64} y={232}>No previews; slow redeploy to roll back</text>
      <Box h={44} w={280} x={432} y={114} />
      <text fontWeight={600} x={448} y={132}>Vertex AI</text>
      <text fill="var(--muted-foreground)" fontSize={11.5} x={448} y={148}>Gemini only, no failover</text>
      <Box h={44} w={280} x={432} y={170} />
      <text fontWeight={600} x={448} y={188}>Firestore</text>
      <text fill="var(--muted-foreground)" fontSize={11.5} x={448} y={204}>Labs, grants, drafts, and checkpoints</text>
      <Box h={44} w={280} x={432} y={226} />
      <text fontWeight={600} x={448} y={244}>Cloud Tasks and Cloud Build</text>
      <text fill="var(--muted-foreground)" fontSize={11.5} x={448} y={260}>Retries; builds push straight to production</text>
    </svg>
  );
}

function TargetDiagram() {
  return (
    <svg aria-label="Target architecture: Vercel runs the agent, Google Cloud keeps the data" className="h-auto w-full" fill="currentColor" fontSize={13} role="img" viewBox="0 56 760 464">
      <Arrowhead id="tgt-arrow" />
      <rect fill="none" height={296} rx={8} stroke={line} strokeWidth={1.25} width={432} x={24} y={128} />
      <text fontWeight={600} x={40} y={152}>Vercel: agent layer</text>
      <rect fill="var(--muted)" height={296} rx={8} stroke={line} strokeWidth={1.25} width={256} x={480} y={128} />
      <text fontWeight={600} x={496} y={152}>Google Cloud: stays put</text>
      <g fill="none" stroke={line} strokeWidth={1.25}>
        <path d="M220 108V168" markerEnd="url(#tgt-arrow)" />
        <path d="M220 224V248" markerEnd="url(#tgt-arrow)" />
        <path d="M220 320V344" markerEnd="url(#tgt-arrow)" />
        <path d="M376 272H496" markerEnd="url(#tgt-arrow)" />
        <path d="M608 248V224" markerEnd="url(#tgt-arrow)" />
        <path d="M376 372H496" markerEnd="url(#tgt-arrow)" />
        <path d="M340 400V476H496" markerEnd="url(#tgt-arrow)" strokeDasharray="4 4" />
        <path d="M64 296H44V476H64" markerEnd="url(#tgt-arrow)" />
      </g>
      <Box h={40} w={200} x={120} y={68} />
      <text textAnchor="middle" x={220} y={92}>Researcher in a browser</text>
      <Box h={56} w={312} x={64} y={168} />
      <text fontWeight={600} x={80} y={192}>Next.js app on Fluid Compute</text>
      <text fill="var(--muted-foreground)" fontSize={11.5} x={80} y={208}>Login, chat UI, this proposal page</text>
      <Box h={72} strong w={312} x={64} y={248} />
      <text fontWeight={600} x={80} y={272}>eve agent on Vercel Workflows</text>
      <text fontSize={11.5} x={80} y={288}>Durable sessions, approvals, evals</text>
      <text fontSize={11.5} x={80} y={304}>Tools: lab data, grants, PubMed, save draft</text>
      <Box h={56} w={312} x={64} y={344} />
      <text fontWeight={600} x={80} y={368}>AI Gateway</text>
      <text fill="var(--muted-foreground)" fontSize={11.5} x={80} y={384}>Gemini first, Claude fallback, tags per lab</text>
      <Box h={56} w={224} x={496} y={168} />
      <text fontWeight={600} x={512} y={192}>Firestore</text>
      <text fill="var(--muted-foreground)" fontSize={11.5} x={512} y={208}>Labs, grants, saved drafts</text>
      <Box h={72} w={224} x={496} y={248} />
      <text fontWeight={600} x={512} y={272}>Research Office API</text>
      <text fill="var(--muted-foreground)" fontSize={11.5} x={512} y={288}>Cloud Run service</text>
      <text fill="var(--muted-foreground)" fontSize={11.5} x={512} y={304}>Verifies the Vercel token</text>
      <Box h={56} w={224} x={496} y={344} />
      <text fontWeight={600} x={512} y={368}>Vertex AI</text>
      <text fill="var(--muted-foreground)" fontSize={11.5} x={512} y={384}>Gemini, plus Claude on Vertex</text>
      <Box h={56} w={216} x={64} y={448} />
      <text fontWeight={600} x={80} y={472}>PubMed (NCBI)</text>
      <text fill="var(--muted-foreground)" fontSize={11.5} x={80} y={488}>Public literature search</text>
      <Box h={56} w={224} x={496} y={448} />
      <text fontWeight={600} x={512} y={472}>Anthropic API</text>
      <text fill="var(--muted-foreground)" fontSize={11.5} x={512} y={488}>Fallback if Vertex fails</text>
      <text fill="var(--muted-foreground)" fontSize={11.5} textAnchor="middle" x={416} y={264}>OIDC token</text>
      <text fill="var(--muted-foreground)" fontSize={11.5} textAnchor="middle" x={416} y={364}>primary</text>
      <text fill="var(--muted-foreground)" fontSize={11.5} textAnchor="middle" x={418} y={468}>fallback</text>
    </svg>
  );
}
