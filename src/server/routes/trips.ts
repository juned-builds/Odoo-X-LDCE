import { Router, Request, Response } from 'express';
import { requireAuth } from '../auth/authMiddleware.ts';
import { asyncHandler } from '../utils/asyncHandler.ts';
import { TripService } from '../trips/tripService.ts';
import { ApiError } from '../utils/apiError.ts';

export const tripsRouter = Router();

// All trip endpoints require authentication
tripsRouter.use(requireAuth);

/**
 * GET /api/trips
 * List all trips for current user
 */
tripsRouter.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const userTrips = await TripService.getUserTrips(req.user!.id);
    res.json({
      success: true,
      trips: userTrips,
    });
  })
);

/**
 * POST /api/trips
 * Create a new trip
 */
tripsRouter.post(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const trip = await TripService.createTrip(req.user!.id, req.body);
    res.status(201).json({
      success: true,
      trip,
    });
  })
);

/**
 * GET /api/trips/:tripId
 * Get full composite trip details
 */
tripsRouter.get(
  '/:tripId',
  asyncHandler(async (req: Request, res: Response) => {
    const trip = await TripService.getTripById(req.user!.id, req.params.tripId);
    res.json({
      success: true,
      trip,
    });
  })
);

/**
 * PUT /api/trips/:tripId
 * Update trip details, itinerary, or budget
 */
tripsRouter.put(
  '/:tripId',
  asyncHandler(async (req: Request, res: Response) => {
    const trip = await TripService.updateTrip(req.user!.id, req.params.tripId, req.body);
    res.json({
      success: true,
      trip,
    });
  })
);

/**
 * DELETE /api/trips/:tripId
 * Delete a trip
 */
tripsRouter.delete(
  '/:tripId',
  asyncHandler(async (req: Request, res: Response) => {
    await TripService.deleteTrip(req.user!.id, req.params.tripId);
    res.json({
      success: true,
      message: 'Trip deleted successfully.',
    });
  })
);

/**
 * POST /api/trips/:tripId/activities
 * Add scheduled activity to trip
 */
tripsRouter.post(
  '/:tripId/activities',
  asyncHandler(async (req: Request, res: Response) => {
    const updatedTrip = await TripService.addScheduledActivity(req.user!.id, req.params.tripId, req.body);
    res.status(201).json({
      success: true,
      trip: updatedTrip,
    });
  })
);

/**
 * PUT /api/trips/:tripId/activities/reorder
 * Bulk reorder scheduled activities
 */
tripsRouter.put(
  '/:tripId/activities/reorder',
  asyncHandler(async (req: Request, res: Response) => {
    if (!Array.isArray(req.body.activities)) {
      throw ApiError.badRequest('Expected activities array for reorder.', 'INVALID_INPUT');
    }
    const updatedTrip = await TripService.reorderScheduledActivities(req.user!.id, req.params.tripId, req.body.activities);
    res.json({
      success: true,
      trip: updatedTrip,
    });
  })
);

/**
 * PUT /api/trips/:tripId/activities/:activityId
 * Update scheduled activity
 */
tripsRouter.put(
  '/:tripId/activities/:activityId',
  asyncHandler(async (req: Request, res: Response) => {
    const updatedTrip = await TripService.updateScheduledActivity(
      req.user!.id,
      req.params.tripId,
      req.params.activityId,
      req.body
    );
    res.json({
      success: true,
      trip: updatedTrip,
    });
  })
);

/**
 * DELETE /api/trips/:tripId/activities/:activityId
 * Remove scheduled activity
 */
tripsRouter.delete(
  '/:tripId/activities/:activityId',
  asyncHandler(async (req: Request, res: Response) => {
    const updatedTrip = await TripService.deleteScheduledActivity(
      req.user!.id,
      req.params.tripId,
      req.params.activityId
    );
    res.json({
      success: true,
      trip: updatedTrip,
    });
  })
);

/**
 * POST /api/trips/:tripId/expenses
 * Add expense to trip
 */
tripsRouter.post(
  '/:tripId/expenses',
  asyncHandler(async (req: Request, res: Response) => {
    const updatedTrip = await TripService.addTripExpense(req.user!.id, req.params.tripId, req.body);
    res.status(201).json({
      success: true,
      trip: updatedTrip,
    });
  })
);

/**
 * PUT /api/trips/:tripId/expenses/:expenseId
 * Update expense in trip
 */
tripsRouter.put(
  '/:tripId/expenses/:expenseId',
  asyncHandler(async (req: Request, res: Response) => {
    const updatedTrip = await TripService.updateTripExpense(
      req.user!.id,
      req.params.tripId,
      req.params.expenseId,
      req.body
    );
    res.json({
      success: true,
      trip: updatedTrip,
    });
  })
);

/**
 * DELETE /api/trips/:tripId/expenses/:expenseId
 * Delete expense from trip
 */
tripsRouter.delete(
  '/:tripId/expenses/:expenseId',
  asyncHandler(async (req: Request, res: Response) => {
    const updatedTrip = await TripService.deleteTripExpense(
      req.user!.id,
      req.params.tripId,
      req.params.expenseId
    );
    res.json({
      success: true,
      trip: updatedTrip,
    });
  })
);

export default tripsRouter;
