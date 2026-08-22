import React from 'react';
import {
  X,
  MapPin,
  Star,
  Calendar,
  Sparkles,
  Plus,
  Compass,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  Tag,
  Bookmark,
} from 'lucide-react';
import { Destination } from '../../types/dashboard';
import { Button } from '../ui/Button';

interface DestinationDetailModalProps {
  isOpen: boolean;
  destination: Destination | null;
  onClose: () => void;
  onAddToTrip: (destination: Destination) => void;
  onExploreActivities?: (destination: Destination) => void;
  isSaved?: boolean;
  onToggleSave?: (destination: Destination) => void;
}

export const DestinationDetailModal: React.FC<DestinationDetailModalProps> = ({
  isOpen,
  destination,
  onClose,
  onAddToTrip,
  onExploreActivities,
  isSaved = false,
  onToggleSave,
}) => {
  if (!isOpen || !destination) return null;

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
            src={destination.image}
            alt={`${destination.city}, ${destination.country}`}
            className="w-full h-full object-cover object-center"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-black/30" />

          {/* Action buttons on cover: Close and Bookmark */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            {onToggleSave && (
              <button
                type="button"
                onClick={() => onToggleSave(destination)}
                className={`p-2.5 rounded-2xl backdrop-blur-md transition-all active:scale-95 cursor-pointer shadow-md flex items-center gap-1.5 text-xs font-semibold ${
                  isSaved
                    ? 'bg-teal-600 text-white ring-2 ring-teal-300/60'
                    : 'bg-black/50 hover:bg-black/70 text-white'
                }`}
                title={isSaved ? 'Remove from Saved' : 'Save Destination'}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-white stroke-white' : 'stroke-current'}`} />
                <span className="hidden sm:inline">{isSaved ? 'Saved' : 'Save'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2.5 rounded-2xl bg-black/50 hover:bg-black/70 text-white backdrop-blur-md transition-all active:scale-95 cursor-pointer shadow-md"
              aria-label="Close details"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Top Badges */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-black/60 text-white backdrop-blur-md border border-white/10">
              {destination.region}
            </span>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-bold border backdrop-blur-md ${getCostBadgeColor(
                destination.costIndex
              )}`}
            >
              Cost: {destination.costIndex}
            </span>
          </div>

          {/* Bottom City & Country Title on Cover */}
          <div className="absolute bottom-5 left-5 right-5 text-white space-y-1">
            <div className="flex items-center gap-2 text-xs text-teal-300 font-semibold uppercase tracking-wider">
              <MapPin className="w-4 h-4 text-teal-300" />
              <span>{destination.country}</span>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-white tracking-tight leading-tight drop-shadow">
                {destination.city}
              </h2>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-extrabold shadow-sm shrink-0">
                <Star className="w-3.5 h-3.5 fill-slate-950" />
                <span>{destination.rating.toFixed(1)}</span>
                {destination.reviewCount && (
                  <span className="text-[10px] opacity-75 font-normal">
                    ({destination.reviewCount.toLocaleString()})
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 sm:p-7 space-y-6 overflow-y-auto">
          {/* Key Facts Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Cost Level
              </span>
              <span className="text-sm font-bold text-slate-900 mt-1 flex items-center gap-1">
                <span>{destination.costIndex}</span>
                <span className="text-xs font-normal text-slate-500">
                  {destination.costIndex === '$'
                    ? '(Budget Friendly)'
                    : destination.costIndex === '$$'
                    ? '(Moderate)'
                    : destination.costIndex === '$$$'
                    ? '(Upscale)'
                    : '(Luxury)'}
                </span>
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Popularity Index
              </span>
              <span className="text-sm font-bold text-slate-900 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-teal-600" />
                <span>{destination.popularity}/100</span>
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col col-span-2 sm:col-span-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Best Season
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-900 mt-1 truncate">
                {destination.bestSeason}
              </span>
            </div>
          </div>

          {/* Description Section */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              About this destination
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
              {destination.description}
            </p>
          </div>

          {/* Top Highlights List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                <span>Key Highlights & Iconic Landmarks</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">
                {destination.highlights.length} Experiences
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {destination.highlights.map((highlight, idx) => (
                <div
                  key={highlight}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-2.5 text-xs text-slate-800"
                >
                  <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 text-[10px] flex items-center justify-center font-bold shrink-0 mt-0.5">
                    0{idx + 1}
                  </span>
                  <span className="font-semibold">{highlight}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tags Chips if present */}
          {destination.tags && destination.tags.length > 0 && (
            <div className="space-y-2 pt-1 border-t border-slate-100">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                <Tag className="w-3.5 h-3.5" />
                <span>Experience Themes:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {destination.tags.map((tag) => (
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
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>

            {onToggleSave && (
              <Button
                variant={isSaved ? 'primary' : 'outline'}
                size="sm"
                onClick={() => onToggleSave(destination)}
                leftIcon={<Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-white stroke-white' : 'stroke-current'}`} />}
                className={isSaved ? 'bg-teal-600 hover:bg-teal-700 text-white' : ''}
              >
                {isSaved ? 'Saved Destination' : 'Save Destination'}
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onExploreActivities && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  onClose();
                  onExploreActivities(destination);
                }}
                leftIcon={<Compass className="w-4 h-4 text-teal-600" />}
              >
                Activities in {destination.city}
              </Button>
            )}

            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                onClose();
                onAddToTrip(destination);
              }}
              leftIcon={<Plus className="w-4 h-4 stroke-[2.5]" />}
              className="shadow-sm hover:shadow"
            >
              Add {destination.city} to a Trip
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
