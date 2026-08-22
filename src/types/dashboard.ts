export type NavSection = 'dashboard' | 'create-trip' | 'my-trips' | 'explore' | 'calendar' | 'budget' | 'settings';

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
  createdAt?: string;
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
