import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// GET /api/branches
router.get("/", requireAuth, async (_req: Request, res: Response) => {
  const branches = await prisma.branch.findMany({
    orderBy: { ultimo_update: "desc" },
  });
  res.json(branches);
});

// POST /api/branches
router.post("/", requireAuth, async (req: Request, res: Response) => {
  const { nome_branch, responsavel_id, status, observacao } = req.body;

  if (!nome_branch) {
    res.status(400).json({ error: "Nome da branch é obrigatório." });
    return;
  }

  const branch = await prisma.branch.create({
    data: {
      nome_branch,
      responsavel_id: responsavel_id ?? null,
      status: status ?? "Em progresso",
      observacao,
    },
  });

  res.status(201).json(branch);
});

// PUT /api/branches/:id
router.put("/:id", requireAuth, async (req: Request, res: Response) => {
  const { nome_branch, responsavel_id, status, observacao } = req.body;

  const branch = await prisma.branch.update({
    where: { id: req.params.id },
    data: {
      ...(nome_branch !== undefined && { nome_branch }),
      ...(responsavel_id !== undefined && { responsavel_id }),
      ...(status !== undefined && { status }),
      ...(observacao !== undefined && { observacao }),
      ultimo_update: new Date(),
    },
  });

  res.json(branch);
});

// DELETE /api/branches/:id
router.delete("/:id", requireAuth, async (req: Request, res: Response) => {
  await prisma.branch.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

export default router;
