import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import {
  signAccessToken,
  generateRefreshToken,
  hashToken,
} from "../lib/jwt.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

const REFRESH_COOKIE = "refresh_token";
const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function cookieOptions(isProd: boolean) {
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "strict" as const,
    maxAge: REFRESH_TTL_MS,
    path: "/api/auth",
  };
}

// POST /api/auth/login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { login, password } = req.body;

    if (!login || !password) {
      res.status(400).json({ error: "Login e senha são obrigatórios." });
      return;
    }

    const normalizedEmail = login.includes("@")
      ? login.trim().toLowerCase()
      : `${login.trim().toLowerCase()}@heimdall.local`;

    const profile = await prisma.profile.findFirst({
      where: {
        OR: [
          { login: login.trim().toLowerCase() },
          { email: normalizedEmail },
        ],
      },
    });

    if (!profile?.password_hash) {
      res.status(401).json({ error: "Login ou senha incorretos." });
      return;
    }

    const valid = await bcrypt.compare(password, profile.password_hash);
    if (!valid) {
      res.status(401).json({ error: "Login ou senha incorretos." });
      return;
    }

    const accessToken = signAccessToken({ userId: profile.id, role: profile.role });
    const refreshToken = generateRefreshToken();

    await prisma.refreshToken.create({
      data: {
        user_id: profile.id,
        token_hash: hashToken(refreshToken),
        expires_at: new Date(Date.now() + REFRESH_TTL_MS),
      },
    });

    const { password_hash: _, ...user } = profile;

    res
      .cookie(REFRESH_COOKIE, refreshToken, cookieOptions(process.env.NODE_ENV === "production"))
      .json({ accessToken, user });
  } catch (err) {
    console.error("[auth/login]", err);
    res.status(500).json({ error: "Erro interno ao fazer login." });
  }
});

// POST /api/auth/refresh
router.post("/refresh", async (req: Request, res: Response) => {
  try {
    const rawToken = req.cookies?.[REFRESH_COOKIE];
    if (!rawToken) {
      res.status(401).json({ error: "Refresh token ausente." });
      return;
    }

    const stored = await prisma.refreshToken.findUnique({
      where: { token_hash: hashToken(rawToken) },
      include: { user: true },
    });

    if (!stored || stored.expires_at < new Date()) {
      res.clearCookie(REFRESH_COOKIE, { path: "/api/auth" });
      res.status(401).json({ error: "Sessão expirada. Faça login novamente." });
      return;
    }

    // Rotate: delete old, issue new.
    // deleteMany avoids P2025 if a concurrent request already consumed this token.
    const { count } = await prisma.refreshToken.deleteMany({ where: { id: stored.id } });
    if (count === 0) {
      // Token was already consumed by a concurrent request — reject.
      res.clearCookie(REFRESH_COOKIE, { path: "/api/auth" });
      res.status(401).json({ error: "Sessão expirada. Faça login novamente." });
      return;
    }

    const newRefresh = generateRefreshToken();
    await prisma.refreshToken.create({
      data: {
        user_id: stored.user_id,
        token_hash: hashToken(newRefresh),
        expires_at: new Date(Date.now() + REFRESH_TTL_MS),
      },
    });

    const accessToken = signAccessToken({
      userId: stored.user.id,
      role: stored.user.role,
    });

    res
      .cookie(REFRESH_COOKIE, newRefresh, cookieOptions(process.env.NODE_ENV === "production"))
      .json({ accessToken });
  } catch (err) {
    console.error("[auth/refresh]", err);
    res.status(500).json({ error: "Erro interno ao renovar sessão." });
  }
});

// POST /api/auth/logout
router.post("/logout", async (req: Request, res: Response) => {
  const rawToken = req.cookies?.[REFRESH_COOKIE];
  if (rawToken) {
    await prisma.refreshToken
      .delete({ where: { token_hash: hashToken(rawToken) } })
      .catch(() => {}); // ignore if not found
  }
  res.clearCookie(REFRESH_COOKIE, { path: "/api/auth" }).json({ ok: true });
});

// GET /api/auth/me
router.get("/me", requireAuth, async (req: Request, res: Response) => {
  try {
    const profile = await prisma.profile.findUnique({
      where: { id: req.user!.userId },
      select: {
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
      },
    });

    if (!profile) {
      res.status(404).json({ error: "Perfil não encontrado." });
      return;
    }

    res.json(profile);
  } catch (err) {
    console.error("[auth/me]", err);
    res.status(500).json({ error: "Erro interno." });
  }
});

// PUT /api/auth/password
router.put("/password", requireAuth, async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: "Senhas são obrigatórias." });
      return;
    }
    if (newPassword.length < 12) {
      res.status(400).json({ error: "A nova senha deve ter pelo menos 12 caracteres." });
      return;
    }

    const profile = await prisma.profile.findUnique({
      where: { id: req.user!.userId },
    });

    if (!profile?.password_hash) {
      res.status(400).json({ error: "Sem senha cadastrada nesta conta." });
      return;
    }

    const valid = await bcrypt.compare(currentPassword, profile.password_hash);
    if (!valid) {
      res.status(401).json({ error: "Senha atual incorreta." });
      return;
    }

    const password_hash = await bcrypt.hash(newPassword, 12);
    await prisma.profile.update({ where: { id: profile.id }, data: { password_hash } });

    // Invalidate all other sessions
    await prisma.refreshToken.deleteMany({ where: { user_id: profile.id } });
    res.clearCookie(REFRESH_COOKIE, { path: "/api/auth" });

    res.json({ ok: true });
  } catch (err) {
    console.error("[auth/password]", err);
    res.status(500).json({ error: "Erro interno ao atualizar senha." });
  }
});

export default router;
