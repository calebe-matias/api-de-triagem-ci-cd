import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const resultsPath = "reports/test-results.json";
const summaryPath = "reports/test-summary.json";

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return null;
  }
}

function collectDurations(node, durations = []) {
  if (!node || typeof node !== "object") {
    return durations;
  }

  if (typeof node.duration === "number") {
    durations.push(node.duration);
  }

  for (const value of Object.values(node)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        collectDurations(item, durations);
      }
    } else if (value && typeof value === "object") {
      collectDurations(value, durations);
    }
  }

  return durations;
}

function summarizeVitestJson(report) {
  if (!report) {
    return {
      test_count: 0,
      test_failures: 0,
      average_test_duration_ms: 0,
      source: "missing"
    };
  }

  const testResults = Array.isArray(report.testResults) ? report.testResults : [];
  const assertionResults = testResults.flatMap((file) =>
    Array.isArray(file.assertionResults) ? file.assertionResults : []
  );
  const durations = assertionResults
    .map((test) => test.duration)
    .filter((duration) => typeof duration === "number");

  const testCount = report.numTotalTests ?? assertionResults.length;
  const failures = report.numFailedTests ?? assertionResults.filter((test) => test.status === "failed").length;
  const durationPool = durations.length > 0 ? durations : collectDurations(report);
  const average =
    durationPool.length > 0 ? durationPool.reduce((total, duration) => total + duration, 0) / durationPool.length : 0;

  return {
    test_count: testCount,
    test_failures: failures,
    average_test_duration_ms: Number(average.toFixed(2)),
    source: "vitest-json"
  };
}

const report = readJson(resultsPath);
const summary = {
  ...summarizeVitestJson(report),
  generated_at: new Date().toISOString()
};

mkdirSync(dirname(summaryPath), { recursive: true });
writeFileSync(summaryPath, `${JSON.stringify(summary, null, 2)}\n`);
console.log(`Wrote ${summaryPath}`);

