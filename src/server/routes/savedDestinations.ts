import { Router, Request, Response } from 'express';
import { requireAuth } from '../auth/authMiddleware.ts';
import { asyncHandler } from '../utils/asyncHandler.ts';
import { SavedDestinationsService } from '../destinations/savedDestinationsService.ts';

export const savedDestinationsRouter = Router();

// Require authentication for all saved destinations routes
savedDestinationsRouter.use(requireAuth);

/**
 * GET /api/saved-destinations
 * Returns array of saved destination IDs
 */
savedDestinationsRouter.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const destinationIds = await SavedDestinationsService.getSavedDestinationIds(req.user!.id);
    res.json({
      success: true,
      destinationIds,
    });
  })
);

/**
 * POST /api/saved-destinations/:destinationId
 * Bookmark/save destination
 */
savedDestinationsRouter.post(
  '/:destinationId',
  asyncHandler(async (req: Request, res: Response) => {
    const result = await SavedDestinationsService.saveDestination(req.user!.id, req.params.destinationId);
    res.json(result);
  })
);

/**
 * DELETE /api/saved-destinations/:destinationId
 * Remove bookmarked destination
 */
savedDestinationsRouter.delete(
  '/:destinationId',
  asyncHandler(async (req: Request, res: Response) => {
    const result = await SavedDestinationsService.removeSavedDestination(req.user!.id, req.params.destinationId);
    res.json(result);
  })
);

export default savedDestinationsRouter;
