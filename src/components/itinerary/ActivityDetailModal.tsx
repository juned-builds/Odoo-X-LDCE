import React from 'react';
import {
  X,
  Clock,
  Calendar,
  MapPin,
  DollarSign,
  Star,
  Tag,
  Edit3,
  Trash2,
  CheckCircle2,
  Compass,
} from 'lucide-react';
import { ItineraryActivity } from '../../types/itinerary';
import { getDestinationCountry, formatLongDate } from '../../utils/itineraryUtils';
import { Button } from '../ui/Button';

interface ActivityDetailModalProps {
  isOpen: boolean;
  activity: ItineraryActivity | null;
  onClose: () => void;
  onQuickEdit: (activity: ItineraryActivity) => void;
  onRemove: (activity: ItineraryActivity) => void;
}

export const ActivityDetailModal: React.FC<ActivityDetailModalProps> = ({
  isOpen,
  activity,
  onClose,
  onQuickEdit,
  onRemove,
}) => {
  if (!isOpen || !activity) return null;

  const country = getDestinationCountry(activity.destinationCity);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
      <div
        className="bg-white w-full max-w-lg rounded-3xl border border-slate-200 shadow-2xl overflow-hidden animate-scaleUp flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="activity-detail-title"
      >
        {/* Cover Image & Quick Close */}
        <div className="relative h-52 sm:h-60 w-full bg-slate-900 shrink-0">
          <img
            src={
              activity.image ||
              'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80'
            }
            alt={activity.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-black/30" />

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md transition-all cursor-pointer shadow-md"
            aria-label="Close details"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Type and Day pill on top of image */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-teal-600/90 backdrop-blur-md text-white text-xs font-bold shadow-sm">
              Day {activity.dayNumber}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-md text-slate-900 text-xs font-bold shadow-sm">
              {activity.type}
            </span>
          </div>

          {/* Bottom Title on Image */}
          <div className="absolute bottom-4 left-4 right-4 text-white space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-200 font-medium">
              <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
              <span>
                {activity.destinationCity}
                {country ? `, ${country}` : ''}
              </span>
            </div>
            <h3
              id="activity-detail-title"
              className="text-lg sm:text-xl font-bold font-display text-white line-clamp-2 drop-shadow-sm"
            >
              {activity.name}
            </h3>
          </div>
        </div>

        {/* Scrollable Information Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Start Time */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5 text-teal-600" />
                <span>Time</span>
              </div>
              <p className="text-sm font-bold text-slate-900">
                {activity.startTime || '09:30 AM'}
              </p>
            </div>

            {/* Duration */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <Compass className="w-3.5 h-3.5 text-indigo-600" />
                <span>Duration</span>
              </div>
              <p className="text-sm font-bold text-slate-900 truncate">
                {activity.duration || '2 hours'}
              </p>
            </div>

            {/* Cost */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                <span>Est. Cost</span>
              </div>
              <p className="text-sm font-bold text-emerald-700 truncate">
                {activity.cost || 'Free'}
              </p>
            </div>

            {/* Rating */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>Rating</span>
              </div>
              <p className="text-sm font-bold text-slate-900">
                {activity.rating ? activity.rating.toFixed(2) : '4.85'} / 5
              </p>
            </div>
          </div>

          {/* Scheduled Date Banner */}
          <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-100 flex items-center justify-between gap-3 text-xs text-teal-900">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-teal-600 shrink-0" />
              <span className="font-semibold">
                Scheduled for {formatLongDate(activity.date)} (Day {activity.dayNumber})
              </span>
            </div>
            {activity.isCustom && (
              <span className="px-2 py-0.5 rounded-md bg-teal-200/60 text-teal-800 text-[10px] font-bold">
                Custom Entry
              </span>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              About this Activity
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {activity.description ||
                'Immerse yourself in authentic local experiences, renowned architecture, and celebrated cultural landmarks.'}
            </p>
          </div>

          {/* Notes / Specific location details if any */}
          {activity.notes && (
            <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-1">
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
                Itinerary Notes
              </span>
              <p className="text-xs text-amber-900 leading-relaxed">
                {activity.notes}
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={() => {
              onClose();
              onRemove(activity);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Remove</span>
          </button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onClose();
                onQuickEdit(activity);
              }}
              leftIcon={<Edit3 className="w-3.5 h-3.5" />}
            >
              Quick Edit
            </Button>
            <Button variant="primary" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
