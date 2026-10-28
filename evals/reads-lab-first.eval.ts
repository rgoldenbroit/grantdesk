import { defineEval } from "eve/evals";
import { equals } from "eve/evals/expect";
import { labStubs } from "./data/stubs.js";

export default defineEval({
  description: "Reads the lab profile before doing anything else.",
  async test(t) {
    const session = await t.session({ stubs: labStubs });
    const turn = await session.send("Summarize my lab's active grants and what's due next.");
    turn.expectOk();
    turn.calledTool("get_lab_profile");
    turn.calledTool("list_active_grants");
    t.check(turn.toolCalls[0]?.name, equals("get_lab_profile"));
  },
});
