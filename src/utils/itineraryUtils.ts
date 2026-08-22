import { Trip, TripActivityAssignment, TripStop } from '../types/dashboard';
import { ItineraryActivity, ItineraryDay } from '../types/itinerary';
import { ALL_DESTINATIONS } from '../data/destinationsData';

/**
 * Looks up country for a destination city from trip stops or global destination registry
 */
export function getDestinationCountry(cityName: string, stops?: TripStop[]): string {
  if (!cityName) return '';
  
  // First check trip stops
  if (stops && stops.length > 0) {
    const stop = stops.find((s) => s.city.toLowerCase() === cityName.toLowerCase());
    if (stop?.country) return stop.country;
  }

  // Then check ALL_DESTINATIONS
  const found = ALL_DESTINATIONS.find(
    (d) => d.city.toLowerCase() === cityName.toLowerCase()
  );
  if (found?.country) return found.country;

  // Common fallbacks
  const commonMap: Record<string, string> = {
    paris: 'France',
    amsterdam: 'Netherlands',
    rome: 'Italy',
    tokyo: 'Japan',
    bali: 'Indonesia',
    london: 'United Kingdom',
    barcelona: 'Spain',
    dubai: 'United Arab Emirates',
    kyoto: 'Japan',
    florence: 'Italy',
    venice: 'Italy',
    newyork: 'United States',
    'new york': 'United States',
    singapore: 'Singapore',
    bangkok: 'Thailand',
    sydney: 'Australia',
  };

  return commonMap[cityName.toLowerCase()] || '';
}

/**
 * Formats a time string into 24-hour display (e.g. "09:30 AM" -> "09:30", "06:30 PM" -> "18:30")
 */
export function format24hTime(timeStr?: string): string {
  if (!timeStr) return '09:00';
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return timeStr;

  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const period = match[3].toUpperCase();

  if (period === 'PM' && hours < 12) {
    hours += 12;
  } else if (period === 'AM' && hours === 12) {
    hours = 0;
  }

  return `${hours.toString().padStart(2, '0')}:${minutes}`;
}

/**
 * Formats date string into full month and day (e.g. "2026-09-10" -> "September 10")
 */
export function formatLongDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Standard preset start times for activity scheduling
 */
export const PRESET_START_TIMES = [
  '08:00 AM',
  '09:00 AM',
  '09:30 AM',
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '11:30 AM',
  '12:00 PM',
  '01:00 PM',
  '01:30 PM',
  '02:00 PM',
  '02:30 PM',
  '03:00 PM',
  '03:30 PM',
  '04:00 PM',
  '04:30 PM',
  '05:00 PM',
  '05:30 PM',
  '06:00 PM',
  '06:30 PM',
  '07:00 PM',
  '07:30 PM',
  '08:00 PM',
  '08:30 PM',
  '09:00 PM',
];

/**
 * Converts a time string like "09:30 AM" or "02:00 PM" into minutes from midnight (0 - 1440)
 */
export function timeStringToMinutes(timeStr?: string): number | null {
  if (!timeStr) return null;
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();

  if (period === 'PM' && hours < 12) {
    hours += 12;
  } else if (period === 'AM' && hours === 12) {
    hours = 0;
  }

  return hours * 60 + minutes;
}

/**
 * Parses duration strings like "2–3 hours", "45 mins", "1.5 hours", "Full day (6h)" into minutes
 */
export function parseDurationToMinutes(durationStr?: string): number {
  if (!durationStr) return 90; // Default 1.5 hours
  const lower = durationStr.toLowerCase();

  // Look for "45 mins" or "30m"
  const minsMatch = lower.match(/(\d+)\s*(min|mins|minute|minutes|m\b)/);
  if (minsMatch && !lower.includes('hour') && !lower.includes('h')) {
    return parseInt(minsMatch[1], 10);
  }

  // Look for "2-3 hours" -> average 2.5h (150 mins)
  const rangeMatch = lower.match(/(\d+)\s*[-–—to]+\s*(\d+)\s*(hour|hours|h)/);
  if (rangeMatch) {
    const min = parseFloat(rangeMatch[1]);
    const max = parseFloat(rangeMatch[2]);
    return Math.round(((min + max) / 2) * 60);
  }

  // Look for "2 hours" or "1.5h"
  const hourMatch = lower.match(/(\d+(?:\.\d+)?)\s*(hour|hours|hr|hrs|h)/);
  if (hourMatch) {
    return Math.round(parseFloat(hourMatch[1]) * 60);
  }

  if (lower.includes('full day')) return 360; // 6 hours
  if (lower.includes('half day')) return 180; // 3 hours

  return 90;
}

