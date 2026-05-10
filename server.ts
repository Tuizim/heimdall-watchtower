import "dotenv/config";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  const isDev = process.env.NODE_ENV !== "production";

  // Security headers — CSP disabled in dev so Vite HMR (websockets + inline scripts) funciona
  app.use(
    helmet({
      contentSecurityPolicy: isDev ? false : {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'", "https://*.supabase.co", "wss://*.supabase.co"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          frameAncestors: ["'none'"],
        },
      },
      crossOriginEmbedderPolicy: isDev ? false : true,
    })
  );

  // Body limit — prevent oversized payload attacks
  app.use(express.json({ limit: "50kb" }));

  // Rate limiting on all API routes: 100 req / 15 min per IP
  app.use(
    "/api",
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      standardHeaders: true,
      legacyHeaders: false,
      message: { error: "Muitas requisições. Tente novamente em 15 minutos." },
    })
  );

  // Stricter limit on login attempts: 10 req / 15 min per IP
  app.use(
    "/api/auth",
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 10,
      standardHeaders: true,
      legacyHeaders: false,
      message: { error: "Muitas tentativas de login. Tente novamente em 15 minutos." },
    })
  );

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Heimdall Watchtower is active" });
  });

  // Callback for OAuth popups
  app.get(["/auth/callback", "/auth/callback/"], (req, res) => {
    res.send(`
      <html>
        <body style="background: #05070a; color: #b89149; display: flex; items-center; justify-content: center; height: 100vh; font-family: sans-serif;">
          <div style="text-align: center;">
            <h2 style="margin-bottom: 10px;">Autenticação Bem-sucedida!</h2>
            <p style="color: #718096; font-size: 14px;">As runas foram confirmadas. Fechando portal...</p>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, window.location.origin);
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
          </div>
        </body>
      </html>
    `);
  });

  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`
🛡️  Heimdall Watchtower
📍  War Room ready at http://localhost:${PORT}
⚔️  Victory awaits, Commander.
    `);
  });
}

startServer().catch((err) => {
  console.error("Critical Failure in Watchtower:", err);
  process.exit(1);
});
