export const experimentFlags = {
  variation: "exp01-baseline",
  cacheEnabled: true,
  executionMode: "sequential",
  expectedCriticalRisk: "critical",
  slowTriageDelayMs: 0,
  generatedRiskCases: 10,
  lintProbe: "stable"
} as const;
