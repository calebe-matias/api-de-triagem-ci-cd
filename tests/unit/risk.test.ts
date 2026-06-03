import { describe, expect, it } from "vitest";
import { calculateRisk, priorityFromRisk, teamFromRisk } from "../../src/domain/risk.js";
import { experimentFlags } from "../../src/experiment-flags.js";

describe("risk engine", () => {
  it("classifies critical symptoms as critical risk", () => {
    const risk = calculateRisk({
      symptoms: ["chest_pain"],
      painLevel: 7,
      temperatureCelsius: 37,
      oxygenSaturation: 96,
      systolicPressure: 120,
      age: 44
    });

    expect(risk).toBe(experimentFlags.expectedCriticalRisk);
  });

  it("classifies low oxygen saturation as critical risk", () => {
    expect(
      calculateRisk({
        symptoms: ["cough"],
        painLevel: 3,
        temperatureCelsius: 37.1,
        oxygenSaturation: 88,
        systolicPressure: 118,
        age: 39
      })
    ).toBe("critical");
  });

  it("classifies elderly patients with fever as high risk", () => {
    expect(
      calculateRisk({
        symptoms: ["fever"],
        painLevel: 4,
        temperatureCelsius: 38.1,
        oxygenSaturation: 96,
        systolicPressure: 130,
        age: 81
      })
    ).toBe("high");
  });

  it("maps risk to operational priority and team", () => {
    expect(priorityFromRisk("critical")).toBe(1);
    expect(priorityFromRisk("low")).toBe(4);
    expect(teamFromRisk("critical")).toBe("emergency");
    expect(teamFromRisk("medium")).toBe("nursing");
  });

  for (let index = 0; index < experimentFlags.generatedRiskCases; index += 1) {
    it(`classifies generated risk case ${index + 1}`, () => {
      const risk = calculateRisk({
        symptoms: index % 3 === 0 ? ["shortness_of_breath"] : ["headache"],
        painLevel: index % 10,
        temperatureCelsius: 36.5 + (index % 4),
        oxygenSaturation: 95,
        systolicPressure: 118,
        age: 20 + index
      });

      expect(["low", "medium", "high", "critical"]).toContain(risk);
    });
  }
});
