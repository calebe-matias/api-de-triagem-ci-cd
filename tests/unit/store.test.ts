import { describe, expect, it } from "vitest";
import { MemoryStore } from "../../src/store/memory-store.js";

describe("memory store", () => {
  it("creates patient, assessment, ticket and ordered timeline", () => {
    const store = new MemoryStore();
    const patient = store.createPatient({
      name: "Joao Souza",
      age: 52,
      document: "998877"
    });

    const { assessment, ticket } = store.createAssessment(patient.id, {
      symptoms: ["shortness_of_breath"],
      painLevel: 7,
      temperatureCelsius: 37.8,
      oxygenSaturation: 92,
      systolicPressure: 135
    });

    expect(assessment.riskLevel).toBe("high");
    expect(ticket.priority).toBe(2);
    expect(ticket.assignedTeam).toBe("medical");
    expect(store.getTimeline(patient.id).map((event) => event.type)).toEqual([
      "patient_created",
      "assessment_created",
      "ticket_created"
    ]);
  });

  it("updates ticket status and records timeline event", () => {
    const store = new MemoryStore();
    const patient = store.createPatient({ name: "Ana Lima", age: 30, document: "445566" });
    const { ticket } = store.createAssessment(patient.id, {
      symptoms: ["headache"],
      painLevel: 4,
      temperatureCelsius: 36.9,
      oxygenSaturation: 98,
      systolicPressure: 118
    });

    const updated = store.updateTicket(ticket.id, "in_progress");

    expect(updated.status).toBe("in_progress");
    expect(store.getTimeline(patient.id).at(-1)?.type).toBe("ticket_updated");
  });
});

