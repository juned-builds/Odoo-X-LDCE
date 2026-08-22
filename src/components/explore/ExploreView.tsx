import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Search,
  Filter,
  X,
  SlidersHorizontal,
  Compass,
  ArrowUpDown,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Luggage,
  MapPin,
  Globe,
  DollarSign,
  Star,
} from 'lucide-react';
import { Destination, Trip } from '../../types/dashboard';
import { ALL_DESTINATIONS } from '../../data/destinationsData';
import { DestinationCard } from './DestinationCard';
import { DestinationDetailModal } from './DestinationDetailModal';
import { AddToTripModal } from './AddToTripModal';
import { Button } from '../ui/Button';

type SortOption =
  | 'popularity'
  | 'cost-asc'
  | 'cost-desc'
  | 'name-asc'
  | 'name-desc'
  | 'rating';

interface ExploreViewProps {
  trips: Trip[];
  onAddDestinationToTrip: (tripId: string, destination: Destination) => void;
  onCreateTripWithDestination?: (destination: Destination) => void;
  onViewTrip?: (trip: Trip) => void;
  onExploreActivities?: (destination: Destination) => void;
  savedDestinationIds?: string[];
  onToggleSaveDestination?: (destination: Destination) => void;
}

export const ExploreView: React.FC<ExploreViewProps> = ({
  trips,
  onAddDestinationToTrip,
  onCreateTripWithDestination,
  onViewTrip,
  onExploreActivities,
  savedDestinationIds = [],
  onToggleSaveDestination,
}) => {
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedCostIndex, setSelectedCostIndex] = useState<string>('all');
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<SortOption>('popularity');
  const [isFiltersExpandedMobile, setIsFiltersExpandedMobile] = useState(false);

  // Modal State
  const [selectedDetailDest, setSelectedDetailDest] = useState<Destination | null>(null);
  const [assigningDest, setAssigningDest] = useState<Destination | null>(null);

  // Toast / Feedback State
  const [assignmentFeedback, setAssignmentFeedback] = useState<{
    tripName: string;
    cityName: string;
    tripId: string;
  } | null>(null);

  // Extract unique countries & regions dynamically from dataset
  const uniqueCountries = useMemo(() => {
    const list = Array.from(new Set(ALL_DESTINATIONS.map((d) => d.country)));
    return list.sort();
  }, []);

  const uniqueRegions = useMemo(() => {
    const list = Array.from(new Set(ALL_DESTINATIONS.map((d) => d.region)));
    return list.sort();
  }, []);

  // Filter and Sort destinations
  const filteredDestinations = useMemo(() => {
    let result = ALL_DESTINATIONS.filter((dest) => {
      // 1. Search Query (City, Country, Region, Description)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesCity = dest.city.toLowerCase().includes(q);
        const matchesCountry = dest.country.toLowerCase().includes(q);
        const matchesRegion = dest.region.toLowerCase().includes(q);
        const matchesDesc =
          dest.description.toLowerCase().includes(q) ||
          (dest.shortDescription && dest.shortDescription.toLowerCase().includes(q));
        const matchesHighlights = dest.highlights.some((h) => h.toLowerCase().includes(q));

        if (
          !matchesCity &&
          !matchesCountry &&
          !matchesRegion &&
          !matchesDesc &&
          !matchesHighlights
        ) {
          return false;
        }
      }

      // 2. Country filter
      if (selectedCountry !== 'all' && dest.country !== selectedCountry) {
        return false;
      }

      // 3. Region filter
      if (selectedRegion !== 'all' && dest.region !== selectedRegion) {
        return false;
      }

      // 4. Cost Index filter
      if (selectedCostIndex !== 'all' && dest.costIndex !== selectedCostIndex) {
        return false;
      }

      // 5. Min Rating filter
      if (minRating > 0 && dest.rating < minRating) {
        return false;
      }

      return true;
    });

    // Sort result
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'popularity':
          return b.popularity - a.popularity;
        case 'cost-asc': {
          const costVal = { $: 1, $$: 2, $$$: 3, $$$$: 4 };
          return costVal[a.costIndex] - costVal[b.costIndex];
        }
        case 'cost-desc': {
          const costVal = { $: 1, $$: 2, $$$: 3, $$$$: 4 };
          return costVal[b.costIndex] - costVal[a.costIndex];
        }
        case 'name-asc':
          return a.city.localeCompare(b.city);
        case 'name-desc':
          return b.city.localeCompare(a.city);
        case 'rating':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

    return result;
  }, [
    searchQuery,
    selectedCountry,
    selectedRegion,
    selectedCostIndex,
    minRating,
    sortBy,
  ]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCountry !== 'all') count++;
    if (selectedRegion !== 'all') count++;
    if (selectedCostIndex !== 'all') count++;
    if (minRating > 0) count++;
    return count;
  }, [selectedCountry, selectedRegion, selectedCostIndex, minRating]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCountry('all');
    setSelectedRegion('all');
    setSelectedCostIndex('all');
    setMinRating(0);
    setSortBy('popularity');
  };

  const handleAddToTripClick = (destination: Destination) => {
    setAssigningDest(destination);
  };

  const handleConfirmAddToTrip = (trip: Trip, destination: Destination) => {
    onAddDestinationToTrip(trip.id, destination);
    setAssignmentFeedback({
      tripName: trip.name,
      cityName: destination.city,
      tripId: trip.id,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-16"
    >
      {/* 1. Page Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-700">
          <Compass className="w-4 h-4 text-teal-600" />
          <span>Global Discovery Hub</span>
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-display tracking-tight text-slate-900">
          Explore Destinations
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl">
          Discover cities and places that could become part of your next journey.
        </p>
      </div>

      {/* 2. Success Assignment Alert Banner */}
      {assignmentFeedback && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-sm flex items-center justify-between gap-3 text-emerald-950 animate-fadeIn">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-bold">
                <span className="text-emerald-900 font-extrabold">{assignmentFeedback.cityName}</span> added to{' '}
                <span className="underline decoration-emerald-500 font-semibold">{assignmentFeedback.tripName}</span>
              </p>
              <p className="text-[11px] text-emerald-700">
                Itinerary stops updated. You can view or reorder this stop in My Trips.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onViewTrip && (
              <button
                type="button"
                onClick={() => {
                  const targetTrip = trips.find((t) => t.id === assignmentFeedback.tripId);
                  if (targetTrip) {
                    onViewTrip(targetTrip);
                  }
                }}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                View Trip
              </button>
            )}

            <button
              type="button"
              onClick={() => setAssignmentFeedback(null)}
              className="p-1.5 text-emerald-600 hover:text-emerald-900 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
              aria-label="Dismiss alert"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 3. Prominent Search Bar & Filter Controls Container */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
        {/* Search Field + Sort on Top Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Main Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search cities, countries, or regions..."
              className="w-full h-11 pl-11 pr-10 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-teal-500 focus:ring-3 focus:ring-teal-500/15 transition-all outline-hidden"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative min-w-[170px] sm:min-w-[190px]">
              <ArrowUpDown className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full h-11 pl-9 pr-8 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:bg-white focus:border-teal-500 focus:ring-3 focus:ring-teal-500/15 transition-all outline-hidden appearance-none cursor-pointer"
              >
                <option value="popularity">Sort: Most Popular</option>
                <option value="rating">Sort: Highest Rated</option>
                <option value="cost-asc">Cost: Low to High ($ → $$$$)</option>
                <option value="cost-desc">Cost: High to Low ($$$$ → $)</option>
                <option value="name-asc">City: A – Z</option>
                <option value="name-desc">City: Z – A</option>
              </select>
            </div>

            {/* Mobile Filter Toggle */}
            <button
              type="button"
              onClick={() => setIsFiltersExpandedMobile(!isFiltersExpandedMobile)}
              className={`
                sm:hidden h-11 px-3.5 rounded-2xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer
                ${activeFiltersCount > 0
                  ? 'bg-teal-50 border-teal-200 text-teal-800'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
                }
              `}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-teal-600 text-white text-[10px] flex items-center justify-center font-bold">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Filter Selectors Strip */}
        <div
          className={`
            pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3
            ${isFiltersExpandedMobile ? 'block' : 'hidden sm:grid'}
          `}
        >
          {/* 1. Country Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Country
            </label>
            <div className="relative">
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full h-10 px-3 pr-8 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 transition-all outline-hidden appearance-none cursor-pointer"
              >
                <option value="all">All Countries ({uniqueCountries.length})</option>
                {uniqueCountries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 2. Region Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Region
            </label>
            <div className="relative">
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full h-10 px-3 pr-8 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 transition-all outline-hidden appearance-none cursor-pointer"
              >
                <option value="all">All Regions ({uniqueRegions.length})</option>
                {uniqueRegions.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 3. Cost Index Chips */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Cost Index
            </label>
            <div className="grid grid-cols-5 gap-1 h-10">
              {['all', '$', '$$', '$$$', '$$$$'].map((cost) => {
                const isSelected = selectedCostIndex === cost;
                return (
                  <button
                    key={cost}
                    type="button"
                    onClick={() => setSelectedCostIndex(cost)}
                    className={`
                      rounded-xl text-xs font-bold flex items-center justify-center transition-all cursor-pointer border
                      ${isSelected
                        ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }
                    `}
                  >
                    {cost === 'all' ? 'All' : cost}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Minimum Rating Filter / Reset Controls */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Minimum Rating
            </label>
            <div className="relative">
              <select
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
                className="w-full h-10 px-3 pr-8 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 transition-all outline-hidden appearance-none cursor-pointer"
              >
                <option value={0}>Any Rating</option>
                <option value={4.8}>★ 4.8 & above</option>
                <option value={4.9}>★ 4.9 & above</option>
                <option value={4.95}>★ 4.95 & above (Top Rated)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active Filters Summary & Reset Button */}
        {(activeFiltersCount > 0 || searchQuery) && (
          <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-slate-400 font-medium">Active filters:</span>

              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 border border-teal-200 text-xs font-medium">
                  <span>Query: "{searchQuery}"</span>
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="hover:text-teal-950 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedCountry !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 border border-teal-200 text-xs font-medium">
                  <span>Country: {selectedCountry}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedCountry('all')}
                    className="hover:text-teal-950 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedRegion !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 border border-teal-200 text-xs font-medium">
                  <span>Region: {selectedRegion}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedRegion('all')}
                    className="hover:text-teal-950 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedCostIndex !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 border border-teal-200 text-xs font-medium">
                  <span>Cost: {selectedCostIndex}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedCostIndex('all')}
                    className="hover:text-teal-950 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {minRating > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 border border-teal-200 text-xs font-medium">
                  <span>Rating ≥ {minRating}★</span>
                  <button
                    type="button"
                    onClick={() => setMinRating(0)}
                    className="hover:text-teal-950 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors cursor-pointer py-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>
        )}
      </div>

      {/* 4. Results Bar */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs sm:text-sm font-semibold text-slate-700">
          Showing <span className="text-teal-700 font-bold">{filteredDestinations.length}</span>{' '}
          {filteredDestinations.length === 1 ? 'destination' : 'destinations'}
          {searchQuery && (
            <span className="text-slate-500 font-normal"> matching "{searchQuery}"</span>
          )}
        </p>

        <span className="text-xs text-slate-400 font-medium">
          Global prototype catalog
        </span>
      </div>

      {/* 5. Destination Cards Grid / Empty State */}
      {filteredDestinations.length === 0 ? (
        /* Empty Results State */
        <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4 max-w-lg mx-auto my-8">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Compass className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-bold font-display text-slate-900">
              No destinations found
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Try another city, country, or region. You can also reset active filters to browse all places.
            </p>
          </div>
          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetFilters}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Reset Filters
            </Button>
          </div>
        </div>
      ) : (
        /* Destination Responsive Cards Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
          {filteredDestinations.map((dest) => (
            <DestinationCard
              key={dest.id}
              destination={dest}
              isSaved={savedDestinationIds.includes(dest.id)}
              onToggleSave={onToggleSaveDestination}
              onViewDetails={(destination) => setSelectedDetailDest(destination)}
              onAddToTrip={(destination) => handleAddToTripClick(destination)}
            />
          ))}
        </div>
      )}

      {/* 6. Destination Detail Modal */}
      <DestinationDetailModal
        isOpen={!!selectedDetailDest}
        destination={selectedDetailDest}
        isSaved={selectedDetailDest ? savedDestinationIds.includes(selectedDetailDest.id) : false}
        onToggleSave={onToggleSaveDestination}
        onClose={() => setSelectedDetailDest(null)}
        onExploreActivities={onExploreActivities}
        onAddToTrip={(destination) => {
          setSelectedDetailDest(null);
          setAssigningDest(destination);
        }}
      />

      {/* 7. Add to Trip Modal with Shared Trip Collection */}
      <AddToTripModal
        isOpen={!!assigningDest}
        destination={assigningDest}
        trips={trips}
        onClose={() => setAssigningDest(null)}
        onSelectTrip={(trip, destination) => {
          handleConfirmAddToTrip(trip, destination);
        }}
        onCreateNewTripWithDestination={
          onCreateTripWithDestination
            ? (destination) => {
                setAssigningDest(null);
                onCreateTripWithDestination(destination);
              }
            : undefined
        }
      />
    </motion.div>
  );
};
