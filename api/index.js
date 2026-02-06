/**
 * Entrada serverless da API na Vercel.
 * Todas as rotas /api/* são reescritas para este handler.
 * Se o servidor falhar ao carregar (ex.: módulo nativo no serverless), retorna 503 em JSON.
 */
import express from "express";

let app;
try {
  const module = await import("../server/index.js");
  app = module.default;
} catch (err) {
  console.error("API failed to load:", err);
  const errMsg = err?.message || String(err);
  app = express();
  app.use(express.json());
  app.use((_req, res) => {
    res.status(503).json({
      error: "API temporariamente indisponível. Verifique os logs do deploy na Vercel.",
      detail: errMsg,
    });
  });
}

export default app;
