/**
 * Entrada serverless da API na Vercel.
 * Todas as rotas /api/* são reescritas para este handler.
 * Força VERCEL=1 antes do import para o loader usar apenas db-vercel (nunca better-sqlite3).
 */
import express from "express";

if (typeof process !== "undefined" && process.env) {
  process.env.VERCEL = "1";
}

let app;
try {
  const module = await import("../server/index.js");
  app = module.default;
} catch (err) {
  console.error("API failed to load:", err);
  const errMsg = err?.message || String(err);
  const errStack = err?.stack || "";
  app = express();
  app.use(express.json());
  app.use((_req, res) => {
    res.status(503).json({
      error: "API temporariamente indisponível. Verifique os logs do deploy na Vercel.",
      detail: errMsg,
      stack: process.env.NODE_ENV !== "production" ? errStack : undefined,
    });
  });
}

export default app;