/**
 * Formats total minutes into readable display like "5h 30m" or "2h" or "45m"
 */
export function formatMinutesToHours(totalMinutes: number): string {
  if (totalMinutes <= 0) return '0m';
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  if (hours > 0 && mins > 0) {
    return `${hours}h ${mins}m`;
  }
  if (hours > 0) {
    return `${hours}h`;
  }
  return `${mins}m`;
}

/**
 * Parses a cost string (e.g., "$25", "€29 (~$31)", "₹4,500", "Free") to an approximate numeric value
 */
export function parseCostToNumeric(costStr?: string, defaultCurrency: string = '₹'): number {
  if (!costStr) return 0;
  if (costStr.toLowerCase().includes('free')) return 0;

  // If contains ~$, parse the USD approximate
  const approxUsd = costStr.match(/~\$(\d+(?:\.\d+)?)/);
  if (approxUsd) {
    const usd = parseFloat(approxUsd[1]);
    // If currency is ₹, roughly convert USD to ₹ (approx 80-85x)
    return defaultCurrency === '₹' ? Math.round(usd * 85) : Math.round(usd);
  }

  // Match numbers with commas
  const clean = costStr.replace(/[^\d.]/g, '');
  const num = parseFloat(clean);
  return isNaN(num) ? 0 : Math.round(num);
}

/**
 * Formats a numeric cost with currency symbol
 */
export function formatCostAmount(amount: number, currency: string = '₹'): string {
  if (amount <= 0) return 'Free';
  return `${currency}${amount.toLocaleString()}`;
}

/**
 * Detects schedule overlaps within a list of activities on a single day.
 */
export function checkScheduleOverlap(activities: ItineraryActivity[]): {
  hasConflict: boolean;
  reason?: string;
} {
  if (activities.length <= 1) return { hasConflict: false };

  // Filter activities with valid start times
  const timedActivities: {
    name: string;
    start: number;
    end: number;
    timeStr: string;
  }[] = [];

  for (const act of activities) {
    if (act.startTime) {
      const startMin = timeStringToMinutes(act.startTime);
      if (startMin !== null) {
        const dur = act.durationMinutes || parseDurationToMinutes(act.duration);
        timedActivities.push({
          name: act.name,
          start: startMin,
          end: startMin + dur,
          timeStr: act.startTime,
        });
      }
    }
  }

  if (timedActivities.length <= 1) return { hasConflict: false };

  // Sort by start time
  timedActivities.sort((a, b) => a.start - b.start);

  for (let i = 0; i < timedActivities.length - 1; i++) {
    const current = timedActivities[i];
    const next = timedActivities[i + 1];

    if (current.end > next.start) {
      return {
        hasConflict: true,
        reason: `"${current.name}" (${current.timeStr}) overlaps with "${next.name}" (${next.timeStr})`,
      };
    }
  }

  return { hasConflict: false };
}

/**
 * Generates dynamic day-by-day itinerary structures for a trip.
 * Automatically distributes destinations across days, extracts assigned activities,
 * calculates durations, sums costs, and flags schedule overlaps.
 */
