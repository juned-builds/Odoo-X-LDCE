import React, { useState, useMemo, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Sparkles,
  Layers,
  ArrowRight,
  List,
  Eye,
} from 'lucide-react';
import { ItineraryDay, ItineraryActivity } from '../../types/itinerary';
import { Trip } from '../../types/dashboard';
import { format24hTime, formatLongDate, getDestinationCountry } from '../../utils/itineraryUtils';
import { ItineraryTimelineView } from './ItineraryTimelineView';
import { Button } from '../ui/Button';

interface ItineraryCalendarViewProps {
  days: ItineraryDay[];
  trip: Trip;
  onQuickEdit: (activity: ItineraryActivity) => void;
  onViewDetails: (activity: ItineraryActivity) => void;
  onRemoveActivity: (activity: ItineraryActivity) => void;
  onEditInBuilder: () => void;
}

export const ItineraryCalendarView: React.FC<ItineraryCalendarViewProps> = ({
  days,
  trip,
  onQuickEdit,
  onViewDetails,
  onRemoveActivity,
  onEditInBuilder,
}) => {
  // Calendar sub-mode: 'month' or 'timeline'
  const [calendarSubMode, setCalendarSubMode] = useState<'month' | 'timeline'>('month');

  // Selected Day number for deep-dive panel
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(1);

  // Active viewing month and year based on trip start date
  const tripStartDate = useMemo(() => {
    if (trip.startDate) {
      const d = new Date(trip.startDate);
      if (!isNaN(d.getTime())) return d;
    }
    return new Date();
  }, [trip.startDate]);

  const [currentYear, setCurrentYear] = useState(tripStartDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(tripStartDate.getMonth()); // 0 - 11

  // Update current month if trip changes
  useEffect(() => {
    setCurrentYear(tripStartDate.getFullYear());
    setCurrentMonth(tripStartDate.getMonth());
    if (days.length > 0) {
      setSelectedDayNumber(days[0].dayNumber);
    }
  }, [trip.id, trip.startDate]);

  // Navigate months
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleToday = () => {
    setCurrentYear(tripStartDate.getFullYear());
    setCurrentMonth(tripStartDate.getMonth());
    if (days.length > 0) {
      setSelectedDayNumber(days[0].dayNumber);
    }
  };

  // Month Name
  const monthName = useMemo(() => {
    const d = new Date(currentYear, currentMonth, 1);
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [currentYear, currentMonth]);

  // Map each calendar date string 'YYYY-MM-DD' to matching ItineraryDay
  const daysByDateStr = useMemo(() => {
    const map = new Map<string, ItineraryDay>();
    for (const d of days) {
      map.set(d.dateStr, d);
    }
    return map;
  }, [days]);

  // Generate calendar grid cells (42 cells: 6 rows of 7 days)
  const calendarCells = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const dayOfWeek = firstDayOfMonth.getDay(); // 0 (Sun) to 6 (Sat)

    const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const cells: {
      date: Date;
      dateStr: string;
      dayOfMonth: number;
      isCurrentMonth: boolean;
      itineraryDay?: ItineraryDay;
      isTripDay: boolean;
    }[] = [];

    // Prev month padding
    for (let i = dayOfWeek - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const d = new Date(currentYear, currentMonth - 1, dayNum);
      const dateStr = d.toISOString().split('T')[0];
      const itinDay = daysByDateStr.get(dateStr);
      cells.push({
        date: d,
        dateStr,
        dayOfMonth: dayNum,
        isCurrentMonth: false,
        itineraryDay: itinDay,
        isTripDay: !!itinDay,
      });
    }

    // Current month days
    for (let dayNum = 1; dayNum <= daysInCurrentMonth; dayNum++) {
      const d = new Date(currentYear, currentMonth, dayNum);
      const dateStr = d.toISOString().split('T')[0];
      const itinDay = daysByDateStr.get(dateStr);
      cells.push({
        date: d,
        dateStr,
        dayOfMonth: dayNum,
        isCurrentMonth: true,
        itineraryDay: itinDay,
        isTripDay: !!itinDay,
      });
    }

    // Next month padding to fill out 35 or 42 grid cells
    const remaining = (7 - (cells.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(currentYear, currentMonth + 1, i);
      const dateStr = d.toISOString().split('T')[0];
      const itinDay = daysByDateStr.get(dateStr);
      cells.push({
        date: d,
        dateStr,
        dayOfMonth: i,
        isCurrentMonth: false,
        itineraryDay: itinDay,
        isTripDay: !!itinDay,
      });
    }

    return cells;
  }, [currentYear, currentMonth, daysByDateStr]);

  // Selected Day data for deep-dive panel
  const selectedDay = useMemo(() => {
    return days.find((d) => d.dayNumber === selectedDayNumber) || days[0];
  }, [days, selectedDayNumber]);

  return (
    <div className="space-y-6">
      {/* Calendar Header Controls & View Mode Toggle */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Month Navigator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-white transition-all cursor-pointer shadow-2xs"
              title="Previous Month"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleToday}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-white transition-all cursor-pointer"
            >
              Trip Start
            </button>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-white transition-all cursor-pointer shadow-2xs"
              title="Next Month"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h3 className="text-base sm:text-xl font-bold font-display text-slate-900">
            {monthName}
          </h3>
        </div>

        {/* Sub-toggle: Month Grid vs Vertical Timeline */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <div className="inline-flex bg-slate-100 p-1 rounded-2xl border border-slate-200/80">
            <button
              type="button"
              onClick={() => setCalendarSubMode('month')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                calendarSubMode === 'month'
                  ? 'bg-white text-teal-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Month Grid</span>
            </button>

            <button
              type="button"
              onClick={() => setCalendarSubMode('timeline')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                calendarSubMode === 'timeline'
                  ? 'bg-white text-teal-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Vertical Timeline</span>
            </button>
          </div>
        </div>
      </div>

      {calendarSubMode === 'timeline' ? (
        /* Vertical Timeline Experience */
        <ItineraryTimelineView
          days={days}
          trip={trip}
          onQuickEdit={onQuickEdit}
          onViewDetails={onViewDetails}
          onRemoveActivity={onRemoveActivity}
          onEditInBuilder={onEditInBuilder}
        />
      ) : (
        /* Interactive Month Calendar Grid */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Month Grid (8 Cols on Desktop) */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            {/* Weekday Names Header */}
            <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200 text-center py-2.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Month Day Cells Grid */}
            <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 border-b border-slate-200">
              {calendarCells.map((cell, idx) => {
                const isSelected =
                  cell.itineraryDay && cell.itineraryDay.dayNumber === selectedDayNumber;

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      if (cell.itineraryDay) {
                        setSelectedDayNumber(cell.itineraryDay.dayNumber);
                      }
                    }}
                    className={`min-h-[85px] sm:min-h-[110px] p-1.5 sm:p-2 flex flex-col justify-between transition-all ${
                      cell.isTripDay
                        ? isSelected
                          ? 'bg-teal-50/70 ring-2 ring-teal-500 z-10 cursor-pointer'
                          : 'bg-teal-50/20 hover:bg-teal-50/50 cursor-pointer'
                        : cell.isCurrentMonth
                        ? 'bg-white text-slate-400'
                        : 'bg-slate-50/50 text-slate-300'
                    }`}
                  >
                    {/* Top Row: Date Number & Trip Day Pill */}
                    <div className="flex items-center justify-between gap-1">
                      <span
                        className={`text-xs font-bold ${
                          cell.isTripDay
                            ? 'text-slate-900 font-extrabold'
                            : cell.isCurrentMonth
                            ? 'text-slate-600'
                            : 'text-slate-400'
                        }`}
                      >
                        {cell.dayOfMonth}
                      </span>

                      {cell.itineraryDay && (
                        <span
                          className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md leading-none ${
                            isSelected
                              ? 'bg-teal-600 text-white'
                              : 'bg-teal-100 text-teal-800'
                          }`}
                        >
                          D{cell.itineraryDay.dayNumber}
                        </span>
                      )}
                    </div>

                    {/* Destination City Tag if Trip Day */}
                    {cell.itineraryDay && (
                      <div className="my-0.5">
                        <span className="text-[10px] font-bold text-slate-700 truncate block">
                          {cell.itineraryDay.destinationCity}
                        </span>
                      </div>
                    )}

                    {/* Activity Badges / Pills */}
                    {cell.itineraryDay && cell.itineraryDay.activities.length > 0 ? (
                      <div className="space-y-1 mt-auto">
                        {cell.itineraryDay.activities.slice(0, 2).map((act) => (
                          <div
                            key={act.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              onViewDetails(act);
                            }}
                            className="px-1.5 py-0.5 rounded-md bg-white border border-teal-200/80 text-[10px] text-slate-800 hover:bg-teal-50 font-medium truncate flex items-center gap-1 shadow-2xs"
                            title={`${act.startTime || ''} ${act.name}`}
                          >
                            <span className="text-[9px] font-bold text-teal-700 shrink-0">
                              {format24hTime(act.startTime)}
                            </span>
                            <span className="truncate">{act.name}</span>
                          </div>
                        ))}

                        {cell.itineraryDay.activities.length > 2 && (
                          <span className="text-[9px] font-bold text-slate-500 pl-1">
                            +{cell.itineraryDay.activities.length - 2} more
                          </span>
                        )}
                      </div>
                    ) : cell.isTripDay ? (
                      <div className="mt-auto text-[9px] text-slate-400 font-medium italic truncate">
                        Open day
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Side Inspector: Selected Day Timeline Panel (4 Cols on Desktop) */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 shadow-xs p-5 space-y-5 flex flex-col">
            {selectedDay ? (
              <>
                {/* Selected Day Header */}
                <div className="pb-4 border-b border-slate-100 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-teal-800 uppercase tracking-widest bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                      DAY {selectedDay.dayNumber} • {selectedDay.destinationCity.toUpperCase()}
                    </span>
                    <span className="text-xs font-extrabold text-emerald-700">
                      {selectedDay.formattedCost}
                    </span>
                  </div>

                  <h4 className="text-lg font-bold font-display text-slate-900">
                    {formatLongDate(selectedDay.dateStr)}
                  </h4>

                  <p className="text-xs text-slate-500">
                    {selectedDay.activities.length} planned activities • {selectedDay.formattedDuration}
                  </p>
                </div>

                {/* Day's Activities List */}
                <div className="flex-1 space-y-3 overflow-y-auto max-h-[480px] pr-1">
                  {selectedDay.activities.length === 0 ? (
                    <div className="py-8 text-center bg-slate-50/60 rounded-2xl border border-dashed border-slate-200 space-y-2">
                      <p className="text-xs text-slate-500 font-medium">
                        No activities scheduled for this day yet.
                      </p>
                      <button
                        type="button"
                        onClick={onEditInBuilder}
                        className="text-xs font-bold text-teal-700 hover:text-teal-800 underline cursor-pointer"
                      >
                        + Add in Itinerary Builder
                      </button>
                    </div>
                  ) : (
                    selectedDay.activities.map((activity) => (
                      <div
                        key={activity.id}
                        onClick={() => onViewDetails(activity)}
                        className="p-3 bg-slate-50 hover:bg-white rounded-2xl border border-slate-200/90 hover:border-teal-300 hover:shadow-xs transition-all cursor-pointer space-y-2 group"
                      >
                        <div className="flex items-start gap-2.5">
                          <img
                            src={
                              activity.image ||
                              'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80'
                            }
                            alt={activity.name}
                            referrerPolicy="no-referrer"
                            className="w-11 h-11 rounded-xl object-cover shrink-0"
                          />

                          <div className="min-w-0 flex-1 space-y-0.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black text-teal-800 bg-teal-50 px-1.5 py-0.2 rounded">
                                {activity.startTime || '09:30 AM'}
                              </span>
                              <span className="text-xs font-extrabold text-emerald-700">
                                {activity.cost || 'Free'}
                              </span>
                            </div>

                            <h5 className="text-xs font-bold text-slate-900 truncate group-hover:text-teal-700">
                              {activity.name}
                            </h5>

                            <div className="text-[10px] text-slate-500 truncate">
                              {activity.duration} • {activity.type}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Day Jump Action */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onEditInBuilder}
                    className="w-full"
                    leftIcon={<Layers className="w-3.5 h-3.5" />}
                  >
                    Edit Day in Builder
                  </Button>
                </div>
              </>
            ) : (
              <div className="py-12 text-center text-xs text-slate-400">
                Select a trip day on the calendar to inspect schedule details.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
