import { ActivityType, CostTier } from './activity';

export interface ItineraryActivity {
  id: string; // Unique assignment ID (e.g. 'act-assign-123')
  activityId: string; // ID of the underlying activity
  name: string;
  destinationCity: string;
  destinationId?: string;
  date: string; // 'YYYY-MM-DD'
  dayNumber: number; // 1-indexed (e.g., 1 for Day 1)
  startTime?: string; // e.g. "09:00 AM"
  duration: string; // e.g. "2–3 hours", "1 hour"
  durationMinutes: number; // e.g. 150
  cost?: string; // e.g. "€29 (~$31)" or "Free"
  costTier?: CostTier | string;
  costNumeric: number; // In currency units for summation
  type: ActivityType | string;
  rating?: number;
  image: string;
  description?: string;
  order: number; // 1, 2, 3... order within the day
  isCustom?: boolean;
  notes?: string;
  location?: string;
}

export interface ItineraryDay {
  dayNumber: number; // 1, 2, 3...
  dateStr: string; // 'YYYY-MM-DD'
  date?: string; // alias for dateStr
  formattedDate: string; // e.g. '10 Jun', 'Thu, Jun 10'
  dayOfWeek: string; // e.g. 'Wednesday'
  destinationCity: string; // e.g. 'Paris'
  destinationId?: string;
  country?: string;
  activities: ItineraryActivity[];
  totalDurationMinutes: number;
  formattedDuration: string; // e.g. '5h 30m planned'
  totalCostNumeric: number;
  totalCost?: number; // alias for totalCostNumeric
  formattedCost: string; // e.g. '₹4,500' or '$75'
  hasTimeConflict: boolean;
  conflictReason?: string;
}

export interface CustomActivityInput {
  name: string;
  description: string;
  type: ActivityType | string;
  duration: string;
  durationMinutes: number;
  cost: string;
  costNumeric: number;
  costTier: CostTier;
  startTime: string;
  location?: string;
  image?: string;
}
