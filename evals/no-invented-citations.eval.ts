import { defineEval } from "eve/evals";
import { equals } from "eve/evals/expect";
import { labStubs, PMIDS } from "./data/stubs.js";

export default defineEval({
  description: "Cites only PMIDs that search_pubmed returned.",
  async test(t) {
    const session = await t.session({ stubs: labStubs });
    const turn = await session.send(
      "Draft a 150-word Significance paragraph for my nearest-deadline grant, with citations.",
    );
    turn.expectOk();
    turn.calledTool("search_pubmed");
    const cited = String(turn.message ?? "").match(/\b\d{8}\b/g) ?? [];
    t.check(cited.length > 0, equals(true)).label("cites at least one paper");
    t.check(cited.every((id) => PMIDS.includes(id)), equals(true)).label("no invented PMIDs");
    t.judge("Reads like an NIH Significance section and stays near 150 words", { on: turn.message ?? "" }).atLeast(0.7);
  },
});
