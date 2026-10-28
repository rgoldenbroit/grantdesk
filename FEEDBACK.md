# Platform feedback for Vercel

Notes from building GrantDesk over three evenings as a first-time eve user.

## What worked well
- eve's one-file-per-tool model. A tool, an approval gate, and a test are each a small file. Adding human approval to the save was one line.
- Evals with tool stubs. I could test "never save without approval" and "never invent a citation" without calling the real Google Cloud API.
- Vercel OIDC across clouds. My Cloud Run API trusts Vercel's signed token, so there is no shared secret to store or rotate.
- AI Gateway: one array for a fallback model, and per-lab cost tags with no extra code.
- Instant Rollback. The old build was still running, so rolling back took seconds.

## What slowed me down
- vercel env pull writes a placeholder for Secret variables. My local login failed until I figured that out. The pull output never told me which keys were placeholders.
- The local OIDC token expires after about 12 hours. It showed up as an "exp claim" error from my own API, which took a minute to connect back to the token.
- eve init needs Node 24, and eve link needs vercel login first. Both are clear once you hit them, but I hit them one at a time.
- Docs drift: the rolling release guide still uses "vercel rolling-release fetch", which the CLI reference marks deprecated in favor of "inspect". The provider docs call Claude on Vertex "vertex", but the model endpoints API returns "vertexAnthropic".
- A passing eval run prints a full stack trace for the intentional outage test, which looks like a failure at first glance.

## Suggestions
- Have vercel env pull list the keys it wrote as placeholders.
- Add a preflight check at the start of eve init: Node version, Vercel login, project link, AI Gateway access.
- In eve eval output, label expected tool failures (from throw stubs) as expected.
