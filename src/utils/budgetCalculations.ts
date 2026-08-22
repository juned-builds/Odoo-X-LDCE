import { Trip, TripActivityAssignment } from '../types/dashboard';
import {
  ExpenseItem,
  ExpenseCategory,
  BudgetFinancials,
  CategorySummary,
  DailySpendingSummary,
} from '../types/budget';
import { CATEGORY_CONFIG, INITIAL_MANUAL_EXPENSES } from '../data/budgetData';
import { getDatesBetween, formatDateForDisplay } from './dateUtils';

/**
 * Extracts a numeric cost value from an activity assignment.
 */
export function extractActivityCostNumeric(activity: TripActivityAssignment): number {
  if (typeof activity.costNumeric === 'number' && !isNaN(activity.costNumeric)) {
    return activity.costNumeric;
  }

  if (activity.cost) {
    // Check if free
    if (activity.cost.toLowerCase().includes('free')) {
      return 0;
    }
    // Match first number sequence
    const match = activity.cost.match(/\d+([.,]\d+)?/);
    if (match) {
      const parsed = parseFloat(match[0].replace(',', ''));
      if (!isNaN(parsed)) {
        // If it was in € or $, roughly convert for prototype or return raw
        if (activity.cost.includes('€') || activity.cost.includes('$')) {
          return Math.round(parsed * 90);
        }
        return parsed;
      }
    }
  }

  // Cost tier fallbacks
  switch (activity.costTier) {
    case '$':
      return 800;
    case '$$':
      return 2500;
    case '$$$':
      return 5500;
    case '$$$$':
      return 15000;
    default:
      return 0;
  }
}

/**
 * Parses trip duration in days safely.
 */
export function getTripDurationInDays(trip: Trip): number {
  if (trip.startDate && trip.endDate) {
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
      const diffMs = end.getTime() - start.getTime();
      const days = Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1;
      if (days > 0) return days;
    }
  }

  if (trip.duration) {
    const match = trip.duration.match(/(\d+)/);
    if (match) {
      const d = parseInt(match[1], 10);
      if (!isNaN(d) && d > 0) return d;
    }
  }

  return 1;
}

/**
 * Converts scheduled itinerary activities into automatic activity expense items.
 */
export function extractAutomaticActivityExpenses(trip: Trip): ExpenseItem[] {
  const activities: TripActivityAssignment[] = [];
  const seenIds = new Set<string>();

  // 1. Direct trip activities
  if (trip.activities && Array.isArray(trip.activities)) {
    trip.activities.forEach((act) => {
      if (act && !seenIds.has(act.id || act.activityId)) {
        seenIds.add(act.id || act.activityId);
        activities.push(act);
      }
    });
  }

  // 2. Activities in stops if not already collected
  if (trip.stops && Array.isArray(trip.stops)) {
    trip.stops.forEach((stop) => {
      if (stop.activities && Array.isArray(stop.activities)) {
        stop.activities.forEach((act) => {
          if (act && !seenIds.has(act.id || act.activityId)) {
            seenIds.add(act.id || act.activityId);
            activities.push(act);
          }
        });
      }
    });
  }

  return activities.map((act) => {
    const amount = extractActivityCostNumeric(act);
    return {
      id: `auto-act-${act.id || act.activityId}`,
      tripId: trip.id,
      category: 'activities' as ExpenseCategory,
      name: act.name,
      amount: amount,
      date: act.date || trip.startDate,
      dayNumber: act.dayNumber || 1,
      source: 'automatic',
      activityAssignmentId: act.id || act.activityId,
      destinationCity: act.destinationCity,
      notes: act.type ? `Activity Category: ${act.type}` : undefined,
    };
  });
}

/**
 * Combines manual expenses (persisted on trip or from initial mock) and automatic itinerary activity expenses.
 */
