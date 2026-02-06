import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  createUser,
  findUserByEmail,
  findUserById,
} from "../db.js";
import { authMiddleware, JWT_SECRET } from "../middleware/auth.js";

const router = Router();
const SALT_ROUNDS = 10;

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { email, password, accessType } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email e senha são obrigatórios" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Senha deve ter no mínimo 6 caracteres" });
    }
    const type = accessType === "lifetime" ? "lifetime" : "per_story";
    const existing = findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: "Este email já está cadastrado" });
    }
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = createUser(email, passwordHash, type);
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        accessType: user.access_type,
        isAdmin: user.is_admin,
      },
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao criar conta" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email e senha são obrigatórios" });
    }
    const user = findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "Email ou senha incorretos" });
    }
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: "Email ou senha incorretos" });
    }
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    const isAdmin = Boolean(user.is_admin) || user.email.toLowerCase() === "admin@admin.com";
    res.json({
      user: {
        id: user.id,
        email: user.email,
        accessType: user.access_type,
        isAdmin,
      },
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao fazer login" });
  }
});

// GET /api/auth/me (requer token)
router.get("/me", authMiddleware, (req, res) => {
  const user = findUserById(req.userId);
  if (!user) {
    return res.status(404).json({ error: "Usuário não encontrado" });
  }
  const isAdmin = Boolean(user.is_admin) || user.email.toLowerCase() === "admin@admin.com";
  res.json({
    id: user.id,
    email: user.email,
    accessType: user.access_type,
    isAdmin,
    createdAt: user.created_at,
  });
});

export default router;
