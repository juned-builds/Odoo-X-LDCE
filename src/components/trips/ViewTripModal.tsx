import React from 'react';
import {
  X,
  Calendar,
  MapPin,
  Clock,
  Luggage,
  Edit3,
  Sparkles,
  FileText,
  CheckCircle2,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Trip } from '../../types/dashboard';
import { formatTripDateRange } from '../../utils/dateUtils';
import { DEFAULT_TRIP_COVER } from '../trip/TripPreviewCard';
import { Button } from '../ui/Button';

interface ViewTripModalProps {
  isOpen: boolean;
  trip: Trip | null;
  onClose: () => void;
  onEdit: (trip: Trip) => void;
  onBuildItinerary?: (trip: Trip) => void;
}

export const ViewTripModal: React.FC<ViewTripModalProps> = ({
  isOpen,
  trip,
  onClose,
  onEdit,
  onBuildItinerary,
}) => {
  if (!isOpen || !trip) return null;

  const dateRangeDisplay = formatTripDateRange(trip.startDate, trip.endDate);
  const coverImage = trip.coverImage || DEFAULT_TRIP_COVER;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-xl rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-scaleUp z-10 max-h-[90vh] flex flex-col">
        {/* Cover Photo Header */}
        <div className="relative h-48 sm:h-56 w-full bg-slate-900 shrink-0">
          <img
            src={coverImage}
            alt={trip.name}
            className="w-full h-full object-cover object-center"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-black/30" />

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3.5 right-3.5 p-2 rounded-xl bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-all active:scale-95 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Top Status Badge */}
          <div className="absolute top-3.5 left-3.5">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-600/90 text-white backdrop-blur-md shadow-xs">
              {trip.status}
            </span>
          </div>

          {/* Title on Cover */}
          <div className="absolute bottom-4 left-4 right-4 text-white space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-teal-300 font-semibold">
              <MapPin className="w-3.5 h-3.5 text-teal-300" />
              <span>{trip.route || trip.name}</span>
            </div>
            <h2 className="font-display font-bold text-xl sm:text-2xl text-white leading-tight drop-shadow">
              {trip.name}
            </h2>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Key Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Duration
              </span>
              <span className="text-sm font-bold text-slate-900 mt-0.5">
                {trip.duration}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Dates
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5 truncate">
                {dateRangeDisplay}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col col-span-2 sm:col-span-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Destinations
              </span>
              <span className="text-sm font-bold text-slate-900 mt-0.5">
                {trip.destinationCount} Stops
              </span>
            </div>
          </div>

          {/* Description */}
          {trip.description && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>Trip Overview</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100">
                {trip.description}
              </p>
            </div>
          )}

          {/* Planned Activities Section */}
          {trip.activities && trip.activities.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                  <span>Planned Activities ({trip.activities.length})</span>
                </div>
              </div>

              <div className="space-y-2">
                {trip.activities.map((act) => (
                  <div
                    key={act.id}
                    className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-teal-300 transition-colors"
                  >
                    <img
                      src={act.image}
                      alt={act.name}
                      className="w-12 h-12 rounded-xl object-cover shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {act.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 truncate">
                        {act.destinationCity} • {act.type} • {act.duration}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-teal-700 px-2 py-1 bg-teal-50 rounded-lg border border-teal-200 shrink-0">
                      {act.cost}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Module 7 Itinerary Action Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-900 to-slate-900 text-white flex items-center justify-between gap-4 shadow-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-teal-300">
                <Layers className="w-4 h-4 text-teal-400" />
                <span>Day-by-Day Itinerary</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed max-w-xs">
                Organize scheduled activities, set arrival times, and build your custom timeline.
              </p>
            </div>

            {onBuildItinerary && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onBuildItinerary(trip);
                }}
                className="px-3.5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer shrink-0"
              >
                <span>Build Itinerary</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>

          <div className="flex items-center gap-2">
            {onBuildItinerary && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  onClose();
                  onBuildItinerary(trip);
                }}
                leftIcon={<Layers className="w-3.5 h-3.5" />}
              >
                Open Itinerary
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onClose();
                onEdit(trip);
              }}
              leftIcon={<Edit3 className="w-3.5 h-3.5" />}
            >
              Edit Details
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
