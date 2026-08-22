import { Server } from 'http';
import { app } from './app.ts';
import { config } from './config/env.ts';
import { closePool, checkDatabaseConnection } from '../db/index.ts';

let server: Server | null = null;
let isShuttingDown = false;

export async function startServer(port = config.port): Promise<Server> {
  const isDbConnected = await checkDatabaseConnection();
  console.log(`[Database] Initial connectivity check: ${isDbConnected ? 'CONNECTED' : 'NOT CONNECTED'}`);

  return new Promise((resolve) => {
    server = app.listen(port, '0.0.0.0', () => {
      console.log(`[GlobeTrotter Backend] Server listening on http://0.0.0.0:${port} (Env: ${config.nodeEnv})`);
      resolve(server!);
    });

    setupGracefulShutdown();
  });
}

function setupGracefulShutdown() {
  const shutdown = async (signal: string) => {
    if (isShuttingDown) return;
    isShuttingDown = true;
    console.log(`\n[GlobeTrotter Backend] Received ${signal}. Starting graceful shutdown...`);

    if (server) {
      server.close(async () => {
        console.log('[GlobeTrotter Backend] HTTP server closed.');
        try {
          await closePool();
          console.log('[GlobeTrotter Backend] Database connection pool closed.');
          process.exit(0);
        } catch (err) {
          console.error('[GlobeTrotter Backend] Error while closing database pool:', err);
          process.exit(1);
        }
      });
    } else {
      await closePool();
      process.exit(0);
    }
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

// Auto-start if executed directly via tsx/node
if (process.argv[1]?.endsWith('index.ts')) {
  startServer().catch((err) => {
    console.error('[GlobeTrotter Backend] Failed to start server:', err);
    process.exit(1);
  });
}
