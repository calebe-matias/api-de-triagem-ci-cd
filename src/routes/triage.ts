import type { FastifyInstance } from "fastify";
import { createAssessmentSchema, createPatientSchema, updateTicketSchema } from "../domain/validators.js";
import type { MemoryStore } from "../store/memory-store.js";

export async function registerTriageRoutes(app: FastifyInstance, store: MemoryStore): Promise<void> {
  app.post("/patients", async (request, reply) => {
    const parsed = createPatientSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({ error: "invalid_patient", issues: parsed.error.issues });
    }

    return reply.status(201).send(store.createPatient(parsed.data));
  });

  app.get("/patients", async () => store.listPatients());

  app.post("/patients/:patientId/assessments", async (request, reply) => {
    const params = request.params as { patientId: string };
    const parsed = createAssessmentSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({ error: "invalid_assessment", issues: parsed.error.issues });
    }

    try {
      return reply.status(201).send(store.createAssessment(params.patientId, parsed.data));
    } catch {
      return reply.status(404).send({ error: "patient_not_found" });
    }
  });

  app.get("/tickets", async () => store.listTickets());

  app.patch("/tickets/:ticketId", async (request, reply) => {
    const params = request.params as { ticketId: string };
    const parsed = updateTicketSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({ error: "invalid_ticket_update", issues: parsed.error.issues });
    }

    try {
      return store.updateTicket(params.ticketId, parsed.data.status);
    } catch {
      return reply.status(404).send({ error: "ticket_not_found" });
    }
  });

  app.get("/patients/:patientId/timeline", async (request, reply) => {
    const params = request.params as { patientId: string };

    try {
      return store.getTimeline(params.patientId);
    } catch {
      return reply.status(404).send({ error: "patient_not_found" });
    }
  });
}

