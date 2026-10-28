import { defineEvalConfig } from "eve/evals";

// Defaults shared by every eval. The judge model grades the soft "quality" checks.
export default defineEvalConfig({
  timeoutMs: 180_000,
});
