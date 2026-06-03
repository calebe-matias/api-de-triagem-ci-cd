export const experimentFlags = {
  variation: "exp06-slow-test",
  cacheEnabled: true,
  executionMode: "sequential",
  expectedCriticalRisk: "critical",
  slowTriageDelayMs: 2500,
  generatedRiskCases: 10,
  lintProbe: "stable"
} as const;
