export type ActivityType =
  | 'Sightseeing'
  | 'Culture'
  | 'Food'
  | 'Adventure'
  | 'Nature'
  | 'Shopping'
  | 'Nightlife'
  | 'Family';

export type CostTier = 'Free' | '$' | '$$' | '$$$' | '$$$$';

export type DurationRange = 'under-1h' | '1-2h' | '2-4h' | '4h-plus';

export type ActivitySortOption =
  | 'popularity'
  | 'rating'
  | 'cost-asc'
  | 'cost-desc'
  | 'duration-asc'
  | 'duration-desc'
  | 'name-asc';

export interface Activity {
  id: string;
  destinationId: string; // e.g. 'dest-paris'
  destinationCity: string;
  destinationCountry: string;
  name: string;
  type: ActivityType;
  description: string;
  shortDescription?: string;
  cost: string; // e.g. "Free", "€25 (~$27)", "$45", "¥3,200 (~$22)"
  costTier: CostTier;
  costNumeric: number; // Approximate USD amount for accurate sorting (0 for Free)
  duration: string; // e.g. "2–3 hours", "45 mins", "Full day (6h)"
  durationMinutes: number; // Approximate minutes for accurate sorting
  durationRange: DurationRange;
  rating: number; // e.g. 4.9
  reviewCount?: number;
  image: string;
  bestTime: string; // e.g. "Morning (09:00 - 12:00)", "Sunset", "Evening"
  tags: string[];
  popularity: number; // 1-100
  highlights?: string[];
  location?: string;
}
