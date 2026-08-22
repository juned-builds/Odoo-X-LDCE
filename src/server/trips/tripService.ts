import { db } from '../../db/index.ts';
import { trips } from '../../db/schema/trips.ts';
import { tripStops } from '../../db/schema/tripStops.ts';
import { scheduledActivities } from '../../db/schema/scheduledActivities.ts';
import { tripExpenses } from '../../db/schema/tripExpenses.ts';
import { destinations } from '../../db/schema/destinations.ts';
import { activities } from '../../db/schema/activities.ts';
import { eq, and, asc, desc, inArray } from 'drizzle-orm';
import { ApiError } from '../utils/apiError.ts';
import { parseTimeToSql, formatSqlTimeToDisplay, calculateDurationDays } from './tripUtils.ts';
import crypto from 'crypto';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function ensureUuid(id?: string): string {
  if (id && UUID_REGEX.test(id)) {
    return id;
  }
  return crypto.randomUUID();
}

export interface TripResponse {
  id: string;
  name: string;
  route: string;
  destinationCount: number;
  startDate: string;
  endDate: string;
  duration: string;
  status: 'upcoming' | 'planning' | 'completed' | 'draft';
  coverImage: string;
  progressPercentage: number;
  budgetTotal: number;
  budgetSpent: number;
  currency: string;
  description?: string;
  destinations: string[];
  stops?: any[];
  activities?: any[];
  expenses?: any[];
  createdAt: string;
}

export class TripService {
  /**
   * Fetch all trips belonging to an authenticated user
   */
  static async getUserTrips(userId: string): Promise<TripResponse[]> {
    const userTrips = await db
      .select()
      .from(trips)
      .where(eq(trips.userId, userId))
      .orderBy(desc(trips.createdAt));

    if (userTrips.length === 0) {
      return [];
    }

    const tripIds = userTrips.map((t) => t.id);

    // Fetch associated stops, activities, and expenses in parallel
    const [allStops, allActivities, allExpenses] = await Promise.all([
      db
        .select()
        .from(tripStops)
        .where(inArray(tripStops.tripId, tripIds))
        .orderBy(asc(tripStops.stopOrder)),
      db
        .select()
        .from(scheduledActivities)
        .where(inArray(scheduledActivities.tripId, tripIds))
        .orderBy(asc(scheduledActivities.dayNumber), asc(scheduledActivities.orderIndex)),
      db
        .select()
        .from(tripExpenses)
        .where(inArray(tripExpenses.tripId, tripIds))
        .orderBy(asc(tripExpenses.expenseDate)),
    ]);

    // Group by tripId
    const stopsByTrip = new Map<string, typeof allStops>();
    const activitiesByTrip = new Map<string, typeof allActivities>();
    const expensesByTrip = new Map<string, typeof allExpenses>();

    for (const stop of allStops) {
      const list = stopsByTrip.get(stop.tripId) || [];
      list.push(stop);
      stopsByTrip.set(stop.tripId, list);
    }

    for (const act of allActivities) {
      const list = activitiesByTrip.get(act.tripId) || [];
      list.push(act);
      activitiesByTrip.set(act.tripId, list);
    }

    for (const exp of allExpenses) {
      const list = expensesByTrip.get(exp.tripId) || [];
      list.push(exp);
      expensesByTrip.set(exp.tripId, list);
    }

    return userTrips.map((t) => {
      const tripStopsList = stopsByTrip.get(t.id) || [];
      const tripActivitiesList = activitiesByTrip.get(t.id) || [];
      const tripExpensesList = expensesByTrip.get(t.id) || [];

      // Calculate total spent
      const totalSpent = tripExpensesList.reduce((sum, exp) => sum + Number(exp.amount || 0), 0);

      // Extract destination names
      const destCities = tripStopsList.length > 0
        ? tripStopsList.map((s) => s.city)
        : t.routeSummary
        ? t.routeSummary.split('→').map((s) => s.trim())
        : [t.name];

      const routeStr = t.routeSummary || destCities.join(' → ') || t.name;

      const formattedStops = tripStopsList.map((s) => ({
        id: s.id,
        destinationId: s.destinationId || undefined,
        city: s.city,
        country: s.country,
        durationDays: s.durationDays,
        startDate: s.startDate,
        endDate: s.endDate,
        order: s.stopOrder,
      }));

      const formattedActivities = tripActivitiesList.map((a) => ({
        id: a.id,
        activityId: a.activityId || a.id,
        name: a.name,
        destinationCity: a.destinationCity,
        type: a.type,
        cost: a.costDisplay,
        costTier: a.costTier,
        costNumeric: Number(a.costNumeric || 0),
        duration: a.durationDisplay,
        durationMinutes: a.durationMinutes,
        image: a.imageUrl || undefined,
        date: a.activityDate,
        dayNumber: a.dayNumber,
        startTime: formatSqlTimeToDisplay(a.startTime),
        time: formatSqlTimeToDisplay(a.startTime),
        order: a.orderIndex,
        rating: a.rating ? Number(a.rating) : undefined,
        description: a.description || undefined,
        notes: a.notes || undefined,
        location: a.location || undefined,
        isCustom: a.isCustom,
      }));

      const formattedExpenses = tripExpensesList.map((e) => ({
        id: e.id,
        tripId: e.tripId,
        category: e.category as any,
        name: e.name,
        amount: Number(e.amount),
        date: e.expenseDate,
        dayNumber: e.dayNumber || undefined,
        source: 'manual' as const,
        notes: e.notes || undefined,
        destinationCity: e.destinationCity || undefined,
        createdAt: e.createdAt.toISOString(),
      }));

      return {
        id: t.id,
        name: t.name,
        route: routeStr,
        destinationCount: destCities.length,
        startDate: t.startDate,
        endDate: t.endDate,
        duration: `${t.durationDays} days`,
        status: t.status as any,
        coverImage: t.coverImageUrl || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80',
        progressPercentage: t.progressPercentage,
        budgetTotal: Number(t.budgetTotal),
        budgetSpent: Math.round(totalSpent),
        currency: t.currency || '₹',
        description: t.description || undefined,
        destinations: destCities,
        stops: formattedStops,
        activities: formattedActivities,
        expenses: formattedExpenses,
        createdAt: t.createdAt.toISOString(),
      };
    });
  }

