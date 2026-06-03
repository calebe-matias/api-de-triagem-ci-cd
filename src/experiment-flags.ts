export const experimentFlags = {
  variation: "exp02-cache-disabled",
  cacheEnabled: false,
  executionMode: "sequential",
  expectedCriticalRisk: "critical",
  slowTriageDelayMs: 0,
  generatedRiskCases: 10,
  lintProbe: "stable"
} as const;
