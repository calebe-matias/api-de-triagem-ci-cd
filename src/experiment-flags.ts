export const experimentFlags = {
  variation: "exp05-risk-test-fixed",
  cacheEnabled: true,
  executionMode: "sequential",
  expectedCriticalRisk: "critical",
  slowTriageDelayMs: 0,
  generatedRiskCases: 10,
  lintProbe: "stable"
} as const;
