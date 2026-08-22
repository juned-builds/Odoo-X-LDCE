import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Compass,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  Share2,
  CopyPlus,
  ArrowRight,
  Luggage,
  DollarSign,
  Layers,
  ChevronRight,
  Globe,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  Info,
  Check,
  Send,
  ArrowLeft,
  Eye,
  Lock,
} from 'lucide-react';
import { Trip, TripStop } from '../../types/dashboard';
import { ItineraryDay, ItineraryActivity } from '../../types/itinerary';
import {
  generateItineraryDays,
  formatCostAmount,
  formatLongDate,
} from '../../utils/itineraryUtils';
import { formatTripDateRange } from '../../utils/dateUtils';
import { getTripShareId, cloneTripForCopy } from '../../utils/shareUtils';
import { ShareTripModal } from './ShareTripModal';
import { CopyTripConfirmModal } from './CopyTripConfirmModal';
import { Button } from '../ui/Button';

interface PublicItineraryViewProps {
  trip?: Trip | null;
  allTrips?: Trip[];
  shareId?: string;
  onPlanYourOwnTrip?: () => void;
  onCopyTripSuccess?: (clonedTrip: Trip) => void;
  onBackToApp?: () => void;
}

export const PublicItineraryView: React.FC<PublicItineraryViewProps> = ({
  trip: initialTrip,
  allTrips = [],
  shareId,
  onPlanYourOwnTrip,
  onCopyTripSuccess,
  onBackToApp,
}) => {
  // Find matching trip by shareId or direct trip prop
  const currentTrip = useMemo(() => {
    if (initialTrip) return initialTrip;
    if (shareId && allTrips.length > 0) {
      return (
        allTrips.find((t) => getTripShareId(t) === shareId || t.id === shareId) || null
      );
    }
    return null;
  }, [initialTrip, shareId, allTrips]);

  // Modals state
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isCopyConfirmOpen, setIsCopyConfirmOpen] = useState(false);
  const [copySuccessMessage, setCopySuccessMessage] = useState<string | null>(null);
  const [selectedDayFilter, setSelectedDayFilter] = useState<number | 'all'>('all');

  // Check if trip is inactive/unshared
  const isTripUnshared = currentTrip?.isShared === false;

  // Compute Itinerary Days
  const days: ItineraryDay[] = useMemo(() => {
    if (!currentTrip) return [];
    return generateItineraryDays(currentTrip);
  }, [currentTrip]);

  // Compute Total Planned Activities & Total Activity Cost
  const totalActivitiesCount = useMemo(() => {
    return days.reduce((sum, d) => sum + d.activities.length, 0);
  }, [days]);

  const totalEstimatedActivityCost = useMemo(() => {
    return days.reduce((sum, d) => sum + d.totalCost, 0);
  }, [days]);

  // Destination stops & city transitions
  const destinationGroups = useMemo(() => {
    if (!days.length) return [];
    const groups: {
      city: string;
      country?: string;
      startDay: number;
      endDay: number;
      daysCount: number;
    }[] = [];

    let currentGroup: {
      city: string;
      country?: string;
      startDay: number;
      endDay: number;
      daysCount: number;
    } | null = null;

    for (const d of days) {
      if (!currentGroup || currentGroup.city !== d.destinationCity) {
        if (currentGroup) {
          groups.push(currentGroup);
        }
        currentGroup = {
          city: d.destinationCity,
          country: d.country,
          startDay: d.dayNumber,
          endDay: d.dayNumber,
          daysCount: 1,
        };
      } else {
        currentGroup.endDay = d.dayNumber;
        currentGroup.daysCount += 1;
      }
    }

    if (currentGroup) {
      groups.push(currentGroup);
    }

    return groups;
  }, [days]);

  // Filtered days based on day tab filter
  const displayedDays = useMemo(() => {
    if (selectedDayFilter === 'all') return days;
    return days.filter((d) => d.dayNumber === selectedDayFilter);
  }, [days, selectedDayFilter]);

  // Handle Copy Trip
  const handleExecuteCopyTrip = () => {
    if (!currentTrip) return;
    const cloned = cloneTripForCopy(currentTrip);
    setIsCopyConfirmOpen(false);

    if (onCopyTripSuccess) {
      onCopyTripSuccess(cloned);
    }
    setCopySuccessMessage(`"${cloned.name}" has been copied to your trips workspace.`);
  };

  // If trip not found or unshared
  if (!currentTrip || isTripUnshared) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans antialiased text-slate-900">
        {/* Public Header */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-xs">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <span className="font-display font-extrabold text-base tracking-tight text-slate-900">
                GlobeTrotter
              </span>
              <span className="text-[10px] font-bold text-teal-700 bg-teal-50 border border-teal-200 px-1.5 py-0.5 rounded-md ml-2 uppercase">
                Shared Itinerary
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onBackToApp && (
              <Button variant="outline" size="sm" onClick={onBackToApp}>
                Back to App
              </Button>
            )}
            {onPlanYourOwnTrip && (
              <Button variant="primary" size="sm" onClick={onPlanYourOwnTrip}>
                Plan Your Own Trip
              </Button>
            )}
          </div>
        </header>

        {/* Error Body */}
        <main className="flex-1 flex items-center justify-center p-6 sm:p-12">
          <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 p-8 text-center shadow-lg space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 mx-auto flex items-center justify-center">
              <AlertCircle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold font-display text-slate-900">
                Trip not found
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                {isTripUnshared
                  ? 'This shared itinerary has been deactivated by its owner.'
                  : 'This shared itinerary may have been removed or is no longer available.'}
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              {onBackToApp && (
                <Button variant="outline" size="md" onClick={onBackToApp} className="w-full sm:w-auto">
                  Go to Dashboard
                </Button>
              )}
              {onPlanYourOwnTrip && (
                <Button variant="primary" size="md" onClick={onPlanYourOwnTrip} className="w-full sm:w-auto">
                  Plan a New Trip
                </Button>
              )}
            </div>
          </div>
        </main>

        {/* Public Footer */}
        <footer className="py-6 px-4 bg-white border-t border-slate-200 text-center text-xs text-slate-500">
          GlobeTrotter Travel Planning • Shared Itinerary View
        </footer>
      </div>
    );
  }

  const dateRangeDisplay = formatTripDateRange(currentTrip.startDate, currentTrip.endDate);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-900 selection:bg-teal-500 selection:text-white">
      {/* 1. PUBLIC HEADER (NO AUTH APP SHELL) */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 sm:px-8 py-3.5 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Logo & Shared Journey Tag */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-xs">
              <Compass className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-display font-extrabold text-base tracking-tight text-slate-900">
                GlobeTrotter
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-800 bg-teal-50 border border-teal-200/80 px-2 py-0.5 rounded-full uppercase tracking-wider">
                <Globe className="w-3 h-3 text-teal-600" />
                <span>Shared Journey</span>
              </span>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-2">
            {onBackToApp && (
              <button
                type="button"
                onClick={onBackToApp}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to App</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsShareModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-all cursor-pointer"
              title="Share itinerary"
            >
              <Share2 className="w-3.5 h-3.5 text-slate-600" />
              <span>Share</span>
            </button>

            <button
              type="button"
              onClick={() => setIsCopyConfirmOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-900 text-xs font-bold transition-all shadow-2xs cursor-pointer"
            >
              <CopyPlus className="w-3.5 h-3.5 text-teal-700" />
              <span>Copy Trip</span>
            </button>

            {onPlanYourOwnTrip && (
              <Button
                variant="primary"
                size="sm"
                onClick={onPlanYourOwnTrip}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Plan Your Own Trip
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Copy Success Toast Banner */}
      <AnimatePresence>
        {copySuccessMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-emerald-600 text-white px-4 py-2.5 text-center text-xs font-semibold shadow-md flex items-center justify-center gap-2 sticky top-[57px] z-30"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
            <span>{copySuccessMessage}</span>
            {onBackToApp && (
              <button
                type="button"
                onClick={onBackToApp}
                className="underline text-emerald-100 hover:text-white font-bold ml-2 cursor-pointer"
              >
                View My Trips →
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. PUBLIC HERO SECTION */}
      <section className="relative bg-slate-950 text-white overflow-hidden">
        {/* Hero Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src={currentTrip.coverImage}
            alt={currentTrip.name}
            className="w-full h-full object-cover object-center opacity-40 scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/40" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 py-12 sm:py-16 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            <span>A shared travel plan created with GlobeTrotter</span>
          </div>

          <div className="space-y-3 max-w-3xl">
            <h1 className="text-3xl sm:text-5xl font-extrabold font-display tracking-tight text-white leading-tight">
              {currentTrip.name}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-sm sm:text-base font-medium text-teal-200">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-teal-400 shrink-0" />
                <span>{currentTrip.route}</span>
              </div>
              <span className="text-slate-500">•</span>
              <div className="flex items-center gap-1.5 text-slate-300">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{dateRangeDisplay}</span>
              </div>
            </div>

            {currentTrip.description && (
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed pt-1">
                {currentTrip.description}
              </p>
            )}
          </div>

          {/* Key Stat Badges Row */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-xs font-semibold text-white">
              <Clock className="w-3.5 h-3.5 text-teal-300" />
              <span>{currentTrip.duration}</span>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-xs font-semibold text-white">
              <Luggage className="w-3.5 h-3.5 text-emerald-300" />
              <span>
                {currentTrip.destinationCount}{' '}
                {currentTrip.destinationCount === 1 ? 'Destination' : 'Destinations'}
              </span>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-xs font-semibold text-white">
              <Layers className="w-3.5 h-3.5 text-amber-300" />
              <span>
                {totalActivitiesCount}{' '}
                {totalActivitiesCount === 1 ? 'Activity' : 'Planned Activities'}
              </span>
            </div>

            {totalEstimatedActivityCost > 0 && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-teal-500/20 backdrop-blur-md border border-teal-500/30 text-xs font-semibold text-teal-200">
                <DollarSign className="w-3.5 h-3.5 text-teal-300" />
                <span>
                  Est. Activities: {formatCostAmount(totalEstimatedActivityCost, currentTrip.currency)}
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 3. MAIN PUBLIC ITINERARY CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12 flex-1 w-full space-y-8">
        {/* Destination Grouping & Transitions Overview */}
        {destinationGroups.length > 0 && (
          <section className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-teal-600" />
                <span>Destination Journey Breakdown</span>
              </h2>
              <span className="text-xs text-slate-400">
                {destinationGroups.length} {destinationGroups.length === 1 ? 'City Stop' : 'City Stops'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {destinationGroups.map((group, idx) => (
                <div
                  key={`${group.city}-${idx}`}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-[11px] font-bold text-teal-700">
                    <span className="uppercase tracking-wider">
                      {group.startDay === group.endDay
                        ? `Day ${group.startDay}`
                        : `Days ${group.startDay}–${group.endDay}`}
                    </span>
                    <span className="text-slate-400 font-normal">
                      {group.daysCount} {group.daysCount === 1 ? 'day' : 'days'}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900">
                    {group.city}
                  </h3>

                  {group.country && (
                    <p className="text-xs text-slate-500">
                      {group.country}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Day Navigation Tabs */}
        {days.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-bold font-display tracking-tight text-slate-900">
                Day-by-Day Schedule
              </h2>

              <div className="text-xs text-slate-500 font-medium">
                {selectedDayFilter === 'all'
                  ? `Showing all ${days.length} days`
                  : `Showing Day ${selectedDayFilter}`}
              </div>
            </div>

            {/* Day Selector Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
              <button
                type="button"
                onClick={() => setSelectedDayFilter('all')}
                className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                  selectedDayFilter === 'all'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                All Days ({days.length})
              </button>

              {days.map((day) => (
                <button
                  key={day.dayNumber}
                  type="button"
                  onClick={() => setSelectedDayFilter(day.dayNumber)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedDayFilter === day.dayNumber
                      ? 'bg-teal-600 text-white font-bold shadow-xs'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  <span>Day {day.dayNumber}</span>
                  <span className="text-[10px] opacity-70">({day.destinationCity})</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 4. DAY-WISE ITINERARY (READ-ONLY) */}
        {displayedDays.length > 0 ? (
          <div className="space-y-8">
            {displayedDays.map((day) => (
              <div
                key={day.dayNumber}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden"
              >
                {/* Day Header */}
                <div className="p-5 sm:p-6 bg-slate-50/80 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white font-extrabold text-sm flex items-center justify-center shadow-xs">
                      {day.dayNumber}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold font-display text-lg text-slate-900">
                          Day {day.dayNumber}: {day.destinationCity}
                        </h3>
                        {day.country && (
                          <span className="text-xs text-slate-500 font-medium">
                            • {day.country}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">
                        {day.dayOfWeek}, {formatLongDate(day.date)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-600 font-medium">
                    <span className="bg-white px-3 py-1 rounded-xl border border-slate-200">
                      {day.activities.length}{' '}
                      {day.activities.length === 1 ? 'activity' : 'activities'}
                    </span>
                    {day.totalCost > 0 && (
                      <span className="bg-teal-50 text-teal-800 border border-teal-200 px-3 py-1 rounded-xl font-semibold">
                        {formatCostAmount(day.totalCost, currentTrip.currency)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Day Activities List */}
                <div className="p-5 sm:p-6 space-y-4">
                  {day.activities.length === 0 ? (
                    <div className="py-6 text-center text-slate-400 text-xs italic bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                      No activities scheduled for this day yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {day.activities.map((act, actIdx) => (
                        <div
                          key={act.id || actIdx}
                          className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 hover:border-teal-300 transition-all flex flex-col sm:flex-row items-start gap-4"
                        >
                          {/* Activity Visual Cover */}
                          {act.image && (
                            <div className="w-full sm:w-28 h-24 sm:h-24 rounded-xl overflow-hidden shrink-0 bg-slate-900 border border-slate-200">
                              <img
                                src={act.image}
                                alt={act.name}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                          )}

                          {/* Activity Details */}
                          <div className="flex-1 min-w-0 space-y-2">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1 text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-lg border border-teal-200">
                                  <Clock className="w-3 h-3 text-teal-600" />
                                  <span>{act.startTime || 'Scheduled'}</span>
                                </span>

                                <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-lg">
                                  {act.type}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                                {act.duration && (
                                  <span className="text-slate-500">
                                    {act.duration}
                                  </span>
                                )}
                                {act.cost && (
                                  <>
                                    <span className="text-slate-300">•</span>
                                    <span className="text-teal-700 font-bold">
                                      {act.cost}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>

                            <h4 className="font-bold text-base text-slate-900">
                              {act.name}
                            </h4>

                            {act.description && (
                              <p className="text-xs text-slate-600 leading-relaxed">
                                {act.description}
                              </p>
                            )}

                            {act.notes && (
                              <div className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                                Note: {act.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center space-y-4 max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
              <Luggage className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold font-display text-slate-900">
                No activities planned yet
              </h3>
              <p className="text-xs text-slate-500">
                This itinerary doesn't have any activities planned yet. You can clone this route and add your own favorite spots!
              </p>
            </div>
            {onPlanYourOwnTrip && (
              <Button variant="primary" size="sm" onClick={onPlanYourOwnTrip}>
                Plan Your Own Trip
              </Button>
            )}
          </div>
        )}

        {/* 5. PUBLIC CALL TO ACTION FOOTER BANNER */}
        <div className="rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-teal-950 text-white p-6 sm:p-10 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5" />
              <span>GlobeTrotter Travel Planner</span>
            </div>
            <h3 className="text-2xl font-bold font-display text-white">
              Inspired by this itinerary?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Copy this exact trip into your private GlobeTrotter workspace to customize days,
              add new activities, and schedule your own adventure.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <Button
              variant="outline"
              size="md"
              onClick={() => setIsCopyConfirmOpen(true)}
              leftIcon={<CopyPlus className="w-4 h-4 text-teal-400" />}
              className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              Copy Itinerary
            </Button>

            {onPlanYourOwnTrip && (
              <Button
                variant="primary"
                size="md"
                onClick={onPlanYourOwnTrip}
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="w-full sm:w-auto"
              >
                Start From Scratch
              </Button>
            )}
          </div>
        </div>
      </main>

      {/* Public Footer */}
      <footer className="py-6 px-4 bg-white border-t border-slate-200 text-center text-xs text-slate-500">
        <p>Created and shared using GlobeTrotter • Personalized Travel Planning Platform</p>
      </footer>

      {/* Share Modal */}
      <ShareTripModal
        isOpen={isShareModalOpen}
        trip={currentTrip}
        onClose={() => setIsShareModalOpen(false)}
        onCopyTrip={() => {
          setIsShareModalOpen(false);
          setIsCopyConfirmOpen(true);
        }}
      />

      {/* Copy Trip Confirmation Modal */}
      <CopyTripConfirmModal
        isOpen={isCopyConfirmOpen}
        trip={currentTrip}
        onClose={() => setIsCopyConfirmOpen(false)}
        onConfirmCopy={handleExecuteCopyTrip}
      />
    </div>
  );
};
