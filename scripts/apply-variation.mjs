import { readFileSync, writeFileSync } from "node:fs";

const variation = process.argv[2];

if (!variation) {
  throw new Error("Usage: npm run experiment:variation -- exp02");
}

const flagMatrix = {
  exp01: {
    variation: "exp01-baseline",
    cacheEnabled: true,
    executionMode: "sequential",
    expectedCriticalRisk: "critical",
    slowTriageDelayMs: 0,
    generatedRiskCases: 10,
    lintProbe: "stable"
  },
  exp02: {
    variation: "exp02-cache-disabled",
    cacheEnabled: false,
    executionMode: "sequential",
    expectedCriticalRisk: "critical",
    slowTriageDelayMs: 0,
    generatedRiskCases: 10,
    lintProbe: "stable"
  },
  exp03: {
    variation: "exp03-cache-enabled",
    cacheEnabled: true,
    executionMode: "sequential",
    expectedCriticalRisk: "critical",
    slowTriageDelayMs: 0,
    generatedRiskCases: 10,
    lintProbe: "stable"
  },
  exp04: {
    variation: "exp04-failing-risk-test",
    cacheEnabled: true,
    executionMode: "sequential",
    expectedCriticalRisk: "high",
    slowTriageDelayMs: 0,
    generatedRiskCases: 10,
    lintProbe: "stable"
  },
  exp05: {
    variation: "exp05-risk-test-fixed",
    cacheEnabled: true,
    executionMode: "sequential",
    expectedCriticalRisk: "critical",
    slowTriageDelayMs: 0,
    generatedRiskCases: 10,
    lintProbe: "stable"
  },
  exp06: {
    variation: "exp06-slow-test",
    cacheEnabled: true,
    executionMode: "sequential",
    expectedCriticalRisk: "critical",
    slowTriageDelayMs: 2500,
    generatedRiskCases: 10,
    lintProbe: "stable"
  },
  exp07: {
    variation: "exp07-slow-test-removed",
    cacheEnabled: true,
    executionMode: "sequential",
    expectedCriticalRisk: "critical",
    slowTriageDelayMs: 0,
    generatedRiskCases: 10,
    lintProbe: "stable"
  },
  exp08: {
    variation: "exp08-more-tests",
    cacheEnabled: true,
    executionMode: "sequential",
    expectedCriticalRisk: "critical",
    slowTriageDelayMs: 0,
    generatedRiskCases: 146,
    lintProbe: "stable"
  },
  exp09: {
    variation: "exp09-parallel-jobs",
    cacheEnabled: true,
    executionMode: "parallel",
    expectedCriticalRisk: "critical",
    slowTriageDelayMs: 0,
    generatedRiskCases: 146,
    lintProbe: "stable"
  },
  exp10: {
    variation: "exp10-sequential-jobs",
    cacheEnabled: true,
    executionMode: "sequential",
    expectedCriticalRisk: "critical",
    slowTriageDelayMs: 0,
    generatedRiskCases: 146,
    lintProbe: "stable"
  },
  exp11: {
    variation: "exp11-lint-failure",
    cacheEnabled: true,
    executionMode: "sequential",
    expectedCriticalRisk: "critical",
    slowTriageDelayMs: 0,
    generatedRiskCases: 146,
    lintProbe: "lint_failure"
  },
  exp12: {
    variation: "exp12-stable-final",
    cacheEnabled: true,
    executionMode: "sequential",
    expectedCriticalRisk: "critical",
    slowTriageDelayMs: 0,
    generatedRiskCases: 146,
    lintProbe: "stable"
  }
};

const selected = flagMatrix[variation];

if (!selected) {
  throw new Error(`Unknown variation ${variation}`);
}

function writeFlags(flags) {
  const content = `export const experimentFlags = {
  variation: "${flags.variation}",
  cacheEnabled: ${flags.cacheEnabled},
  executionMode: "${flags.executionMode}",
  expectedCriticalRisk: "${flags.expectedCriticalRisk}",
  slowTriageDelayMs: ${flags.slowTriageDelayMs},
  generatedRiskCases: ${flags.generatedRiskCases},
  lintProbe: "${flags.lintProbe}"
} as const;
`;

  writeFileSync("src/experiment-flags.ts", content);
}

function writeLintProbe(flags) {
  const stable = `export function lintProbeStatus(): string {
  return "stable";
}
`;
  const failing = `export function lintProbeStatus(): string {
  const unusedProbe = "this intentionally breaks eslint";
  return "lint_failure";
}
`;

  writeFileSync("src/lint-probe.ts", flags.lintProbe === "lint_failure" ? failing : stable);
}

function writeWorkflow(flags) {
  const qualityNeeds = flags.executionMode === "sequential" ? "needs: install" : "needs: install";
  const testNeeds = flags.executionMode === "sequential" ? "needs: quality" : "needs: install";
  const cacheValue = flags.cacheEnabled ? "true" : "false";

  const workflow = `name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  workflow_dispatch:

env:
  CACHE_ENABLED: "${cacheValue}"
  EXECUTION_MODE: "${flags.executionMode}"
  EXPERIMENT_VARIATION: "${flags.variation}"

jobs:
  install:
    name: install dependencies
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node with npm cache
        if: env.CACHE_ENABLED == 'true'
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Setup Node without cache
        if: env.CACHE_ENABLED != 'true'
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: npm ci

  quality:
    name: lint and typecheck
    ${qualityNeeds}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node with npm cache
        if: env.CACHE_ENABLED == 'true'
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Setup Node without cache
        if: env.CACHE_ENABLED != 'true'
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: npm ci

      - name: ESLint
        run: npm run lint

      - name: TypeScript
        run: npm run typecheck

  test:
    name: automated tests
    ${testNeeds}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node with npm cache
        if: env.CACHE_ENABLED == 'true'
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Setup Node without cache
        if: env.CACHE_ENABLED != 'true'
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: npm ci

      - name: Run tests with coverage
        shell: bash
        run: |
          set +e
          npm run test:ci
          TEST_STATUS=$?
          npm run test:summary
          exit $TEST_STATUS

      - name: Write pipeline context
        if: always()
        run: npm run pipeline:context

      - name: Upload pipeline results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: pipeline-results
          path: |
            reports/
            coverage/
          retention-days: 14
`;

  writeFileSync(".github/workflows/ci.yml", workflow);
}

function appendLog(flags) {
  const path = "docs/variation-state.md";
  const previous = readFileSync(path, "utf8");
  const next = `${previous.trimEnd()}
- ${new Date().toISOString()} - ${flags.variation}: cache=${flags.cacheEnabled}, mode=${flags.executionMode}, tests=${flags.generatedRiskCases}, slow=${flags.slowTriageDelayMs}, lint=${flags.lintProbe}
`;

  writeFileSync(path, next);
}

writeFlags(selected);
writeLintProbe(selected);
writeWorkflow(selected);
appendLog(selected);
console.log(`Applied ${selected.variation}`);
