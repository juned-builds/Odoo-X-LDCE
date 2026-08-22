import { Router } from 'express';
import { healthRouter } from './health.ts';
import authRouter from './auth.ts';

export const apiRouter = Router();

// Mount individual sub-routers
apiRouter.use('/health', healthRouter);
apiRouter.use('/auth', authRouter);
