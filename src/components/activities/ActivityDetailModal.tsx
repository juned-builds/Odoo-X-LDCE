import React from 'react';
import {
  X,
  MapPin,
  Star,
  Clock,
  Sun,
  Sparkles,
  Plus,
  Check,
  CheckCircle2,
  DollarSign,
  Tag,
  TrendingUp,
  Compass,
  Calendar,
} from 'lucide-react';
import { Activity } from '../../types/activity';
import { Button } from '../ui/Button';

interface ActivityDetailModalProps {
  isOpen: boolean;
  activity: Activity | null;
  isAdded?: boolean;
  onClose: () => void;
  onAddToTrip: (activity: Activity) => void;
}

export const ActivityDetailModal: React.FC<ActivityDetailModalProps> = ({
  isOpen,
  activity,
  isAdded = false,
  onClose,
  onAddToTrip,
}) => {
  if (!isOpen || !activity) return null;

  const getTypeColor = (type: Activity['type']) => {
    switch (type) {
      case 'Sightseeing':
        return 'bg-blue-600 text-white';
      case 'Culture':
        return 'bg-purple-600 text-white';
      case 'Food':
        return 'bg-amber-600 text-white';
      case 'Adventure':
        return 'bg-emerald-600 text-white';
      case 'Nature':
        return 'bg-teal-600 text-white';
      case 'Shopping':
        return 'bg-rose-600 text-white';
      case 'Nightlife':
        return 'bg-indigo-600 text-white';
      case 'Family':
        return 'bg-cyan-600 text-white';
      default:
        return 'bg-slate-700 text-white';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-scaleUp z-10 max-h-[90vh] flex flex-col">
        {/* Cover Photo Header */}
        <div className="relative h-60 sm:h-72 w-full bg-slate-900 shrink-0">
          <img
            src={activity.image}
            alt={activity.name}
            className="w-full h-full object-cover object-center"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-black/30" />

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2.5 rounded-2xl bg-black/50 hover:bg-black/70 text-white backdrop-blur-md transition-all active:scale-95 cursor-pointer shadow-md"
            aria-label="Close details"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Top Badges */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md shadow-xs ${getTypeColor(
                activity.type
              )}`}
            >
              {activity.type}
            </span>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-bold border backdrop-blur-md ${getCostBadgeColor(
                activity.costTier
              )}`}
            >
              Cost: {activity.cost}
            </span>
          </div>

          {/* Bottom Title & Destination on Cover */}
          <div className="absolute bottom-5 left-5 right-5 text-white space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-teal-300 font-semibold uppercase tracking-wider">
              <MapPin className="w-4 h-4 text-teal-300" />
              <span>
                {activity.destinationCity}, {activity.destinationCountry}
              </span>
              {activity.location && (
                <span className="text-slate-300 font-normal">
                  • {activity.location}
                </span>
              )}
            </div>

            <div className="flex items-baseline justify-between gap-4">
              <h2 className="font-display font-bold text-xl sm:text-2xl lg:text-3xl text-white tracking-tight leading-tight drop-shadow">
                {activity.name}
              </h2>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-extrabold shadow-sm shrink-0">
                <Star className="w-3.5 h-3.5 fill-slate-950" />
                <span>{activity.rating.toFixed(1)}</span>
                {activity.reviewCount && (
                  <span className="text-[10px] opacity-75 font-normal">
                    ({activity.reviewCount.toLocaleString()})
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 sm:p-7 space-y-6 overflow-y-auto">
          {/* Key Facts Summary Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Duration
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-900 mt-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-teal-600" />
                <span className="truncate">{activity.duration}</span>
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Estimated Cost
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-900 mt-1 truncate">
                {activity.cost}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Best Timing
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-900 mt-1 flex items-center gap-1">
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span className="truncate" title={activity.bestTime}>
                  {activity.bestTime.split('(')[0].trim()}
                </span>
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Popularity
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-900 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-teal-600" />
                <span>{activity.popularity}/100</span>
              </span>
            </div>
          </div>

          {/* Description Section */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              About this experience
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
              {activity.description}
            </p>
          </div>

          {/* Key Highlights / Inclusions */}
          {activity.highlights && activity.highlights.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                  <span>Key Highlights & What's Included</span>
                </h3>
                <span className="text-[11px] text-slate-400 font-medium">
                  {activity.highlights.length} Points
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {activity.highlights.map((highlight, idx) => (
                  <div
                    key={highlight}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-2.5 text-xs text-slate-800"
                  >
                    <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 text-[10px] flex items-center justify-center font-bold shrink-0 mt-0.5">
                      ✓
                    </span>
                    <span className="font-semibold leading-snug">{highlight}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags Chips if present */}
          {activity.tags && activity.tags.length > 0 && (
            <div className="space-y-2 pt-1 border-t border-slate-100">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                <Tag className="w-3.5 h-3.5" />
                <span>Categories & Tags:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {activity.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>

          <Button
            variant={isAdded ? 'secondary' : 'primary'}
            size="sm"
            onClick={() => {
              onAddToTrip(activity);
            }}
            leftIcon={
              isAdded ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <Plus className="w-4 h-4 stroke-[2.5]" />
              )
            }
            className="shadow-sm hover:shadow"
          >
            {isAdded ? 'Manage / Add to Another Trip' : 'Add to Trip'}
          </Button>
        </div>
      </div>
    </div>
  );
};
