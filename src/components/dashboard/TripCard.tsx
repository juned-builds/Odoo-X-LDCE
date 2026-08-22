import React from 'react';
import { Calendar, MapPin, ArrowRight, Luggage } from 'lucide-react';
import { Trip } from '../../types/dashboard';
import { formatTripDateRange } from '../../utils/dateUtils';
import { DEFAULT_TRIP_COVER } from '../trip/TripPreviewCard';

interface TripCardProps {
  trip: Trip;
  onView: (trip: Trip) => void;
  onEdit: (trip: Trip) => void;
  onDelete?: (trip: Trip) => void;
}

export const TripCard: React.FC<TripCardProps> = ({ trip, onView, onEdit }) => {
  const getStatusBadge = (status: Trip['status']) => {
    switch (status) {
      case 'upcoming':
        return {
          label: 'Upcoming',
          style: 'bg-teal-50 text-teal-700 border-teal-200',
        };
      case 'completed':
        return {
          label: 'Completed',
          style: 'bg-slate-100 text-slate-700 border-slate-200',
        };
      case 'planning':
        return {
          label: 'Planning',
          style: 'bg-amber-50 text-amber-700 border-amber-200',
        };
      default:
        return {
          label: 'Draft',
          style: 'bg-slate-50 text-slate-600 border-slate-200',
        };
    }
  };

  const statusInfo = getStatusBadge(trip.status);
  const coverImage = trip.coverImage || DEFAULT_TRIP_COVER;
  const dateRangeDisplay = formatTripDateRange(trip.startDate, trip.endDate);

  return (
    <div className="group rounded-2xl bg-white border border-slate-200/90 hover:border-teal-300 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden">
      {/* Visual Cover */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-900">
        <img
          src={coverImage}
          alt={trip.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/10" />

        {/* Top Status & Duration */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md ${statusInfo.style}`}
          >
            {statusInfo.label}
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-black/50 text-white backdrop-blur-md border border-white/10">
            {trip.duration}
          </span>
        </div>

        {/* Bottom Destination Count Overlay */}
        <div className="absolute bottom-3 left-3 text-white text-xs font-semibold drop-shadow flex items-center gap-1.5">
          <Luggage className="w-3.5 h-3.5 text-teal-300" />
          <span>{trip.destinationCount} {trip.destinationCount === 1 ? 'Destination' : 'Destinations'}</span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          <h4 className="font-display font-bold text-base text-slate-900 line-clamp-1 group-hover:text-teal-700 transition-colors">
            {trip.name}
          </h4>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span className="truncate">{trip.route || trip.name}</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{dateRangeDisplay}</span>
          </div>

          {trip.description && (
            <p className="text-xs text-slate-500 line-clamp-2 pt-1">
              {trip.description}
            </p>
          )}
        </div>

        {/* Action Button Row */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => onEdit(trip)}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Edit Trip
          </button>

          <button
            type="button"
            onClick={() => onView(trip)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-700 px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 transition-colors cursor-pointer"
          >
            <span>View</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
