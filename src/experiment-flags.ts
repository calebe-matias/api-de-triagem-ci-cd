export const experimentFlags = {
  variation: "exp03-cache-enabled",
  cacheEnabled: true,
  executionMode: "sequential",
  expectedCriticalRisk: "critical",
  slowTriageDelayMs: 0,
  generatedRiskCases: 10,
  lintProbe: "stable"
} as const;
