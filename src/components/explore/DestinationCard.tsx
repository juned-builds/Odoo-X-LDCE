import React from 'react';
import {
  MapPin,
  Star,
  Calendar,
  Sparkles,
  Plus,
  ArrowRight,
  TrendingUp,
  Compass,
} from 'lucide-react';
import { Destination } from '../../types/dashboard';

interface DestinationCardProps {
  destination: Destination;
  onViewDetails: (destination: Destination) => void;
  onAddToTrip: (destination: Destination) => void;
}

export const DestinationCard: React.FC<DestinationCardProps> = ({
  destination,
  onViewDetails,
  onAddToTrip,
}) => {
  const getCostBadgeColor = (cost: Destination['costIndex']) => {
    switch (cost) {
      case '$':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case '$$':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case '$$$':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case '$$$$':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="group rounded-3xl bg-white border border-slate-200/90 hover:border-teal-400/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden">
      {/* Visual Cover Header */}
      <div className="relative h-52 w-full overflow-hidden bg-slate-900">
        <img
          src={destination.image}
          alt={`${destination.city}, ${destination.country}`}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-black/20" />

        {/* Top Badges */}
        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between">
          {/* Region Pill */}
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-black/50 text-white backdrop-blur-md border border-white/10 tracking-wide">
            {destination.region}
          </span>

          {/* Rating & Cost Badge */}
          <div className="flex items-center gap-1.5">
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-bold border backdrop-blur-md ${getCostBadgeColor(
                destination.costIndex
              )}`}
              title={`Cost Index: ${destination.costIndex}`}
            >
              {destination.costIndex}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400/95 text-slate-950 backdrop-blur-md shadow-xs">
              <Star className="w-3 h-3 fill-slate-950 text-slate-950" />
              <span>{destination.rating.toFixed(1)}</span>
            </span>
          </div>
        </div>

        {/* Bottom City & Country overlay */}
        <div className="absolute bottom-3.5 left-3.5 right-3.5 text-white space-y-0.5">
          <div className="flex items-center gap-1.5 text-xs text-teal-300 font-semibold">
            <MapPin className="w-3.5 h-3.5 text-teal-300 shrink-0" />
            <span>{destination.country}</span>
          </div>
          <h3 className="font-display font-bold text-xl sm:text-2xl text-white tracking-tight leading-snug drop-shadow-sm">
            {destination.city}
          </h3>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          {/* Short Description */}
          <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
            {destination.shortDescription || destination.description}
          </p>

          {/* Best Season Indicator */}
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
            <Calendar className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span className="truncate">
              Best season: <strong className="text-slate-700 font-semibold">{destination.bestSeason}</strong>
            </span>
          </div>

          {/* Highlights Preview Tags (first 2) */}
          {destination.highlights && destination.highlights.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              {destination.highlights.slice(0, 2).map((highlight) => (
                <span
                  key={highlight}
                  className="text-[11px] font-medium text-slate-600 bg-slate-100/80 px-2.5 py-1 rounded-lg border border-slate-200/60 truncate max-w-[180px]"
                >
                  • {highlight}
                </span>
              ))}
              {destination.highlights.length > 2 && (
                <span className="text-[10px] font-semibold text-slate-400 px-1">
                  +{destination.highlights.length - 2} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Action Button Row */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => onViewDetails(destination)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 transition-all active:scale-[0.98] cursor-pointer"
          >
            <span>View Details</span>
          </button>

          <button
            type="button"
            onClick={() => onAddToTrip(destination)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 shadow-xs hover:shadow transition-all active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add to Trip</span>
          </button>
        </div>
      </div>
    </div>
  );
};
