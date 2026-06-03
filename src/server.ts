import { buildApp } from "./app.js";

const app = buildApp();
const port = Number(process.env.PORT ?? 3000);

try {
  await app.listen({ port, host: "0.0.0.0" });
  console.log(`API de Triagem CI CD listening on ${port}`);
} catch (error) {
  app.log.error(error);
  process.exit(1);
}

