import { defineAgent, defineDynamic } from "eve";

const PRIMARY_MODEL = "google/gemini-3.7-flash"; // confirm the ID at vercel.com/ai-gateway/models
const FALLBACK_MODEL = "anthropic/claude-sonnet-5.5";

const POLICIES = {
  // DECISION: default tries Google's infrastructure first. With BYOK (the university's
  // own Vertex credentials, set in AI Gateway settings) this draws down their Google
  // commitment; without BYOK it runs on Vercel's credentials. Claude on Vertex is
  // tried before Anthropic direct.
  standard: { order: ["vertex", "anthropic"] },
  // DECISION: for labs whose data terms forbid other providers.
  "vertex-only": { only: ["vertex"] },
} as const;

type PolicyName = keyof typeof POLICIES;

export default defineAgent({
  // DECISION: no shell, file, or web tools. GrantDesk only needs its four tools,
  // so the model gets nothing else (least privilege, and no sandbox to pay for).
  defaultTools: false,
  model: defineDynamic({
    events: {
      // DECISION: choose once per session. Switching models mid-session would
      // throw away the provider's prompt cache.
      "session.started": (_event, ctx) => {
        const user = ctx.session.auth.initiator;
        const lab = String(user?.attributes.labId ?? process.env.DEV_LAB_ID ?? "unknown");
        const requested = String(user?.attributes.modelPolicy ?? "standard");
        const policyName: PolicyName = requested === "vertex-only" ? "vertex-only" : "standard";
        return {
          model: PRIMARY_MODEL,
          modelOptions: {
            providerOptions: {
              gateway: {
                ...POLICIES[policyName],
                models: [FALLBACK_MODEL],
                user: user?.principalId ?? "local-dev",
                // DECISION: tags make per-lab chargeback a report, not a project.
                tags: [`lab:${lab}`, `policy:${policyName}`, `env:${process.env.VERCEL_ENV ?? "local"}`],
              },
            },
          },
        };
      },
    },
  }),
  limits: {
    // DECISION: pause runaway sessions and ask to continue: at $2 of model spend, or
    // 2M new input tokens if a provider reports no cost (this replaces eve's default cap).
    sessionUsage: ({ window }) =>
      (window.costUsd ?? 0) >= 2 || window.inputTokens - window.cacheReadTokens >= 2_000_000,
  },
});