  /**
   * Fetch single trip by ID (with ownership check)
   */
  static async getTripById(userId: string, tripId: string): Promise<TripResponse> {
    if (!UUID_REGEX.test(tripId)) {
      throw ApiError.notFound('Trip not found.', 'NOT_FOUND');
    }

    const [tripRecord] = await db
      .select()
      .from(trips)
      .where(and(eq(trips.id, tripId), eq(trips.userId, userId)));

    if (!tripRecord) {
      throw ApiError.notFound('Trip not found.', 'NOT_FOUND');
    }

    const [stopsList, activitiesList, expensesList] = await Promise.all([
      db
        .select()
        .from(tripStops)
        .where(eq(tripStops.tripId, tripId))
        .orderBy(asc(tripStops.stopOrder)),
      db
        .select()
        .from(scheduledActivities)
        .where(eq(scheduledActivities.tripId, tripId))
        .orderBy(asc(scheduledActivities.dayNumber), asc(scheduledActivities.orderIndex)),
      db
        .select()
        .from(tripExpenses)
        .where(eq(tripExpenses.tripId, tripId))
        .orderBy(asc(tripExpenses.expenseDate)),
    ]);

    const totalSpent = expensesList.reduce((sum, exp) => sum + Number(exp.amount || 0), 0);
    const destCities = stopsList.length > 0
      ? stopsList.map((s) => s.city)
      : tripRecord.routeSummary
      ? tripRecord.routeSummary.split('→').map((s) => s.trim())
      : [tripRecord.name];

    return {
      id: tripRecord.id,
      name: tripRecord.name,
      route: tripRecord.routeSummary || destCities.join(' → ') || tripRecord.name,
      destinationCount: destCities.length,
      startDate: tripRecord.startDate,
      endDate: tripRecord.endDate,
      duration: `${tripRecord.durationDays} days`,
      status: tripRecord.status as any,
      coverImage: tripRecord.coverImageUrl || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80',
      progressPercentage: tripRecord.progressPercentage,
      budgetTotal: Number(tripRecord.budgetTotal),
      budgetSpent: Math.round(totalSpent),
      currency: tripRecord.currency || '₹',
      description: tripRecord.description || undefined,
      destinations: destCities,
      stops: stopsList.map((s) => ({
        id: s.id,
        destinationId: s.destinationId || undefined,
        city: s.city,
        country: s.country,
        durationDays: s.durationDays,
        startDate: s.startDate,
        endDate: s.endDate,
        order: s.stopOrder,
      })),
      activities: activitiesList.map((a) => ({
        id: a.id,
        activityId: a.activityId || a.id,
        name: a.name,
        destinationCity: a.destinationCity,
        type: a.type,
        cost: a.costDisplay,
        costTier: a.costTier,
        costNumeric: Number(a.costNumeric || 0),
        duration: a.durationDisplay,
        durationMinutes: a.durationMinutes,
        image: a.imageUrl || undefined,
        date: a.activityDate,
        dayNumber: a.dayNumber,
        startTime: formatSqlTimeToDisplay(a.startTime),
        time: formatSqlTimeToDisplay(a.startTime),
        order: a.orderIndex,
        rating: a.rating ? Number(a.rating) : undefined,
        description: a.description || undefined,
        notes: a.notes || undefined,
        location: a.location || undefined,
        isCustom: a.isCustom,
      })),
      expenses: expensesList.map((e) => ({
        id: e.id,
        tripId: e.tripId,
        category: e.category as any,
        name: e.name,
        amount: Number(e.amount),
        date: e.expenseDate,
        dayNumber: e.dayNumber || undefined,
        source: 'manual' as const,
        notes: e.notes || undefined,
        destinationCity: e.destinationCity || undefined,
        createdAt: e.createdAt.toISOString(),
      })),
      createdAt: tripRecord.createdAt.toISOString(),
    };
  }

