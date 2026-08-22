import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { createApp } from './src/server/app.ts';
import { config } from './src/server/config/env.ts';
import { closePool, checkDatabaseConnection } from './src/db/index.ts';

async function startServer() {
  const app = createApp();
  const PORT = config.port;

  // Vite middleware for development, or static file serving in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
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

  const server = app.listen(PORT, '0.0.0.0', async () => {
    console.log(`[GlobeTrotter] Application running on http://0.0.0.0:${PORT}`);
    const isDbConnected = await checkDatabaseConnection();
    console.log(`[Database] PostgreSQL status: ${isDbConnected ? 'CONNECTED' : 'DISCONNECTED'}`);
  });

  let isShuttingDown = false;
  const shutdown = async (signal: string) => {
    if (isShuttingDown) return;
    isShuttingDown = true;
    console.log(`\n[GlobeTrotter] Received ${signal}. Shutting down gracefully...`);
    server.close(async () => {
      console.log('[GlobeTrotter] HTTP server closed.');
      try {
        await closePool();
        console.log('[GlobeTrotter] Database connection pool closed.');
        process.exit(0);
      } catch (err) {
        console.error('[GlobeTrotter] Error while closing database pool:', err);
        process.exit(1);
      }
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

startServer().catch((err) => {
  console.error('[GlobeTrotter] Server startup failure:', err);
  process.exit(1);
});
