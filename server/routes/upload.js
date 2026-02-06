import { Router } from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";
import { existsSync, mkdirSync } from "fs";
import { authMiddleware, requireAdmin } from "../middleware/auth.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = process.env.VERCEL === "1"
  ? path.join("/tmp", "story-sanctuary-uploads")
  : path.join(__dirname, "..", "uploads");
if (!existsSync(uploadsDir)) mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || path.extname(file.mimetype) || "";
    const safeExt = ext.toLowerCase().match(/^\.(jpg|jpeg|png|gif|webp|mp4|webm|mov|mp3|wav|ogg|m4a)$/)
      ? ext
      : ".bin";
    cb(null, `${randomUUID()}${safeExt}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB
  fileFilter: (_req, file, cb) => {
    const allowed = /\.(jpg|jpeg|png|gif|webp|mp4|webm|mov|mp3|wav|ogg|m4a)$/i.test(file.originalname)
      || /^(image|video|audio)\//.test(file.mimetype);
    if (allowed) cb(null, true);
    else cb(new Error("Tipo de arquivo não permitido. Use imagem, vídeo ou áudio."));
  },
});

const router = Router();
router.use(authMiddleware);
router.use(requireAdmin);

function getBaseUrl(req) {
  const envBase = process.env.API_PUBLIC_URL;
  if (envBase) return envBase.replace(/\/$/, "");
  const host = req.get("host") || req.get("x-forwarded-host");
  const proto = req.get("x-forwarded-proto") || (req.connection?.encrypted ? "https" : "http");
  if (host) return `${proto}://${host}`;
  const port = process.env.PORT || 3001;
  return `http://localhost:${port}`;
}

router.post("/", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Nenhum arquivo enviado" });
  }
  const base = getBaseUrl(req);
  const url = `${base}/uploads/${req.file.filename}`;
  res.json({ url });
});

router.use((err, _req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "Arquivo muito grande. Máximo 100 MB." });
    }
  }
  if (err.message) return res.status(400).json({ error: err.message });
  next(err);
});

export default router;
