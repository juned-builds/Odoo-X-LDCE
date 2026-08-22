import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  DollarSign,
  MapPin,
  Share2,
  Edit3,
  Layers,
  List,
  ChevronRight,
  Sparkles,
  Compass,
  CheckCircle2,
  AlertCircle,
  Plus,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { Trip, TripActivityAssignment } from '../../types/dashboard';
import { ItineraryDay, ItineraryActivity } from '../../types/itinerary';
import {
  generateItineraryDays,
  formatMinutesToHours,
  formatCostAmount,
  formatLongDate,
} from '../../utils/itineraryUtils';
import { formatTripDisplayDate } from '../../utils/dateUtils';
import { ItineraryListView } from './ItineraryListView';
import { ItineraryCalendarView } from './ItineraryCalendarView';
import { QuickEditActivityModal } from './QuickEditActivityModal';
import { ActivityDetailModal } from './ActivityDetailModal';
import { ShareTripModal } from './ShareTripModal';
import { ConfirmRemoveModal } from './ConfirmRemoveModal';
import { Button } from '../ui/Button';

interface ItineraryViewScreenProps {
  trip: Trip;
  onBack: () => void;
  onEditItinerary: () => void;
  onSaveTrip: (updatedTrip: Trip) => void;
  initialViewMode?: 'list' | 'calendar';
  onOpenPublicView?: (shareId: string) => void;
  onCopyTrip?: (trip: Trip) => void;
}

