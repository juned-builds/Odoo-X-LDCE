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
      formattedDuration: '1 day (Day Trip)',
      isValid: true,
    };
  }

  if (diffDays === 2 || diffDays === 3) {
    return {
      days: diffDays,
      formattedDuration: `${diffDays} days (Weekend Getaway)`,
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
