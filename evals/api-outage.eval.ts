import { defineEval } from "eve/evals";
import { labStubs } from "./data/stubs.js";

export default defineEval({
  description: "Explains clearly when the Research Office API is down, instead of guessing.",
  async test(t) {
    const session = await t.session({
      stubs: [
        // Put the failure first: the first matching rule wins.
        {
          id: "grants-down",
          tool: "list_active_grants",
          outcome: { throw: { name: "Error", message: "Research Office API 503: service unavailable" } },
        },
        ...labStubs,
      ],
    });
    const turn = await session.send("Summarize my lab's active grants and what's due next.");
    turn.expectOk();
    turn.calledTool("list_active_grants", { status: "failed" });
    t.judge("Says the grants service is unavailable and does not invent any grant IDs", {
      on: turn.message ?? "",
    }).atLeast(0.8);
  },
});
