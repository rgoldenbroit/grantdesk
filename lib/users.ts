import type { AppSession } from "./session";

// DECISION: two demo users so reviewers can see per-lab data and a per-lab model policy.
// Production replaces this file with the university's single sign-on.
export const DEMO_USERS: Record<string, AppSession> = {
  "pi.protein@eastbrook.edu": {
    sub: "u-protein",
    name: "Dr. Maya Chen",
    labId: "protein-design",
    labName: "Protein Design Lab",
    modelPolicy: "standard",
  },
  "pi.neuro@eastbrook.edu": {
    sub: "u-neuro",
    name: "Dr. Samuel Okafor",
    labId: "neuro-imaging",
    labName: "Neuro Imaging Lab",
    modelPolicy: "vertex-only",
  },
};
