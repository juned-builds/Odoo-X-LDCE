import React, { useState, useEffect } from 'react';
import { X, Clock, Calendar, Save, AlertCircle } from 'lucide-react';
import { ItineraryActivity, ItineraryDay } from '../../types/itinerary';
import { PRESET_START_TIMES, parseDurationToMinutes, timeStringToMinutes } from '../../utils/itineraryUtils';
import { Button } from '../ui/Button';

interface QuickEditActivityModalProps {
  isOpen: boolean;
  activity: ItineraryActivity | null;
  days: ItineraryDay[];
  onClose: () => void;
  onSaveQuickEdit: (updatedActivity: {
    assignmentId: string;
    name: string;
    dayNumber: number;
    dateStr: string;
    destinationCity: string;
    startTime: string;
    duration: string;
    durationMinutes: number;
  }) => void;
}

export const QuickEditActivityModal: React.FC<QuickEditActivityModalProps> = ({
  isOpen,
  activity,
  days,
  onClose,
  onSaveQuickEdit,
}) => {
  const [name, setName] = useState(activity?.name || '');
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(
    activity?.dayNumber || 1
  );
  const [startTime, setStartTime] = useState(activity?.startTime || '09:30 AM');
  const [customStartTime, setCustomStartTime] = useState('');
  const [isCustomTime, setIsCustomTime] = useState(
    activity?.startTime ? !PRESET_START_TIMES.includes(activity.startTime) : false
  );
  const [duration, setDuration] = useState(activity?.duration || '2 hours');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && activity) {
      setName(activity.name || '');
      setSelectedDayNumber(activity.dayNumber || 1);
      const isPreset = PRESET_START_TIMES.includes(activity.startTime || '');
      setStartTime(activity.startTime || '09:30 AM');
      setIsCustomTime(!isPreset);
      if (!isPreset && activity.startTime) {
        setCustomStartTime(activity.startTime);
      } else {
        setCustomStartTime('');
      }
      setDuration(activity.duration || '2 hours');
      setError(null);
    }
  }, [isOpen, activity]);

  const handleClose = () => {
    if (typeof onClose === 'function') {
      onClose();
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activity) return;

    if (!name.trim()) {
      setError('Activity name is required');
      return;
    }

    const effectiveTime = isCustomTime ? customStartTime.trim() || '09:30 AM' : startTime;
    if (timeStringToMinutes(effectiveTime) === null) {
      setError('Please provide a valid time format (e.g. 10:30 AM or 02:00 PM)');
      return;
    }

    const targetDay = days.find((d) => d.dayNumber === selectedDayNumber);
    const dateStr = targetDay ? targetDay.dateStr : activity.date;
    const destCity = targetDay ? targetDay.destinationCity : activity.destinationCity;
    const durMins = parseDurationToMinutes(duration);

    onSaveQuickEdit({
      assignmentId: activity.id,
      name: name.trim(),
      dayNumber: selectedDayNumber,
      dateStr,
      destinationCity: destCity,
      startTime: effectiveTime,
      duration: duration.trim(),
      durationMinutes: durMins,
    });
    handleClose();
  };

  if (!isOpen || !activity) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
      <div
        className="bg-white w-full max-w-md rounded-3xl border border-slate-200 shadow-2xl overflow-hidden animate-scaleUp"
        role="dialog"
        aria-modal="true"
        aria-labelledby="quick-edit-title"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 id="quick-edit-title" className="text-base font-bold font-display text-white">
                Quick Edit Activity
              </h3>
              <p className="text-xs text-slate-300">
                Adjust scheduled date, start time, and duration
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-rose-700 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Activity Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Activity Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white focus:outline-hidden text-sm font-medium text-slate-800 transition-colors"
              placeholder="e.g. Louvre Museum"
            />
          </div>

          {/* Scheduled Day / Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-teal-600" />
              <span>Scheduled Day & Destination</span>
            </label>
            <select
              value={selectedDayNumber}
              onChange={(e) => setSelectedDayNumber(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white focus:outline-hidden text-sm font-medium text-slate-800 transition-colors cursor-pointer"
            >
              {days.map((d) => (
                <option key={d.dayNumber} value={d.dayNumber}>
                  Day {d.dayNumber} ({d.formattedDate}) — {d.destinationCity}
                </option>
              ))}
            </select>
          </div>

          {/* Start Time */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-teal-600" />
                <span>Start Time</span>
              </label>
              <button
                type="button"
                onClick={() => setIsCustomTime(!isCustomTime)}
                className="text-[11px] font-semibold text-teal-600 hover:text-teal-700 underline cursor-pointer"
              >
                {isCustomTime ? 'Use Presets' : 'Custom Time'}
              </button>
            </div>

            {isCustomTime ? (
              <input
                type="text"
                value={customStartTime}
                onChange={(e) => setCustomStartTime(e.target.value)}
                placeholder="e.g. 10:15 AM or 04:45 PM"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white focus:outline-hidden text-sm font-medium text-slate-800"
              />
            ) : (
              <select
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white focus:outline-hidden text-sm font-medium text-slate-800 cursor-pointer"
              >
                {PRESET_START_TIMES.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Duration */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Duration
            </label>
            <div className="grid grid-cols-3 gap-2 mb-2">
              {['1 hour', '2 hours', '3 hours', 'Half day (3h)', 'Full day (6h)'].map(
                (durPreset) => (
                  <button
                    key={durPreset}
                    type="button"
                    onClick={() => setDuration(durPreset)}
                    className={`px-2.5 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer truncate ${
                      duration === durPreset
                        ? 'bg-teal-50 border-teal-500 text-teal-800 shadow-2xs font-bold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {durPreset}
                  </button>
                )
              )}
            </div>
            <input
              type="text"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g. 2–3 hours, 45 mins"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white focus:outline-hidden text-sm font-medium text-slate-800"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <Button variant="ghost" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              leftIcon={<Save className="w-3.5 h-3.5" />}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
