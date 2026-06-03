export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface Patient {
  id: string;
  name: string;
  age: number;
  document: string;
  createdAt: string;
}

export interface TriageAssessment {
  id: string;
  patientId: string;
  symptoms: string[];
  painLevel: number;
  temperatureCelsius: number;
  oxygenSaturation: number;
  systolicPressure: number;
  riskLevel: RiskLevel;
  createdAt: string;
}

export interface Ticket {
  id: string;
  patientId: string;
  assessmentId: string;
  priority: number;
  status: "open" | "in_progress" | "resolved";
  assignedTeam: "nursing" | "medical" | "emergency";
  createdAt: string;
}

export interface TimelineEvent {
  id: string;
  patientId: string;
  type: "patient_created" | "assessment_created" | "ticket_created" | "ticket_updated";
  description: string;
  createdAt: string;
}

