import { z } from "zod";

export const createPatientSchema = z.object({
  name: z.string().min(2).max(120),
  age: z.number().int().min(0).max(130),
  document: z.string().min(5).max(30)
});

export const createAssessmentSchema = z.object({
  symptoms: z.array(z.string().min(2)).min(1),
  painLevel: z.number().int().min(0).max(10),
  temperatureCelsius: z.number().min(34).max(43),
  oxygenSaturation: z.number().int().min(50).max(100),
  systolicPressure: z.number().int().min(60).max(240)
});

export const updateTicketSchema = z.object({
  status: z.enum(["open", "in_progress", "resolved"])
});