export function getAllTripExpenses(trip: Trip, customManualExpenses?: ExpenseItem[]): ExpenseItem[] {
  let manualExpenses: ExpenseItem[] = [];

  if (customManualExpenses) {
    manualExpenses = customManualExpenses.filter((e) => e.tripId === trip.id);
  } else if (trip.expenses && Array.isArray(trip.expenses)) {
    manualExpenses = trip.expenses;
  } else if (INITIAL_MANUAL_EXPENSES[trip.id]) {
    manualExpenses = INITIAL_MANUAL_EXPENSES[trip.id];
  } else if (INITIAL_MANUAL_EXPENSES['trip-1'] && trip.id === 'trip-upcoming-1') {
    manualExpenses = INITIAL_MANUAL_EXPENSES['trip-1'];
  }

  const automaticExpenses = extractAutomaticActivityExpenses(trip);

  // Return manual + automatic
  return [...manualExpenses, ...automaticExpenses];
}

/**
 * Calculates complete financial breakdown for a given trip.
 */
export function calculateTripFinancials(
  trip: Trip,
  customManualExpenses?: ExpenseItem[]
): BudgetFinancials {
  const totalBudget = Math.max(0, trip.budgetTotal || 0);
  const currency = trip.currency || '₹';
  const durationDays = getTripDurationInDays(trip);

  const allExpenses = getAllTripExpenses(trip, customManualExpenses);

  let manualExpensesCount = 0;
  let automaticExpensesCount = 0;

  // Category totals
  const categoryTotals: Record<ExpenseCategory, number> = {
    transport: 0,
    accommodation: 0,
    activities: 0,
    meals: 0,
  };

  const categoryCounts: Record<ExpenseCategory, number> = {
    transport: 0,
    accommodation: 0,
    activities: 0,
    meals: 0,
  };

  allExpenses.forEach((exp) => {
    const validCategory = exp.category in categoryTotals ? exp.category : 'activities';
    const validAmount = typeof exp.amount === 'number' && !isNaN(exp.amount) ? Math.max(0, exp.amount) : 0;
    categoryTotals[validCategory] += validAmount;
    categoryCounts[validCategory] += 1;

    if (exp.source === 'manual') {
      manualExpensesCount += 1;
    } else {
      automaticExpensesCount += 1;
    }
  });

  const totalEstimatedCost =
    categoryTotals.transport +
    categoryTotals.accommodation +
    categoryTotals.activities +
    categoryTotals.meals;

  const remainingBudget = totalBudget - totalEstimatedCost;
  const isOverBudget = totalEstimatedCost > totalBudget;
  const overBudgetAmount = isOverBudget ? totalEstimatedCost - totalBudget : 0;

  const percentageUsed = totalBudget > 0 ? Math.round((totalEstimatedCost / totalBudget) * 100) : 0;
  const averageDailyCost = durationDays > 0 ? Math.round(totalEstimatedCost / durationDays) : 0;
  const baselineDailyBudget = durationDays > 0 && totalBudget > 0 ? Math.round(totalBudget / durationDays) : 0;

  // Build Category Summaries
  const categories: Record<ExpenseCategory, CategorySummary> = {
    transport: {
      category: 'transport',
      label: CATEGORY_CONFIG.transport.label,
      amount: categoryTotals.transport,
      percentage: totalEstimatedCost > 0 ? Math.round((categoryTotals.transport / totalEstimatedCost) * 100) : 0,
      itemCount: categoryCounts.transport,
      color: CATEGORY_CONFIG.transport.color,
      hexColor: CATEGORY_CONFIG.transport.hexColor,
      bgColor: CATEGORY_CONFIG.transport.bgColor,
      borderColor: CATEGORY_CONFIG.transport.borderColor,
      textColor: CATEGORY_CONFIG.transport.textColor,
      iconName: CATEGORY_CONFIG.transport.iconName,
    },
    accommodation: {
      category: 'accommodation',
      label: CATEGORY_CONFIG.accommodation.label,
      amount: categoryTotals.accommodation,
      percentage: totalEstimatedCost > 0 ? Math.round((categoryTotals.accommodation / totalEstimatedCost) * 100) : 0,
      itemCount: categoryCounts.accommodation,
      color: CATEGORY_CONFIG.accommodation.color,
      hexColor: CATEGORY_CONFIG.accommodation.hexColor,
      bgColor: CATEGORY_CONFIG.accommodation.bgColor,
      borderColor: CATEGORY_CONFIG.accommodation.borderColor,
      textColor: CATEGORY_CONFIG.accommodation.textColor,
      iconName: CATEGORY_CONFIG.accommodation.iconName,
    },
    activities: {
      category: 'activities',
      label: CATEGORY_CONFIG.activities.label,
      amount: categoryTotals.activities,
      percentage: totalEstimatedCost > 0 ? Math.round((categoryTotals.activities / totalEstimatedCost) * 100) : 0,
      itemCount: categoryCounts.activities,
      color: CATEGORY_CONFIG.activities.color,
      hexColor: CATEGORY_CONFIG.activities.hexColor,
      bgColor: CATEGORY_CONFIG.activities.bgColor,
      borderColor: CATEGORY_CONFIG.activities.borderColor,
      textColor: CATEGORY_CONFIG.activities.textColor,
      iconName: CATEGORY_CONFIG.activities.iconName,
    },
    meals: {
      category: 'meals',
      label: CATEGORY_CONFIG.meals.label,
      amount: categoryTotals.meals,
      percentage: totalEstimatedCost > 0 ? Math.round((categoryTotals.meals / totalEstimatedCost) * 100) : 0,
      itemCount: categoryCounts.meals,
      color: CATEGORY_CONFIG.meals.color,
      hexColor: CATEGORY_CONFIG.meals.hexColor,
      bgColor: CATEGORY_CONFIG.meals.bgColor,
      borderColor: CATEGORY_CONFIG.meals.borderColor,
      textColor: CATEGORY_CONFIG.meals.textColor,
      iconName: CATEGORY_CONFIG.meals.iconName,
    },
  };

  // Build Daily Breakdown
  const dateStrings =
    trip.startDate && trip.endDate
      ? getDatesBetween(trip.startDate, trip.endDate)
      : Array.from({ length: durationDays }, (_, i) => `Day ${i + 1}`);

  const stops = trip.stops || [];

  const dailyBreakdown: DailySpendingSummary[] = dateStrings.map((dateStr, idx) => {
    const dayNumber = idx + 1;
    const formattedDate = dateStr.startsWith('Day ') ? dateStr : formatDateForDisplay(dateStr);

    // Determine city for this day based on stops
    let city = trip.destinations?.[0] || 'Destination';
    if (stops.length > 0) {
      const stopIndex = Math.min(
        Math.floor((idx / Math.max(1, dateStrings.length)) * stops.length),
        stops.length - 1
      );
      city = stops[stopIndex]?.city || city;
    }

    // Filter items belonging to this day
    const dayItems = allExpenses.filter((e) => {
      if (e.date && e.date === dateStr) return true;
      if (e.dayNumber && e.dayNumber === dayNumber) return true;
      return false;
    });

    const totalSpent = dayItems.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    const isDayOver = baselineDailyBudget > 0 && totalSpent > baselineDailyBudget;
    const overAmount = isDayOver ? totalSpent - baselineDailyBudget : 0;
    const percentageOfDailyTarget =
      baselineDailyBudget > 0 ? Math.round((totalSpent / baselineDailyBudget) * 100) : 0;

    return {
      dateStr,
      dayNumber,
      formattedDate,
      destinationCity: city,
      totalSpent,
      baselineDailyBudget,
      isOverBudget: isDayOver,
      overAmount,
      percentageOfDailyTarget,
      items: dayItems,
    };
  });

  return {
    totalBudget,
    totalEstimatedCost,
    remainingBudget,
    isOverBudget,
    overBudgetAmount,
    percentageUsed,
    averageDailyCost,
    baselineDailyBudget,
    tripDurationDays: durationDays,
    currency,
    categories,
    dailyBreakdown,
    allExpenses,
    manualExpensesCount,
    automaticExpensesCount,
  };
}
