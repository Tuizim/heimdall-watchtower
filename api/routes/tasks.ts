import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router = Router();

// GET /api/tasks
router.get("/", requireAuth, async (_req: Request, res: Response) => {
  const tasks = await prisma.task.findMany({
    orderBy: { created_at: "desc" },
  });
  res.json(tasks);
});

// GET /api/tasks/:id
router.get("/:id", requireAuth, async (req: Request, res: Response) => {
  const task = await prisma.task.findUnique({ where: { id: req.params.id } });
  if (!task) {
    res.status(404).json({ error: "Tarefa não encontrada." });
    return;
  }
  res.json(task);
});

// POST /api/tasks
router.post("/", requireAuth, async (req: Request, res: Response) => {
  const { titulo, descricao, pontos, dias_estimados, data_prevista, status, responsavel_id } = req.body;

  if (!titulo) {
    res.status(400).json({ error: "Título é obrigatório." });
    return;
  }

  const task = await prisma.task.create({
    data: {
      titulo,
      descricao,
      pontos: pontos ?? 1,
      dias_estimados: dias_estimados ?? 1,
      data_prevista: data_prevista ? new Date(data_prevista) : null,
      status: status ?? "Verde",
      responsavel_id: responsavel_id ?? null,
    },
  });

  res.status(201).json(task);
});

// PUT /api/tasks/:id
router.put("/:id", requireAuth, async (req: Request, res: Response) => {
  const { titulo, descricao, pontos, dias_estimados, data_prevista, status, responsavel_id } = req.body;

  const task = await prisma.task.update({
    where: { id: req.params.id },
    data: {
      ...(titulo !== undefined && { titulo }),
      ...(descricao !== undefined && { descricao }),
      ...(pontos !== undefined && { pontos }),
      ...(dias_estimados !== undefined && { dias_estimados }),
      ...(data_prevista !== undefined && { data_prevista: data_prevista ? new Date(data_prevista) : null }),
      ...(status !== undefined && { status }),
      ...(responsavel_id !== undefined && { responsavel_id }),
    },
  });

  res.json(task);
});

// DELETE /api/tasks/:id
router.delete("/:id", requireAuth, async (req: Request, res: Response) => {
  await prisma.task.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

// DELETE /api/tasks — delete ALL tasks (Ragnarök, admin only)
router.delete("/", requireAuth, requireAdmin, async (_req: Request, res: Response) => {
  const { count } = await prisma.task.deleteMany();
  res.json({ ok: true, deleted: count });
});

export default router;
