# Plan: demo UI polish

Facts and decisions are in `research.md`. Edit any copy below before saying "implement". I build exactly what is here.

## Ground rules

- Touch only `app/`. No edits to `agent/`, `lib/`, `proxy.ts`, `gcp/`, or `components/`.
- Before the first edit, copy every existing file I will change into the scratchpad. The final diff compares against those copies, so it shows only my changes and leaves your uncommitted work alone.
- I pause after each phase with a short summary and a typecheck result.

## Files

| File | Change | Size |
|---|---|---|
| `app/globals.css` | Change `--primary`, `--primary-foreground`, `--ring` in light and dark blocks | ~6 lines |
| `app/_components/logo-mark.tsx` | **New.** Logo as a React component; lines use the current text color | ~25 lines |
| `app/icon.svg` | Replace the eve mark with the white logo on a blue rounded tile | ~10 lines |
| `app/apple-icon.tsx` | Draw the new logo instead of the eve mark | ~15 lines changed |
| `app/login/page.tsx` | Logo beside the title | ~5 lines |
| `app/_components/about-demo-dialog.tsx` | **New.** The About dialog and its trigger | ~80 lines |
| `app/_components/agent-chat.tsx` | Logo beside the empty-state title; About link in the header and on the empty state | ~25 lines |
| `app/proposal/page.tsx` | **New.** Public proposal page | ~180 lines |

## Phase 1: colors and logo

