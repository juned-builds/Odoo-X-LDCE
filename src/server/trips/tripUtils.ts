/**
 * Trip Utilities for Server & Database Conversions
 */

export function parseTimeToSql(timeStr?: string): string {
  if (!timeStr) return '10:00:00';
  
  const trimmed = timeStr.trim();

  // Handle standard 24h format HH:MM:SS or HH:MM
  const match24 = trimmed.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (match24 && !trimmed.toLowerCase().includes('am') && !trimmed.toLowerCase().includes('pm')) {
    const h = parseInt(match24[1], 10);
    const m = parseInt(match24[2], 10);
    const s = match24[3] ? parseInt(match24[3], 10) : 0;
    if (h >= 0 && h < 24 && m >= 0 && m < 60 && s >= 0 && s < 60) {
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
  }

  // Handle 12-hour AM/PM format (e.g., "10:00 AM", "6:30 PM", "09:15 am")
  const match12 = trimmed.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*([aApP][mM])$/);
  if (match12) {
    let hours = parseInt(match12[1], 10);
    const minutes = parseInt(match12[2], 10);
    const seconds = match12[3] ? parseInt(match12[3], 10) : 0;
    const modifier = match12[4].toUpperCase();

    if (hours === 12) {
      hours = modifier === 'PM' ? 12 : 0;
    } else if (modifier === 'PM') {
      hours += 12;
    }

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  return '10:00:00';
}

export function formatSqlTimeToDisplay(sqlTime?: string): string {
  if (!sqlTime) return '10:00 AM';

  const parts = sqlTime.split(':');
  if (parts.length < 2) return sqlTime;

  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];

  if (isNaN(hours)) return '10:00 AM';

  const modifier = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;

  return `${String(displayHours).padStart(2, '0')}:${minutes} ${modifier}`;
}

export function calculateDurationDays(startDateStr: string, endDateStr: string): number {
  try {
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(1, isNaN(diffDays) ? 1 : diffDays);
  } catch {
    return 1;
  }
}