  /**
   * Create a new trip in a PostgreSQL transaction
   */
  static async createTrip(userId: string, payload: any): Promise<TripResponse> {
    const tripId = ensureUuid(payload.id);
    const name = (payload.name || 'My Adventure').trim();
    const startDate = payload.startDate || new Date().toISOString().split('T')[0];
    const endDate = payload.endDate || startDate;
    const durationDays = calculateDurationDays(startDate, endDate);
    const routeSummary = payload.route || (Array.isArray(payload.destinations) ? payload.destinations.join(' → ') : name);
    const status = payload.status || 'planning';
    const coverImageUrl = payload.coverImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80';
    const progressPercentage = typeof payload.progressPercentage === 'number' ? payload.progressPercentage : 15;
    const budgetTotal = typeof payload.budgetTotal === 'number' ? payload.budgetTotal.toFixed(2) : (payload.budgetTotal || '65000.00');
    const currency = payload.currency || '₹';
    const description = payload.description || null;

    // Load existing catalog destinations & activities to safely associate foreign keys
    const [catalogDestinations, catalogActivities] = await Promise.all([
      db.select({ id: destinations.id, city: destinations.city, country: destinations.country }).from(destinations),
      db.select({ id: activities.id }).from(activities),
    ]);

    const destMap = new Map(catalogDestinations.map((d) => [d.id, d]));
    const destCityMap = new Map(catalogDestinations.map((d) => [d.city.toLowerCase(), d]));
    const validActivityIds = new Set(catalogActivities.map((a) => a.id));

    // Execute atomic transaction
    await db.transaction(async (tx) => {
      // 1. Insert Trip
      await tx.insert(trips).values({
        id: tripId,
        userId,
        name,
        routeSummary,
        startDate,
        endDate,
        durationDays,
        status,
        coverImageUrl,
        progressPercentage,
        budgetTotal,
        currency,
        description,
      });

      // 2. Insert Stops
      const rawStops = Array.isArray(payload.stops) && payload.stops.length > 0
        ? payload.stops
        : Array.isArray(payload.destinations) && payload.destinations.length > 0
        ? payload.destinations.map((city: string, idx: number) => ({ city, order: idx + 1 }))
        : [{ city: name, order: 1 }];

      const insertedStops = [];
      for (let i = 0; i < rawStops.length; i++) {
        const s = rawStops[i];
        const stopId = ensureUuid(s.id);
        const city = s.city || 'Destination';
        const matchedDest = (s.destinationId && destMap.get(s.destinationId)) || destCityMap.get(city.toLowerCase());
        const destinationId = matchedDest ? matchedDest.id : null;
        const country = s.country || (matchedDest ? matchedDest.country : 'Global');
        const stopOrder = s.order || i + 1;
        const stopStart = s.startDate || startDate;
        const stopEnd = s.endDate || endDate;
        const stopDuration = s.durationDays || Math.max(1, calculateDurationDays(stopStart, stopEnd));

        await tx.insert(tripStops).values({
          id: stopId,
          tripId,
          destinationId,
          city,
          country,
          durationDays: stopDuration,
          startDate: stopStart,
          endDate: stopEnd,
          stopOrder,
        });

        insertedStops.push({ id: stopId, city, stopOrder });
      }

      // 3. Insert Activities (if provided)
      if (Array.isArray(payload.activities) && payload.activities.length > 0) {
        for (let idx = 0; idx < payload.activities.length; idx++) {
          const act = payload.activities[idx];
          const actId = ensureUuid(act.id);
          const rawActivityId = act.activityId || act.id;
          const isValidCatalogAct = validActivityIds.has(rawActivityId);
          const activityId = isValidCatalogAct ? rawActivityId : null;
          const isCustom = act.isCustom || !isValidCatalogAct;
          const matchedStop = insertedStops.find((st) => st.city.toLowerCase() === (act.destinationCity || '').toLowerCase()) || insertedStops[0];

          await tx.insert(scheduledActivities).values({
            id: actId,
            tripId,
            stopId: matchedStop ? matchedStop.id : null,
            activityId,
            name: act.name || 'Activity',
            type: act.type || 'Sightseeing',
            destinationCity: act.destinationCity || (matchedStop ? matchedStop.city : name),
            activityDate: act.date || startDate,
            dayNumber: act.dayNumber || 1,
            startTime: parseTimeToSql(act.startTime || act.time),
            durationDisplay: act.duration || '2 hrs',
            durationMinutes: typeof act.durationMinutes === 'number' ? act.durationMinutes : 120,
            costDisplay: act.cost || '₹0',
            costTier: act.costTier || '$$',
            costNumeric: typeof act.costNumeric === 'number' ? act.costNumeric.toFixed(2) : '0.00',
            rating: act.rating ? act.rating.toFixed(2) : null,
            imageUrl: act.image || null,
            description: act.description || null,
            notes: act.notes || null,
            orderIndex: typeof act.order === 'number' ? act.order : idx,
            isCustom,
          });
        }
      }

      // 4. Insert Expenses (if provided)
      if (Array.isArray(payload.expenses) && payload.expenses.length > 0) {
        for (const exp of payload.expenses) {
          const expId = ensureUuid(exp.id);
          await tx.insert(tripExpenses).values({
            id: expId,
            tripId,
            category: exp.category || 'activities',
            name: exp.name || 'Expense',
            amount: typeof exp.amount === 'number' ? exp.amount.toFixed(2) : (exp.amount || '0.00'),
            expenseDate: exp.date || startDate,
            dayNumber: exp.dayNumber || null,
            notes: exp.notes || null,
            destinationCity: exp.destinationCity || null,
          });
        }
      }
    });

    return TripService.getTripById(userId, tripId);
  }

