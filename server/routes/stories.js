import { Router } from "express";
import { listStories, getStoryById } from "../db.js";

const router = Router();

// GET /api/stories — lista todos os contos (público)
router.get("/", async (req, res) => {
  try {
    const stories = await listStories();
    res.json(stories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao listar contos" });
  }
});

// GET /api/stories/:id — um conto (público)
router.get("/:id", async (req, res) => {
  try {
    const story = await getStoryById(req.params.id);
    if (!story) return res.status(404).json({ error: "Conto não encontrado" });
    res.json(story);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar conto" });
  }
});

export default router;
