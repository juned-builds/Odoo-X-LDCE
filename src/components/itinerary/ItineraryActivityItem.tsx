import React, { useState } from 'react';
import {
  Clock,
  MapPin,
  DollarSign,
  Star,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Edit3,
  Trash2,
  Compass,
} from 'lucide-react';
import { ItineraryActivity } from '../../types/itinerary';

interface ItineraryActivityItemProps {
  activity: ItineraryActivity;
  index: number;
  totalActivitiesInDay: number;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onQuickEdit: (activity: ItineraryActivity) => void;
  onViewDetails: (activity: ItineraryActivity) => void;
  onRemove: (activity: ItineraryActivity) => void;
  onDragStart?: (e: React.DragEvent, activityId: string, index: number) => void;
  onDragOver?: (e: React.DragEvent, index: number) => void;
  onDrop?: (e: React.DragEvent, targetIndex: number) => void;
  onDragEnd?: () => void;
  isDragging?: boolean;
}

export const ItineraryActivityItem: React.FC<ItineraryActivityItemProps> = ({
  activity,
  index,
  totalActivitiesInDay,
  onMoveUp,
  onMoveDown,
  onQuickEdit,
  onViewDetails,
  onRemove,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  isDragging = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart && onDragStart(e, activity.id, index)}
      onDragOver={(e) => onDragOver && onDragOver(e, index)}
      onDrop={(e) => onDrop && onDrop(e, index)}
      onDragEnd={onDragEnd}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative bg-white rounded-2xl border transition-all duration-150 ${
        isDragging
          ? 'opacity-40 border-teal-500 scale-[0.98] shadow-inner bg-teal-50/20'
          : 'border-slate-200/90 hover:border-teal-300 hover:shadow-md'
      }`}
    >
      <div className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        {/* Left Side: Drag handle, Time Badge, Thumbnail, and Info */}
        <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
          {/* Drag Handle & Reorder buttons */}
          <div className="flex flex-col items-center justify-center shrink-0 self-center text-slate-400">
            <div
              className="cursor-grab active:cursor-grabbing p-1 rounded-lg hover:text-slate-700 hover:bg-slate-100 hidden sm:block"
              title="Drag to reorder activities within this day"
            >
              <GripVertical className="w-4 h-4" />
            </div>

            {/* Mobile / Keyboard Up & Down controls */}
            <div className="flex sm:flex-col gap-0.5">
              <button
                type="button"
                disabled={index === 0}
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveUp && onMoveUp();
                }}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
                title="Move activity up"
                aria-label="Move activity up"
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                disabled={index === totalActivitiesInDay - 1}
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveDown && onMoveDown();
                }}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
                title="Move activity down"
                aria-label="Move activity down"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Time Badge */}
          <div className="shrink-0 flex flex-col items-center justify-center px-2.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-center min-w-[76px]">
            <span className="text-xs font-black text-slate-900 leading-none">
              {activity.startTime || '09:30 AM'}
            </span>
            <span className="text-[10px] text-slate-500 font-semibold mt-0.5 truncate max-w-[70px]">
              {activity.duration}
            </span>
          </div>

          {/* Thumbnail */}
          <div
            onClick={() => onViewDetails(activity)}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0 cursor-pointer relative shadow-2xs border border-slate-100"
          >
            <img
              src={
                activity.image ||
                'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80'
              }
              alt={activity.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>

          {/* Activity Info (Clickable for details) */}
          <div
            onClick={() => onViewDetails(activity)}
            className="min-w-0 flex-1 space-y-1 cursor-pointer"
          >
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 text-[10px] font-bold border border-teal-100">
                {activity.type}
              </span>
              <span className="text-slate-400 text-xs">•</span>
              <span className="text-xs text-slate-500 font-medium truncate">
                {activity.destinationCity}
              </span>
              {activity.rating && (
                <>
                  <span className="text-slate-400 text-xs">•</span>
                  <div className="flex items-center gap-0.5 text-[11px] font-bold text-amber-600">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                    <span>{activity.rating.toFixed(1)}</span>
                  </div>
                </>
              )}
            </div>

            <h4 className="text-sm sm:text-base font-bold text-slate-900 line-clamp-1 group-hover:text-teal-700 transition-colors">
              {activity.name}
            </h4>

            <p className="text-xs text-slate-500 line-clamp-1">
              {activity.description || 'Curated travel activity and highlight.'}
            </p>
          </div>
        </div>

        {/* Right Side: Cost Badge & Quick Action Buttons */}
        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
          {/* Cost Badge */}
          <div className="text-left sm:text-right">
            <span className="text-xs sm:text-sm font-extrabold text-emerald-700">
              {activity.cost || 'Free'}
            </span>
            <div className="text-[10px] text-slate-400 font-medium">Est. Cost</div>
          </div>

          {/* Action Buttons: Quick Edit & Remove */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onQuickEdit(activity);
              }}
              className="p-2 rounded-xl text-slate-500 hover:text-teal-700 hover:bg-teal-50 border border-slate-200/80 hover:border-teal-200 transition-all active:scale-95 cursor-pointer shadow-2xs"
              title="Quick edit activity"
              aria-label="Quick edit activity"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(activity);
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all active:scale-95 cursor-pointer"
              title="Remove activity from day"
              aria-label="Remove activity"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
