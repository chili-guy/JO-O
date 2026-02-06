/**
 * Entrada serverless da API na Vercel.
 * Todas as rotas /api/* são reescritas para este handler.
 * VERCEL=1 deve estar definido antes de qualquer import do server (loader usa só db-vercel).
 */
// Definir antes de qualquer import que possa puxar server/db (evita better-sqlite3 no serverless)
if (typeof process !== "undefined" && process.env) {
  process.env.VERCEL = "1";
}
import express from "express";

let app;
try {
  const module = await import("../server/index.js");
  app = module.default;
} catch (err) {
  console.error("API failed to load:", err);
  const errMsg = err?.message || String(err);
  const errStack = err?.stack || "";
  const errName = err?.name || "Error";
  app = express();
  app.use(express.json());
  app.use((_req, res) => {
    res.status(503).json({
      error: "API temporariamente indisponível. Verifique os logs do deploy na Vercel.",
      detail: errMsg,
      name: errName,
      stack: errStack,
    });
  });
}

export default app;