  /**
   * Update an existing trip in PostgreSQL
   */
  static async updateTrip(userId: string, tripId: string, payload: any): Promise<TripResponse> {
    if (!UUID_REGEX.test(tripId)) {
      throw ApiError.notFound('Trip not found.', 'NOT_FOUND');
    }

    // Verify ownership
    const [existingTrip] = await db
      .select()
      .from(trips)
      .where(and(eq(trips.id, tripId), eq(trips.userId, userId)));

    if (!existingTrip) {
      throw ApiError.notFound('Trip not found.', 'NOT_FOUND');
    }

    const startDate = payload.startDate !== undefined ? payload.startDate : existingTrip.startDate;
    const endDate = payload.endDate !== undefined ? payload.endDate : existingTrip.endDate;
    const durationDays = calculateDurationDays(startDate, endDate);
    const name = payload.name !== undefined ? payload.name.trim() : existingTrip.name;
    const routeSummary = payload.route !== undefined
      ? payload.route
      : payload.destinations !== undefined && Array.isArray(payload.destinations)
      ? payload.destinations.join(' → ')
      : existingTrip.routeSummary;
    const status = payload.status !== undefined ? payload.status : existingTrip.status;
    const coverImageUrl = payload.coverImage !== undefined ? payload.coverImage : existingTrip.coverImageUrl;
    const progressPercentage = payload.progressPercentage !== undefined ? payload.progressPercentage : existingTrip.progressPercentage;
    const budgetTotal = payload.budgetTotal !== undefined
      ? typeof payload.budgetTotal === 'number'
        ? payload.budgetTotal.toFixed(2)
        : String(payload.budgetTotal)
      : existingTrip.budgetTotal;
    const currency = payload.currency !== undefined ? payload.currency : existingTrip.currency;
    const description = payload.description !== undefined ? payload.description : existingTrip.description;

    const [catalogDestinations, catalogActivities] = await Promise.all([
      db.select({ id: destinations.id, city: destinations.city, country: destinations.country }).from(destinations),
      db.select({ id: activities.id }).from(activities),
    ]);

    const destMap = new Map(catalogDestinations.map((d) => [d.id, d]));
    const destCityMap = new Map(catalogDestinations.map((d) => [d.city.toLowerCase(), d]));
    const validActivityIds = new Set(catalogActivities.map((a) => a.id));

    await db.transaction(async (tx) => {
      // 1. Update trip table
      await tx
        .update(trips)
        .set({
          name,
          routeSummary,
          startDate,
          endDate,
          durationDays,
          status,
          coverImageUrl,
          progressPercentage,
          budgetTotal,
          currency,
          description,
          updatedAt: new Date(),
        })
        .where(eq(trips.id, tripId));

      // 2. Sync Stops if provided
      if (Array.isArray(payload.stops) || Array.isArray(payload.destinations)) {
        const rawStops = Array.isArray(payload.stops)
          ? payload.stops
          : payload.destinations.map((city: string, idx: number) => ({ city, order: idx + 1 }));

        // Remove old stops and re-insert
        await tx.delete(tripStops).where(eq(tripStops.tripId, tripId));

        for (let i = 0; i < rawStops.length; i++) {
          const s = rawStops[i];
          const stopId = ensureUuid(s.id);
          const city = s.city || 'Destination';
          const matchedDest = (s.destinationId && destMap.get(s.destinationId)) || destCityMap.get(city.toLowerCase());
          const destinationId = matchedDest ? matchedDest.id : null;
          const country = s.country || (matchedDest ? matchedDest.country : 'Global');
          const stopOrder = s.order || i + 1;
          const stopStart = s.startDate || startDate;
          const stopEnd = s.endDate || endDate;
          const stopDuration = s.durationDays || Math.max(1, calculateDurationDays(stopStart, stopEnd));

          await tx.insert(tripStops).values({
            id: stopId,
            tripId,
            destinationId,
            city,
            country,
            durationDays: stopDuration,
            startDate: stopStart,
            endDate: stopEnd,
            stopOrder,
          });
        }
      }

      // 3. Sync Activities if provided
      if (Array.isArray(payload.activities)) {
        await tx.delete(scheduledActivities).where(eq(scheduledActivities.tripId, tripId));

        for (let idx = 0; idx < payload.activities.length; idx++) {
          const act = payload.activities[idx];
          const actId = ensureUuid(act.id);
          const rawActivityId = act.activityId || act.id;
          const isValidCatalogAct = validActivityIds.has(rawActivityId);
          const activityId = isValidCatalogAct ? rawActivityId : null;
          const isCustom = act.isCustom || !isValidCatalogAct;

          await tx.insert(scheduledActivities).values({
            id: actId,
            tripId,
            activityId,
            name: act.name || 'Activity',
            type: act.type || 'Sightseeing',
            destinationCity: act.destinationCity || name,
            activityDate: act.date || startDate,
            dayNumber: act.dayNumber || 1,
            startTime: parseTimeToSql(act.startTime || act.time),
            durationDisplay: act.duration || '2 hrs',
            durationMinutes: typeof act.durationMinutes === 'number' ? act.durationMinutes : 120,
            costDisplay: act.cost || '₹0',
            costTier: act.costTier || '$$',
            costNumeric: typeof act.costNumeric === 'number' ? act.costNumeric.toFixed(2) : '0.00',
            rating: act.rating ? Number(act.rating).toFixed(2) : null,
            imageUrl: act.image || null,
            description: act.description || null,
            notes: act.notes || null,
            orderIndex: typeof act.order === 'number' ? act.order : idx,
            isCustom,
          });
        }
      }

      // 4. Sync Expenses if provided
      if (Array.isArray(payload.expenses)) {
        await tx.delete(tripExpenses).where(eq(tripExpenses.tripId, tripId));

        for (const exp of payload.expenses) {
          const expId = ensureUuid(exp.id);
          await tx.insert(tripExpenses).values({
            id: expId,
            tripId,
            category: exp.category || 'activities',
            name: exp.name || 'Expense',
            amount: typeof exp.amount === 'number' ? exp.amount.toFixed(2) : (exp.amount || '0.00'),
            expenseDate: exp.date || startDate,
            dayNumber: exp.dayNumber || null,
            notes: exp.notes || null,
            destinationCity: exp.destinationCity || null,
          });
        }
      }
    });

    return TripService.getTripById(userId, tripId);
  }

