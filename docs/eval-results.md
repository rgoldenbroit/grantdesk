# How GrantDesk's AI behavior is checked

Command: `npx eve eval --strict` (run Oct 27, 2026)

    Results: 4 passed (4 total)
    Gates: 10 passed
    judge.boolean: 91% (2 evals)

| Eval | What it proves |
| --- | --- |
| reads-lab-first | The agent reads the signed-in lab's profile before anything else |
| approval-before-save | A save waits for a person's approval, and completes only after it |
| no-invented-citations | Every PMID in a draft came from the PubMed search; an AI judge scores the writing |
| api-outage | When the grants service is down, the agent says so instead of inventing grant IDs |