export function generateItineraryDays(trip: Trip): ItineraryDay[] {
  if (!trip.startDate || !trip.endDate) {
    return [];
  }

  const start = new Date(trip.startDate);
  const end = new Date(trip.endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return [];
  }

  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  const diffTime = end.getTime() - start.getTime();
  const totalDays = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1);

  const destinationsList =
    trip.destinations && trip.destinations.length > 0
      ? trip.destinations
      : trip.route
      ? trip.route.split('→').map((s) => s.trim()).filter(Boolean)
      : [];

  const rawActivities: TripActivityAssignment[] = trip.activities || [];

  const days: ItineraryDay[] = [];

  for (let dayIdx = 0; dayIdx < totalDays; dayIdx++) {
    const dayNumber = dayIdx + 1;
    const currentDayDate = new Date(start);
    currentDayDate.setDate(start.getDate() + dayIdx);

    const dateStr = currentDayDate.toISOString().split('T')[0];
    const formattedDate = currentDayDate.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
    });
    const dayOfWeek = currentDayDate.toLocaleDateString('en-US', {
      weekday: 'short',
    });

    // Determine the destination city for this day
    let destinationCity = 'Destination';
    if (destinationsList.length > 0) {
      if (destinationsList.length === 1) {
        destinationCity = destinationsList[0];
      } else {
        // Distribute days across destinations proportionally
        const destIndex = Math.min(
          Math.floor((dayIdx / totalDays) * destinationsList.length),
          destinationsList.length - 1
        );
        destinationCity = destinationsList[destIndex];
      }
    }

    // Match activities assigned to this date or dayNumber
    const dayActivities: ItineraryActivity[] = rawActivities
      .filter((act) => {
        if (act.date) {
          return act.date === dateStr;
        }
        if (act.dayNumber) {
          return act.dayNumber === dayNumber;
        }
        return false;
      })
      .map((act, actIdx) => {
        const durMins =
          act.durationMinutes || parseDurationToMinutes(act.duration);
        const costNum =
          act.costNumeric !== undefined
            ? act.costNumeric
            : parseCostToNumeric(act.cost, trip.currency);

        return {
          id: act.id || `act-assign-${dayIdx}-${actIdx}`,
          activityId: act.activityId,
          name: act.name,
          destinationCity: act.destinationCity || destinationCity,
          destinationId: act.destinationId,
          date: dateStr,
          dayNumber: dayNumber,
          startTime: act.time || act.startTime || getDefaultStartTime(actIdx),
          duration: act.duration || '2 hours',
          durationMinutes: durMins,
          cost: act.cost || 'Free',
          costTier: act.costTier,
          costNumeric: costNum,
          type: act.type || 'Sightseeing',
          rating: act.rating || 4.8,
          image:
            act.image ||
            'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80',
          description: act.description,
          order: act.order !== undefined ? act.order : actIdx + 1,
          isCustom: !!act.isCustom,
          notes: act.notes,
        };
      });

    // Sort day activities by order and start time
    dayActivities.sort((a, b) => {
      if (a.order !== b.order) {
        return a.order - b.order;
      }
      const timeA = timeStringToMinutes(a.startTime) ?? 9999;
      const timeB = timeStringToMinutes(b.startTime) ?? 9999;
      return timeA - timeB;
    });

    // Calculate daily duration and cost sums
    const totalDurationMinutes = dayActivities.reduce(
      (sum, act) => sum + (act.durationMinutes || 0),
      0
    );
    const totalCostNumeric = dayActivities.reduce(
      (sum, act) => sum + (act.costNumeric || 0),
      0
    );

    // Check time conflicts
    const conflictCheck = checkScheduleOverlap(dayActivities);

    days.push({
      dayNumber,
      dateStr,
      date: dateStr,
      formattedDate,
      dayOfWeek,
      destinationCity,
      country: getDestinationCountry(destinationCity, trip.stops),
      activities: dayActivities,
      totalDurationMinutes,
      formattedDuration: formatMinutesToHours(totalDurationMinutes),
      totalCostNumeric,
      totalCost: totalCostNumeric,
      formattedCost: formatCostAmount(totalCostNumeric, trip.currency || '₹'),
      hasTimeConflict: conflictCheck.hasConflict,
      conflictReason: conflictCheck.reason,
    });
  }

  return days;
}

/**
 * Returns default sensible start times based on activity sequence within a day
 */
function getDefaultStartTime(index: number): string {
  const defaults = [
    '09:30 AM',
    '01:30 PM',
    '04:30 PM',
    '07:30 PM',
    '11:00 AM',
    '03:00 PM',
  ];
  return defaults[index % defaults.length];
}
