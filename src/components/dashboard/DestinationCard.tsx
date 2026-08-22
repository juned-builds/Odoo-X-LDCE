import React from 'react';
import { Star, MapPin, ArrowRight, Compass, Calendar } from 'lucide-react';
import { RecommendedDestination } from '../../types/dashboard';

interface DestinationCardProps {
  destination: RecommendedDestination;
  onExplore: (destination: RecommendedDestination) => void;
}

export const DestinationCard: React.FC<DestinationCardProps> = ({
  destination,
  onExplore,
}) => {
  return (
    <div className="group rounded-2xl bg-white border border-slate-200/90 hover:border-teal-300 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden">
      {/* Visual Image */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
        <img
          src={destination.image}
          alt={destination.city}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/10" />

        {/* Top Cost Indicator & Rating */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/90 text-slate-800 backdrop-blur-md shadow-xs">
            {destination.costIndicator}
          </span>
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-black/50 text-white backdrop-blur-md">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span>{destination.sampleRating}</span>
          </div>
        </div>

        {/* Bottom City & Region Overlay */}
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <div className="flex items-center gap-1 text-[11px] text-teal-300 font-semibold uppercase tracking-wider">
            <MapPin className="w-3 h-3" />
            <span>{destination.country}</span>
          </div>
          <h4 className="font-display font-bold text-lg text-white leading-tight drop-shadow-sm">
            {destination.city}
          </h4>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
          {destination.shortDescription}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {destination.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600"
            >
              {tag}
            </span>
          ))}
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-teal-50 text-teal-700">
            Best: {destination.bestTimeToVisit}
          </span>
        </div>

        {/* Explore CTA */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-medium">Sample Guide</span>
          <button
            type="button"
            onClick={() => onExplore(destination)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-700 group-hover:translate-x-0.5 transition-all"
          >
            <span>Explore City</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
