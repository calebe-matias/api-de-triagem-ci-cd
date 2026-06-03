import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

function parseArgs() {
  const args = new Map();
  const raw = process.argv.slice(2);

  for (let index = 0; index < raw.length; index += 1) {
    const item = raw[index];
    if (item.startsWith("--")) {
      args.set(item.slice(2), raw[index + 1]);
      index += 1;
    }
  }

  return {
    owner: args.get("owner") ?? process.env.GITHUB_OWNER ?? "calebe-matias",
    repo: args.get("repo") ?? process.env.GITHUB_REPOSITORY_NAME ?? "api-de-triagem-ci-cd",
    workflow: args.get("workflow") ?? "ci.yml",
    limit: Number(args.get("limit") ?? 30)
  };
}

function ghApi(path) {
  const output = execFileSync("gh", ["api", path], { encoding: "utf8" });
  return JSON.parse(output);
}

function msBetween(start, end) {
  if (!start || !end) {
    return 0;
  }

  return new Date(end).getTime() - new Date(start).getTime();
}

function secondsBetween(start, end) {
  return Number((msBetween(start, end) / 1000).toFixed(2));
}

function readJsonIfExists(path) {
  if (!existsSync(path)) {
    return null;
  }

  return JSON.parse(readFileSync(path, "utf8"));
}

function downloadRunArtifact(runId) {
  const destination = join(".tmp-metrics", String(runId));
  rmSync(destination, { recursive: true, force: true });
  mkdirSync(destination, { recursive: true });

  try {
    execFileSync("gh", ["run", "download", String(runId), "--name", "pipeline-results", "--dir", destination], {
      stdio: "pipe"
    });
  } catch {
    return {
      testSummary: null,
      pipelineContext: null
    };
  }

  return {
    testSummary: readJsonIfExists(join(destination, "reports", "test-summary.json")),
    pipelineContext: readJsonIfExists(join(destination, "reports", "pipeline-context.json"))
  };
}

function csvEscape(value) {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }

  return text;
}

function toCsv(rows) {
  const headers = [
    "run_id",
    "run_url",
    "commit_sha",
    "commit_message",
    "status",
    "workflow_duration",
    "job_name",
    "job_duration",
    "step_name",
    "step_duration",
    "test_count",
    "test_failures",
    "average_test_duration",
    "timestamp",
    "cache_enabled",
    "execution_mode",
    "variation"
  ];

  return [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(","))
  ].join("\n");
}

const options = parseArgs();
const runsResponse = ghApi(
  `/repos/${options.owner}/${options.repo}/actions/workflows/${options.workflow}/runs?branch=main&per_page=${options.limit}`
);
const runs = runsResponse.workflow_runs
  .filter((run) => run.head_commit?.message?.startsWith("exp"))
  .sort((left, right) => new Date(left.created_at).getTime() - new Date(right.created_at).getTime());

const rows = [];

for (const run of runs) {
  const jobsResponse = ghApi(`/repos/${options.owner}/${options.repo}/actions/runs/${run.id}/jobs?per_page=100`);
  const artifactData = downloadRunArtifact(run.id);
  const testSummary = artifactData.testSummary ?? {};
  const pipelineContext = artifactData.pipelineContext ?? {};
  const workflowDuration = secondsBetween(run.created_at, run.updated_at);
  const commitMessage = run.head_commit?.message?.split("\n")[0] ?? "";
  const base = {
    run_id: run.id,
    run_url: run.html_url,
    commit_sha: run.head_sha,
    commit_message: commitMessage,
    status: run.conclusion ?? run.status,
    workflow_duration: workflowDuration,
    test_count: testSummary.test_count ?? 0,
    test_failures: testSummary.test_failures ?? 0,
    average_test_duration: testSummary.average_test_duration_ms ?? 0,
    timestamp: run.created_at,
    cache_enabled: pipelineContext.cache_enabled ?? "unknown",
    execution_mode: pipelineContext.execution_mode ?? "unknown",
    variation: pipelineContext.variation ?? commitMessage.split(":")[0]
  };

  for (const job of jobsResponse.jobs ?? []) {
    const jobDuration = secondsBetween(job.started_at, job.completed_at);
    const steps = job.steps?.length ? job.steps : [{ name: "job", started_at: job.started_at, completed_at: job.completed_at }];

    for (const step of steps) {
      rows.push({
        ...base,
        job_name: job.name,
        job_duration: jobDuration,
        step_name: step.name,
        step_duration: secondsBetween(step.started_at, step.completed_at)
      });
    }
  }
}

mkdirSync("metrics", { recursive: true });
writeFileSync("metrics/runs.json", `${JSON.stringify(rows, null, 2)}\n`);
writeFileSync("metrics/runs.csv", `${toCsv(rows)}\n`);
console.log(`Collected ${rows.length} metric rows from ${runs.length} workflow runs.`);