export const ItineraryViewScreen: React.FC<ItineraryViewScreenProps> = ({
  trip,
  onBack,
  onEditItinerary,
  onSaveTrip,
  initialViewMode = 'list',
  onOpenPublicView,
  onCopyTrip,
}) => {
  // 1. View Mode Switcher ('list' or 'calendar')
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>(initialViewMode);

  // 2. Computed Itinerary Days from single source of truth
  const days: ItineraryDay[] = useMemo(() => {
    return generateItineraryDays(trip);
  }, [trip]);

  // 3. Expand / Collapse State tracking across the session
  const [expandedDays, setExpandedDays] = useState<Record<number, boolean>>(() => {
    const initial: Record<number, boolean> = {};
    for (const d of days) {
      initial[d.dayNumber] = true;
    }
    return initial;
  });

  const handleToggleDay = (dayNumber: number) => {
    setExpandedDays((prev) => ({
      ...prev,
      [dayNumber]: !(prev[dayNumber] ?? true),
    }));
  };

  const handleExpandAll = () => {
    const next: Record<number, boolean> = {};
    for (const d of days) {
      next[d.dayNumber] = true;
    }
    setExpandedDays(next);
  };

  const handleCollapseAll = () => {
    const next: Record<number, boolean> = {};
    for (const d of days) {
      next[d.dayNumber] = false;
    }
    setExpandedDays(next);
  };

  // 4. Modals State
  const [quickEditActivity, setQuickEditActivity] = useState<ItineraryActivity | null>(null);
  const [detailActivity, setDetailActivity] = useState<ItineraryActivity | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [removeTargetActivity, setRemoveTargetActivity] = useState<ItineraryActivity | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3500);
  };

  // 5. Trip Summary Metrics
  const tripSummary = useMemo(() => {
    const totalActivities = days.reduce((sum, d) => sum + d.activities.length, 0);
    const totalDurationMins = days.reduce((sum, d) => sum + d.totalDurationMinutes, 0);
    const totalCost = days.reduce((sum, d) => sum + d.totalCostNumeric, 0);
    const totalDests = trip.destinations?.length || trip.destinationCount || 1;

    return {
      totalDays: days.length || 1,
      totalDestinations: totalDests,
      totalActivities,
      formattedTotalDuration: formatMinutesToHours(totalDurationMins),
      formattedTotalCost: formatCostAmount(totalCost, trip.currency || '₹'),
    };
  }, [days, trip]);

  // 6. Shared State Modifiers

  // Reorder activities within a day
  const handleReorderActivitiesInDay = (
    dayNumber: number,
    sourceIndex: number,
    targetIndex: number
  ) => {
    const day = days.find((d) => d.dayNumber === dayNumber);
    if (!day || day.activities.length <= 1) return;

    const dayActs = [...day.activities];
    const [moved] = dayActs.splice(sourceIndex, 1);
    dayActs.splice(targetIndex, 0, moved);

    // Re-assign order numbers
    const updatedAssignments = (trip.activities || []).map((raw) => {
      const idxInDay = dayActs.findIndex((a) => a.id === raw.id || a.activityId === raw.activityId);
      if (idxInDay !== -1) {
        return {
          ...raw,
          order: idxInDay + 1,
        };
      }
      return raw;
    });

    const updatedTrip: Trip = {
      ...trip,
      activities: updatedAssignments,
    };

    onSaveTrip(updatedTrip);
    showNotification('Activity sequence updated.');
  };

  // Move activity Up
  const handleMoveActivityUp = (assignmentId: string) => {
    const targetDay = days.find((d) => d.activities.some((a) => a.id === assignmentId));
    if (!targetDay) return;
    const actIdx = targetDay.activities.findIndex((a) => a.id === assignmentId);
    if (actIdx > 0) {
      handleReorderActivitiesInDay(targetDay.dayNumber, actIdx, actIdx - 1);
    }
  };

  // Move activity Down
  const handleMoveActivityDown = (assignmentId: string) => {
    const targetDay = days.find((d) => d.activities.some((a) => a.id === assignmentId));
    if (!targetDay) return;
    const actIdx = targetDay.activities.findIndex((a) => a.id === assignmentId);
    if (actIdx < targetDay.activities.length - 1) {
      handleReorderActivitiesInDay(targetDay.dayNumber, actIdx, actIdx + 1);
    }
  };

  // Quick edit save
  const handleSaveQuickEdit = (updated: {
    assignmentId: string;
    name: string;
    dayNumber: number;
    dateStr: string;
    destinationCity: string;
    startTime: string;
    duration: string;
    durationMinutes: number;
  }) => {
    const currentRaw = trip.activities || [];
    const updatedActivities = currentRaw.map((act) => {
      if (act.id === updated.assignmentId) {
        return {
          ...act,
          name: updated.name,
          dayNumber: updated.dayNumber,
          date: updated.dateStr,
          destinationCity: updated.destinationCity,
          time: updated.startTime,
          startTime: updated.startTime,
          duration: updated.duration,
          durationMinutes: updated.durationMinutes,
        };
      }
      return act;
    });

    const updatedTrip: Trip = {
      ...trip,
      activities: updatedActivities,
    };

    onSaveTrip(updatedTrip);
    showNotification(`Updated "${updated.name}" successfully.`);
  };

  // Confirm remove activity
  const handleConfirmRemove = () => {
    if (!removeTargetActivity) return;
    const target = removeTargetActivity;

    const currentRaw = trip.activities || [];
    const updatedActivities = currentRaw.filter((a) => a.id !== target.id);

    const updatedTrip: Trip = {
      ...trip,
      activities: updatedActivities,
    };

    onSaveTrip(updatedTrip);
    setRemoveTargetActivity(null);
    showNotification(`Removed "${target.name}" from itinerary.`);
  };

  // Quick date jump scrolling
  const handleJumpToDay = (dayNumber: number) => {
    // Ensure day is expanded
    setExpandedDays((prev) => ({ ...prev, [dayNumber]: true }));
    const element = document.getElementById(`itinerary-list-day-${dayNumber}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const formattedDates = `${formatTripDisplayDate(trip.startDate)} — ${formatTripDisplayDate(
    trip.endDate
  )}`;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-fadeIn">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 animate-slideUp">
          <div className="flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white rounded-2xl shadow-xl border border-slate-700 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-teal-400" />
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* 1. Official Header for Selected Trip */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
        {/* Navigation & Actions Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors self-start cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Trips</span>
          </button>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsShareModalOpen(true)}
              leftIcon={<Share2 className="w-3.5 h-3.5 text-teal-600" />}
            >
              Share Trip
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={onEditItinerary}
              leftIcon={<Edit3 className="w-3.5 h-3.5" />}
            >
              Edit Itinerary
            </Button>
          </div>
        </div>

        {/* Trip Title & Route Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pt-2 border-t border-slate-100">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-teal-50 text-teal-800 text-xs font-black uppercase tracking-wider border border-teal-200/80">
                {trip.status.toUpperCase()} ITINERARY
              </span>
              <span className="text-slate-400 text-xs">•</span>
              <span className="text-xs font-semibold text-slate-500">
                {trip.destinations?.length || trip.destinationCount} destinations
              </span>
              <span className="text-slate-400 text-xs">•</span>
              <span className="text-xs font-semibold text-slate-500">
                {trip.duration}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-display text-slate-900 tracking-tight">
              {trip.name}
            </h1>

            {/* Route & Date */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-sm text-slate-600 font-medium">
              <div className="flex items-center gap-1.5 text-teal-700 font-bold">
                <MapPin className="w-4 h-4 shrink-0" />
                <span>{trip.route}</span>
              </div>
              <span className="text-slate-300 font-bold">•</span>
              <div className="flex items-center gap-1.5 text-slate-600">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{formattedDates}</span>
              </div>
            </div>
          </div>

          {/* View Mode Toggle Button Group */}
          <div className="flex items-center gap-3 self-start lg:self-center">
            <div className="bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80 flex items-center gap-1 shadow-inner">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-white text-slate-900 shadow-xs ring-1 ring-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <List className="w-3.5 h-3.5 text-teal-600" />
                <span>List View</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('calendar')}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'calendar'
                    ? 'bg-white text-slate-900 shadow-xs ring-1 ring-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 text-teal-600" />
                <span>Calendar & Timeline</span>
              </button>
            </div>
          </div>
        </div>

        {/* 2. Official Trip Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-5 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Total Duration
            </span>
            <span className="text-sm font-extrabold text-slate-900">
              {tripSummary.totalDays} Days
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Destinations
            </span>
            <span className="text-sm font-extrabold text-slate-900">
              {tripSummary.totalDestinations} Cities
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Activities
            </span>
            <span className="text-sm font-extrabold text-teal-700">
              {tripSummary.totalActivities} Planned
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Planned Time
            </span>
            <span className="text-sm font-extrabold text-slate-900">
              {tripSummary.formattedTotalDuration}
            </span>
          </div>

          <div className="col-span-2 sm:col-span-1 p-3 bg-emerald-50/70 rounded-2xl border border-emerald-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
              Est. Activity Cost
            </span>
            <span className="text-sm font-extrabold text-emerald-800">
              {tripSummary.formattedTotalCost}
            </span>
          </div>
        </div>
      </div>

      {/* 3. List View Controls Strip (Expand / Collapse All & Day Navigation) */}
      {viewMode === 'list' && days.length > 0 && (
        <div className="bg-white p-3.5 sm:p-4 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Quick Date / Day Navigation Strip */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 md:pb-0">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider pr-1 shrink-0">
              Jump to:
            </span>
            {days.map((day) => (
              <button
                key={day.dayNumber}
                type="button"
                onClick={() => handleJumpToDay(day.dayNumber)}
                className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-50 hover:bg-teal-50 hover:text-teal-800 border border-slate-200/80 text-slate-700 shrink-0 transition-all cursor-pointer active:scale-95"
              >
                Day {day.dayNumber} • {day.destinationCity}
              </button>
            ))}
          </div>

          {/* Expand All / Collapse All */}
          <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
            <button
              type="button"
              onClick={handleExpandAll}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Expand All</span>
            </button>

            <button
              type="button"
              onClick={handleCollapseAll}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              <span>Collapse All</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. Active View Mode Body */}
      {viewMode === 'list' ? (
        <ItineraryListView
          days={days}
          trip={trip}
          onEditInBuilder={onEditItinerary}
          onQuickEdit={(activity) => setQuickEditActivity(activity)}
          onViewDetails={(activity) => setDetailActivity(activity)}
          onRemoveActivity={(activity) => setRemoveTargetActivity(activity)}
          onReorderActivitiesInDay={handleReorderActivitiesInDay}
          onMoveActivityUp={handleMoveActivityUp}
          onMoveActivityDown={handleMoveActivityDown}
          expandedDays={expandedDays}
          onToggleDay={handleToggleDay}
        />
      ) : (
        <ItineraryCalendarView
          days={days}
          trip={trip}
          onQuickEdit={(activity) => setQuickEditActivity(activity)}
          onViewDetails={(activity) => setDetailActivity(activity)}
          onRemoveActivity={(activity) => setRemoveTargetActivity(activity)}
          onEditInBuilder={onEditItinerary}
        />
      )}

      {/* 5. Modals */}
      <QuickEditActivityModal
        isOpen={!!quickEditActivity}
        activity={quickEditActivity}
        days={days}
        onClose={() => setQuickEditActivity(null)}
        onSaveQuickEdit={handleSaveQuickEdit}
      />

      <ActivityDetailModal
        isOpen={!!detailActivity}
        activity={detailActivity}
        onClose={() => setDetailActivity(null)}
        onQuickEdit={(act) => {
          setDetailActivity(null);
          setQuickEditActivity(act);
        }}
        onRemove={(act) => {
          setDetailActivity(null);
          setRemoveTargetActivity(act);
        }}
      />

      <ShareTripModal
        isOpen={isShareModalOpen}
        trip={trip}
        onClose={() => setIsShareModalOpen(false)}
        onOpenPublicView={onOpenPublicView}
        onCopyTrip={onCopyTrip}
        onToggleShareStatus={(t, isShared) => {
          onSaveTrip({
            ...t,
            isShared,
          });
        }}
      />

      <ConfirmRemoveModal
        isOpen={!!removeTargetActivity}
        activityName={removeTargetActivity?.name || ''}
        dayNumber={removeTargetActivity?.dayNumber || 1}
        title="Remove Activity from Itinerary"
        message={
          removeTargetActivity
            ? `Are you sure you want to remove "${removeTargetActivity.name}" from your Day ${removeTargetActivity.dayNumber} itinerary? You can re-add it anytime.`
            : undefined
        }
        confirmLabel="Remove Activity"
        onConfirm={handleConfirmRemove}
        onClose={() => setRemoveTargetActivity(null)}
      />
    </div>
  );
};