  /**
   * Delete a trip by ID
   */
  static async deleteTrip(userId: string, tripId: string): Promise<void> {
    if (!UUID_REGEX.test(tripId)) {
      throw ApiError.notFound('Trip not found.', 'NOT_FOUND');
    }

    const [existingTrip] = await db
      .select()
      .from(trips)
      .where(and(eq(trips.id, tripId), eq(trips.userId, userId)));

    if (!existingTrip) {
      throw ApiError.notFound('Trip not found.', 'NOT_FOUND');
    }

    await db.delete(trips).where(eq(trips.id, tripId));
  }

  /**
   * Scheduled Activities sub-operations
   */
  static async addScheduledActivity(userId: string, tripId: string, actData: any) {
    await TripService.verifyTripOwnership(userId, tripId);

    const actId = ensureUuid(actData.id);
    const rawActivityId = actData.activityId || actData.id;
    const [catalogAct] = await db.select().from(activities).where(eq(activities.id, rawActivityId));
    const activityId = catalogAct ? catalogAct.id : null;
    const isCustom = actData.isCustom || !catalogAct;

    await db.insert(scheduledActivities).values({
      id: actId,
      tripId,
      activityId,
      name: actData.name || 'Activity',
      type: actData.type || 'Sightseeing',
      destinationCity: actData.destinationCity || 'Destination',
      activityDate: actData.date || new Date().toISOString().split('T')[0],
      dayNumber: actData.dayNumber || 1,
      startTime: parseTimeToSql(actData.startTime || actData.time),
      durationDisplay: actData.duration || '2 hrs',
      durationMinutes: typeof actData.durationMinutes === 'number' ? actData.durationMinutes : 120,
      costDisplay: actData.cost || '₹0',
      costTier: actData.costTier || '$$',
      costNumeric: typeof actData.costNumeric === 'number' ? actData.costNumeric.toFixed(2) : '0.00',
      rating: actData.rating ? Number(actData.rating).toFixed(2) : null,
      imageUrl: actData.image || null,
      description: actData.description || null,
      notes: actData.notes || null,
      orderIndex: typeof actData.order === 'number' ? actData.order : 0,
      isCustom,
    });

    return TripService.getTripById(userId, tripId);
  }

