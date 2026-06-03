import type { RiskLevel } from "./types.js";

export interface RiskInput {
  symptoms: string[];
  painLevel: number;
  temperatureCelsius: number;
  oxygenSaturation: number;
  systolicPressure: number;
  age: number;
}

const criticalSymptoms = new Set(["chest_pain", "stroke_signs", "severe_bleeding", "unconscious"]);
const highSymptoms = new Set(["shortness_of_breath", "persistent_vomiting", "confusion"]);

export function calculateRisk(input: RiskInput): RiskLevel {
  const normalizedSymptoms = input.symptoms.map((symptom) => symptom.trim().toLowerCase());
  const hasCriticalSymptom = normalizedSymptoms.some((symptom) => criticalSymptoms.has(symptom));
  const hasHighSymptom = normalizedSymptoms.some((symptom) => highSymptoms.has(symptom));

  if (
    hasCriticalSymptom ||
    input.oxygenSaturation < 90 ||
    input.systolicPressure < 85 ||
    input.painLevel >= 9
  ) {
    return "critical";
  }

  if (
    hasHighSymptom ||
    input.oxygenSaturation < 94 ||
    input.temperatureCelsius >= 39 ||
    input.systolicPressure > 170 ||
    input.age >= 75
  ) {
    return "high";
  }

  if (input.painLevel >= 5 || input.temperatureCelsius >= 37.8 || normalizedSymptoms.length >= 3) {
    return "medium";
  }

  return "low";
}

export function priorityFromRisk(risk: RiskLevel): number {
  const priorities: Record<RiskLevel, number> = {
    critical: 1,
    high: 2,
    medium: 3,
    low: 4
  };

  return priorities[risk];
}

export function teamFromRisk(risk: RiskLevel): "nursing" | "medical" | "emergency" {
  if (risk === "critical") {
    return "emergency";
  }

  if (risk === "high") {
    return "medical";
  }

  return "nursing";
}

