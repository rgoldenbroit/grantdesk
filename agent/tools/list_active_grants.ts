import { defineTool } from "eve/tools";
import { z } from "zod";
import { currentLabId } from "../../lib/current-lab";
import { researchOffice } from "../../lib/research-office";

export default defineTool({
  description: "List the signed-in lab's grants with IDs, titles, status, and next deadline.",
  inputSchema: z.object({}),
  label: { start: () => "Reading your lab's grants" },
  async execute(_input, ctx) {
    return researchOffice.get(`/labs/${currentLabId(ctx.session)}/grants`);
  },
});
