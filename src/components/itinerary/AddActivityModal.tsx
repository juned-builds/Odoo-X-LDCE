import React, { useState, useMemo } from 'react';
import {
  Search,
  X,
  Plus,
  Clock,
  DollarSign,
  Star,
  Sparkles,
  MapPin,
  Check,
  Tag,
} from 'lucide-react';
import { ALL_ACTIVITIES } from '../../data/activitiesData';
import { Activity, ActivityType } from '../../types/activity';
import { Trip, TripActivityAssignment } from '../../types/dashboard';
import { PRESET_START_TIMES } from '../../utils/itineraryUtils';
import { Button } from '../ui/Button';

interface AddActivityModalProps {
  isOpen: boolean;
  dayNumber: number;
  dateStr: string;
  destinationCity: string;
  trip: Trip;
  existingDayActivityIds: string[];
  onClose: () => void;
  onSelectActivity: (activity: Activity | TripActivityAssignment, startTime: string) => void;
  onOpenCustomModal: () => void;
}

const CATEGORY_TABS = [
  'All',
  'Sightseeing',
  'Culture',
  'Food',
  'Adventure',
  'Nature',
  'Shopping',
];

export const AddActivityModal: React.FC<AddActivityModalProps> = ({
  isOpen,
  dayNumber,
  dateStr,
  destinationCity,
  trip,
  existingDayActivityIds,
  onClose,
  onSelectActivity,
  onOpenCustomModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStartTime, setSelectedStartTime] = useState('10:00 AM');
  const [activeTab, setActiveTab] = useState<'destination' | 'saved'>('destination');

  // Activities for this destination
  const destinationActivities = useMemo(() => {
    return ALL_ACTIVITIES.filter((act) => {
      const matchCity =
        act.destinationCity.toLowerCase() === destinationCity.toLowerCase() ||
        act.destinationId?.toLowerCase().includes(destinationCity.toLowerCase()) ||
        destinationCity.toLowerCase().includes(act.destinationCity.toLowerCase());
      return matchCity;
    });
  }, [destinationCity]);

  // Saved trip activities that are relevant
  const savedTripActivities = useMemo(() => {
    return trip.activities || [];
  }, [trip.activities]);

  // Current list to filter
  const currentPool = activeTab === 'destination' ? destinationActivities : savedTripActivities;

  // Filtered activities
  const filteredActivities = useMemo(() => {
    return currentPool.filter((act) => {
      // Search
      const matchesSearch =
        !searchQuery.trim() ||
        act.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (act.description && act.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (act.type && act.type.toLowerCase().includes(searchQuery.toLowerCase()));

      // Category
      const matchesCategory =
        selectedCategory === 'All' ||
        act.type?.toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [currentPool, searchQuery, selectedCategory]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-scaleUp z-10 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-900 text-white shrink-0">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-teal-300 uppercase tracking-wider">
                <span>Day {dayNumber} Itinerary</span>
                <span>•</span>
                <span>{destinationCity}</span>
              </div>
              <h2 className="text-xl font-bold font-display text-white">
                Add Activity to Day {dayNumber}
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all active:scale-95 cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Start Time Picker & Custom Action Bar */}
          <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-400" />
              <span className="text-slate-300 font-medium">Default Start Time:</span>
              <select
                value={selectedStartTime}
                onChange={(e) => setSelectedStartTime(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1 text-teal-200 font-semibold focus:outline-none focus:border-teal-500 cursor-pointer"
              >
                {PRESET_START_TIMES.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenCustomModal();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 font-semibold border border-teal-500/30 transition-all active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Create Custom Activity</span>
            </button>
          </div>
        </div>

        {/* Source Tabs & Search */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/70 shrink-0 space-y-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('destination')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'destination'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Explore {destinationCity} ({destinationActivities.length})
            </button>

            {savedTripActivities.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab('saved')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'saved'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                Saved to Trip ({savedTripActivities.length})
              </button>
            )}
          </div>

          {/* Search bar & Category filters */}
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder={`Search activities in ${destinationCity}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {CATEGORY_TABS.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Activities List */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-3">
          {filteredActivities.length === 0 ? (
            <div className="text-center py-10 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Search className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-800">No matching activities found</p>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Try adjusting your search or category filter, or create a custom activity.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onClose();
                  onOpenCustomModal();
                }}
                leftIcon={<Sparkles className="w-3.5 h-3.5 text-teal-600" />}
              >
                Create Custom Activity
              </Button>
            </div>
          ) : (
            filteredActivities.map((act) => {
              const isAlreadyAdded = existingDayActivityIds.includes(act.id);

              return (
                <div
                  key={act.id}
                  className={`group p-3 sm:p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    isAlreadyAdded
                      ? 'bg-slate-50 border-slate-200 opacity-80'
                      : 'bg-white hover:bg-teal-50/40 border-slate-200/80 hover:border-teal-200 shadow-xs hover:shadow'
                  }`}
                >
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <img
                      src={
                        act.image ||
                        'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=400&q=80'
                      }
                      alt={act.name}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 sm:w-18 sm:h-18 rounded-xl object-cover shrink-0 border border-slate-200"
                    />

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider">
                          {act.type}
                        </span>
                        {act.cost && (
                          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                            {act.cost}
                          </span>
                        )}
                        {act.duration && (
                          <span className="text-[11px] text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {act.duration}
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                        {act.name}
                      </h4>

                      <p className="text-[11px] text-slate-500 line-clamp-1">
                        {act.description || (act as any).shortDescription}
                      </p>
                    </div>
                  </div>

                  {/* Add action */}
                  <div className="w-full sm:w-auto flex items-center justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    {isAlreadyAdded ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 px-3 py-1.5 bg-slate-100 rounded-xl">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        In Day {dayNumber}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          onSelectActivity(act, selectedStartTime);
                          onClose();
                        }}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs hover:shadow transition-all active:scale-95 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add @ {selectedStartTime}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenCustomModal();
            }}
            className="text-xs font-bold text-teal-700 hover:text-teal-800 hover:underline flex items-center gap-1 cursor-pointer"
          >
            Can't find it? Add Custom Activity →
          </button>
        </div>
      </div>
    </div>
  );
};
