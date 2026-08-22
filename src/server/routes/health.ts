import { Router, Request, Response } from 'express';
import { checkDatabaseConnection } from '../../db/index.ts';
import { asyncHandler } from '../utils/asyncHandler.ts';

export const healthRouter = Router();

healthRouter.get(
  '/',
  asyncHandler(async (_req: Request, res: Response) => {
    const isDbConnected = await checkDatabaseConnection();

    if (!isDbConnected) {
      res.status(503).json({
        success: false,
        message: 'GlobeTrotter API is running in degraded state',
        database: 'disconnected',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'GlobeTrotter API is running',
      database: 'connected',
    });
  })
);
