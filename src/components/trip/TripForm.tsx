import React, { useState, useRef } from 'react';
import {
  Calendar,
  Image as ImageIcon,
  Upload,
  Trash2,
  RefreshCw,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  FileText,
  Compass,
  ArrowRight,
  Info,
} from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { TripFormData } from '../../types/dashboard';
import { calculateTripDuration } from '../../utils/dateUtils';

interface TripFormProps {
  formData: TripFormData;
  onChange: (field: keyof TripFormData, value: string) => void;
  onSubmit: (actionType: 'save' | 'continue') => void;
  onCancel: () => void;
  isSaving: boolean;
  errors: Partial<Record<keyof TripFormData | 'dateRange', string>>;
  setErrors: React.Dispatch<
    React.SetStateAction<Partial<Record<keyof TripFormData | 'dateRange', string>>>
  >;
}

// Curated preset cover photo collection for prototype testing
export const CURATED_PRESET_COVERS = [
  {
    id: 'europe',
    title: 'Paris & Europe',
    url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'japan',
    title: 'Tokyo & Kyoto',
    url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'swiss',
    title: 'Swiss Alps',
    url: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'bali',
    title: 'Tropical Bali',
    url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'amalfi',
    title: 'Amalfi Coast',
    url: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'dubai',
    title: 'Dubai Skyline',
    url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80',
  },
];

