import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { existsSync, mkdirSync } from "fs";
import bcrypt from "bcryptjs";
import { seedStoriesIfEmpty, findUserByEmail, createUser } from "./db.js";
import authRoutes from "./routes/auth.js";
import accessRoutes from "./routes/access.js";
import storiesRoutes from "./routes/stories.js";
import adminRoutes from "./routes/admin.js";
import uploadRoutes from "./routes/upload.js";
import stripeRoutes, { stripeWebhookHandler } from "./routes/stripe.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, "uploads");
if (!existsSync(uploadsDir)) mkdirSync(uploadsDir, { recursive: true });

const DEFAULT_ADMIN_EMAIL = "admin@admin.com";
const DEFAULT_ADMIN_PASSWORD = "admin123";

const INIT_TIMEOUT_MS = 15000;
const initPromise = (async () => {
  await Promise.race([
    (async () => {
      await seedStoriesIfEmpty();
      const existing = await findUserByEmail(DEFAULT_ADMIN_EMAIL);
      if (!existing) {
        const hash = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10);
        await createUser(DEFAULT_ADMIN_EMAIL, hash, "per_story", true);
        console.log(`Admin padrão criado: ${DEFAULT_ADMIN_EMAIL}`);
      }
    })(),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Init timeout")), INIT_TIMEOUT_MS)
    ),
  ]).catch((err) => {
    console.error("Init error:", err);
    throw err;
  });
})();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: true, credentials: true }));

app.use((_req, _res, next) => {
  initPromise.then(() => next()).catch(next);
});

// Webhook Stripe precisa do body raw (antes de express.json)
app.post("/api/webhooks/stripe", express.raw({ type: "application/json" }), stripeWebhookHandler);

app.use(express.json({ limit: "2mb" }));

app.use("/uploads", express.static(uploadsDir));
app.use("/api/auth", authRoutes);
app.use("/api/access", accessRoutes);
app.use("/api/stories", storiesRoutes);
// Upload antes de /api/admin para não ser engolido pela rota admin
app.use("/api/admin/upload", uploadRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/stripe", stripeRoutes);

app.get("/api/health", (_, res) => res.json({ ok: true }));

// 404 em JSON para o front não quebrar ao parsear
app.use("/api", (_req, res) => {
  res.status(404).json({ error: "Rota não encontrada" });
});

// Frontend integrado (só fora da Vercel; na Vercel o front é servido estático)
if (process.env.VERCEL !== "1") {
  const distPath = path.join(__dirname, "..", "dist");
  if (existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
}

// Erros não tratados retornam JSON (evita HTML que quebra o parse no front)
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message || "Erro interno no servidor" });
});

if (process.env.VERCEL !== "1") {
  app.listen(PORT, () => {
    console.log(`Story Sanctuary rodando em http://localhost:${PORT} (API + frontend)`);
  });
}

export default app;
