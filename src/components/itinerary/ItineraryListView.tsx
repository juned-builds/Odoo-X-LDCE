import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  MapPin,
  Clock,
  DollarSign,
  Calendar,
  AlertTriangle,
  Plus,
  Sparkles,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { ItineraryDay, ItineraryActivity } from '../../types/itinerary';
import { Trip } from '../../types/dashboard';
import { getDestinationCountry, formatLongDate } from '../../utils/itineraryUtils';
import { ItineraryActivityItem } from './ItineraryActivityItem';
import { Button } from '../ui/Button';

interface ItineraryListViewProps {
  days: ItineraryDay[];
  trip: Trip;
  onEditInBuilder: () => void;
  onQuickEdit: (activity: ItineraryActivity) => void;
  onViewDetails: (activity: ItineraryActivity) => void;
  onRemoveActivity: (activity: ItineraryActivity) => void;
  onReorderActivitiesInDay: (dayNumber: number, sourceIndex: number, targetIndex: number) => void;
  onMoveActivityUp: (assignmentId: string) => void;
  onMoveActivityDown: (assignmentId: string) => void;
  expandedDays: Record<number, boolean>;
  onToggleDay: (dayNumber: number) => void;
}

export const ItineraryListView: React.FC<ItineraryListViewProps> = ({
  days,
  trip,
  onEditInBuilder,
  onQuickEdit,
  onViewDetails,
  onRemoveActivity,
  onReorderActivitiesInDay,
  onMoveActivityUp,
  onMoveActivityDown,
  expandedDays,
  onToggleDay,
}) => {
  // Drag and drop state within the list
  const [draggingInfo, setDraggingInfo] = useState<{
    dayNumber: number;
    activityId: string;
    index: number;
  } | null>(null);

  const handleDragStart = (
    e: React.DragEvent,
    dayNumber: number,
    activityId: string,
    index: number
  ) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ dayNumber, activityId, index }));
    setDraggingInfo({ dayNumber, activityId, index });
  };

  const handleDragOver = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dayNumber: number, targetIndex: number) => {
    e.preventDefault();
    if (!draggingInfo) return;

    if (draggingInfo.dayNumber === dayNumber && draggingInfo.index !== targetIndex) {
      onReorderActivitiesInDay(dayNumber, draggingInfo.index, targetIndex);
    }
    setDraggingInfo(null);
  };

  const handleDragEnd = () => {
    setDraggingInfo(null);
  };

  if (days.length === 0) {
    return (
      <div className="py-16 px-6 text-center bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-teal-50 border border-teal-100 flex items-center justify-center mx-auto text-teal-600 shadow-sm">
          <Calendar className="w-8 h-8" />
        </div>
        <div className="space-y-1.5 max-w-md mx-auto">
          <h3 className="text-xl font-bold font-display text-slate-900">
            No Itinerary Days Generated
          </h3>
          <p className="text-xs sm:text-sm text-slate-500">
            Configure trip dates and destinations in your trip settings to generate your daily itinerary.
          </p>
        </div>
        <div className="pt-2">
          <Button variant="primary" size="md" onClick={onEditInBuilder}>
            Configure Trip Dates
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {days.map((day) => {
        const isExpanded = expandedDays[day.dayNumber] ?? true;
        const country = getDestinationCountry(day.destinationCity, trip.stops);
        const cityHeaderTitle = country
          ? `${day.destinationCity.toUpperCase()}, ${country.toUpperCase()}`
          : day.destinationCity.toUpperCase();

        return (
          <section
            key={day.dayNumber}
            id={`itinerary-list-day-${day.dayNumber}`}
            className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden transition-all scroll-mt-24"
          >
            {/* 1. Official City & Day Header (Clickable to expand/collapse) */}
            <div
              onClick={() => onToggleDay(day.dayNumber)}
              className="p-4 sm:p-5 bg-gradient-to-r from-slate-50 via-white to-slate-50/80 border-b border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-100/60 transition-colors select-none"
            >
              {/* Left: Destination & Day Information */}
              <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex flex-col items-center justify-center shrink-0 shadow-xs">
                  <span className="text-[10px] font-black tracking-wider uppercase leading-none">
                    DAY
                  </span>
                  <span className="text-sm font-black leading-none mt-0.5">
                    {day.dayNumber}
                  </span>
                </div>

                <div className="min-w-0 space-y-0.5">
                  {/* City Header */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black text-teal-800 uppercase tracking-widest bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200/80">
                      {cityHeaderTitle}
                    </span>
                    <span className="text-xs text-slate-400 font-bold">•</span>
                    <span className="text-xs font-semibold text-slate-600">
                      {formatLongDate(day.dateStr)} ({day.dayOfWeek})
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold font-display text-slate-900 truncate">
                    {day.destinationCity} Journey Timeline
                  </h3>
                </div>
              </div>

              {/* Right: Daily Summary & Toggle Chevron */}
              <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-200/60">
                {/* Summary Metrics */}
                <div className="flex items-center gap-3 text-xs">
                  <span className="px-2.5 py-1 rounded-xl bg-slate-100 font-bold text-slate-700">
                    {day.activities.length} {day.activities.length === 1 ? 'activity' : 'activities'}
                  </span>

                  <span className="text-slate-400 font-bold">•</span>

                  <span className="font-semibold text-slate-600">
                    {day.formattedDuration}
                  </span>

                  <span className="text-slate-400 font-bold">•</span>

                  <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200/60">
                    {day.formattedCost}
                  </span>
                </div>

                {/* Chevron icon */}
                <div className="p-1.5 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors">
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              </div>
            </div>

            {/* Time Conflict Notice if any */}
            {isExpanded && day.hasTimeConflict && (
              <div className="mx-4 sm:mx-6 mt-4 p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-2.5 text-xs text-amber-800">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="font-medium">
                  {day.conflictReason || 'Schedule notice: Multiple activities have overlapping planned times.'}
                </span>
              </div>
            )}

            {/* 2. Activities List Body */}
            {isExpanded && (
              <div className="p-4 sm:p-6 space-y-3.5 animate-fadeIn">
                {day.activities.length === 0 ? (
                  /* Empty Day State */
                  <div className="p-6 text-center rounded-2xl bg-slate-50/70 border border-dashed border-slate-200 space-y-3">
                    <p className="text-xs sm:text-sm text-slate-500 font-medium">
                      Nothing planned for this day yet.
                    </p>
                    <button
                      type="button"
                      onClick={onEditInBuilder}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-all cursor-pointer shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5 text-teal-600" />
                      <span>+ Add Activity in Itinerary Builder</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {day.activities.map((activity, actIdx) => (
                      <ItineraryActivityItem
                        key={activity.id}
                        activity={activity}
                        index={actIdx}
                        totalActivitiesInDay={day.activities.length}
                        onMoveUp={() => onMoveActivityUp(activity.id)}
                        onMoveDown={() => onMoveActivityDown(activity.id)}
                        onQuickEdit={onQuickEdit}
                        onViewDetails={onViewDetails}
                        onRemove={onRemoveActivity}
                        onDragStart={(e) =>
                          handleDragStart(e, day.dayNumber, activity.id, actIdx)
                        }
                        onDragOver={(e) => handleDragOver(e, actIdx)}
                        onDrop={(e) => handleDrop(e, day.dayNumber, actIdx)}
                        onDragEnd={handleDragEnd}
                        isDragging={draggingInfo?.activityId === activity.id}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
};
