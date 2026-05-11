import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

const PUBLIC_FIELDS = {
  id: true,
  nome: true,
  email: true,
  login: true,
  avatar_url: true,
  classe_viking: true,
  papel: true,
  role: true,
  xp: true,
  created_at: true,
};

// GET /api/profiles
router.get("/", requireAuth, async (_req: Request, res: Response) => {
  const profiles = await prisma.profile.findMany({
    select: PUBLIC_FIELDS,
    orderBy: { xp: "desc" },
  });
  res.json(profiles);
});

// GET /api/profiles/:id
router.get("/:id", requireAuth, async (req: Request, res: Response) => {
  const profile = await prisma.profile.findUnique({
    where: { id: req.params.id },
    select: PUBLIC_FIELDS,
  });

  if (!profile) {
    res.status(404).json({ error: "Perfil não encontrado." });
    return;
  }

  res.json(profile);
});

// PUT /api/profiles/:id  (own profile or admin)
router.put("/:id", requireAuth, async (req: Request, res: Response) => {
  const isOwn = req.user!.userId === req.params.id;
  const isAdmin = req.user!.role === "admin";

  if (!isOwn && !isAdmin) {
    res.status(403).json({ error: "Sem permissão para editar este perfil." });
    return;
  }

  const { nome, avatar_url, classe_viking, papel } = req.body;

  const updated = await prisma.profile.update({
    where: { id: req.params.id },
    data: { nome, avatar_url, classe_viking, papel },
    select: PUBLIC_FIELDS,
  });

  res.json(updated);
});

export default router;
