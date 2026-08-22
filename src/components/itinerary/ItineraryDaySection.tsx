import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  DollarSign,
  Plus,
  Sparkles,
  MapPin,
  AlertTriangle,
  ChevronDown,
  Info,
} from 'lucide-react';
import { ItineraryActivity, ItineraryDay } from '../../types/itinerary';
import { Trip } from '../../types/dashboard';
import { ItineraryActivityCard } from './ItineraryActivityCard';
import { Button } from '../ui/Button';

interface ItineraryDaySectionProps {
  day: ItineraryDay;
  trip: Trip;
  totalDays: number;
  availableCities: string[];
  onAddActivityClick: () => void;
  onAddCustomClick: () => void;
  onMoveActivityUp: (activityId: string) => void;
  onMoveActivityDown: (activityId: string) => void;
  onMoveActivityToDay: (activityId: string, targetDayNumber: number) => void;
  onUpdateActivityStartTime: (activityId: string, newTime: string) => void;
  onRequestRemoveActivity: (activity: ItineraryActivity) => void;
  onChangeDayCity: (newCity: string) => void;
}

export const ItineraryDaySection: React.FC<ItineraryDaySectionProps> = ({
  day,
  trip,
  totalDays,
  availableCities,
  onAddActivityClick,
  onAddCustomClick,
  onMoveActivityUp,
  onMoveActivityDown,
  onMoveActivityToDay,
  onUpdateActivityStartTime,
  onRequestRemoveActivity,
  onChangeDayCity,
}) => {
  const [showCityPicker, setShowCityPicker] = useState(false);

  return (
    <div
      id={`itinerary-day-${day.dayNumber}`}
      className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:border-slate-300"
    >
      {/* Day Header */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Day Badge, Date & City */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-xl bg-teal-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-xs">
              Day {day.dayNumber}
            </span>
            <span className="text-sm font-bold text-white">
              {day.formattedDate}
            </span>
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">
              ({day.dayOfWeek})
            </span>
          </div>

          {/* Destination City Pill / Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowCityPicker(!showCityPicker)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-teal-300 text-xs font-semibold border border-white/10 transition-all cursor-pointer"
              title="Click to change city for this day"
            >
              <MapPin className="w-3 h-3 text-teal-400" />
              <span>{day.destinationCity}</span>
              {availableCities.length > 1 && (
                <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
              )}
            </button>

            {/* City Picker Dropdown */}
            {showCityPicker && availableCities.length > 1 && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setShowCityPicker(false)}
                />
                <div className="absolute left-0 top-full mt-1.5 z-40 w-44 bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 py-1.5 text-xs animate-scaleUp">
                  <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
                    Assign City to Day {day.dayNumber}:
                  </div>
                  {availableCities.map((city) => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => {
                        onChangeDayCity(city);
                        setShowCityPicker(false);
                      }}
                      className={`w-full text-left px-3 py-2 transition-colors flex items-center gap-2 cursor-pointer ${
                        day.destinationCity.toLowerCase() === city.toLowerCase()
                          ? 'text-teal-300 font-bold bg-slate-800'
                          : 'text-slate-200 hover:bg-teal-600 hover:text-white'
                      }`}
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{city}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right: Daily Stats Summary */}
        <div className="flex items-center gap-4 text-xs font-medium text-slate-300 bg-slate-950/40 px-3.5 py-1.5 rounded-2xl border border-white/5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-teal-400" />
            <span>
              {day.activities.length} {day.activities.length === 1 ? 'activity' : 'activities'}
            </span>
          </div>

          <div className="h-3 w-px bg-slate-700" />

          <div className="flex items-center gap-1 text-slate-200">
            <Clock className="w-3.5 h-3.5 text-teal-400" />
            <span>{day.formattedDuration}</span>
          </div>

          {day.totalCostNumeric > 0 && (
            <>
              <div className="h-3 w-px bg-slate-700" />
              <div className="flex items-center gap-1 text-emerald-300 font-semibold">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                <span>{day.formattedCost}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Non-blocking Overlap Warning Banner */}
      {day.hasTimeConflict && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 flex items-center gap-2.5 text-xs text-amber-800">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <div className="flex-1 font-medium">
            <strong className="font-bold">Schedule Overlap Alert:</strong>{' '}
            {day.conflictReason || 'Two or more activities have overlapping time slots on this day.'}
          </div>
        </div>
      )}

      {/* Activities Content Area */}
      <div className="p-4 sm:p-5 space-y-3 bg-slate-50/50">
        {day.activities.length === 0 ? (
          /* Polished Empty Day State */
          <div className="py-8 px-4 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-white space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center mx-auto text-teal-600">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <p className="text-xs sm:text-sm font-bold text-slate-800">
                Nothing planned yet for Day {day.dayNumber}
              </p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Add an activity or custom excursion to build your day in {day.destinationCity}.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <Button
                variant="primary"
                size="sm"
                onClick={onAddActivityClick}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Add Activity
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onAddCustomClick}
                leftIcon={<Sparkles className="w-3.5 h-3.5 text-teal-600" />}
              >
                Custom Event
              </Button>
            </div>
          </div>
        ) : (
          /* List of Scheduled Activities */
          <div className="space-y-2.5">
            {day.activities.map((activity, idx) => (
              <ItineraryActivityCard
                key={activity.id}
                activity={activity}
                dayIndex={day.dayNumber - 1}
                totalDays={totalDays}
                isFirst={idx === 0}
                isLast={idx === day.activities.length - 1}
                currency={trip.currency || '₹'}
                onMoveUp={() => onMoveActivityUp(activity.id)}
                onMoveDown={() => onMoveActivityDown(activity.id)}
                onMoveToDay={(targetDay) => onMoveActivityToDay(activity.id, targetDay)}
                onUpdateStartTime={(newTime) =>
                  onUpdateActivityStartTime(activity.id, newTime)
                }
                onRemove={() => onRequestRemoveActivity(activity)}
              />
            ))}
          </div>
        )}

        {/* Day Footer Action Buttons */}
        {day.activities.length > 0 && (
          <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200/60">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Info className="w-3 h-3 text-slate-400" />
              Use arrows to adjust schedule order
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onAddCustomClick}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-all active:scale-95 cursor-pointer shadow-2xs"
              >
                <Sparkles className="w-3 h-3 text-teal-600" />
                <span>+ Custom Event</span>
              </button>

              <button
                type="button"
                onClick={onAddActivityClick}
                className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs hover:shadow transition-all active:scale-95 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Activity</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
