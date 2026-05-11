import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router = Router();

// All admin routes require auth + admin role
router.use(requireAuth, requireAdmin);

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

// GET /api/admin/users
router.get("/users", async (_req: Request, res: Response) => {
  const users = await prisma.profile.findMany({
    select: PUBLIC_FIELDS,
    orderBy: { created_at: "asc" },
  });
  res.json(users);
});

// POST /api/admin/users  — create a user with username/password
router.post("/users", async (req: Request, res: Response) => {
  const { nome, login, password, email, papel, classe_viking, role, avatar_url } = req.body;

  if (!nome || !login || !password) {
    res.status(400).json({ error: "Nome, login e senha são obrigatórios." });
    return;
  }
  if (password.length < 12) {
    res.status(400).json({ error: "Senha deve ter pelo menos 12 caracteres." });
    return;
  }

  const exists = await prisma.profile.findFirst({
    where: { OR: [{ login }, { email: email ?? `${login}@heimdall.local` }] },
  });
  if (exists) {
    res.status(409).json({ error: "Login ou email já em uso." });
    return;
  }

  const password_hash = await bcrypt.hash(password, 12);
  const resolvedEmail = email?.trim() || `${login.trim().toLowerCase()}@heimdall.local`;

  const user = await prisma.profile.create({
    data: {
      nome,
      login: login.trim().toLowerCase(),
      email: resolvedEmail,
      password_hash,
      papel: papel ?? "Desenvolvedor",
      classe_viking: classe_viking ?? "Recruta",
      role: role === "admin" ? "admin" : "user",
      ...(avatar_url ? { avatar_url } : {}),
    },
    select: PUBLIC_FIELDS,
  });

  res.status(201).json(user);
});

// PUT /api/admin/users/:id  — update any user field
router.put("/users/:id", async (req: Request, res: Response) => {
  const { nome, login, password, email, papel, classe_viking, role, xp } = req.body;

  const data: Record<string, unknown> = {};
  if (nome !== undefined) data.nome = nome;
  if (login !== undefined) data.login = login.trim().toLowerCase();
  if (email !== undefined) data.email = email;
  if (papel !== undefined) data.papel = papel;
  if (classe_viking !== undefined) data.classe_viking = classe_viking;
  if (role !== undefined) data.role = role === "admin" ? "admin" : "user";
  if (xp !== undefined) data.xp = Number(xp);
  if (password !== undefined) {
    if (password.length < 12) {
      res.status(400).json({ error: "Senha deve ter pelo menos 12 caracteres." });
      return;
    }
    data.password_hash = await bcrypt.hash(password, 12);
  }

  const user = await prisma.profile.update({
    where: { id: req.params.id },
    data,
    select: PUBLIC_FIELDS,
  });

  res.json(user);
});

// DELETE /api/admin/users/:id
router.delete("/users/:id", async (req: Request, res: Response) => {
  await prisma.profile.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

export default router;
