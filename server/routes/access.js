import { Router } from "express";
import { hasStoryAccess, getUserPurchasedStories } from "../db.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

// GET /api/access/check/:storyId — verifica se o usuário tem acesso ao conto (requer token)
router.get("/check/:storyId", authMiddleware, async (req, res) => {
  const { storyId } = req.params;
  const hasAccess = await hasStoryAccess(req.userId, storyId);
  res.json({ hasAccess, storyId });
});

// GET /api/access/me — lista contos que o usuário tem acesso (para per_story)
router.get("/me", authMiddleware, async (req, res) => {
  const storyIds = await getUserPurchasedStories(req.userId);
  res.json({ storyIds });
});

export default router;
