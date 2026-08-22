import React, { useState } from 'react';
import { Sparkles, X, Clock, DollarSign, MapPin, Tag, FileText } from 'lucide-react';
import { ActivityType, CostTier } from '../../types/activity';
import { CustomActivityInput } from '../../types/itinerary';
import { PRESET_START_TIMES, parseDurationToMinutes, parseCostToNumeric } from '../../utils/itineraryUtils';
import { Button } from '../ui/Button';

interface AddCustomActivityModalProps {
  isOpen: boolean;
  dayNumber: number;
  dateStr: string;
  destinationCity: string;
  onClose: () => void;
  onAddCustomActivity: (input: CustomActivityInput) => void;
}

const ACTIVITY_TYPES: ActivityType[] = [
  'Sightseeing',
  'Culture',
  'Food',
  'Adventure',
  'Nature',
  'Shopping',
  'Nightlife',
  'Family',
];

const DURATION_PRESETS = [
  { label: '30 mins', value: '30 mins', minutes: 30 },
  { label: '1 hour', value: '1 hour', minutes: 60 },
  { label: '1.5 hours', value: '1.5 hours', minutes: 90 },
  { label: '2 hours', value: '2 hours', minutes: 120 },
  { label: '3 hours', value: '3 hours', minutes: 180 },
  { label: '4 hours', value: '4 hours', minutes: 240 },
  { label: 'Half Day (4h)', value: 'Half Day (4h)', minutes: 240 },
  { label: 'Full Day (6h+)', value: 'Full Day (6h)', minutes: 360 },
];

export const AddCustomActivityModal: React.FC<AddCustomActivityModalProps> = ({
  isOpen,
  dayNumber,
  dateStr,
  destinationCity,
  onClose,
  onAddCustomActivity,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<ActivityType>('Sightseeing');
  const [duration, setDuration] = useState('2 hours');
  const [customDuration, setCustomDuration] = useState('');
  const [cost, setCost] = useState('Free');
  const [startTime, setStartTime] = useState('10:00 AM');
  const [location, setLocation] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter an activity name');
      return;
    }

    const finalDuration = duration === 'custom' ? customDuration || '2 hours' : duration;
    const durMinutes = parseDurationToMinutes(finalDuration);
    const costNum = parseCostToNumeric(cost);

    let costTier: CostTier = 'Free';
    if (costNum > 0) {
      if (costNum <= 20) costTier = '$';
      else if (costNum <= 50) costTier = '$$';
      else if (costNum <= 100) costTier = '$$$';
      else costTier = '$$$$';
    }

    // Default pleasant placeholder photo based on activity type
    const typeImageMap: Record<string, string> = {
      Food: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
      Culture: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=80',
      Adventure: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=800&q=80',
      Nature: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
      Shopping: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80',
      Nightlife: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
      Family: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=800&q=80',
      Sightseeing: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80',
    };

    onAddCustomActivity({
      name: name.trim(),
      description: description.trim() || `Custom planned event in ${destinationCity}.`,
      type,
      duration: finalDuration,
      durationMinutes: durMinutes,
      cost: cost.trim() || 'Free',
      costNumeric: costNum,
      costTier,
      startTime,
      location: location.trim() || destinationCity,
      image: typeImageMap[type] || typeImageMap.Sightseeing,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-scaleUp z-10 max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-slate-900 text-white shrink-0 flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-teal-300 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-teal-400" />
              <span>Day {dayNumber} • {destinationCity}</span>
            </div>
            <h2 className="text-xl font-bold font-display text-white">
              Add Custom Activity
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

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 text-xs sm:text-sm">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Activity Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Activity Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Traditional Pasta Making Workshop, Rooftop Sunset Drinks..."
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:bg-white focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-xs sm:text-sm transition-all"
            />
          </div>

          {/* Type & Start Time Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Activity Type */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-teal-600" />
                <span>Category / Type</span>
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ActivityType)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 cursor-pointer"
              >
                {ACTIVITY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Start Time */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-teal-600" />
                <span>Start Time</span>
              </label>
              <select
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 cursor-pointer"
              >
                {PRESET_START_TIMES.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Duration & Cost Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Duration */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Duration</span>
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 cursor-pointer"
              >
                {DURATION_PRESETS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
                <option value="custom">Custom duration...</option>
              </select>
              {duration === 'custom' && (
                <input
                  type="text"
                  placeholder="e.g. 45 mins, 2.5 hours"
                  value={customDuration}
                  onChange={(e) => setCustomDuration(e.target.value)}
                  className="mt-2 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              )}
            </div>

            {/* Estimated Cost */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-slate-500" />
                <span>Estimated Cost</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Free, $30, €45, ₹2,000"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-xs sm:text-sm focus:bg-white focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span>Location / Neighborhood (Optional)</span>
            </label>
            <input
              type="text"
              placeholder={`e.g. Historic Quarter, ${destinationCity} Central Station...`}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-xs sm:text-sm focus:bg-white focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>

          {/* Description / Notes */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>Description / Notes (Optional)</span>
            </label>
            <textarea
              rows={2}
              placeholder="Add key highlights, reservation codes, dress codes, or meeting points..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-xs sm:text-sm focus:bg-white focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 resize-none"
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
            <Button variant="outline" size="sm" onClick={onClose} type="button">
              Cancel
            </Button>

            <Button variant="primary" size="sm" type="submit" leftIcon={<Sparkles className="w-3.5 h-3.5" />}>
              Add Custom Activity
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
