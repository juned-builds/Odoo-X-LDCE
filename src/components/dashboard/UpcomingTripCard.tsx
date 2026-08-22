import React from 'react';
import {
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Luggage,
} from 'lucide-react';
import { Trip } from '../../types/dashboard';

interface UpcomingTripCardProps {
  trip: Trip;
  onViewItinerary: (trip: Trip) => void;
}

export const UpcomingTripCard: React.FC<UpcomingTripCardProps> = ({
  trip,
  onViewItinerary,
}) => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[300px]">
        {/* Visual Cover Side (5 cols on lg) */}
        <div className="lg:col-span-5 relative min-h-[220px] lg:min-h-full overflow-hidden">
          <img
            src={trip.coverImage}
            alt={trip.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-slate-950/40" />

          {/* Floating Status Badge */}
          <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-600/90 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-md">
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
            <span>Upcoming Adventure</span>
          </div>

          {/* Bottom stats overlay on image */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white text-xs font-medium drop-shadow-md">
            <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg">
              <Clock className="w-3.5 h-3.5 text-teal-300" />
              <span>{trip.duration}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg">
              <Luggage className="w-3.5 h-3.5 text-emerald-300" />
              <span>{trip.destinationCount} Destinations</span>
            </div>
          </div>
        </div>

        {/* Content Details Side (7 cols on lg) */}
        <div className="lg:col-span-7 p-6 sm:p-7 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Header / Route */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
                  Featured Itinerary
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{trip.startDate} — {trip.endDate}</span>
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-slate-900">
                {trip.name}
              </h3>

              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 pt-1">
                <MapPin className="w-4 h-4 text-teal-600 shrink-0" />
                <span className="truncate">{trip.route}</span>
              </div>
            </div>

            {/* Destination Route Stop Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {trip.destinations.map((dest, idx) => (
                <div
                  key={dest}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700"
                >
                  <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 text-[10px] flex items-center justify-center font-bold">
                    0{idx + 1}
                  </span>
                  <span>{dest}</span>
                </div>
              ))}
            </div>

            {/* Planning Readiness Progress Bar */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                  <span>Itinerary Readiness</span>
                </span>
                <span className="font-bold text-teal-700">{trip.progressPercentage}% Completed</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-500"
                  style={{ width: `${trip.progressPercentage}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500">
                Hotels & rail connections reserved. 3 activities remaining to schedule.
              </p>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
            <div className="text-xs text-slate-500 self-start sm:self-auto">
              Budget Allocated: <strong className="text-slate-900 font-semibold">{trip.currency}{trip.budgetSpent.toLocaleString()}</strong> of {trip.currency}{trip.budgetTotal.toLocaleString()}
            </div>

            <button
              type="button"
              onClick={() => onViewItinerary(trip)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm hover:shadow flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <span>View Itinerary</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
