import React from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Luggage,
  Sparkles,
  Compass,
  FileText,
  CheckCircle,
} from 'lucide-react';
import { calculateTripDuration, formatTripDisplayDate } from '../../utils/dateUtils';

interface TripPreviewCardProps {
  name: string;
  startDate: string;
  endDate: string;
  description: string;
  coverImage: string;
}

// Fallback high quality travel placeholder if none chosen
export const DEFAULT_TRIP_COVER =
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80';

export const TripPreviewCard: React.FC<TripPreviewCardProps> = ({
  name,
  startDate,
  endDate,
  description,
  coverImage,
}) => {
  const durationInfo = calculateTripDuration(startDate, endDate);
  const activeCover = coverImage || DEFAULT_TRIP_COVER;

  const displayStartDate = startDate ? formatTripDisplayDate(startDate) : 'Start date';
  const displayEndDate = endDate ? formatTripDisplayDate(endDate) : 'End date';
  const hasValidDates = durationInfo.isValid;

  return (
    <div className="sticky top-24 space-y-4">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-teal-600" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
            Live Trip Preview
          </h3>
        </div>
        <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
          Auto-Syncs
        </span>
      </div>

      {/* Main Preview Card Container */}
      <div className="rounded-3xl bg-white border border-slate-200/90 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col">
        {/* Cover Photo Area */}
        <div className="relative h-56 sm:h-64 w-full overflow-hidden bg-slate-900">
          <img
            src={activeCover}
            alt={name || 'Trip preview cover'}
            className="w-full h-full object-cover object-center transition-transform duration-700"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-black/20" />

          {/* Top Status Badge & Photo Source Indicator */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-600/90 text-white backdrop-blur-md shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
              <span>Draft Plan</span>
            </span>

            {durationInfo.isValid && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-black/50 text-teal-300 backdrop-blur-md border border-white/10">
                <Clock className="w-3.5 h-3.5" />
                <span>{durationInfo.formattedDuration}</span>
              </span>
            )}
          </div>

          {/* Bottom Overlay Title in Cover */}
          <div className="absolute bottom-4 left-4 right-4 text-white space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-teal-300 font-semibold uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5" />
              <span>Personalized Itinerary</span>
            </div>
            <h4 className="font-display font-bold text-xl sm:text-2xl text-white leading-tight drop-shadow-md line-clamp-2">
              {name.trim() || 'Untitled Adventure'}
            </h4>
          </div>
        </div>

        {/* Details Body */}
        <div className="p-5 sm:p-6 space-y-5 flex-1 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Date & Timing Schedule Box */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-teal-600" />
                  <span>Travel Window</span>
                </span>
                {hasValidDates && (
                  <span className="text-teal-700 font-bold lowercase">
                    {durationInfo.formattedDuration}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between gap-2 text-xs sm:text-sm font-bold text-slate-800 pt-0.5">
                <span className={startDate ? 'text-slate-900' : 'text-slate-400 font-normal italic'}>
                  {displayStartDate}
                </span>
                <span className="text-slate-400 font-normal">→</span>
                <span className={endDate ? 'text-slate-900' : 'text-slate-400 font-normal italic'}>
                  {displayEndDate}
                </span>
              </div>
            </div>

            {/* Trip Description Preview */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>Trip Overview</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-4 bg-white p-3 rounded-xl border border-slate-100 italic">
                {description.trim() ? (
                  `"${description.trim()}"`
                ) : (
                  <span className="text-slate-400 not-italic">
                    Add a description to summarize your travel goals, companionship, or route ideas...
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Quick Prototype Guidance Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
              <span>Ready for itinerary scheduling</span>
            </div>
            <span className="text-slate-400">Module 3 Scope</span>
          </div>
        </div>
      </div>
    </div>
  );
};
