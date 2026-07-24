import express from 'express';
import http from 'http';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { createExpressApp } from './express-app';
import { env } from './config/env';
import { verifyDatabaseConnectionOnStartup } from './prisma/client';

export async function startServer() {
  const app = createExpressApp();
  const PORT = env.PORT || 3000;
  const server = http.createServer(app);

  // Perform non-blocking database connection verification on startup
  verifyDatabaseConnectionOnStartup().catch((err) => {
    console.warn('[DairySphere Backend] Database startup check encountered an error:', err);
  });

  // Vite middleware for development or static serving for production
  if (process.env.NODE_ENV !== 'production') {
    const isHmrDisabled = process.env.DISABLE_HMR === 'true';
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: isHmrDisabled ? false : { server },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  return new Promise((resolve) => {
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`[DairySphere Backend] Server listening on http://0.0.0.0:${PORT} [${env.NODE_ENV}]`);
      resolve(server);
    });
  });
}