  static async updateScheduledActivity(userId: string, tripId: string, activityId: string, actData: any) {
    await TripService.verifyTripOwnership(userId, tripId);

    const [existing] = await db
      .select()
      .from(scheduledActivities)
      .where(and(eq(scheduledActivities.id, activityId), eq(scheduledActivities.tripId, tripId)));

    if (!existing) {
      throw ApiError.notFound('Activity not found in trip.', 'NOT_FOUND');
    }

    await db
      .update(scheduledActivities)
      .set({
        name: actData.name !== undefined ? actData.name : existing.name,
        type: actData.type !== undefined ? actData.type : existing.type,
        destinationCity: actData.destinationCity !== undefined ? actData.destinationCity : existing.destinationCity,
        activityDate: actData.date !== undefined ? actData.date : existing.activityDate,
        dayNumber: actData.dayNumber !== undefined ? actData.dayNumber : existing.dayNumber,
        startTime: actData.startTime !== undefined || actData.time !== undefined
          ? parseTimeToSql(actData.startTime || actData.time)
          : existing.startTime,
        durationDisplay: actData.duration !== undefined ? actData.duration : existing.durationDisplay,
        durationMinutes: actData.durationMinutes !== undefined ? actData.durationMinutes : existing.durationMinutes,
        costDisplay: actData.cost !== undefined ? actData.cost : existing.costDisplay,
        costNumeric: actData.costNumeric !== undefined ? Number(actData.costNumeric).toFixed(2) : existing.costNumeric,
        notes: actData.notes !== undefined ? actData.notes : existing.notes,
        orderIndex: actData.order !== undefined ? actData.order : existing.orderIndex,
      })
      .where(eq(scheduledActivities.id, activityId));

    return TripService.getTripById(userId, tripId);
  }

