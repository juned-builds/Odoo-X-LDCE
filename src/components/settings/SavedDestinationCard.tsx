import React from 'react';
import {
  MapPin,
  Star,
  Trash2,
  Plus,
  Compass,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { Destination } from '../../types/dashboard';

interface SavedDestinationCardProps {
  destination: Destination;
  onRemove: (destinationId: string) => void;
  onAddToTrip?: (destination: Destination) => void;
  onExploreActivities?: (destination: Destination) => void;
}

export const SavedDestinationCard: React.FC<SavedDestinationCardProps> = ({
  destination,
  onRemove,
  onAddToTrip,
  onExploreActivities,
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
    <div className="group rounded-3xl bg-white border border-slate-200/90 hover:border-teal-300 shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col overflow-hidden">
      {/* Cover Image & Badges */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-900">
        <img
          src={destination.image}
          alt={`${destination.city}, ${destination.country}`}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-black/20" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-black/50 text-white backdrop-blur-md border border-white/10">
            {destination.region}
          </span>

          <div className="flex items-center gap-1.5">
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border backdrop-blur-md ${getCostBadgeColor(
                destination.costIndex
              )}`}
            >
              {destination.costIndex}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950 backdrop-blur-md">
              <Star className="w-2.5 h-2.5 fill-slate-950 text-slate-950" />
              <span>{destination.rating.toFixed(1)}</span>
            </span>
          </div>
        </div>

        {/* City and Country Title */}
        <div className="absolute bottom-3 left-3 right-3 text-white space-y-0.5">
          <div className="flex items-center gap-1 text-[11px] text-teal-300 font-semibold">
            <MapPin className="w-3 h-3 text-teal-300 shrink-0" />
            <span>{destination.country}</span>
          </div>
          <h4 className="font-display font-bold text-lg text-white leading-tight drop-shadow-xs">
            {destination.city}
          </h4>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
          {destination.shortDescription || destination.description}
        </p>

        {/* Action Controls */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => onRemove(destination.id)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/80 transition-colors cursor-pointer"
            title="Remove from saved destinations"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Remove</span>
          </button>

          <div className="flex items-center gap-1.5">
            {onExploreActivities && (
              <button
                type="button"
                onClick={() => onExploreActivities(destination)}
                className="p-1.5 rounded-xl text-slate-600 hover:text-teal-700 hover:bg-teal-50 transition-colors cursor-pointer"
                title={`Explore activities in ${destination.city}`}
                aria-label={`Explore activities in ${destination.city}`}
              >
                <Compass className="w-4 h-4" />
              </button>
            )}

            {onAddToTrip && (
              <button
                type="button"
                onClick={() => onAddToTrip(destination)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Add to Trip</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
