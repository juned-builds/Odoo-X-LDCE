import express, { Express } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './config/env.ts';
import { requestLogger } from './middleware/requestLogger.ts';
import { notFoundHandler } from './middleware/notFound.ts';
import { errorHandler } from './middleware/errorHandler.ts';
import { apiRouter } from './routes/index.ts';

export function createApp(): Express {
  const app = express();

  // Basic security and parsing middleware
  app.use(
    cors({
      origin: config.clientOrigin,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  app.use(cookieParser());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // Request logger
  app.use(requestLogger);

  // Mount API endpoints
  app.use('/api', apiRouter);

  // Catch-all 404 handler for unmatched API routes
  app.use('/api/*', notFoundHandler);

  // Centralized error handler
  app.use(errorHandler);

  return app;
}

export const app = createApp();
