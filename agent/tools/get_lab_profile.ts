import { defineTool } from "eve/tools";
import { z } from "zod";
import { currentLabId } from "../../lib/current-lab";
import { researchOffice } from "../../lib/research-office";

export default defineTool({
  description: "Get the signed-in researcher's lab profile: lab name, PI, department, and research focus.",
  // DECISION: no labId input. The model cannot ask for another lab's data.
  inputSchema: z.object({}),
  label: { start: () => "Reading your lab profile" },
  async execute(_input, ctx) {
    return researchOffice.get(`/labs/${currentLabId(ctx.session)}`);
  },
});
