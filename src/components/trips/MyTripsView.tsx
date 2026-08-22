import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Plus,
  Filter,
  ArrowUpDown,
  Luggage,
  Calendar,
  Sparkles,
  Compass,
  CheckCircle2,
  X,
  SlidersHorizontal,
} from 'lucide-react';
import { Trip } from '../../types/dashboard';
import { MyTripCard } from './MyTripCard';
import { DeleteTripModal } from './DeleteTripModal';
import { Button } from '../ui/Button';

interface MyTripsViewProps {
  trips: Trip[];
  onPlanTrip: () => void;
  onEditTrip: (trip: Trip) => void;
  onViewTrip: (trip: Trip) => void;
  onDeleteTrip: (tripId: string) => void;
  notificationMessage?: string | null;
  onDismissNotification?: () => void;
}

type StatusFilter = 'all' | 'planning' | 'upcoming' | 'completed';
type SortOption = 'newest' | 'oldest' | 'upcoming' | 'alphabetical';

export const MyTripsView: React.FC<MyTripsViewProps> = ({
  trips,
  onPlanTrip,
  onEditTrip,
  onViewTrip,
  onDeleteTrip,
  notificationMessage,
  onDismissNotification,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [tripToDelete, setTripToDelete] = useState<Trip | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Calculate status counts
  const statusCounts = useMemo(() => {
    return {
      all: trips.length,
      planning: trips.filter((t) => t.status === 'planning').length,
      upcoming: trips.filter((t) => t.status === 'upcoming').length,
      completed: trips.filter((t) => t.status === 'completed').length,
    };
  }, [trips]);

  // Filter & Sort Logic
  const filteredAndSortedTrips = useMemo(() => {
    let result = [...trips];

    // 1. Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (trip) =>
          trip.name.toLowerCase().includes(q) ||
          (trip.route && trip.route.toLowerCase().includes(q)) ||
          (trip.description && trip.description.toLowerCase().includes(q)) ||
          (trip.destinations &&
            trip.destinations.some((d) => d.toLowerCase().includes(q)))
      );
    }

    // 2. Status Filter
    if (statusFilter !== 'all') {
      result = result.filter((trip) => trip.status === statusFilter);
    }

    // 3. Sorting
    result.sort((a, b) => {
      if (sortBy === 'newest') {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      }
      if (sortBy === 'oldest') {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateA - dateB;
      }
      if (sortBy === 'upcoming') {
        const startA = new Date(a.startDate).getTime() || 0;
        const startB = new Date(b.startDate).getTime() || 0;
        return startA - startB;
      }
      if (sortBy === 'alphabetical') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });

    return result;
  }, [trips, searchQuery, statusFilter, sortBy]);

  const handleConfirmDelete = (trip: Trip) => {
    setIsDeleting(true);
    setTimeout(() => {
      onDeleteTrip(trip.id);
      setIsDeleting(false);
      setTripToDelete(null);
    }, 400);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
  };

  return (
    <div className="space-y-7 pb-12 animate-fadeIn">
      {/* 1. Temporary Success Alert / Notification if present */}
      {notificationMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-sm flex items-center justify-between gap-3 text-emerald-900 animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="text-xs sm:text-sm font-semibold">{notificationMessage}</p>
          </div>
          {onDismissNotification && (
            <button
              type="button"
              onClick={onDismissNotification}
              className="p-1 text-emerald-600 hover:text-emerald-950 rounded-lg hover:bg-emerald-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* 2. Header & Main Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-200/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 uppercase tracking-wider">
            <Luggage className="w-4 h-4 text-teal-600" />
            <span>Itinerary Collection ({trips.length})</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 tracking-tight">
            My Trips
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Manage your adventures, review your journeys, and continue planning.
          </p>
        </div>

        <div>
          <Button
            type="button"
            variant="primary"
            onClick={onPlanTrip}
            leftIcon={<Plus className="w-4 h-4" />}
            className="w-full sm:w-auto shadow-sm hover:shadow"
          >
            Plan New Trip
          </Button>
        </div>
      </div>

      {/* 3. Search, Filter & Sort Controls Toolbar */}
      <div className="rounded-3xl bg-white border border-slate-200/90 shadow-xs p-4 sm:p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-center">
          {/* Search Input (7 cols on md) */}
          <div className="md:col-span-7 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by trip name or destination (e.g. Goa, Paris, Tokyo)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-teal-500 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-3 focus:ring-teal-500/20 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-200 transition-colors"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort Selector (5 cols on md) */}
          <div className="md:col-span-5 flex items-center justify-end gap-2">
            <div className="flex items-center gap-2 w-full justify-end">
              <span className="text-xs font-semibold text-slate-500 shrink-0 flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5" />
                <span>Sort by:</span>
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="text-xs sm:text-sm font-medium bg-slate-50/70 hover:bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all cursor-pointer"
              >
                <option value="newest">Newest Added</option>
                <option value="oldest">Oldest</option>
                <option value="upcoming">Upcoming Dates</option>
                <option value="alphabetical">Trip Name (A—Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Status Filter Chips Row */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs">
          <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] mr-1 shrink-0 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            <span>Filter:</span>
          </span>

          {(
            [
              { id: 'all', label: 'All Trips', count: statusCounts.all },
              { id: 'planning', label: 'Planning', count: statusCounts.planning },
              { id: 'upcoming', label: 'Upcoming', count: statusCounts.upcoming },
              { id: 'completed', label: 'Completed', count: statusCounts.completed },
            ] as const
          ).map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`
                  inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap cursor-pointer
                  ${
                    isActive
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }
                `}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-teal-700 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}

          {(searchQuery || statusFilter !== 'all') && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="ml-auto text-xs font-semibold text-teal-600 hover:text-teal-800 hover:underline px-2 py-1 shrink-0"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* 4. Trips Content Area */}
      {trips.length === 0 ? (
        /* Empty State: No Trips at All */
        <div className="py-16 text-center rounded-3xl bg-white border border-slate-200/90 p-8 sm:p-12 space-y-5 shadow-xs max-w-xl mx-auto">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 shadow-sm">
            <Compass className="w-8 h-8 animate-spin-slow" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-xl sm:text-2xl font-bold font-display text-slate-900">
              No trips yet
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              Your next adventure starts here. Create a personalized itinerary to begin planning destinations, dates, and packing lists.
            </p>
          </div>
          <div className="pt-2">
            <Button
              variant="primary"
              onClick={onPlanTrip}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Plan a New Trip
            </Button>
          </div>
        </div>
      ) : filteredAndSortedTrips.length === 0 ? (
        /* Empty State: Filter/Search yielded 0 items */
        <div className="py-14 text-center rounded-3xl bg-white border border-slate-200/90 p-8 space-y-4 shadow-xs max-w-lg mx-auto">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500">
            <Search className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold font-display text-slate-900">
              No matching trips found
            </h3>
            <p className="text-xs text-slate-500">
              No journeys match your current search "{searchQuery}" or selected status filter.
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-3">
            <Button variant="outline" size="sm" onClick={handleClearFilters}>
              Clear Search & Filters
            </Button>
            <Button variant="primary" size="sm" onClick={onPlanTrip}>
              Create New Trip
            </Button>
          </div>
        </div>
      ) : (
        /* 5. Responsive Grid of Trip Cards (3 cols desktop, 2 cols tablet, 1 col mobile) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedTrips.map((trip) => (
            <MyTripCard
              key={trip.id}
              trip={trip}
              onView={onViewTrip}
              onEdit={onEditTrip}
              onDelete={(t) => setTripToDelete(t)}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteTripModal
        isOpen={!!tripToDelete}
        trip={tripToDelete}
        onClose={() => setTripToDelete(null)}
        onConfirmDelete={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
};
