import { Trip, TripActivityAssignment, TripStop } from '../types/dashboard';

/**
 * Generates a deterministic share identifier from a trip
 */
export function getTripShareId(trip: Trip): string {
  if (trip.shareId) return trip.shareId;
  // Deterministic clean slug or ID
  const cleanName = (trip.name || 'trip')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const idSuffix = trip.id.replace(/[^a-zA-Z0-9]/g, '').slice(-6) || 'pub';
  return `${cleanName}-${idSuffix}`;
}

/**
 * Returns the shareable public link for the prototype
 */
export function getShareUrl(shareId: string): string {
  if (typeof window !== 'undefined' && window.location) {
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    return `${origin}${pathname}#/share/${shareId}`;
  }
  return `https://globetrotter.travel/share/${shareId}`;
}

/**
 * Deep clones a trip with brand new IDs for the user's workspace
 */
export function cloneTripForCopy(sourceTrip: Trip): Trip {
  const timestamp = Date.now();
  const newTripId = `trip-copy-${timestamp}`;
  
  // Clone stops with new references
  const clonedStops: TripStop[] = sourceTrip.stops
    ? sourceTrip.stops.map((stop, idx) => ({
        ...stop,
        order: idx + 1,
        activities: stop.activities
          ? stop.activities.map((act, actIdx) => ({
              ...act,
              id: `act-assign-${timestamp}-${idx}-${actIdx}`,
            }))
          : [],
      }))
    : [];

  // Clone activities with new IDs
  const clonedActivities: TripActivityAssignment[] = sourceTrip.activities
    ? sourceTrip.activities.map((act, idx) => ({
        ...act,
        id: `act-assign-${timestamp}-${idx}`,
      }))
    : [];

  const copyName = sourceTrip.name.endsWith('— Copy')
    ? `${sourceTrip.name} (2)`
    : `${sourceTrip.name} — Copy`;

  const clonedTrip: Trip = {
    ...sourceTrip,
    id: newTripId,
    name: copyName,
    status: 'planning',
    progressPercentage: Math.min(30, sourceTrip.progressPercentage || 25),
    createdAt: new Date().toISOString(),
    isShared: false,
    shareId: undefined,
    stops: clonedStops,
    activities: clonedActivities,
    // Reset private expenses when cloning a public itinerary
    expenses: [],
  };

  return clonedTrip;
}

/**
 * Triggers native device Web Share API if available
 */
export async function triggerNativeShare(trip: Trip, shareUrl: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share({
        title: `${trip.name} | GlobeTrotter Itinerary`,
        text: `Check out this travel itinerary for ${trip.name} (${trip.route}) on GlobeTrotter!`,
        url: shareUrl,
      });
      return true;
    } catch (err) {
      // User cancelled or aborted
      if ((err as Error).name !== 'AbortError') {
        console.warn('Native share failed:', err);
      }
      return false;
    }
  }
  return false;
}

/**
 * Builds social media share links
 */
export function getSocialShareUrl(
  platform: 'whatsapp' | 'twitter' | 'facebook' | 'linkedin',
  trip: Trip,
  shareUrl: string
): string {
  const title = encodeURIComponent(`${trip.name} — ${trip.route} (${trip.duration})`);
  const encodedUrl = encodeURIComponent(shareUrl);
  const text = encodeURIComponent(`Explore this travel itinerary for ${trip.name} on GlobeTrotter:`);

  switch (platform) {
    case 'whatsapp':
      return `https://api.whatsapp.com/send?text=${text}%20${encodedUrl}`;
    case 'twitter':
      return `https://twitter.com/intent/tweet?text=${title}&url=${encodedUrl}&hashtags=Travel,GlobeTrotter,Itinerary`;
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    case 'linkedin':
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
    default:
      return shareUrl;
  }
}
