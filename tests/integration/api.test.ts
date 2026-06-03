import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../../src/app.js";
import { experimentFlags } from "../../src/experiment-flags.js";

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe("triage api", () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = buildApp();
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });

  it("returns health status", async () => {
    const response = await app.inject({ method: "GET", url: "/health" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ status: "ok" });
  });

  it("creates a patient and lists patients", async () => {
    const create = await app.inject({
      method: "POST",
      url: "/patients",
      payload: { name: "Carla Mendes", age: 42, document: "123456" }
    });

    const list = await app.inject({ method: "GET", url: "/patients" });

    expect(create.statusCode).toBe(201);
    expect(list.json()).toHaveLength(1);
  });

  it("creates assessment, ticket and timeline", async () => {
    const patientResponse = await app.inject({
      method: "POST",
      url: "/patients",
      payload: { name: "Bruno Costa", age: 67, document: "abcdef" }
    });
    const patient = patientResponse.json();

    const assessmentResponse = await app.inject({
      method: "POST",
      url: `/patients/${patient.id}/assessments`,
      payload: {
        symptoms: ["chest_pain"],
        painLevel: 8,
        temperatureCelsius: 37.2,
        oxygenSaturation: 95,
        systolicPressure: 128
      }
    });
    const timelineResponse = await app.inject({ method: "GET", url: `/patients/${patient.id}/timeline` });

    expect(assessmentResponse.statusCode).toBe(201);
    expect(assessmentResponse.json().assessment.riskLevel).toBe("critical");
    expect(timelineResponse.json().map((event: { type: string }) => event.type)).toEqual([
      "patient_created",
      "assessment_created",
      "ticket_created"
    ]);
  });

  it("updates ticket status", async () => {
    const patientResponse = await app.inject({
      method: "POST",
      url: "/patients",
      payload: { name: "Daniel Rocha", age: 35, document: "zz999" }
    });
    const patient = patientResponse.json();
    await app.inject({
      method: "POST",
      url: `/patients/${patient.id}/assessments`,
      payload: {
        symptoms: ["fever"],
        painLevel: 5,
        temperatureCelsius: 38.5,
        oxygenSaturation: 97,
        systolicPressure: 120
      }
    });
    const tickets = (await app.inject({ method: "GET", url: "/tickets" })).json();

    const update = await app.inject({
      method: "PATCH",
      url: `/tickets/${tickets[0].id}`,
      payload: { status: "resolved" }
    });

    expect(update.statusCode).toBe(200);
    expect(update.json().status).toBe("resolved");
  });

  it("can simulate a slow triage test for pipeline analysis", async () => {
    await wait(experimentFlags.slowTriageDelayMs);
    expect(experimentFlags.slowTriageDelayMs).toBeGreaterThanOrEqual(0);
  });
});

