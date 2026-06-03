import { calculateRisk, priorityFromRisk, teamFromRisk } from "../domain/risk.js";
import type { Patient, Ticket, TimelineEvent, TriageAssessment } from "../domain/types.js";

export class MemoryStore {
  private patients = new Map<string, Patient>();
  private assessments = new Map<string, TriageAssessment>();
  private tickets = new Map<string, Ticket>();
  private timeline: TimelineEvent[] = [];
  private sequence = 0;

  createPatient(input: Omit<Patient, "id" | "createdAt">): Patient {
    const patient: Patient = {
      ...input,
      id: this.nextId("pat"),
      createdAt: this.now()
    };

    this.patients.set(patient.id, patient);
    this.addTimeline(patient.id, "patient_created", `Paciente ${patient.name} cadastrado.`);
    return patient;
  }

  listPatients(): Patient[] {
    return [...this.patients.values()].sort((left, right) => left.createdAt.localeCompare(right.createdAt));
  }

  getPatient(id: string): Patient | undefined {
    return this.patients.get(id);
  }

  createAssessment(
    patientId: string,
    input: Omit<TriageAssessment, "id" | "patientId" | "riskLevel" | "createdAt">
  ): { assessment: TriageAssessment; ticket: Ticket } {
    const patient = this.requirePatient(patientId);
    const riskLevel = calculateRisk({ ...input, age: patient.age });
    const assessment: TriageAssessment = {
      ...input,
      id: this.nextId("tri"),
      patientId,
      riskLevel,
      createdAt: this.now()
    };

    this.assessments.set(assessment.id, assessment);
    this.addTimeline(patientId, "assessment_created", `Triagem registrada com risco ${riskLevel}.`);

    const ticket: Ticket = {
      id: this.nextId("tic"),
      patientId,
      assessmentId: assessment.id,
      priority: priorityFromRisk(riskLevel),
      status: "open",
      assignedTeam: teamFromRisk(riskLevel),
      createdAt: this.now()
    };

    this.tickets.set(ticket.id, ticket);
    this.addTimeline(patientId, "ticket_created", `Ticket ${ticket.id} aberto para ${ticket.assignedTeam}.`);
    return { assessment, ticket };
  }

  listTickets(): Ticket[] {
    return [...this.tickets.values()].sort((left, right) => left.priority - right.priority);
  }

  updateTicket(id: string, status: Ticket["status"]): Ticket {
    const ticket = this.tickets.get(id);

    if (!ticket) {
      throw new Error("Ticket not found");
    }

    const updated = { ...ticket, status };
    this.tickets.set(id, updated);
    this.addTimeline(updated.patientId, "ticket_updated", `Ticket ${id} atualizado para ${status}.`);
    return updated;
  }

  getTimeline(patientId: string): TimelineEvent[] {
    this.requirePatient(patientId);
    return this.timeline
      .filter((event) => event.patientId === patientId)
      .sort((left, right) => left.createdAt.localeCompare(right.createdAt));
  }

  private requirePatient(id: string): Patient {
    const patient = this.patients.get(id);

    if (!patient) {
      throw new Error("Patient not found");
    }

    return patient;
  }

  private addTimeline(patientId: string, type: TimelineEvent["type"], description: string): void {
    this.timeline.push({
      id: this.nextId("evt"),
      patientId,
      type,
      description,
      createdAt: this.now()
    });
  }

  private nextId(prefix: string): string {
    this.sequence += 1;
    return `${prefix}_${this.sequence.toString().padStart(4, "0")}`;
  }

  private now(): string {
    const base = Date.UTC(2026, 0, 1, 12, 0, 0);
    return new Date(base + this.sequence * 1000).toISOString();
  }
}

