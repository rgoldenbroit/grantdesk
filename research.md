# Research: demo UI polish

Goal: blue accent, an original book-and-check logo, an "About this demo" dialog, a matching login page, and a new public `/proposal` page. Keep the existing layout. No edits to `agent/`, `lib/`, `proxy.ts`, or `gcp/`.

## Decisions (answered 2026-10-27)

1. `/proposal`: build the page. Draft the copy from the repo; you edit it in `plan.md` first.
2. Audience for `/proposal`: plain summary first for research office leaders, then architecture for IT and cloud reviewers.
3. "About this demo" link: in the chat header **and** on the empty state.
4. `app/apple-icon.tsx`: switch to the new logo.
5. Fictional list includes Eastbrook University.

## What already exists

- **Login page** (`app/login/page.tsx`) already shows "GrantDesk" and "Eastbrook University · Office of Research". It only needs the logo.
- **Empty state** is the screen before the first message (`app/_components/agent-chat.tsx:205-221`). It shows the title, the user's name and lab, and the starter prompts.
- **Chat header** (`agent-chat.tsx:277-316`) appears only after the first message. It has the title in the center, "Sign out" fixed top-left, and "New chat" fixed top-right.
- **Dialog** (`components/ui/dialog.tsx`) is installed and unused, so no new dependency is needed.
- **`app/icon.svg` and `app/apple-icon.tsx`** both draw the eve scaffold logo.
- **`/proposal`** is already listed as public in `proxy.ts:6`, so it opens without sign-in. No page exists yet.
- **Uncommitted work is in progress** in `agent-chat.tsx`, `layout.tsx`, `page.tsx`, `s/page.tsx`, `s/[sessionId]/page.tsx`, and the untracked `starter-prompts.tsx`.

## How colors flow

Every component reads a few named color variables from `app/globals.css`. Changing three of them recolors the app:

| Variable | Used by | Effect of making it blue |
|---|---|---|
| `--primary` | default buttons, send button, user chat bubbles, links inside assistant replies, badges, selected answers in agent questions, text-selection highlight in inputs | All turn blue |
| `--primary-foreground` | text on top of `--primary` | Must stay readable on blue |
| `--ring` | focus outline on buttons, inputs, selects, the dialog close button | Focus outlines turn blue |

Leave `--accent` alone. In this component library, "accent" is the light gray hover color for menus and ghost buttons. Making it blue would tint every hover.

Dark mode switches on the operating system setting (`globals.css:59`). There is no in-app toggle. Dark mode needs a lighter blue, because deep blue is unreadable on near-black.

## Proposed colors, contrast checked

Contrast ratio is how much brighter the lighter color is than the darker one. The accessibility standard asks for at least 4.5 for text and 3.0 for outlines. Measured with `/private/tmp/claude-501/-Users-russellgoldenbroit-dev-active-grantdesk/ae8bc05c-3f6a-49d6-b67a-fe1db3a7779e/scratchpad/contrast.mjs`:

| Mode | `--primary` | `--primary-foreground` | `--ring` | Button text | Link on page | Focus outline |
|---|---|---|---|---|---|---|
| Light | `oklch(0.42 0.13 260)` ≈ #1d4a93 | near-white (unchanged) | `oklch(0.55 0.15 260)` ≈ #396fc8 | 8.3 | 7.9 | 4.5 |
| Dark | `oklch(0.75 0.11 255)` ≈ #7eb1f3 | `oklch(0.2 0.04 260)` ≈ #0b1628 | `oklch(0.65 0.13 255)` ≈ #5591dd | 8.2 | 8.9 | 6.1 |

## Logo

Draft rendered and checked: `/private/tmp/claude-501/-Users-russellgoldenbroit-dev-active-grantdesk/ae8bc05c-3f6a-49d6-b67a-fe1db3a7779e/scratchpad/logo/mark.svg.png` (blue mark) and `/private/tmp/claude-501/-Users-russellgoldenbroit-dev-active-grantdesk/ae8bc05c-3f6a-49d6-b67a-fe1db3a7779e/scratchpad/logo/tile.svg.png` (white on a blue tile). It is an open book of two pages meeting at a spine, with a check mark just above. Drawn with thick rounded lines on a 24×24 grid so it holds up at 16 px.

## Facts the dialog and `/proposal` rely on

Each claim below is from the code, not from memory.

- **Research Office API runs on Cloud Run** and owns lab, grant, and draft records (`gcp/research-office-api/index.js:1-2`, `docs/decisions/0002`).
- **Firestore** stores those records in a separate named database (`index.js:16-17`).
- **No shared secret between Vercel and Google Cloud.** Each call carries a short-lived token Vercel signs for this project. The API checks the signature against Vercel's published keys and rejects other projects and environments (`lib/research-office.ts:7-8`, `index.js:47-78`).
- **The demo accepts development, preview, and production callers.** Production would accept production only (`index.js:12-14`).
- **The lab comes from the verified login, never from the model** (`agent/tools/save_draft.ts:24-26`). On writes, the API also checks that the grant belongs to that lab (`index.js:100-104`).
- **Every save needs a human yes.** While waiting, the session is parked and uses no compute (`save_draft.ts:15-21`).
- **Retried saves never duplicate** (`save_draft.ts:27-31`, `index.js:106-126`).
- **Four tools only:** lab profile, active grants, PubMed search, save draft. No shell, file, or web tools (`agent/agent.ts:19-21`).
- **Citations:** the agent is instructed to cite only PMIDs returned by PubMed (`agent/instructions.md`). This is an instruction, not a hard check.
- **Models:** through Vercel AI Gateway, Google Vertex AI first, then Anthropic. Labs whose data terms require it are pinned to Vertex only. With the university's own Vertex credentials, usage draws down its Google commitment (`agent.ts:6-14`).
- **Spend:** every AI request is tagged with lab, policy, and environment. A chat pauses at $2 of model spend and asks to continue (`agent.ts:41-50`).
- **Production path:** university single sign-on replaces the demo users (`docs/decisions/0003`, `lib/users.ts:3-4`). The token check moves to Cloud Run's own access control via Workload Identity Federation (`docs/decisions/0002`).
- **Fictional:** Eastbrook University, both labs, all three grants, both users (`index.js:21-35`, `lib/users.ts`).
- **GitHub repo** `https://github.com/rgoldenbroit/grantdesk` is public.

## Constraints found

- **Header crowding on phones.** The header title is centered with 96 px of padding on each side. "Sign out" plus "About this demo" on the left reaches about 194 px, so it would overlap the title on screens under about 680 px. Fix: show an info icon instead of the text below the `md` width (768 px), and widen the header padding from 96 to 112 px.
- **Signing in for checks.** Signing in needs `DEMO_PASSWORD` from `.env.local`. Typing it through browser automation would put it in this transcript, so you sign in once in the test tab yourself.
- **Dark mode checks.** Chrome follows the macOS appearance setting. Checking dark mode in a real browser means switching macOS to Dark briefly.

## Outside this task (not fixing)

- `GET /drafts/:id` in `gcp/research-office-api/index.js:129` returns any draft without a lab check. Only GrantDesk's own Vercel project can call the API, and no agent tool uses this route, so nobody can reach it today. It would matter if a "read draft" tool were added.
