"use client";

import { Button } from "@/components/ui/button";

export const STARTER_PROMPTS = [
  "Summarize my lab's active grants and what's due next.",
  "Find recent papers related to my lab's focus and draft a 250-word Significance section for my nearest-deadline grant, with PMID citations.",
  "Save that Significance section to the Research Office.",
] as const;

export function StarterPrompts({
  disabled,
  onPick,
}: {
  readonly disabled: boolean;
  readonly onPick: (prompt: string) => void;
}) {
  return (
    <div className="flex w-full flex-col gap-2">
      {STARTER_PROMPTS.map((prompt) => (
        <Button
          className="h-auto justify-start whitespace-normal py-2 text-left font-normal"
          disabled={disabled}
          key={prompt}
          onClick={() => onPick(prompt)}
          type="button"
          variant="outline"
        >
          {prompt}
        </Button>
      ))}
    </div>
  );
}
