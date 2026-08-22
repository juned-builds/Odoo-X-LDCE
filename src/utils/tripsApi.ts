/**
 * Trips and Saved Destinations Client-Side API Utility
 */
import { Trip, TripActivityAssignment } from '../types/dashboard';
import { ExpenseItem } from '../types/budget';

export async function fetchTripsApi(): Promise<Trip[]> {
  const res = await fetch('/api/trips', {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to fetch trips');
  }

  const data = await res.json();
  return data.trips || [];
}

export async function fetchTripByIdApi(tripId: string): Promise<Trip> {
  const res = await fetch(`/api/trips/${tripId}`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to fetch trip details');
  }

  const data = await res.json();
  return data.trip;
}

export async function createTripApi(tripData: Partial<Trip>): Promise<Trip> {
  const res = await fetch('/api/trips', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(tripData),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to create trip');
  }

  const data = await res.json();
  return data.trip;
}

export async function updateTripApi(tripId: string, tripData: Partial<Trip>): Promise<Trip> {
  const res = await fetch(`/api/trips/${tripId}`, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(tripData),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to update trip');
  }

  const data = await res.json();
  return data.trip;
}

export async function deleteTripApi(tripId: string): Promise<void> {
  const res = await fetch(`/api/trips/${tripId}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to delete trip');
  }
}

export async function addActivityToTripApi(tripId: string, activity: Partial<TripActivityAssignment>): Promise<Trip> {
  const res = await fetch(`/api/trips/${tripId}/activities`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(activity),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to add activity');
  }

  const data = await res.json();
  return data.trip;
}

export async function updateTripActivityApi(
  tripId: string,
  activityId: string,
  activity: Partial<TripActivityAssignment>
): Promise<Trip> {
  const res = await fetch(`/api/trips/${tripId}/activities/${activityId}`, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(activity),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to update activity');
  }

  const data = await res.json();
  return data.trip;
}

export async function deleteTripActivityApi(tripId: string, activityId: string): Promise<Trip> {
  const res = await fetch(`/api/trips/${tripId}/activities/${activityId}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to delete activity');
  }

  const data = await res.json();
  return data.trip;
}

export async function reorderTripActivitiesApi(
  tripId: string,
  activities: Array<{ id: string; dayNumber: number; orderIndex: number; startTime?: string }>
): Promise<Trip> {
  const res = await fetch(`/api/trips/${tripId}/activities/reorder`, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ activities }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to reorder activities');
  }

  const data = await res.json();
  return data.trip;
}

export async function addTripExpenseApi(tripId: string, expense: Partial<ExpenseItem>): Promise<Trip> {
  const res = await fetch(`/api/trips/${tripId}/expenses`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(expense),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to add expense');
  }

  const data = await res.json();
  return data.trip;
}

export async function updateTripExpenseApi(
  tripId: string,
  expenseId: string,
  expense: Partial<ExpenseItem>
): Promise<Trip> {
  const res = await fetch(`/api/trips/${tripId}/expenses/${expenseId}`, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(expense),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to update expense');
  }

  const data = await res.json();
  return data.trip;
}

export async function deleteTripExpenseApi(tripId: string, expenseId: string): Promise<Trip> {
  const res = await fetch(`/api/trips/${tripId}/expenses/${expenseId}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to delete expense');
  }

  const data = await res.json();
  return data.trip;
}

export async function fetchSavedDestinationIdsApi(): Promise<string[]> {
  const res = await fetch('/api/saved-destinations', {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    return [];
  }

  const data = await res.json();
  return data.destinationIds || [];
}

export async function saveDestinationApi(destinationId: string): Promise<void> {
  const res = await fetch(`/api/saved-destinations/${destinationId}`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to save destination');
  }
}

export async function removeSavedDestinationApi(destinationId: string): Promise<void> {
  const res = await fetch(`/api/saved-destinations/${destinationId}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to remove saved destination');
  }
}