  static async deleteScheduledActivity(userId: string, tripId: string, activityId: string) {
    await TripService.verifyTripOwnership(userId, tripId);

    await db
      .delete(scheduledActivities)
      .where(and(eq(scheduledActivities.id, activityId), eq(scheduledActivities.tripId, tripId)));

    return TripService.getTripById(userId, tripId);
  }

  static async reorderScheduledActivities(userId: string, tripId: string, reorderList: Array<{ id: string; dayNumber: number; orderIndex: number; startTime?: string }>) {
    await TripService.verifyTripOwnership(userId, tripId);

    await db.transaction(async (tx) => {
      for (const item of reorderList) {
        const updateData: any = {
          dayNumber: item.dayNumber,
          orderIndex: item.orderIndex,
        };
        if (item.startTime) {
          updateData.startTime = parseTimeToSql(item.startTime);
        }
        await tx
          .update(scheduledActivities)
          .set(updateData)
          .where(and(eq(scheduledActivities.id, item.id), eq(scheduledActivities.tripId, tripId)));
      }
    });

    return TripService.getTripById(userId, tripId);
  }

  /**
   * Trip Expenses sub-operations
   */
  static async addTripExpense(userId: string, tripId: string, expData: any) {
    await TripService.verifyTripOwnership(userId, tripId);

    const expId = ensureUuid(expData.id);
    await db.insert(tripExpenses).values({
      id: expId,
      tripId,
      category: expData.category || 'activities',
      name: expData.name || 'Expense',
      amount: typeof expData.amount === 'number' ? expData.amount.toFixed(2) : (expData.amount || '0.00'),
      expenseDate: expData.date || new Date().toISOString().split('T')[0],
      dayNumber: expData.dayNumber || null,
      notes: expData.notes || null,
      destinationCity: expData.destinationCity || null,
    });

    return TripService.getTripById(userId, tripId);
  }

  static async updateTripExpense(userId: string, tripId: string, expenseId: string, expData: any) {
    await TripService.verifyTripOwnership(userId, tripId);

    const [existing] = await db
      .select()
      .from(tripExpenses)
      .where(and(eq(tripExpenses.id, expenseId), eq(tripExpenses.tripId, tripId)));

    if (!existing) {
      throw ApiError.notFound('Expense not found in trip.', 'NOT_FOUND');
    }

    await db
      .update(tripExpenses)
      .set({
        category: expData.category !== undefined ? expData.category : existing.category,
        name: expData.name !== undefined ? expData.name : existing.name,
        amount: expData.amount !== undefined ? Number(expData.amount).toFixed(2) : existing.amount,
        expenseDate: expData.date !== undefined ? expData.date : existing.expenseDate,
        dayNumber: expData.dayNumber !== undefined ? expData.dayNumber : existing.dayNumber,
        notes: expData.notes !== undefined ? expData.notes : existing.notes,
        destinationCity: expData.destinationCity !== undefined ? expData.destinationCity : existing.destinationCity,
      })
      .where(eq(tripExpenses.id, expenseId));

    return TripService.getTripById(userId, tripId);
  }

  static async deleteTripExpense(userId: string, tripId: string, expenseId: string) {
    await TripService.verifyTripOwnership(userId, tripId);

    await db
      .delete(tripExpenses)
      .where(and(eq(tripExpenses.id, expenseId), eq(tripExpenses.tripId, tripId)));

    return TripService.getTripById(userId, tripId);
  }

  private static async verifyTripOwnership(userId: string, tripId: string) {
    if (!UUID_REGEX.test(tripId)) {
      throw ApiError.notFound('Trip not found.', 'NOT_FOUND');
    }

    const [existing] = await db
      .select({ id: trips.id })
      .from(trips)
      .where(and(eq(trips.id, tripId), eq(trips.userId, userId)));

    if (!existing) {
      throw ApiError.notFound('Trip not found.', 'NOT_FOUND');
    }
  }
}
