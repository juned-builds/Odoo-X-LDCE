import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Compass,
  CheckCircle2,
  AlertCircle,
  Save,
  Sparkles,
  MapPin,
  DollarSign,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { Trip, TripActivityAssignment } from '../../types/dashboard';
import { ItineraryActivity, ItineraryDay, CustomActivityInput } from '../../types/itinerary';
import { Activity } from '../../types/activity';
import {
  generateItineraryDays,
  parseDurationToMinutes,
  parseCostToNumeric,
  formatMinutesToHours,
  formatCostAmount,
} from '../../utils/itineraryUtils';
import { formatTripDateRange } from '../../utils/dateUtils';
import { ItineraryDaySection } from './ItineraryDaySection';
import { AddActivityModal } from './AddActivityModal';
import { AddCustomActivityModal } from './AddCustomActivityModal';
import { ConfirmRemoveModal } from './ConfirmRemoveModal';
import { UnsavedChangesModal } from './UnsavedChangesModal';
import { Button } from '../ui/Button';

interface ItineraryBuilderViewProps {
  trip: Trip;
  onBack: () => void;
  onSaveTrip: (updatedTrip: Trip) => void;
  onNavigateToExplore?: () => void;
}

export const ItineraryBuilderView: React.FC<ItineraryBuilderViewProps> = ({
  trip,
  onBack,
  onSaveTrip,
  onNavigateToExplore,
}) => {
  // Working activities state for this trip
  const [workingActivities, setWorkingActivities] = useState<TripActivityAssignment[]>(() => {
    return trip.activities || [];
  });

  // Custom per-day city overrides if user changes a day's destination
  const [dayCityOverrides, setDayCityOverrides] = useState<Record<number, string>>({});

  // Unsaved changes tracking
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // Modals state
  const [activeAddDay, setActiveAddDay] = useState<{ dayNumber: number; dateStr: string; city: string } | null>(null);
  const [activeCustomDay, setActiveCustomDay] = useState<{ dayNumber: number; dateStr: string; city: string } | null>(null);
  const [activityToRemove, setActivityToRemove] = useState<ItineraryActivity | null>(null);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);

  // Sync state if trip prop changes externally
  useEffect(() => {
    setWorkingActivities(trip.activities || []);
    setIsDirty(false);
  }, [trip.id]);

  // Construct a temporary trip representation with working activities
  const workingTrip: Trip = useMemo(() => {
    return {
      ...trip,
      activities: workingActivities,
    };
  }, [trip, workingActivities]);

  // Generate itinerary days
  const rawDays = useMemo(() => {
    return generateItineraryDays(workingTrip);
  }, [workingTrip]);

  // Apply any per-day city overrides
  const days: ItineraryDay[] = useMemo(() => {
    return rawDays.map((d) => {
      if (dayCityOverrides[d.dayNumber]) {
        return {
          ...d,
          destinationCity: dayCityOverrides[d.dayNumber],
        };
      }
      return d;
    });
  }, [rawDays, dayCityOverrides]);

  // Available cities for city pickers
  const availableCities = useMemo(() => {
    const fromTrip = trip.destinations || [];
    const fromRoute = trip.route ? trip.route.split('→').map((s) => s.trim()) : [];
    const combined = Array.from(new Set([...fromTrip, ...fromRoute])).filter(Boolean);
    return combined.length > 0 ? combined : ['Destination'];
  }, [trip]);

  // Aggregate trip statistics
  const totalPlannedActivities = workingActivities.length;
  const totalPlannedMinutes = days.reduce((sum, d) => sum + d.totalDurationMinutes, 0);
  const totalPlannedCost = days.reduce((sum, d) => sum + d.totalCostNumeric, 0);

  // Handle Navigation Back with unsaved changes prompt
  const handleBackAttempt = () => {
    if (isDirty) {
      setShowUnsavedModal(true);
    } else {
      onBack();
    }
  };

  // Save Itinerary
  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      const updatedTrip: Trip = {
        ...trip,
        activities: workingActivities,
      };
      onSaveTrip(updatedTrip);
      setIsSaving(false);
      setIsDirty(false);
      setSaveSuccessMessage('Itinerary saved successfully!');
      setTimeout(() => setSaveSuccessMessage(null), 4000);
    }, 400);
  };

  // Reorder activity Up within a day
  const handleMoveActivityUp = (assignmentId: string) => {
    setWorkingActivities((prev) => {
      const act = prev.find((a) => a.id === assignmentId);
      if (!act) return prev;

      // Find all activities on this same day
      const sameDayActs = prev.filter(
        (a) =>
          (a.date && act.date && a.date === act.date) ||
          (a.dayNumber && act.dayNumber && a.dayNumber === act.dayNumber)
      );

      const currentIndex = sameDayActs.findIndex((a) => a.id === assignmentId);
      if (currentIndex <= 0) return prev; // already top

      const prevAct = sameDayActs[currentIndex - 1];

      // Swap their orders
      const orderA = act.order || currentIndex + 1;
      const orderB = prevAct.order || currentIndex;

      setIsDirty(true);
      return prev.map((item) => {
        if (item.id === act.id) return { ...item, order: orderB };
        if (item.id === prevAct.id) return { ...item, order: orderA };
        return item;
      });
    });
  };

  // Reorder activity Down within a day
  const handleMoveActivityDown = (assignmentId: string) => {
    setWorkingActivities((prev) => {
      const act = prev.find((a) => a.id === assignmentId);
      if (!act) return prev;

      const sameDayActs = prev.filter(
        (a) =>
          (a.date && act.date && a.date === act.date) ||
          (a.dayNumber && act.dayNumber && a.dayNumber === act.dayNumber)
      );

      const currentIndex = sameDayActs.findIndex((a) => a.id === assignmentId);
      if (currentIndex === -1 || currentIndex >= sameDayActs.length - 1) return prev; // already bottom

      const nextAct = sameDayActs[currentIndex + 1];

      const orderA = act.order || currentIndex + 1;
      const orderB = nextAct.order || currentIndex + 2;

      setIsDirty(true);
      return prev.map((item) => {
        if (item.id === act.id) return { ...item, order: orderB };
        if (item.id === nextAct.id) return { ...item, order: orderA };
        return item;
      });
    });
  };

  // Move activity to a different Day
  const handleMoveActivityToDay = (assignmentId: string, targetDayNumber: number) => {
    const targetDay = days.find((d) => d.dayNumber === targetDayNumber);
    if (!targetDay) return;

    setWorkingActivities((prev) => {
      setIsDirty(true);
      return prev.map((act) => {
        if (act.id === assignmentId) {
          return {
            ...act,
            date: targetDay.dateStr,
            dayNumber: targetDayNumber,
            destinationCity: targetDay.destinationCity,
            order: targetDay.activities.length + 1,
          };
        }
        return act;
      });
    });
  };

  // Update Activity Start Time
  const handleUpdateActivityStartTime = (assignmentId: string, newTime: string) => {
    setWorkingActivities((prev) => {
      setIsDirty(true);
      return prev.map((act) => {
        if (act.id === assignmentId) {
          return {
            ...act,
            time: newTime,
            startTime: newTime,
          };
        }
        return act;
      });
    });
  };

  // Change destination city for a day
  const handleChangeDayCity = (dayNumber: number, newCity: string) => {
    setDayCityOverrides((prev) => ({
      ...prev,
      [dayNumber]: newCity,
    }));
    setIsDirty(true);
  };

  // Add Catalog or Saved Activity to Day
  const handleAddActivityToDay = (
    activity: Activity | TripActivityAssignment,
    startTime: string
  ) => {
    if (!activeAddDay) return;

    const targetDay = days.find((d) => d.dayNumber === activeAddDay.dayNumber);
    const dateStr = targetDay ? targetDay.dateStr : activeAddDay.dateStr;
    const destCity = targetDay ? targetDay.destinationCity : activeAddDay.city;

    const newAssignment: TripActivityAssignment = {
      id: `act-assign-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      activityId: 'activityId' in activity ? (activity as any).activityId : activity.id,
      name: activity.name,
      destinationCity: destCity,
      destinationId: 'destinationId' in activity ? activity.destinationId : undefined,
      type: activity.type,
      cost: activity.cost,
      costTier: activity.costTier,
      costNumeric:
        'costNumeric' in activity
          ? (activity as any).costNumeric
          : parseCostToNumeric(activity.cost, trip.currency),
      duration: activity.duration,
      durationMinutes:
        'durationMinutes' in activity
          ? (activity as any).durationMinutes
          : parseDurationToMinutes(activity.duration),
      image: activity.image,
      date: dateStr,
      dayNumber: activeAddDay.dayNumber,
      time: startTime,
      startTime: startTime,
      order: (targetDay?.activities.length || 0) + 1,
      rating: 'rating' in activity ? activity.rating : 4.8,
      description: activity.description || (activity as any).shortDescription,
      isCustom: false,
      addedAt: new Date().toISOString(),
    };

    setWorkingActivities((prev) => [...prev, newAssignment]);
    setIsDirty(true);
    setActiveAddDay(null);
  };

  // Add Custom Activity to Day
  const handleAddCustomActivityToDay = (input: CustomActivityInput) => {
    if (!activeCustomDay) return;

    const targetDay = days.find((d) => d.dayNumber === activeCustomDay.dayNumber);
    const dateStr = targetDay ? targetDay.dateStr : activeCustomDay.dateStr;
    const destCity = targetDay ? targetDay.destinationCity : activeCustomDay.city;

    const newCustomAssignment: TripActivityAssignment = {
      id: `act-custom-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      activityId: `custom-act-${Date.now()}`,
      name: input.name,
      destinationCity: destCity,
      type: input.type,
      cost: input.cost,
      costTier: input.costTier,
      costNumeric: input.costNumeric,
      duration: input.duration,
      durationMinutes: input.durationMinutes,
      image: input.image,
      date: dateStr,
      dayNumber: activeCustomDay.dayNumber,
      time: input.startTime,
      startTime: input.startTime,
      order: (targetDay?.activities.length || 0) + 1,
      description: input.description,
      isCustom: true,
      notes: input.location ? `Location: ${input.location}` : undefined,
      addedAt: new Date().toISOString(),
    };

    setWorkingActivities((prev) => [...prev, newCustomAssignment]);
    setIsDirty(true);
    setActiveCustomDay(null);
  };

  // Confirm removal of activity from day
  const handleConfirmRemove = () => {
    if (!activityToRemove) return;

    setWorkingActivities((prev) => prev.filter((a) => a.id !== activityToRemove.id));
    setIsDirty(true);
    setActivityToRemove(null);
  };

  // Smooth scroll to a day
  const scrollToDay = (dayNumber: number) => {
    const el = document.getElementById(`itinerary-day-${dayNumber}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24 animate-fadeIn">
      {/* Top Navigation & Sticky Page Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Back Action & Title Info */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={handleBackAttempt}
              className="p-2 -ml-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all active:scale-95 cursor-pointer shrink-0"
              title="Back to My Trips"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="min-w-0 space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100">
                  Itinerary Builder
                </span>
                {isDirty && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    Unsaved changes
                  </span>
                )}
              </div>

              <h1 className="text-lg sm:text-xl font-bold font-display text-slate-900 truncate">
                {trip.name}
              </h1>

              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="font-medium text-slate-700">{trip.route || trip.destinations?.join(' → ')}</span>
                <span>•</span>
                <span>{formatTripDateRange(trip.startDate, trip.endDate)}</span>
                <span>•</span>
                <span>{trip.duration || `${days.length} days`}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons: Cancel, Save */}
          <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBackAttempt}
            >
              Back to Trips
            </Button>

            <Button
              variant="primary"
              size="sm"
              isLoading={isSaving}
              onClick={handleSave}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Itinerary
            </Button>
          </div>
        </div>
      </header>

      {/* Save Success Banner */}
      {saveSuccessMessage && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="p-3.5 bg-emerald-600 text-white rounded-2xl shadow-md flex items-center justify-between gap-3 animate-scaleUp">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold">
              <CheckCircle2 className="w-5 h-5 text-emerald-200" />
              <span>{saveSuccessMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setSaveSuccessMessage(null)}
              className="text-emerald-100 hover:text-white text-xs font-bold px-2 py-1 rounded-lg hover:bg-emerald-700"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Workspace Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Compact Trip Summary Header Card */}
        <section className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <img
                src={
                  trip.coverImage ||
                  'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80'
                }
                alt={trip.name}
                referrerPolicy="no-referrer"
                className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover border border-white/10 shrink-0 shadow-md"
              />

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-lg bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-500/30">
                    {trip.status.toUpperCase()}
                  </span>
                  <span className="text-xs text-slate-300">{days.length} Days Total</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold font-display text-white">
                  {trip.name}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 max-w-xl line-clamp-1">
                  {trip.description || 'Custom personalized multi-day journey itinerary.'}
                </p>
              </div>
            </div>

            {/* Overview Stats Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto shrink-0 text-center">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Destinations</div>
                <div className="text-lg font-black text-white mt-0.5">
                  {trip.destinationCount || trip.destinations?.length || 1}
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Activities</div>
                <div className="text-lg font-black text-teal-300 mt-0.5">
                  {totalPlannedActivities}
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Planned Hours</div>
                <div className="text-lg font-black text-white mt-0.5">
                  {formatMinutesToHours(totalPlannedMinutes)}
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Est. Activity Cost</div>
                <div className="text-lg font-black text-emerald-300 mt-0.5">
                  {formatCostAmount(totalPlannedCost, trip.currency || '₹')}
                </div>
              </div>
            </div>
          </div>

          {/* Quick-Jump Day Navigation Strip */}
          {days.length > 0 && (
            <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200/80 flex items-center gap-2 overflow-x-auto scrollbar-none">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1 shrink-0">
                Jump to Day:
              </span>
              {days.map((d) => (
                <button
                  key={d.dayNumber}
                  type="button"
                  onClick={() => scrollToDay(d.dayNumber)}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-teal-50 hover:text-teal-900 border border-slate-200 text-slate-700 text-xs font-semibold shrink-0 transition-all active:scale-95 cursor-pointer shadow-2xs flex items-center gap-1.5"
                >
                  <span className="font-bold text-teal-600">D{d.dayNumber}</span>
                  <span className="text-slate-400">•</span>
                  <span>{d.destinationCity}</span>
                  {d.activities.length > 0 && (
                    <span className="ml-1 w-4 h-4 rounded-full bg-slate-100 text-slate-600 text-[10px] flex items-center justify-center font-bold">
                      {d.activities.length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Empty Destinations / Invalid Dates State */}
        {days.length === 0 ? (
          <div className="py-16 px-6 text-center bg-white rounded-3xl border border-slate-200 space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-teal-50 border border-teal-100 flex items-center justify-center mx-auto text-teal-600 shadow-sm">
              <Compass className="w-8 h-8" />
            </div>

            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="text-xl font-bold font-display text-slate-900">
                No Destinations or Dates Selected
              </h3>
              <p className="text-xs sm:text-sm text-slate-500">
                This trip doesn't have start and end dates or destinations configured yet. Add destinations from Explore or update your trip dates to generate your daily itinerary timeline.
              </p>
            </div>

            {onNavigateToExplore && (
              <div className="pt-2">
                <Button
                  variant="primary"
                  size="md"
                  onClick={onNavigateToExplore}
                  leftIcon={<Compass className="w-4 h-4" />}
                >
                  Explore Destinations
                </Button>
              </div>
            )}
          </div>
        ) : (
          /* Day-by-Day Timeline List */
          <div className="space-y-6">
            {days.map((day) => (
              <ItineraryDaySection
                key={day.dayNumber}
                day={day}
                trip={trip}
                totalDays={days.length}
                availableCities={availableCities}
                onAddActivityClick={() =>
                  setActiveAddDay({
                    dayNumber: day.dayNumber,
                    dateStr: day.dateStr,
                    city: day.destinationCity,
                  })
                }
                onAddCustomClick={() =>
                  setActiveCustomDay({
                    dayNumber: day.dayNumber,
                    dateStr: day.dateStr,
                    city: day.destinationCity,
                  })
                }
                onMoveActivityUp={handleMoveActivityUp}
                onMoveActivityDown={handleMoveActivityDown}
                onMoveActivityToDay={handleMoveActivityToDay}
                onUpdateActivityStartTime={handleUpdateActivityStartTime}
                onRequestRemoveActivity={(act) => setActivityToRemove(act)}
                onChangeDayCity={(city) => handleChangeDayCity(day.dayNumber, city)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modal: Add Curated / Saved Activity */}
      {activeAddDay && (
        <AddActivityModal
          isOpen={!!activeAddDay}
          dayNumber={activeAddDay.dayNumber}
          dateStr={activeAddDay.dateStr}
          destinationCity={activeAddDay.city}
          trip={workingTrip}
          existingDayActivityIds={
            days
              .find((d) => d.dayNumber === activeAddDay.dayNumber)
              ?.activities.map((a) => a.id) || []
          }
          onClose={() => setActiveAddDay(null)}
          onSelectActivity={handleAddActivityToDay}
          onOpenCustomModal={() => {
            const currentDay = activeAddDay;
            setActiveAddDay(null);
            setActiveCustomDay(currentDay);
          }}
        />
      )}

      {/* Modal: Add Custom Activity */}
      {activeCustomDay && (
        <AddCustomActivityModal
          isOpen={!!activeCustomDay}
          dayNumber={activeCustomDay.dayNumber}
          dateStr={activeCustomDay.dateStr}
          destinationCity={activeCustomDay.city}
          onClose={() => setActiveCustomDay(null)}
          onAddCustomActivity={handleAddCustomActivityToDay}
        />
      )}

      {/* Modal: Confirm Remove Activity */}
      {activityToRemove && (
        <ConfirmRemoveModal
          isOpen={!!activityToRemove}
          activityName={activityToRemove.name}
          dayNumber={activityToRemove.dayNumber}
          onClose={() => setActivityToRemove(null)}
          onConfirm={handleConfirmRemove}
        />
      )}

      {/* Modal: Unsaved Changes Alert */}
      <UnsavedChangesModal
        isOpen={showUnsavedModal}
        onKeepEditing={() => setShowUnsavedModal(false)}
        onDiscardChanges={() => {
          setShowUnsavedModal(false);
          setIsDirty(false);
          onBack();
        }}
      />
    </div>
  );
};
