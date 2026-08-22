import React from 'react';
import {
  Calendar,
  MapPin,
  ArrowRight,
  Luggage,
  Clock,
  Trash2,
  Edit3,
  Sparkles,
} from 'lucide-react';
import { Trip } from '../../types/dashboard';
import { formatTripDateRange } from '../../utils/dateUtils';
import { DEFAULT_TRIP_COVER } from '../trip/TripPreviewCard';

interface MyTripCardProps {
  trip: Trip;
  onView: (trip: Trip) => void;
  onEdit: (trip: Trip) => void;
  onDelete: (trip: Trip) => void;
}

export const MyTripCard: React.FC<MyTripCardProps> = ({
  trip,
  onView,
  onEdit,
  onDelete,
}) => {
  const getStatusBadge = (status: Trip['status']) => {
    switch (status) {
      case 'upcoming':
        return {
          label: 'Upcoming',
          badgeClass: 'bg-teal-500/90 text-white border-teal-400/40',
          indicatorClass: 'bg-emerald-300',
        };
      case 'completed':
        return {
          label: 'Completed',
          badgeClass: 'bg-slate-700/90 text-slate-100 border-slate-600/40',
          indicatorClass: 'bg-slate-400',
        };
      case 'planning':
      default:
        return {
          label: 'Planning',
          badgeClass: 'bg-amber-500/90 text-white border-amber-400/40',
          indicatorClass: 'bg-amber-200',
        };
    }
  };

  const statusInfo = getStatusBadge(trip.status);
  const coverImage = trip.coverImage || DEFAULT_TRIP_COVER;
  const dateRangeDisplay = formatTripDateRange(trip.startDate, trip.endDate);

  return (
    <div className="group rounded-3xl bg-white border border-slate-200/90 hover:border-teal-400/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden">
      {/* Cover Image Header */}
      <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-900">
        <img
          src={coverImage}
          alt={trip.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-black/20" />

        {/* Top Badges & Actions */}
        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md border shadow-sm ${statusInfo.badgeClass}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.indicatorClass}`} />
            <span>{statusInfo.label}</span>
          </span>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(trip);
            }}
            className="p-2 rounded-xl bg-black/40 hover:bg-rose-600 text-white/80 hover:text-white backdrop-blur-md border border-white/10 shadow-xs transition-all active:scale-95 cursor-pointer"
            title="Delete Trip"
            aria-label={`Delete ${trip.name}`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Bottom Overlay Info on Image */}
        <div className="absolute bottom-3.5 left-3.5 right-3.5 flex items-center justify-between text-white text-xs font-medium drop-shadow-md">
          <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
            <Clock className="w-3.5 h-3.5 text-teal-300" />
            <span>{trip.duration}</span>
          </div>

          <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
            <Luggage className="w-3.5 h-3.5 text-emerald-300" />
            <span>
              {trip.destinationCount} {trip.destinationCount === 1 ? 'Destination' : 'Destinations'}
            </span>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2.5">
          {/* Trip Name */}
          <h3 className="font-display font-bold text-lg text-slate-900 line-clamp-1 group-hover:text-teal-700 transition-colors">
            {trip.name}
          </h3>

          {/* Route & Dates */}
          <div className="space-y-1.5 text-xs text-slate-600">
            <div className="flex items-center gap-2 font-medium">
              <MapPin className="w-4 h-4 text-teal-600 shrink-0" />
              <span className="truncate text-slate-700">{trip.route || trip.name}</span>
            </div>

            <div className="flex items-center gap-2 text-slate-500">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{dateRangeDisplay}</span>
            </div>
          </div>

          {/* Description Snippet when available */}
          {trip.description ? (
            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100 italic">
              "{trip.description}"
            </p>
          ) : (
            <p className="text-xs text-slate-400 italic">
              No description added yet.
            </p>
          )}
        </div>

        {/* Action Button Row */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={() => onEdit(trip)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 transition-all active:scale-[0.98] cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-slate-500" />
            <span>Edit Trip</span>
          </button>

          <button
            type="button"
            onClick={() => onView(trip)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 shadow-xs hover:shadow transition-all active:scale-[0.98] cursor-pointer"
          >
            <span>View</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
