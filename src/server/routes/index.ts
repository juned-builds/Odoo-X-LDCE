import { Router } from 'express';
import { healthRouter } from './health.ts';
<<<<<<< Updated upstream
=======
import authRouter from './auth.ts';
import tripsRouter from './trips.ts';
import savedDestinationsRouter from './savedDestinations.ts';
>>>>>>> Stashed changes

export const apiRouter = Router();

// Mount individual sub-routers
apiRouter.use('/health', healthRouter);
<<<<<<< Updated upstream
=======
apiRouter.use('/auth', authRouter);
apiRouter.use('/trips', tripsRouter);
apiRouter.use('/saved-destinations', savedDestinationsRouter);
>>>>>>> Stashed changes
