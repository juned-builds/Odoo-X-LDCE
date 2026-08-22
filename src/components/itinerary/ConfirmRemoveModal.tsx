import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '../ui/Button';

interface ConfirmRemoveModalProps {
  isOpen: boolean;
  activityName: string;
  dayNumber: number;
  onClose: () => void;
  onConfirm: () => void;
}

export const ConfirmRemoveModal: React.FC<ConfirmRemoveModalProps> = ({
  isOpen,
  activityName,
  dayNumber,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 overflow-hidden animate-scaleUp z-10 space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-bold font-display text-slate-900">
            Remove activity from Day {dayNumber}?
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Are you sure you want to remove <strong className="text-slate-900 font-semibold">"{activityName}"</strong> from Day {dayNumber}'s itinerary?
          </p>
          <p className="text-[11px] text-slate-400 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            This only removes the activity assignment for this specific day. The underlying destination and trip will remain unaffected.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>

          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs hover:shadow transition-all active:scale-95 cursor-pointer"
          >
            Remove Activity
          </button>
        </div>
      </div>
    </div>
  );
};
