import { Router } from "express";
import {
  listStories,
  getStoryById,
  createStory,
  updateStory,
  deleteStory,
} from "../db.js";
import { authMiddleware, requireAdmin } from "../middleware/auth.js";

const router = Router();

router.use(authMiddleware);
router.use(requireAdmin);

// GET /api/admin/stories — listar todos (admin)
router.get("/stories", (req, res) => {
  try {
    const stories = listStories();
    res.json(stories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao listar contos" });
  }
});

// GET /api/admin/stories/:id — um conto (admin)
router.get("/stories/:id", (req, res) => {
  try {
    const story = getStoryById(req.params.id);
    if (!story) return res.status(404).json({ error: "Conto não encontrado" });
    res.json(story);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar conto" });
  }
});

// POST /api/admin/stories — criar conto (admin)
router.post("/stories", (req, res) => {
  try {
    const body = req.body;
    if (!body.title) {
      return res.status(400).json({ error: "Título é obrigatório" });
    }
    const story = createStory(body);
    res.status(201).json(story);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao criar conto" });
  }
});

// PUT /api/admin/stories/:id — atualizar conto (admin)
router.put("/stories/:id", (req, res) => {
  try {
    const story = updateStory(req.params.id, req.body);
    if (!story) return res.status(404).json({ error: "Conto não encontrado" });
    res.json(story);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao atualizar conto" });
  }
});

// DELETE /api/admin/stories/:id — remover conto (admin)
router.delete("/stories/:id", (req, res) => {
  try {
    const existing = getStoryById(req.params.id);
    if (!existing) return res.status(404).json({ error: "Conto não encontrado" });
    deleteStory(req.params.id);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao excluir conto" });
  }
});

export default router;
