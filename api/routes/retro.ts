import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// GET /api/retro
router.get("/", requireAuth, async (_req: Request, res: Response) => {
  const cards = await prisma.retroCard.findMany({
    orderBy: { created_at: "desc" },
  });
  res.json(cards);
});

// POST /api/retro
router.post("/", requireAuth, async (req: Request, res: Response) => {
  const { titulo, descricao, status } = req.body;

  if (!titulo) {
    res.status(400).json({ error: "Título é obrigatório." });
    return;
  }

  const card = await prisma.retroCard.create({
    data: {
      titulo,
      descricao,
      status: status ?? "Pendentes",
      responsavel_id: req.user!.userId,
    },
  });

  res.status(201).json(card);
});

// PUT /api/retro/:id  (owner or admin)
router.put("/:id", requireAuth, async (req: Request, res: Response) => {
  const existing = await prisma.retroCard.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    res.status(404).json({ error: "Card não encontrado." });
    return;
  }

  const isOwner = existing.responsavel_id === req.user!.userId;
  const isAdmin = req.user!.role === "admin";

  if (!isOwner && !isAdmin) {
    res.status(403).json({ error: "Sem permissão para editar este card." });
    return;
  }

  const { titulo, descricao, status, responsavel_id } = req.body;

  const card = await prisma.retroCard.update({
    where: { id: req.params.id },
    data: {
      ...(titulo !== undefined && { titulo }),
      ...(descricao !== undefined && { descricao }),
      ...(status !== undefined && { status }),
      ...(responsavel_id !== undefined && { responsavel_id }),
    },
  });

  res.json(card);
});

// DELETE /api/retro/:id  (owner or admin)
router.delete("/:id", requireAuth, async (req: Request, res: Response) => {
  const existing = await prisma.retroCard.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    res.status(404).json({ error: "Card não encontrado." });
    return;
  }

  const isOwner = existing.responsavel_id === req.user!.userId;
  const isAdmin = req.user!.role === "admin";

  if (!isOwner && !isAdmin) {
    res.status(403).json({ error: "Sem permissão para excluir este card." });
    return;
  }

  await prisma.retroCard.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

export default router;
