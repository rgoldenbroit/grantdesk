import type { Metadata } from "next";
import { LogoMark } from "@/app/_components/logo-mark";

// Public page: proxy.ts lists /proposal in PUBLIC_PATHS, so it never reads the session.
export const metadata: Metadata = {
  title: "GrantDesk proposal",
  description:
    "A grant-writing assistant for the Office of Research, running on Vercel with data kept on Google Cloud.",
};

const REPO_URL = "https://github.com/rgoldenbroit/grantdesk";

const linkClass =
  "rounded-sm text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50";

const IN_SHORT = [
  {
    lead: "Drafts start from your records.",
    text: "GrantDesk reads the researcher's lab profile and active grants from the Research Office system before it writes.",
  },
  {
    lead: "Citations are real papers.",
    text: "It searches PubMed and cites each paper by its PubMed ID, with a link.",
  },
  {
    lead: "Nothing is saved without a yes.",
    text: "Every save to the Research Office system asks the researcher to approve it first.",
  },
  {
    lead: "Your data stays where it is.",
    text: "Lab, grant, and draft records stay in the Office of Research's Google Cloud project.",
  },
  {
    lead: "Costs are capped and reported per lab.",
    text: "A chat pauses at $2 of AI usage and asks before continuing. Every AI request is tagged with its lab, so spending can be reported lab by lab.",
  },
] as const;

const STEPS = [
  "Signs in.",
  "Asks, for example, “Draft a 250-word Significance section for my nearest-deadline grant.”",
  "Reads the draft and its PubMed citations.",
  "Approves the save. The section is stored in the Research Office system under that grant.",
] as const;

const WHO_RUNS_WHAT = [
  {
    part: "Web app and assistant: Vercel.",
    text: "A Next.js web app and an agent built with eve, Vercel's framework for long-running AI agents. A chat waiting for approval is paused and uses no compute.",
  },
  {
    part: "AI models: Vercel AI Gateway.",
    text: "Requests go to Google Vertex AI first, then Anthropic. A lab whose data terms require it can be limited to Vertex AI only.",
  },
  {
    part: "Research Office API: Google Cloud Run.",
    text: "Owns the lab, grant, and draft records.",
  },
  {
    part: "Database: Firestore.",
    text: "A separate named database, kept apart from other data in the project.",
  },
  {
    part: "Literature: PubMed.",
    text: "The National Library of Medicine's public search service.",
  },
] as const;

const SECURITY = [
  {
    lead: "No shared password between Vercel and Google Cloud.",
    text: "For each call, Vercel issues a short-lived token that proves which project and environment is calling. The API checks it against Vercel's published keys. Nothing long-lived is stored, so there is nothing to leak or rotate.",
  },
  {
    lead: "The lab comes from the sign-in, not the AI.",
    text: "When saving, GrantDesk takes the lab from the verified login. Text hidden in a document or a prompt cannot redirect a save to another lab. The API also refuses to save to a grant that belongs to a different lab.",
  },
  {
    lead: "Retries never create duplicates.",
    text: "If a save is retried after a network error, the API returns the original draft.",
  },
  {
    lead: "Four tools and nothing else.",
    text: "The assistant can read the lab profile, list grants, search PubMed, and save a draft. It has no web browsing, file access, or command line.",
  },
  {
    lead: "Citations depend on an instruction.",
    text: "The assistant is told to cite only papers its PubMed search returned. Reviewers should still read each citation.",
  },
] as const;

const PATH_TO_PRODUCTION = [
  "Replace the two demo accounts with the university's single sign-on.",
  "Move the token check into Cloud Run's own access control, using Google's Workload Identity Federation (a way for Google Cloud to trust Vercel's tokens directly).",
  "Accept calls from the production environment only. The demo also accepts preview and local development.",
  "Connect the university's own Vertex AI credentials in AI Gateway, so AI usage counts against its existing Google commitment.",
] as const;

export default function ProposalPage() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="mx-auto flex w-full max-w-2xl items-center justify-between gap-4 px-4 py-5 sm:px-6">
        <a
          className="flex items-center gap-2 rounded-sm font-medium outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          href="/"
        >
          <LogoMark className="size-6 text-primary" />
          GrantDesk
        </a>
        <a className={`${linkClass} text-sm`} href="/">
          Open GrantDesk
        </a>
      </header>

      <main className="mx-auto w-full max-w-2xl space-y-12 px-4 pt-6 pb-16 sm:px-6">
        <section className="space-y-4">
          <p className="font-medium text-primary text-xs uppercase tracking-wider">Proposal</p>
          <h1 className="font-medium text-3xl tracking-tight sm:text-4xl">
            A grant-writing assistant for the Office of Research
          </h1>
          <p className="text-lg leading-relaxed">
            GrantDesk helps researchers draft NIH grant sections from their own lab and grant
            records, with real citations. It runs on Vercel and leaves the Office of Research's data
            on Google Cloud.
          </p>
          <p className="rounded-lg border bg-card px-4 py-3 text-sm italic">
            This is a working demo. Eastbrook University and its labs, grants, and users are
            fictional. The services behind them are real.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-medium text-xl tracking-tight">In short</h2>
          <ul className="list-disc space-y-3 pl-5 leading-relaxed">
            {IN_SHORT.map(({ lead, text }) => (
              <li key={lead}>
                <strong className="font-medium">{lead}</strong> {text}
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="font-medium text-xl tracking-tight">What a researcher does</h2>
          <ol className="list-decimal space-y-2 pl-5 leading-relaxed">
            {STEPS.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>

        <section className="space-y-4">
          <h2 className="font-medium text-xl tracking-tight">How it works</h2>
          <p className="leading-relaxed">
            GrantDesk adds to the existing Google Cloud setup. It does not replace it. Vercel runs
            the assistant and the web app. Google Cloud keeps the data, identity, and Vertex AI.
          </p>
          <h3 className="pt-2 font-medium">Who runs what</h3>
          <dl className="divide-y rounded-lg border bg-card">
            {WHO_RUNS_WHAT.map(({ part, text }) => (
              <div className="space-y-1 px-4 py-3" key={part}>
                <dt className="font-medium">{part}</dt>
                <dd className="text-sm leading-relaxed">{text}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="space-y-4">
          <h2 className="font-medium text-xl tracking-tight">Security</h2>
          <ul className="list-disc space-y-3 pl-5 leading-relaxed">
            {SECURITY.map(({ lead, text }) => (
              <li key={lead}>
                <strong className="font-medium">{lead}</strong> {text}
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="font-medium text-xl tracking-tight">Path to production</h2>
          <ul className="list-disc space-y-2 pl-5 leading-relaxed">
            {PATH_TO_PRODUCTION.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        </section>

        <footer className="flex flex-wrap gap-x-4 gap-y-2 border-t pt-6 text-sm">
          <a className={linkClass} href="/">
            Open GrantDesk
          </a>
          <a className={linkClass} href={REPO_URL} rel="noreferrer" target="_blank">
            View the code on GitHub
          </a>
        </footer>
      </main>
    </div>
  );
}
