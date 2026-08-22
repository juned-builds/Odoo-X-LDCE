/**
 * Date utility helpers for GlobeTrotter trip calculations
 */

export function calculateTripDuration(startDateStr: string, endDateStr: string): {
  days: number;
  formattedDuration: string;
  isValid: boolean;
  errorMessage?: string;
} {
  if (!startDateStr || !endDateStr) {
    return {
      days: 0,
      formattedDuration: '',
      isValid: false,
    };
  }

  const start = new Date(startDateStr);
  const end = new Date(endDateStr);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return {
      days: 0,
      formattedDuration: '',
      isValid: false,
      errorMessage: 'Invalid date format',
    };
  }

  // Set times to midnight to calculate pure day differences
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1; // inclusive of end day

  if (diffDays < 1) {
    return {
      days: diffDays,
      formattedDuration: '',
      isValid: false,
      errorMessage: 'End date cannot be earlier than start date',
    };
  }

  if (diffDays === 1) {
    return {
      days: 1,
      formattedDuration: '1 day',
      isValid: true,
    };
  }

  if (diffDays === 2 || diffDays === 3) {
    return {
      days: diffDays,
      formattedDuration: `${diffDays} days`,
      isValid: true,
    };
  }

  return {
    days: diffDays,
    formattedDuration: `${diffDays} days`,
    isValid: true,
  };
}

export function formatTripDisplayDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;

  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatTripShortDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;

  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
  });
}

export function formatTripDateRange(startDateStr: string, endDateStr: string): string {
  if (!startDateStr && !endDateStr) return 'Flexible Dates';
  if (!startDateStr) return `Until ${formatTripShortDate(endDateStr)}`;
  if (!endDateStr) return `From ${formatTripShortDate(startDateStr)}`;

  const start = new Date(startDateStr);
  const end = new Date(endDateStr);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return `${startDateStr} — ${endDateStr}`;
  }

  const startFormatted = start.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
  });

  const endFormatted = end.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
  });

  return `${startFormatted} — ${endFormatted}`;
}

export function deriveTripStatus(
  startDateStr: string,
  endDateStr: string,
  fallbackStatus: 'upcoming' | 'planning' | 'completed' | 'draft' = 'planning'
): 'upcoming' | 'planning' | 'completed' | 'draft' {
  if (!startDateStr || !endDateStr) return fallbackStatus;

  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return fallbackStatus;
  }

  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  if (end.getTime() < now.getTime()) {
    return 'completed';
  }

  // If start is within next 60 days
  const sixtyDaysAhead = new Date();
  sixtyDaysAhead.setDate(now.getDate() + 60);

  if (start.getTime() >= now.getTime() && start.getTime() <= sixtyDaysAhead.getTime()) {
    return 'upcoming';
  }

  return 'planning';
}
