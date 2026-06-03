export const experimentFlags = {
  variation: "exp04-failing-risk-test",
  cacheEnabled: true,
  executionMode: "sequential",
  expectedCriticalRisk: "high",
  slowTriageDelayMs: 0,
  generatedRiskCases: 10,
  lintProbe: "stable"
} as const;
