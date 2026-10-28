import type { ToolStub } from "eve/evals";

// Fake PMIDs used only in tests. The agent must cite these and nothing else.
export const PMIDS = ["39001234", "38877654", "38512345"];

export const labStubs: readonly ToolStub[] = [
  {
    id: "lab",
    tool: "get_lab_profile",
    outcome: {
      response: {
        id: "protein-design",
        name: "Protein Design Lab",
        pi: "Dr. Maya Chen",
        focus: "computational design of enzymes that break down PET plastic",
      },
    },
  },
  {
    id: "grants",
    tool: "list_active_grants",
    outcome: {
      response: {
        grants: [
          {
            id: "R01-GM-0421",
            title: "Engineering thermostable PET hydrolases",
            status: "Resubmission in progress",
            nextDeadline: "2027-02-05",
          },
        ],
      },
    },
  },
  {
    id: "pubmed",
    tool: "search_pubmed",
    outcome: {
      response: {
        results: PMIDS.map((pmid) => ({
          pmid,
          title: `Thermostable PET hydrolase study ${pmid}`,
          journal: "Test Journal of Enzymology",
          year: "2025",
          url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
        })),
      },
    },
  },
  { id: "save", tool: "save_draft", outcome: { response: { id: "D-TEST0001", duplicate: false } } },
];
