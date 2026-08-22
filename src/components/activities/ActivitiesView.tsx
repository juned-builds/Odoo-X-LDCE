import React, { useState, useMemo } from 'react';
import {
  Search,
  SlidersHorizontal,
  X,
  Sparkles,
  MapPin,
  Clock,
  DollarSign,
  Star,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Compass,
  ChevronDown,
  Filter,
  Plus,
  Flame,
} from 'lucide-react';
import { Activity, ActivityType, CostTier, DurationRange, ActivitySortOption } from '../../types/activity';
import { ALL_ACTIVITIES } from '../../data/activitiesData';
import { Destination, Trip } from '../../types/dashboard';
import { ActivityCard } from './ActivityCard';
import { ActivityDetailModal } from './ActivityDetailModal';
import { AddActivityToTripModal } from './AddActivityToTripModal';
import { Button } from '../ui/Button';

interface ActivitiesViewProps {
  initialDestinationCity?: string;
  trips: Trip[];
  onAddActivityToTrip: (tripId: string, stopCity: string, activity: Activity) => void;
  onRemoveActivityFromTrip?: (tripId: string, activityId: string, stopCity?: string) => void;
  onCreateNewTrip?: () => void;
}

export const ActivitiesView: React.FC<ActivitiesViewProps> = ({
  initialDestinationCity = 'Paris',
  trips,
  onAddActivityToTrip,
  onRemoveActivityFromTrip,
  onCreateNewTrip,
}) => {
  // 1. Destination Filter / Switcher State
  const [selectedCity, setSelectedCity] = useState<string>(initialDestinationCity || 'All');

  // 2. Search Query
  const [searchQuery, setSearchQuery] = useState('');

  // 3. Filter States
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedCost, setSelectedCost] = useState<string>('All');
  const [selectedDuration, setSelectedDuration] = useState<string>('All');
  const [sortBy, setSortBy] = useState<ActivitySortOption>('popularity');
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // 4. Modal States
  const [detailModalActivity, setDetailModalActivity] = useState<Activity | null>(null);
  const [addToTripActivity, setAddToTripActivity] = useState<Activity | null>(null);

  // 5. Toast Feedback
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: 'success' | 'info';
  } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Distinct city list extracted from ALL_ACTIVITIES
  const availableCities = useMemo(() => {
    const set = new Set<string>();
    ALL_ACTIVITIES.forEach((a) => set.add(a.destinationCity));
    return Array.from(set).sort();
  }, []);

  // Filter and Sort Pipeline
  const filteredActivities = useMemo(() => {
    return ALL_ACTIVITIES.filter((act) => {
      // City Filter
      if (selectedCity !== 'All' && act.destinationCity.toLowerCase() !== selectedCity.toLowerCase()) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = act.name.toLowerCase().includes(query);
        const matchesDesc = act.description.toLowerCase().includes(query);
        const matchesCity = act.destinationCity.toLowerCase().includes(query);
        const matchesCountry = act.destinationCountry.toLowerCase().includes(query);
        const matchesType = act.type.toLowerCase().includes(query);
        const matchesTags = act.tags?.some((t) => t.toLowerCase().includes(query));

        if (!matchesName && !matchesDesc && !matchesCity && !matchesCountry && !matchesType && !matchesTags) {
          return false;
        }
      }

      // Activity Type Filter
      if (selectedType !== 'All' && act.type !== selectedType) {
        return false;
      }

      // Cost Filter
      if (selectedCost !== 'All') {
        if (selectedCost === 'Free' && act.costTier !== 'Free') return false;
        if (selectedCost === '$' && act.costTier !== '$') return false;
        if (selectedCost === '$$' && act.costTier !== '$$') return false;
        if (selectedCost === '$$$' && act.costTier !== '$$$') return false;
        if (selectedCost === '$$$$' && act.costTier !== '$$$$') return false;
      }

      // Duration Filter
      if (selectedDuration !== 'All') {
        if (selectedDuration === 'under-1h' && act.durationRange !== 'under-1h') return false;
        if (selectedDuration === '1-2h' && act.durationRange !== '1-2h') return false;
        if (selectedDuration === '2-4h' && act.durationRange !== '2-4h') return false;
        if (selectedDuration === '4h-plus' && act.durationRange !== '4h-plus') return false;
      }

      return true;
    }).sort((a, b) => {
      switch (sortBy) {
        case 'popularity':
          return (b.popularity || 0) - (a.popularity || 0);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'cost-asc':
          return a.costNumeric - b.costNumeric;
        case 'cost-desc':
          return b.costNumeric - a.costNumeric;
        case 'duration-asc':
          return a.durationMinutes - b.durationMinutes;
        case 'duration-desc':
          return b.durationMinutes - a.durationMinutes;
        case 'name-asc':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
  }, [selectedCity, searchQuery, selectedType, selectedCost, selectedDuration, sortBy]);

  // Check if any filters are active (other than default)
  const isFilterActive =
    searchQuery.trim() !== '' ||
    selectedType !== 'All' ||
    selectedCost !== 'All' ||
    selectedDuration !== 'All' ||
    sortBy !== 'popularity' ||
    selectedCity !== 'All';

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedType('All');
    setSelectedCost('All');
    setSelectedDuration('All');
    setSortBy('popularity');
    setSelectedCity('All');
  };

  // Helper to check if an activity is in any trip
  const getActivityTripInfo = (activityId: string) => {
    for (const trip of trips) {
      if (trip.activities?.some((a) => a.activityId === activityId)) {
        return { isAdded: true, tripName: trip.name, tripId: trip.id };
      }
      if (trip.stops?.some((s) => s.activities?.some((a) => a.activityId === activityId))) {
        return { isAdded: true, tripName: trip.name, tripId: trip.id };
      }
    }
    return { isAdded: false, tripName: undefined, tripId: undefined };
  };

  const handleAddModalSubmit = (tripId: string, stopCity: string, activity: Activity) => {
    onAddActivityToTrip(tripId, stopCity, activity);
    const targetTrip = trips.find((t) => t.id === tripId);
    showToast(`"${activity.name}" added to ${targetTrip?.name || 'your trip'}!`, 'success');
  };

  const handleRemoveActivity = (tripId: string, activityId: string, stopCity?: string) => {
    if (onRemoveActivityFromTrip) {
      onRemoveActivityFromTrip(tripId, activityId, stopCity);
      const targetTrip = trips.find((t) => t.id === tripId);
      showToast(`Removed activity from ${targetTrip?.name || 'trip'}.`, 'info');
    }
  };

  const activityTypes: ActivityType[] = [
    'Sightseeing',
    'Culture',
    'Food',
    'Adventure',
    'Nature',
    'Shopping',
    'Nightlife',
    'Family',
  ];

  return (
    <div className="space-y-7 pb-16">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-slideDown flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-900 text-white shadow-2xl border border-slate-700/80">
          <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" />
          <span className="text-xs sm:text-sm font-semibold">{toastMessage.text}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="p-1 text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 1. Header & Dynamic Title Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-teal-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Compass className="w-4 h-4" />
            <span>Activity Search & Discovery</span>
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 tracking-tight">
            {selectedCity === 'All' ? 'Explore World Experiences' : `Things to do in ${selectedCity}`}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Browse top-rated things to do, skip-the-line attractions, food tours, and outdoor adventures to add to your custom itinerary.
          </p>
        </div>

        {/* City Filter / Quick Switcher */}
        <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
          <label className="text-xs font-bold text-slate-600 hidden sm:inline">Destination:</label>
          <div className="relative">
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="appearance-none pl-9 pr-8 py-2 rounded-xl text-xs sm:text-sm font-bold bg-white text-slate-800 border border-slate-200 hover:border-teal-500 shadow-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 cursor-pointer"
            >
              <option value="All">🌍 All Destinations ({ALL_ACTIVITIES.length})</option>
              {availableCities.map((city) => (
                <option key={city} value={city}>
                  📍 {city}
                </option>
              ))}
            </select>
            <MapPin className="w-3.5 h-3.5 text-teal-600 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 2. City Fast-Chips Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 pt-0.5">
        <button
          type="button"
          onClick={() => setSelectedCity('All')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            selectedCity === 'All'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          All Destinations
        </button>
        {availableCities.map((city) => {
          const isSelected = selectedCity.toLowerCase() === city.toLowerCase();
          const count = ALL_ACTIVITIES.filter((a) => a.destinationCity.toLowerCase() === city.toLowerCase()).length;
          return (
            <button
              key={city}
              type="button"
              onClick={() => setSelectedCity(city)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                isSelected
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-teal-50 hover:text-teal-700 border border-slate-200/80'
              }`}
            >
              <span>{city}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-teal-700 text-teal-100' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search activities, keywords, tours, museums..."
              className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600 whitespace-nowrap hidden sm:inline">
              Sort by:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as ActivitySortOption)}
              className="px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 cursor-pointer"
            >
              <option value="popularity">🔥 Most Popular</option>
              <option value="rating">⭐ Highest Rated</option>
              <option value="cost-asc">💲 Price: Low to High</option>
              <option value="cost-desc">💎 Price: High to Low</option>
              <option value="duration-asc">⏱️ Duration: Shortest First</option>
              <option value="duration-desc">⏳ Duration: Longest First</option>
              <option value="name-asc">🔤 Alphabetical (A–Z)</option>
            </select>

            {/* Mobile Filter Toggle Button */}
            <button
              type="button"
              onClick={() => setShowFiltersMobile(!showFiltersMobile)}
              className="lg:hidden p-2.5 rounded-2xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
              aria-label="Toggle filters"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Controls Row (Visible on Desktop or Mobile Expanded) */}
        <div
          className={`grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 ${
            showFiltersMobile ? 'block' : 'hidden lg:grid'
          }`}
        >
          {/* Activity Type Filter */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Activity Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 cursor-pointer"
            >
              <option value="All">All Types</option>
              {activityTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Cost Filter */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Cost Budget
            </label>
            <select
              value={selectedCost}
              onChange={(e) => setSelectedCost(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 cursor-pointer"
            >
              <option value="All">All Price Points</option>
              <option value="Free">Free Experiences</option>
              <option value="$">$ Budget (Under $20)</option>
              <option value="$$">$$ Moderate ($20–$40)</option>
              <option value="$$$">$$$ Premium ($40–$75)</option>
              <option value="$$$$">$$$$ Luxury ($75+)</option>
            </select>
          </div>

          {/* Duration Filter */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Duration
            </label>
            <select
              value={selectedDuration}
              onChange={(e) => setSelectedDuration(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 cursor-pointer"
            >
              <option value="All">Any Duration</option>
              <option value="under-1h">Under 1 hour</option>
              <option value="1-2h">1 to 2 hours</option>
              <option value="2-4h">2 to 4 hours (Half Day)</option>
              <option value="4h-plus">4+ hours (Full Day)</option>
            </select>
          </div>
        </div>

        {/* Active Filters Bar & Reset Action */}
        {isFilterActive && (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-slate-400 font-medium">Active filters:</span>
              {selectedCity !== 'All' && (
                <span className="px-2 py-0.5 rounded-lg bg-teal-50 text-teal-700 font-semibold border border-teal-200">
                  City: {selectedCity}
                </span>
              )}
              {selectedType !== 'All' && (
                <span className="px-2 py-0.5 rounded-lg bg-purple-50 text-purple-700 font-semibold border border-purple-200">
                  Type: {selectedType}
                </span>
              )}
              {selectedCost !== 'All' && (
                <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                  Cost: {selectedCost}
                </span>
              )}
              {selectedDuration !== 'All' && (
                <span className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                  Duration: {selectedDuration}
                </span>
              )}
              {searchQuery && (
                <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                  "{searchQuery}"
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 font-bold hover:underline cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>
        )}
      </div>

      {/* 4. Results Header & Count */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Showing {filteredActivities.length} {filteredActivities.length === 1 ? 'Experience' : 'Experiences'}
        </span>
      </div>

      {/* 5. Activities Cards Grid or Empty State */}
      {filteredActivities.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 space-y-4 max-w-md mx-auto my-8">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Compass className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="font-display font-bold text-lg text-slate-900">
              No experiences found
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              Try changing your search or filters.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleResetFilters} leftIcon={<RotateCcw className="w-4 h-4" />}>
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredActivities.map((activity) => {
            const tripInfo = getActivityTripInfo(activity.id);
            return (
              <ActivityCard
                key={activity.id}
                activity={activity}
                isAdded={tripInfo.isAdded}
                addedTripName={tripInfo.tripName}
                onViewDetails={(act) => setDetailModalActivity(act)}
                onAddToTrip={(act) => setAddToTripActivity(act)}
                onRemoveFromTrip={(act) => {
                  if (tripInfo.tripId) {
                    handleRemoveActivity(tripInfo.tripId, act.id);
                  }
                }}
              />
            );
          })}
        </div>
      )}

      {/* 6. Activity Detail Modal */}
      {detailModalActivity && (
        <ActivityDetailModal
          isOpen={Boolean(detailModalActivity)}
          activity={detailModalActivity}
          isAdded={getActivityTripInfo(detailModalActivity.id).isAdded}
          onClose={() => setDetailModalActivity(null)}
          onAddToTrip={(act) => {
            setDetailModalActivity(null);
            setAddToTripActivity(act);
          }}
        />
      )}

      {/* 7. Add to Trip Modal */}
      {addToTripActivity && (
        <AddActivityToTripModal
          isOpen={Boolean(addToTripActivity)}
          activity={addToTripActivity}
          trips={trips}
          onClose={() => setAddToTripActivity(null)}
          onAddActivity={handleAddModalSubmit}
          onRemoveActivity={handleRemoveActivity}
          onCreateNewTrip={onCreateNewTrip}
        />
      )}
    </div>
  );
};