export const TripForm: React.FC<TripFormProps> = ({
  formData,
  onChange,
  onSubmit,
  onCancel,
  isSaving,
  errors,
  setErrors,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Handle local image file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          coverImage: 'Image size should be less than 5MB',
        }));
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange('coverImage', reader.result as string);
        setErrors((prev) => {
          const updated = { ...prev };
          delete updated.coverImage;
          return updated;
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange('coverImage', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const durationInfo = calculateTripDuration(formData.startDate, formData.endDate);

  const handleSubmit = (e: React.FormEvent, actionType: 'save' | 'continue') => {
    e.preventDefault();
    onSubmit(actionType);
  };

  return (
    <form className="space-y-6" onSubmit={(e) => handleSubmit(e, 'save')}>
      {/* Card 1: Core Trip Details */}
      <div className="rounded-3xl bg-white border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-slate-900">
                General Trip Info
              </h3>
              <p className="text-xs text-slate-500">
                Essential name and timeline of your destination journey
              </p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
            Step 1 of 1
          </span>
        </div>

        {/* 1. Trip Name */}
        <div className="space-y-1.5">
          <Input
            label="Trip Name *"
            id="trip-name-input"
            type="text"
            placeholder="e.g. European Summer Adventure"
            value={formData.name}
            onChange={(e) => {
              onChange('name', e.target.value);
              if (errors.name) {
                setErrors((prev) => {
                  const u = { ...prev };
                  delete u.name;
                  return u;
                });
              }
            }}
            error={errors.name}
            helperText="Give your trip a descriptive, inspiring name."
            leftIcon={<Compass className="w-4 h-4" />}
          />
        </div>

        {/* 2. Start Date & End Date Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {/* Start Date */}
          <div className="space-y-1.5">
            <Input
              label="Start Date *"
              id="trip-start-date"
              type="date"
              value={formData.startDate}
              onChange={(e) => {
                onChange('startDate', e.target.value);
                setErrors((prev) => {
                  const u = { ...prev };
                  delete u.startDate;
                  delete u.dateRange;
                  return u;
                });
              }}
              error={errors.startDate}
              leftIcon={<Calendar className="w-4 h-4" />}
            />
          </div>

          {/* End Date */}
          <div className="space-y-1.5">
            <Input
              label="End Date *"
              id="trip-end-date"
              type="date"
              value={formData.endDate}
              min={formData.startDate || undefined}
              onChange={(e) => {
                onChange('endDate', e.target.value);
                setErrors((prev) => {
                  const u = { ...prev };
                  delete u.endDate;
                  delete u.dateRange;
                  return u;
                });
              }}
              error={errors.endDate || errors.dateRange}
              leftIcon={<Calendar className="w-4 h-4" />}
            />
          </div>
        </div>

        {/* Dynamic Duration Callout */}
        {durationInfo.isValid && (
          <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-200/80 flex items-center justify-between text-xs text-teal-900 animate-fadeIn">
            <div className="flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
              <span>
                Calculated Trip Duration: <strong className="font-bold">{durationInfo.formattedDuration}</strong>
              </span>
            </div>
            <span className="text-[11px] text-teal-700 font-semibold">
              {durationInfo.days} total {durationInfo.days === 1 ? 'day' : 'days'}
            </span>
          </div>
        )}

        {/* 3. Trip Description Textarea */}
        <div className="space-y-1.5">
          <label
            htmlFor="trip-description-input"
            className="text-xs font-semibold uppercase tracking-wider text-slate-600 flex items-center justify-between"
          >
            <span>Trip Description</span>
            <span className="text-slate-400 font-normal normal-case text-[11px]">Optional</span>
          </label>
          <textarea
            id="trip-description-input"
            rows={4}
            placeholder="Tell us a little about your journey... (e.g. scenic coastal driving, food tastings, museum visits, or budget goals)"
            value={formData.description}
            onChange={(e) => onChange('description', e.target.value)}
            className="w-full p-3.5 text-sm bg-white border border-slate-200 hover:border-slate-300 focus:border-teal-500 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-3 focus:ring-teal-500/20 transition-all shadow-xs resize-y"
          />
          <p className="text-xs text-slate-500">
            A short overview helps organize companion notes and packing highlights.
          </p>
        </div>
      </div>

      {/* Card 2: Cover Photo Selector & Presets */}
      <div className="rounded-3xl bg-white border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-slate-900">
                Cover Photo
              </h3>
              <p className="text-xs text-slate-500">
                Add an inspiring visual for your trip dashboard card
              </p>
            </div>
          </div>
          <span className="text-xs text-slate-400">Optional</span>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {formData.coverImage ? (
          /* Image Selected Preview with Replace/Remove */
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 group">
            <img
              src={formData.coverImage}
              alt="Selected trip cover"
              className="w-full h-44 object-cover object-center group-hover:scale-102 transition-transform duration-300"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-2 rounded-xl bg-white text-slate-800 text-xs font-semibold shadow-md hover:bg-slate-50 flex items-center gap-1.5 transition-all active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5 text-teal-600" />
                <span>Replace Image</span>
              </button>

              <button
                type="button"
                onClick={() => onChange('coverImage', '')}
                className="px-3.5 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold shadow-md hover:bg-rose-700 flex items-center gap-1.5 transition-all active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            </div>
          </div>
        ) : (
          /* Drag & Drop Local Upload Box */
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2
              ${isDragging
                ? 'border-teal-500 bg-teal-50/50'
                : 'border-slate-300 hover:border-teal-400 bg-slate-50/50 hover:bg-slate-50'
              }
            `}
          >
            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-center text-teal-600">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-800">
                Click to browse or drag & drop a cover image
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                PNG, JPG, or WEBP up to 5MB
              </p>
            </div>
          </div>
        )}

        {/* Quick Travel Preset Inspiration Gallery */}
        <div className="space-y-2 pt-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Or choose from curated destinations:</span>
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {CURATED_PRESET_COVERS.map((preset) => {
              const isSelected = formData.coverImage === preset.url;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => onChange('coverImage', preset.url)}
                  className={`
                    relative rounded-xl overflow-hidden h-16 border-2 transition-all group text-left
                    ${isSelected
                      ? 'border-teal-500 ring-2 ring-teal-500/30'
                      : 'border-transparent hover:border-slate-300'
                    }
                  `}
                >
                  <img
                    src={preset.url}
                    alt={preset.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1.5">
                    <span className="text-[10px] font-bold text-white leading-tight truncate">
                      {preset.title}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Global Form Errors Banner if any */}
      {Object.keys(errors).length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Please correct the highlighted fields:</p>
            <ul className="list-disc list-inside text-rose-700 mt-1 space-y-0.5 text-[11px]">
              {errors.name && <li>{errors.name}</li>}
              {errors.startDate && <li>{errors.startDate}</li>}
              {errors.endDate && <li>{errors.endDate}</li>}
              {errors.dateRange && <li>{errors.dateRange}</li>}
            </ul>
          </div>
        </div>
      )}

      {/* Action Button Row */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSaving}
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <Button
            type="button"
            variant="secondary"
            onClick={() => onSubmit('continue')}
            isLoading={isSaving}
            className="w-full sm:w-auto"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Save & Continue
          </Button>

          <Button
            type="submit"
            variant="primary"
            isLoading={isSaving}
            className="w-full sm:w-auto"
            rightIcon={<CheckCircle2 className="w-4 h-4" />}
          >
            Save Trip
          </Button>
        </div>
      </div>
    </form>
  );
};
