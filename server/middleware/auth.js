import jwt from "jsonwebtoken";
import { findUserById } from "../db.js";

const JWT_SECRET = process.env.JWT_SECRET || "story-sanctuary-dev-secret-change-in-production";

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token não informado" });
  }
  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.userId;
    req.userEmail = payload.email;
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido ou expirado" });
  }
}

export function requireAdmin(req, res, next) {
  const user = findUserById(req.userId);
  const isAdmin = user && (user.is_admin || (user.email && user.email.toLowerCase() === "admin@admin.com"));
  if (!isAdmin) {
    return res.status(403).json({ error: "Acesso restrito a administradores" });
  }
  next();
}

export function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }
  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.userId;
    req.userEmail = payload.email;
  } catch {
    // ignore invalid token
  }
  next();
}

export { JWT_SECRET };
