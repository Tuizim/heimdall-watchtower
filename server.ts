import "dotenv/config";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import path from "path";
import { createServer as createViteServer } from "vite";
import api from "./api/index.js";

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isDev = process.env.NODE_ENV !== "production";

  // Security headers — CSP disabled in dev so Vite HMR works
  app.use(
    helmet({
      contentSecurityPolicy: isDev
        ? false
        : {
            directives: {
              defaultSrc: ["'self'"],
              scriptSrc: ["'self'"],
              styleSrc: ["'self'", "'unsafe-inline'"],
              imgSrc: ["'self'", "data:", "https:"],
              connectSrc: ["'self'"],
              fontSrc: ["'self'"],
              objectSrc: ["'none'"],
              frameAncestors: ["'none'"],
            },
          },
      crossOriginEmbedderPolicy: isDev ? false : true,
    })
  );

  app.use(express.json({ limit: "5mb" }));
  app.use(cookieParser());

  // Rate limiting — only active in production
  if (!isDev) {
    app.use(
      "/api",
      rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 1000,
        standardHeaders: true,
        legacyHeaders: false,
        message: { error: "Muitas requisições. Tente novamente em 15 minutos." },
      })
    );
  }

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", env: process.env.NODE_ENV });
  });

  // Mount all API routes
  app.use("/api", api);

  // OAuth callback stub (kept for any future OAuth integration)
  app.get(["/auth/callback", "/auth/callback/"], (_req, res) => {
    res.send(`
      <html>
        <body style="background:#05070a;color:#b89149;display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;">
          <div style="text-align:center;">
            <h2>Autenticação Bem-sucedida!</h2>
            <p style="color:#718096;font-size:14px;">Fechando portal...</p>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, window.location.origin);
                window.close();
              } else { window.location.href = '/'; }
            </script>
          </div>
        </body>
      </html>
    `);
  });

  // Centralized error handler
  app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error("[ERROR]", err.message);
    res.status(500).json({ error: "Erro interno do servidor." });
  });

  // Frontend serving
  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`
🛡️  Heimdall Watchtower
📍  War Room ready at http://localhost:${PORT}
🗄️  Database: ${process.env.DATABASE_URL?.split("@")[1] ?? "not configured"}
⚔️  Victory awaits, Commander.
    `);
  });
}

startServer().catch((err) => {
  console.error("Critical Failure in Watchtower:", err);
  process.exit(1);
});
