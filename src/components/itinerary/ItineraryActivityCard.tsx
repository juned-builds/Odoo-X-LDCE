import React, { useState } from 'react';
import {
  Clock,
  DollarSign,
  Star,
  ChevronUp,
  ChevronDown,
  Trash2,
  Calendar,
  Sparkles,
  MapPin,
  MoveRight,
  MoreHorizontal,
} from 'lucide-react';
import { ItineraryActivity } from '../../types/itinerary';
import { PRESET_START_TIMES } from '../../utils/itineraryUtils';

interface ItineraryActivityCardProps {
  activity: ItineraryActivity;
  dayIndex: number;
  totalDays: number;
  isFirst: boolean;
  isLast: boolean;
  currency: string;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onMoveToDay: (targetDayNumber: number) => void;
  onUpdateStartTime: (newTime: string) => void;
  onRemove: () => void;
}

export const ItineraryActivityCard: React.FC<ItineraryActivityCardProps> = ({
  activity,
  dayIndex,
  totalDays,
  isFirst,
  isLast,
  currency,
  onMoveUp,
  onMoveDown,
  onMoveToDay,
  onUpdateStartTime,
  onRemove,
}) => {
  const [showMoveMenu, setShowMoveMenu] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const dayNumbers = Array.from({ length: totalDays }, (_, i) => i + 1).filter(
    (d) => d !== activity.dayNumber
  );

  return (
    <div className="relative group bg-white hover:bg-slate-50/70 rounded-2xl border border-slate-200/90 hover:border-slate-300 p-3.5 sm:p-4 transition-all shadow-xs hover:shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      {/* Left side: Time Pill, Thumbnail, Info */}
      <div className="flex items-start gap-3.5 flex-1 min-w-0 w-full sm:w-auto">
        {/* Scheduled Start Time Badge */}
        <div className="shrink-0 flex flex-col items-center">
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowTimePicker(!showTimePicker)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-teal-900 text-teal-300 hover:text-white text-[11px] font-bold shadow-xs transition-all cursor-pointer"
              title="Click to adjust start time"
            >
              <Clock className="w-3 h-3 text-teal-400" />
              <span>{activity.startTime || '10:00 AM'}</span>
            </button>

            {/* Time Picker Dropdown */}
            {showTimePicker && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setShowTimePicker(false)}
                />
                <div className="absolute top-full left-0 mt-1.5 z-40 w-36 max-h-48 overflow-y-auto bg-slate-900 rounded-xl shadow-xl border border-slate-700 py-1 text-xs">
                  <div className="px-2.5 py-1 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
                    Set Start Time
                  </div>
                  {PRESET_START_TIMES.map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => {
                        onUpdateStartTime(time);
                        setShowTimePicker(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 hover:bg-teal-600 hover:text-white transition-colors cursor-pointer ${
                        activity.startTime === time
                          ? 'text-teal-300 font-bold bg-slate-800'
                          : 'text-slate-200'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <span className="text-[10px] text-slate-400 mt-1 font-medium">
            {activity.duration}
          </span>
        </div>

        {/* Thumbnail Image */}
        <img
          src={
            activity.image ||
            'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=400&q=80'
          }
          alt={activity.name}
          referrerPolicy="no-referrer"
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover shrink-0 border border-slate-200 shadow-xs"
        />

        {/* Info */}
        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider">
              {activity.type}
            </span>

            {activity.isCustom && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold">
                <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                Custom
              </span>
            )}

            {activity.cost && (
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                {activity.cost}
              </span>
            )}

            {activity.rating && !activity.isCustom && (
              <span className="text-[11px] font-bold text-slate-700 flex items-center gap-0.5">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                {activity.rating}
              </span>
            )}
          </div>

          <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
            {activity.name}
          </h4>

          {activity.description && (
            <p className="text-[11px] text-slate-500 line-clamp-1">
              {activity.description}
            </p>
          )}

          {activity.notes && (
            <p className="text-[11px] text-teal-800 bg-teal-50/80 px-2 py-0.5 rounded-md inline-block">
              Note: {activity.notes}
            </p>
          )}
        </div>
      </div>

      {/* Right side: Reorder Up/Down, Move to Day, Remove Action Bar */}
      <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
        {/* Reordering Controls */}
        <div className="flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200">
          <button
            type="button"
            disabled={isFirst}
            onClick={onMoveUp}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isFirst
                ? 'text-slate-300 cursor-not-allowed'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
            title="Move activity earlier"
          >
            <ChevronUp className="w-4 h-4" />
          </button>

          <button
            type="button"
            disabled={isLast}
            onClick={onMoveDown}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isLast
                ? 'text-slate-300 cursor-not-allowed'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
            title="Move activity later"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        {/* Move to another Day */}
        {dayNumbers.length > 0 && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMoveMenu(!showMoveMenu)}
              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 flex items-center gap-1 transition-all cursor-pointer"
              title="Move to different day"
            >
              <MoveRight className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Move</span>
            </button>

            {showMoveMenu && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setShowMoveMenu(false)}
                />
                <div className="absolute right-0 top-full mt-1.5 z-40 w-40 max-h-48 overflow-y-auto bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 text-xs animate-scaleUp">
                  <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-100">
                    Move to Day:
                  </div>
                  {dayNumbers.map((dNum) => (
                    <button
                      key={dNum}
                      type="button"
                      onClick={() => {
                        onMoveToDay(dNum);
                        setShowMoveMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-slate-700 hover:bg-teal-50 hover:text-teal-900 font-medium transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <Calendar className="w-3.5 h-3.5 text-teal-600" />
                      <span>Day {dNum}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Delete Activity */}
        <button
          type="button"
          onClick={onRemove}
          className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
          title="Remove from this day"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
