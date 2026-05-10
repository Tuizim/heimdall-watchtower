import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Heimdall Watchtower is active" });
  });

  app.get("/api/config", (req, res) => {
    res.json({
      supabaseUrl: process.env.VITE_SUPABASE_URL,
      supabaseAnonKey: process.env.VITE_SUPABASE_ANON_KEY,
    });
  });

  // Callback for OAuth popups
  app.get(['/auth/callback', '/auth/callback/'], (req, res) => {
    res.send(`
      <html>
        <body style="background: #05070a; color: #b89149; display: flex; items-center; justify-content: center; height: 100vh; font-family: sans-serif;">
          <div style="text-align: center;">
            <h2 style="margin-bottom: 10px;">Autenticação Bem-sucedida!</h2>
            <p style="color: #718096; font-size: 14px;">As runas foram confirmadas. Fechando portal...</p>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
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

  // Novo endpoint para injeção via script tag (mais robusto contra bloqueios de build)
  app.get("/supabase-config.js", (req, res) => {
    res.type("application/javascript");
    res.send(`
      window.__SUPABASE_CONFIG__ = {
        url: ${JSON.stringify(process.env.VITE_SUPABASE_URL || '')},
        key: ${JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY || '')}
      };
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