1. **`globals.css`.** Light block: `--primary: oklch(0.42 0.13 260)`, `--ring: oklch(0.55 0.15 260)`, `--primary-foreground` unchanged. Dark block: `--primary: oklch(0.75 0.11 255)`, `--primary-foreground: oklch(0.2 0.04 260)`, `--ring: oklch(0.65 0.13 255)`. Nothing else changes.
2. **`logo-mark.tsx`.** Exports `LOGO_PATHS` (four lines of path data from the draft) and `LogoMark({ className })`. The mark is decorative (`aria-hidden`), because the word "GrantDesk" always sits next to it. Colored with `text-primary`, so it follows dark mode on its own.
3. **`icon.svg`.** 32×32 blue (#1d4a93) rounded square with the mark in white. It reads on both light and dark browser tab bars.
4. **`apple-icon.tsx`.** Same tile at 180×180. Uses `LOGO_PATHS` from `logo-mark.tsx`, so the two cannot drift apart. `icon.svg` has to be a plain file, so it keeps its own copy of the paths.
5. **Login page.** The title becomes a row: `LogoMark` at 32 px, then "GrantDesk". Subtitle unchanged.
6. **Empty state.** Same row at 44 px beside the 48 px title.

## Phase 2: About dialog

**Component.** `AboutDemoDialog({ className, children })`. `children` is the trigger's content and `className` styles the trigger, because the two places that use it look different. It is built from the existing `components/ui/dialog.tsx`. Both links open in a new tab, so the chat stays open behind them.

**In the header.** "Sign out" and the About trigger sit together top-left, same gray text style as "Sign out" today. Below 768 px wide, the trigger is an info icon with the label "About this demo" for screen readers. At 768 px and up, it shows the words "About this demo". Header side padding goes from 96 to 112 px so nothing overlaps the centered title on phones.

**On the empty state.** A blue "About this demo" text link under the name and lab line.

**Dialog copy:**

> **About this demo**
> GrantDesk is a working prototype. The services are real. The university, people, and records are made up.
>
> **Real**
> - **Research Office API** on Google Cloud Run. It accepts only short-lived tokens that Vercel signs for this app.
> - **Firestore** stores the lab, grant, and draft records. Saving a draft writes a real record.
> - **PubMed** searches are live. Every citation is a real paper.
> - **Vercel AI Gateway** sends requests to Google Vertex AI first, then Anthropic, and tags spending by lab.
>
> **Fictional**
> - Eastbrook University
> - The labs and their research focus
> - The grants, their IDs, and deadlines
> - The users and demo accounts
>
> [Read the proposal](/proposal) · [View the code on GitHub](https://github.com/rgoldenbroit/grantdesk)

## Phase 3: `/proposal` page

**Technical shape.** A static server page with no sign-in check (`proxy.ts` already lets it through). It has the logo and "GrantDesk" at the top, linking to `/`, plus an "Open GrantDesk" link. Single column, 672 px max width, 16 px side margins on phones. Headings, lists, and a definition list for "Who runs what". No tables, so nothing scrolls sideways on a phone. Page title: "GrantDesk proposal".

**Draft copy:**

> PROPOSAL
> # A grant-writing assistant for the Office of Research
> GrantDesk helps researchers draft NIH grant sections from their own lab and grant records, with real citations. It runs on Vercel and leaves the Office of Research's data on Google Cloud.
>
> *This is a working demo. Eastbrook University and its labs, grants, and users are fictional. The services behind them are real.*
>
> ## In short
> - **Drafts start from your records.** GrantDesk reads the researcher's lab profile and active grants from the Research Office system before it writes.
> - **Citations are real papers.** It searches PubMed and cites each paper by its PubMed ID, with a link.
> - **Nothing is saved without a yes.** Every save to the Research Office system asks the researcher to approve it first.
> - **Your data stays where it is.** Lab, grant, and draft records stay in the Office of Research's Google Cloud project.
> - **Costs are capped and reported per lab.** A chat pauses at $2 of AI usage and asks before continuing. Every AI request is tagged with its lab, so spending can be reported lab by lab.
>
> ## What a researcher does
> 1. Signs in.
> 2. Asks, for example, "Draft a 250-word Significance section for my nearest-deadline grant."
> 3. Reads the draft and its PubMed citations.
> 4. Approves the save. The section is stored in the Research Office system under that grant.
>
> ## How it works
> GrantDesk adds to the existing Google Cloud setup. It does not replace it. Vercel runs the assistant and the web app. Google Cloud keeps the data, identity, and Vertex AI.
>
> **Who runs what**
> - **Web app and assistant: Vercel.** A Next.js web app and an agent built with eve, Vercel's framework for long-running AI agents. A chat waiting for approval is paused and uses no compute.
> - **AI models: Vercel AI Gateway.** Requests go to Google Vertex AI first, then Anthropic. A lab whose data terms require it can be limited to Vertex AI only.
> - **Research Office API: Google Cloud Run.** Owns the lab, grant, and draft records.
> - **Database: Firestore.** A separate named database, kept apart from other data in the project.
> - **Literature: PubMed.** The National Library of Medicine's public search service.
>
> ## Security
> - **No shared password between Vercel and Google Cloud.** For each call, Vercel issues a short-lived token that proves which project and environment is calling. The API checks it against Vercel's published keys. Nothing long-lived is stored, so there is nothing to leak or rotate.
> - **The lab comes from the sign-in, not the AI.** When saving, GrantDesk takes the lab from the verified login. Text hidden in a document or a prompt cannot redirect a save to another lab. The API also refuses to save to a grant that belongs to a different lab.
> - **Retries never create duplicates.** If a save is retried after a network error, the API returns the original draft.
> - **Four tools and nothing else.** The assistant can read the lab profile, list grants, search PubMed, and save a draft. It has no web browsing, file access, or command line.
> - **Citations depend on an instruction.** The assistant is told to cite only papers its PubMed search returned. Reviewers should still read each citation.
>
> ## Path to production
> - Replace the two demo accounts with the university's single sign-on.
> - Move the token check into Cloud Run's own access control, using Google's Workload Identity Federation (a way for Google Cloud to trust Vercel's tokens directly).
> - Accept calls from the production environment only. The demo also accepts preview and local development.
> - Connect the university's own Vertex AI credentials in AI Gateway, so AI usage counts against its existing Google commitment.
>
> [Open GrantDesk](/) · [View the code on GitHub](https://github.com/rgoldenbroit/grantdesk)

## Phase 4: verify and show the diff

1. `npm run typecheck` (this also runs after each earlier phase).
2. `npm run build`, to catch anything typecheck misses, such as the icon routes.
3. Start the dev server and check in Chrome at 1280 px and 375 px wide:
   - I check `/login`, `/proposal`, `/icon.svg`, and `/apple-icon` myself.
   - **You sign in once in the test tab**, so the demo password stays out of this transcript. Then I check the empty state, the header after one message, the dialog, and keyboard focus outlines.
   - Dark mode (optional): you switch macOS to Dark for a minute and I repeat the screenshots.
4. Show the diff: each changed file compared with its saved copy, plus the full text of each new file.

## Not doing

- No changes to `--accent`, the `components/` folder, or the "Sign out" link's color.
- No in-app light/dark toggle.
- No commit. I'll ask when we're done.
