import cors from "@fastify/cors";
import Fastify from "fastify";
import { registerHealthRoutes } from "./routes/health.js";
import { registerTriageRoutes } from "./routes/triage.js";
import { MemoryStore } from "./store/memory-store.js";

export function buildApp() {
  const app = Fastify({ logger: false });
  const store = new MemoryStore();

  app.register(cors, { origin: true });
  app.register(registerHealthRoutes);
  app.register(async (instance) => registerTriageRoutes(instance, store));

  return app;
}

