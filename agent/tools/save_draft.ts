import { createHash } from "node:crypto";
import { defineTool } from "eve/tools";
import { always } from "eve/tools/approval";
import { z } from "zod";
import { currentLabId } from "../../lib/current-lab";
import { researchOffice } from "../../lib/research-office";

export default defineTool({
  description: "Save a finished proposal section to the Research Office system of record.",
  inputSchema: z.object({
    grantId: z.string().describe("Grant ID from list_active_grants, for example R01-GM-0421"),
    section: z.enum(["specific_aims", "significance", "approach"]),
    markdown: z.string().min(200).describe("The final section text in Markdown"),
  }),
  label: { start: ({ section }) => `Saving ${section.replace("_", " ")} to the Research Office` },
  // DECISION: every write to the system of record needs a human yes.
  // While it waits, the session is parked durably and uses no compute.
  approval: {
    request: always(),
    prompt: ({ input }) =>
      `Save this ${input.section.replace("_", " ")} (${input.markdown.split(/\s+/).length} words) to grant ${input.grantId}?`,
  },
  async execute(input, ctx) {
    // DECISION: the lab comes from the verified login, never from the model,
    // so a prompt injection cannot make the agent write to another lab.
    const labId = currentLabId(ctx.session);
    // DECISION: an interrupted step can re-run. The same content in the same
    // session gives the same key, so the API never stores a duplicate.
    const key = createHash("sha256")
      .update(`${ctx.session.id}:${labId}:${input.grantId}:${input.section}:${input.markdown}`)
      .digest("hex");
    // labId goes last so the verified value always wins over anything in the model's input.
    return researchOffice.post("/drafts", { ...input, labId }, key);
  },
});
