import { describe, expect, it } from "vitest";
import { createAssessmentSchema, createPatientSchema } from "../../src/domain/validators.js";

describe("validators", () => {
  it("accepts valid patient input", () => {
    const result = createPatientSchema.safeParse({
      name: "Maria Silva",
      age: 38,
      document: "12345678900"
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid patient age", () => {
    const result = createPatientSchema.safeParse({
      name: "A",
      age: 170,
      document: "1"
    });

    expect(result.success).toBe(false);
  });

  it("accepts valid assessment input", () => {
    const result = createAssessmentSchema.safeParse({
      symptoms: ["fever", "headache"],
      painLevel: 5,
      temperatureCelsius: 38.2,
      oxygenSaturation: 97,
      systolicPressure: 122
    });

    expect(result.success).toBe(true);
  });
});

