import { Router } from 'express';
import { healthRouter } from './health.ts';
import authRouter from './auth.ts';
import tripsRouter from './trips.ts';
import savedDestinationsRouter from './savedDestinations.ts';

export const apiRouter = Router();

// Mount individual sub-routers
apiRouter.use('/health', healthRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/trips', tripsRouter);
apiRouter.use('/saved-destinations', savedDestinationsRouter);
