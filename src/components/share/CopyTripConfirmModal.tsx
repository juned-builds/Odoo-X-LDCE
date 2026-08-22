import React from 'react';
import { CopyPlus, Sparkles, X, ArrowRight, CheckCircle2, Luggage } from 'lucide-react';
import { Trip } from '../../types/dashboard';
import { Button } from '../ui/Button';

interface CopyTripConfirmModalProps {
  isOpen: boolean;
  trip: Trip | null;
  onClose: () => void;
  onConfirmCopy: () => void;
}

export const CopyTripConfirmModal: React.FC<CopyTripConfirmModalProps> = ({
  isOpen,
  trip,
  onClose,
  onConfirmCopy,
}) => {
  if (!isOpen || !trip) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="copy-trip-title"
    >
      <div className="bg-white w-full max-w-md rounded-3xl border border-slate-200 shadow-2xl overflow-hidden animate-scaleUp">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-teal-900 to-slate-900 text-white flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-500/30 text-teal-300 flex items-center justify-center shrink-0">
              <CopyPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 id="copy-trip-title" className="text-lg font-bold font-display text-white">
                Copy this itinerary?
              </h3>
              <p className="text-xs text-teal-200">
                Create an editable clone in your workspace
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">
            This will create your own editable version of{' '}
            <strong className="text-slate-900 font-semibold">{trip.name}</strong>.
          </p>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <Luggage className="w-4 h-4 text-teal-600" />
              <span>What will be copied:</span>
            </div>
            <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside pl-1">
              <li>All destination stops and journey route</li>
              <li>Scheduled daily activities & start times</li>
              <li>Activity durations & estimated costs</li>
              <li>Trip duration and journey description</li>
            </ul>
          </div>

          <p className="text-xs text-slate-500 italic">
            The original shared itinerary will remain unchanged. You will be able to customize and schedule your own activities.
          </p>
        </div>

        {/* Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onConfirmCopy}
            leftIcon={<CopyPlus className="w-4 h-4" />}
          >
            Copy Trip
          </Button>
        </div>
      </div>
    </div>
  );
};
