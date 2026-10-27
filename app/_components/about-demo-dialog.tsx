"use client";

import type { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const REPO_URL = "https://github.com/rgoldenbroit/grantdesk";

const REAL = [
  {
    name: "Research Office API",
    detail: "on Google Cloud Run. It accepts only short-lived tokens that Vercel signs for this app.",
  },
  {
    name: "Firestore",
    detail: "stores the lab, grant, and draft records. Saving a draft writes a real record.",
  },
  { name: "PubMed", detail: "searches are live. Every citation is a real paper." },
  {
    name: "Vercel AI Gateway",
    detail: "sends requests to Google Vertex AI first, then Anthropic, and tags spending by lab.",
  },
] as const;

const FICTIONAL = [
  "Eastbrook University",
  "The labs and their research focus",
  "The grants, their IDs, and deadlines",
  "The users and demo accounts",
] as const;

const linkClass =
  "rounded-sm text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50";

// The trigger is styled by the caller: the chat header and the empty state look different.
export function AboutDemoDialog({
  children,
  className,
}: {
  readonly children: ReactNode;
  readonly className?: string;
}) {
  return (
    <Dialog>
      <DialogTrigger className={className}>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader className="text-left">
          <DialogTitle>About this demo</DialogTitle>
          <DialogDescription>
            GrantDesk is a working prototype. The services are real. The university, people, and
            records are made up.
          </DialogDescription>
        </DialogHeader>
        <section className="space-y-2">
          <h3 className="font-medium text-sm">Real</h3>
          <ul className="list-disc space-y-1.5 pl-5 text-muted-foreground text-sm">
            {REAL.map(({ name, detail }) => (
              <li key={name}>
                <span className="font-medium text-foreground">{name}</span> {detail}
              </li>
            ))}
          </ul>
        </section>
        <section className="space-y-2">
          <h3 className="font-medium text-sm">Fictional</h3>
          <ul className="list-disc space-y-1.5 pl-5 text-muted-foreground text-sm">
            {FICTIONAL.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
          {/* New tabs, so the chat stays open behind them. */}
          <a className={linkClass} href="/proposal" target="_blank">
            Read the proposal
          </a>
          <a className={linkClass} href={REPO_URL} rel="noreferrer" target="_blank">
            View the code on GitHub
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}
