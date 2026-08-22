export type NavSection =
  | 'dashboard'
  | 'create-trip'
  | 'my-trips'
  | 'explore'
  | 'activities'
  | 'itinerary'
  | 'calendar'
  | 'budget'
  | 'settings';

export interface TripActivityAssignment {
  id: string;
  activityId: string;
  destinationCity: string;
  destinationId?: string;
  stopOrder?: number;
  name: string;
  type: string;
  cost?: string;
  costTier?: string;
  costNumeric?: number;
  duration?: string;
  durationMinutes?: number;
  image?: string;
  date?: string; // 'YYYY-MM-DD'
  time?: string; // e.g. "09:30 AM"
  startTime?: string; // alias for time
  dayNumber?: number; // e.g. 1 for Day 1
  order?: number; // order index within the day
  rating?: number;
  description?: string;
  isCustom?: boolean;
  notes?: string;
  addedAt?: string;
}

export interface TripStop {
  destinationId?: string;
  city: string;
  country?: string;
  startDate?: string;
  endDate?: string;
  order: number;
  activities?: TripActivityAssignment[];
}

export interface Trip {
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
  notesCount?: number;
  destinations: string[];
  stops?: TripStop[];
  activities?: TripActivityAssignment[];
  createdAt?: string;
}

export interface Destination {
  id: string;
  city: string;
  country: string;
  region: string;
  description: string;
  shortDescription?: string;
  costIndex: '$' | '$$' | '$$$' | '$$$$';
  popularity: number;
  rating: number;
  reviewCount?: number;
  image: string;
  bestSeason: string;
  highlights: string[];
  tags?: string[];
}

export interface TripFormData {
  name: string;
  startDate: string;
  endDate: string;
  description: string;
  coverImage: string;
}

export interface RecommendedDestination {
  id: string;
  city: string;
  country: string;
  region: string;
  shortDescription: string;
  costIndicator: '$' | '$$' | '$$$' | '$$$$';
  sampleRating: number;
  reviewCount: number;
  image: string;
  tags: string[];
  bestTimeToVisit: string;
}

export interface BudgetCategory {
  name: string;
  spent: number;
  budgeted: number;
  percentage: number;
  color: string;
  bgColor: string;
}

export interface BudgetHighlight {
  tripName: string;
  currency: string;
  totalPlanned: number;
  amountSpent: number;
  remainingAmount: number;
  averageDailyCost: number;
  tripDurationDays: number;
  categories: BudgetCategory[];
}
