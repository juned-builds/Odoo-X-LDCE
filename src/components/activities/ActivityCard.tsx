import React from 'react';
import {
  Star,
  Clock,
  Plus,
  Check,
  CheckCircle2,
  Sparkles,
  MapPin,
  Tag,
  Sunrise,
  Sun,
  Eye,
} from 'lucide-react';
import { Activity } from '../../types/activity';

interface ActivityCardProps {
  activity: Activity;
  isAdded?: boolean;
  addedTripName?: string;
  onViewDetails: (activity: Activity) => void;
  onAddToTrip: (activity: Activity) => void;
  onRemoveFromTrip?: (activity: Activity) => void;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  isAdded = false,
  addedTripName,
  onViewDetails,
  onAddToTrip,
  onRemoveFromTrip,
}) => {
  const getTypeColor = (type: Activity['type']) => {
    switch (type) {
      case 'Sightseeing':
        return 'bg-blue-500/90 text-white';
      case 'Culture':
        return 'bg-purple-500/90 text-white';
      case 'Food':
        return 'bg-amber-500/90 text-white';
      case 'Adventure':
        return 'bg-emerald-600/90 text-white';
      case 'Nature':
        return 'bg-teal-600/90 text-white';
      case 'Shopping':
        return 'bg-rose-500/90 text-white';
      case 'Nightlife':
        return 'bg-indigo-600/90 text-white';
      case 'Family':
        return 'bg-cyan-600/90 text-white';
      default:
        return 'bg-slate-700/90 text-white';
    }
  };

  const getCostBadgeColor = (tier: Activity['costTier']) => {
    switch (tier) {
      case 'Free':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case '$':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case '$$':
        return 'bg-blue-50 text-blue-700 border-blue-200';
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
      <div className="relative h-48 w-full overflow-hidden bg-slate-900">
        <img
          src={activity.image}
          alt={activity.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-black/20" />

        {/* Top Badges */}
        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between gap-2">
          {/* Type Pill */}
          <span
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold backdrop-blur-md shadow-xs tracking-wide ${getTypeColor(
              activity.type
            )}`}
          >
            {activity.type}
          </span>

          {/* Rating & Cost Badge */}
          <div className="flex items-center gap-1.5">
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-bold border backdrop-blur-md ${getCostBadgeColor(
                activity.costTier
              )}`}
              title={`Cost: ${activity.cost}`}
            >
              {activity.costTier === 'Free' ? 'Free' : activity.costTier}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400 text-slate-950 backdrop-blur-md shadow-xs">
              <Star className="w-3 h-3 fill-slate-950 text-slate-950" />
              <span>{activity.rating.toFixed(1)}</span>
            </span>
          </div>
        </div>

        {/* Bottom Destination Overlay & Added Indicator */}
        <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between text-white">
          <div className="flex items-center gap-1.5 text-xs text-teal-300 font-semibold">
            <MapPin className="w-3.5 h-3.5 text-teal-300 shrink-0" />
            <span>
              {activity.destinationCity}, {activity.destinationCountry}
            </span>
          </div>

          {isAdded && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-extrabold shadow-sm">
              <Check className="w-3 h-3 stroke-[3]" />
              <span>Added</span>
            </span>
          )}
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2.5">
          {/* Activity Title */}
          <h3 className="font-display font-bold text-base sm:text-lg text-slate-900 tracking-tight leading-snug group-hover:text-teal-700 transition-colors line-clamp-2">
            {activity.name}
          </h3>

          {/* Short Description */}
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {activity.shortDescription || activity.description}
          </p>

          {/* Meta Info: Duration & Cost & Best Time */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-100">
              <Clock className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span className="truncate">{activity.duration}</span>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-100">
              <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="truncate" title={activity.bestTime}>
                {activity.bestTime.split('(')[0].trim()}
              </span>
            </div>
          </div>

          {/* Tags preview */}
          {activity.tags && activity.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              {activity.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Added To Trip Banner if currently added */}
          {isAdded && addedTripName && (
            <div className="px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] flex items-center justify-between">
              <span className="truncate">
                In: <strong>{addedTripName}</strong>
              </span>
            </div>
          )}
        </div>

        {/* Action Button Row */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => onViewDetails(activity)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 transition-all active:scale-[0.98] cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            <span>Details</span>
          </button>

          {isAdded ? (
            <button
              type="button"
              onClick={() => {
                if (onRemoveFromTrip) {
                  onRemoveFromTrip(activity);
                } else {
                  onAddToTrip(activity);
                }
              }}
              className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-rose-50 hover:text-rose-700 border border-emerald-200 hover:border-rose-200 transition-all active:scale-[0.98] cursor-pointer group/btn"
              title="Click to manage or remove from trip"
            >
              <CheckCircle2 className="w-3.5 h-3.5 group-hover/btn:hidden" />
              <span className="group-hover/btn:hidden">Added</span>
              <span className="hidden group-hover/btn:inline">Remove</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onAddToTrip(activity)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 shadow-xs hover:shadow transition-all active:scale-[0.98] cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add to Trip</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
