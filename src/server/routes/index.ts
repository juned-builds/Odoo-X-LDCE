import { Router } from 'express';
import { healthRouter } from './health.ts';

export const apiRouter = Router();

// Mount individual sub-routers
apiRouter.use('/health', healthRouter);
