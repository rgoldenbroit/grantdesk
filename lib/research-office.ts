// Calls the Research Office API on Google Cloud with a fresh Vercel OIDC token.
import { getVercelOidcToken } from "@vercel/oidc";

async function call(path: string, init: RequestInit = {}) {
  const base = process.env.RESEARCH_OFFICE_API_URL;
  if (!base) throw new Error("RESEARCH_OFFICE_API_URL is not set");
  // DECISION: ask for the token on every call. It is short-lived, so nothing long-lived is stored.
  const token = await getVercelOidcToken();
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      ...init.headers,
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    // DECISION: fail fast. A hung GCP call should not hold the agent step open.
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`Research Office API ${res.status}: ${await res.text()}`);
  return res.json();
}

export const researchOffice = {
  get: (path: string) => call(path),
  post: (path: string, body: unknown, idempotencyKey: string) =>
    call(path, {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "idempotency-key": idempotencyKey },
    }),
};
