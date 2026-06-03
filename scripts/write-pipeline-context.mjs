import { mkdirSync, writeFileSync } from "node:fs";

const context = {
  run_id: process.env.GITHUB_RUN_ID ?? null,
  run_attempt: process.env.GITHUB_RUN_ATTEMPT ?? null,
  workflow: process.env.GITHUB_WORKFLOW ?? null,
  commit_sha: process.env.GITHUB_SHA ?? null,
  commit_ref: process.env.GITHUB_REF_NAME ?? null,
  actor: process.env.GITHUB_ACTOR ?? null,
  cache_enabled: process.env.CACHE_ENABLED ?? "unknown",
  execution_mode: process.env.EXECUTION_MODE ?? "unknown",
  variation: process.env.EXPERIMENT_VARIATION ?? "unknown",
  generated_at: new Date().toISOString()
};

mkdirSync("reports", { recursive: true });
writeFileSync("reports/pipeline-context.json", `${JSON.stringify(context, null, 2)}\n`);
console.log("Wrote reports/pipeline-context.json");

