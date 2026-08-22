import React, { useState } from 'react';
import {
  Clock,
  MapPin,
  DollarSign,
  Star,
  Edit3,
  Trash2,
  Calendar,
  Sparkles,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { ItineraryDay, ItineraryActivity } from '../../types/itinerary';
import { Trip } from '../../types/dashboard';
import { format24hTime, formatLongDate, getDestinationCountry } from '../../utils/itineraryUtils';
import { Button } from '../ui/Button';

interface ItineraryTimelineViewProps {
  days: ItineraryDay[];
  trip: Trip;
  onQuickEdit: (activity: ItineraryActivity) => void;
  onViewDetails: (activity: ItineraryActivity) => void;
  onRemoveActivity: (activity: ItineraryActivity) => void;
  onEditInBuilder: () => void;
  selectedDayFilter?: number | 'all';
  onSelectDayFilter?: (day: number | 'all') => void;
}

export const ItineraryTimelineView: React.FC<ItineraryTimelineViewProps> = ({
  days,
  trip,
  onQuickEdit,
  onViewDetails,
  onRemoveActivity,
  onEditInBuilder,
  selectedDayFilter = 'all',
  onSelectDayFilter,
}) => {
  const [internalDayFilter, setInternalDayFilter] = useState<number | 'all'>('all');
  const activeDayFilter = onSelectDayFilter ? selectedDayFilter : internalDayFilter;

  const filteredDays = days.filter((d) =>
    activeDayFilter === 'all' ? true : d.dayNumber === activeDayFilter
  );

  const totalActivities = filteredDays.reduce((acc, d) => acc + d.activities.length, 0);

  return (
    <div className="space-y-6">
      {/* Day Filter Pills Strip */}
      <div className="bg-white p-3.5 sm:p-4 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between gap-3 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">
            <Filter className="w-3.5 h-3.5 text-teal-600" />
            <span>Timeline Filter:</span>
          </div>

          <button
            type="button"
            onClick={() =>
              onSelectDayFilter ? onSelectDayFilter('all') : setInternalDayFilter('all')
            }
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeDayFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Days ({days.length})
          </button>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {days.map((d) => (
            <button
              key={d.dayNumber}
              type="button"
              onClick={() =>
                onSelectDayFilter
                  ? onSelectDayFilter(d.dayNumber)
                  : setInternalDayFilter(d.dayNumber)
              }
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeDayFilter === d.dayNumber
                  ? 'bg-teal-600 text-white shadow-xs font-bold'
                  : 'bg-slate-50 text-slate-700 hover:bg-teal-50 border border-slate-200/80'
              }`}
            >
              <span>Day {d.dayNumber}</span>
              <span className="opacity-60">•</span>
              <span className="truncate max-w-[80px]">{d.destinationCity}</span>
            </button>
          ))}
        </div>
      </div>

      {totalActivities === 0 ? (
        <div className="py-16 px-6 text-center bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-teal-50 border border-teal-100 flex items-center justify-center mx-auto text-teal-600 shadow-sm">
            <Clock className="w-8 h-8" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-xl font-bold font-display text-slate-900">
              No Activities in Timeline
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              There are no scheduled activities for the selected timeline filter. Add activities to see your vertical time-tree.
            </p>
          </div>
          <div className="pt-2">
            <Button variant="primary" size="md" onClick={onEditInBuilder}>
              Add Activities in Builder
            </Button>
          </div>
        </div>
      ) : (
        /* Vertical Travel Timeline Track */
        <div className="space-y-8">
          {filteredDays.map((day) => {
            const country = getDestinationCountry(day.destinationCity, trip.stops);

            return (
              <div
                key={day.dayNumber}
                className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-7 space-y-6"
              >
                {/* Day Marker Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex flex-col items-center justify-center font-black">
                      <span className="text-[9px] uppercase tracking-wider text-slate-400">DAY</span>
                      <span className="text-sm leading-none">{day.dayNumber}</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-teal-800 uppercase tracking-wider bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                          {day.destinationCity.toUpperCase()}{country ? `, ${country.toUpperCase()}` : ''}
                        </span>
                        <span className="text-xs text-slate-400 font-bold">•</span>
                        <span className="text-xs text-slate-500 font-medium">
                          {formatLongDate(day.dateStr)}
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold font-display text-slate-900 mt-0.5">
                        {day.destinationCity} Schedule
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 self-start sm:self-auto">
                    <span>{day.activities.length} events</span>
                    <span>•</span>
                    <span>{day.formattedDuration}</span>
                    <span>•</span>
                    <span className="text-emerald-700 font-bold">{day.formattedCost}</span>
                  </div>
                </div>

                {/* Day's Activities Tree */}
                {day.activities.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400 font-medium bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                    No scheduled activities for this day yet.
                  </div>
                ) : (
                  <div className="relative pl-6 sm:pl-10 space-y-6 before:absolute before:left-[19px] sm:before:left-[35px] before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-teal-500 before:via-slate-300 before:to-teal-500">
                    {day.activities.map((activity, idx) => {
                      const time24 = format24hTime(activity.startTime);

                      return (
                        <div key={activity.id} className="relative group">
                          {/* Left Timeline Node (Hour Bubble) */}
                          <div className="absolute -left-6 sm:-left-10 top-3 flex items-center justify-center">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white border-2 border-teal-600 text-slate-900 shadow-sm flex flex-col items-center justify-center font-bold z-10 group-hover:scale-110 group-hover:border-teal-700 transition-all">
                              <span className="text-[10px] sm:text-[11px] font-black text-teal-900 leading-tight">
                                {time24}
                              </span>
                            </div>
                          </div>

                          {/* Activity Card on Timeline Node */}
                          <div
                            onClick={() => onViewDetails(activity)}
                            className="ml-6 sm:ml-5 bg-slate-50/80 hover:bg-white rounded-2xl border border-slate-200/90 hover:border-teal-300 hover:shadow-md p-4 transition-all cursor-pointer"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              {/* Content */}
                              <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                                <img
                                  src={
                                    activity.image ||
                                    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80'
                                  }
                                  alt={activity.name}
                                  referrerPolicy="no-referrer"
                                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover shrink-0 border border-slate-200/80"
                                />

                                <div className="space-y-1 min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 text-[10px] font-bold border border-teal-200">
                                      {activity.type}
                                    </span>
                                    <span className="text-slate-400 text-xs">•</span>
                                    <span className="text-xs font-semibold text-slate-600">
                                      {activity.startTime || '09:30 AM'} ({activity.duration})
                                    </span>
                                    {activity.rating && (
                                      <>
                                        <span className="text-slate-400 text-xs">•</span>
                                        <div className="flex items-center gap-0.5 text-[11px] font-bold text-amber-600">
                                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                                          <span>{activity.rating.toFixed(1)}</span>
                                        </div>
                                      </>
                                    )}
                                  </div>

                                  <h4 className="text-sm sm:text-base font-bold text-slate-900 line-clamp-1 group-hover:text-teal-700 transition-colors">
                                    {activity.name}
                                  </h4>

                                  <p className="text-xs text-slate-500 line-clamp-1">
                                    {activity.description || 'Highlight of this destination.'}
                                  </p>
                                </div>
                              </div>

                              {/* Right: Cost & Quick Actions */}
                              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60">
                                <div className="text-left sm:text-right">
                                  <div className="text-xs sm:text-sm font-extrabold text-emerald-700">
                                    {activity.cost || 'Free'}
                                  </div>
                                  <div className="text-[10px] text-slate-400 font-medium">
                                    Estimated
                                  </div>
                                </div>

                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onQuickEdit(activity);
                                    }}
                                    className="p-2 rounded-xl text-slate-500 hover:text-teal-700 hover:bg-teal-50 border border-slate-200/80 transition-all cursor-pointer"
                                    title="Quick edit"
                                    aria-label="Quick edit activity"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onRemoveActivity(activity);
                                    }}
                                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all cursor-pointer"
                                    title="Remove from itinerary"
                                    aria-label="Remove activity"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
