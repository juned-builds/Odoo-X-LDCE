import React from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import { Trip } from '../../types/dashboard';
import { Button } from '../ui/Button';

interface DeleteTripModalProps {
  isOpen: boolean;
  trip: Trip | null;
  onClose: () => void;
  onConfirmDelete: (trip: Trip) => void;
  isDeleting?: boolean;
}

export const DeleteTripModal: React.FC<DeleteTripModalProps> = ({
  isOpen,
  trip,
  onClose,
  onConfirmDelete,
  isDeleting = false,
}) => {
  if (!isOpen || !trip) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Dialog Box */}
      <div className="relative w-full max-w-md rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-scaleUp z-10">
        {/* Top Icon & Close */}
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shadow-xs">
            <Trash2 className="w-6 h-6" />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h3 className="text-xl font-bold font-display text-slate-900 tracking-tight">
            Delete this trip?
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Are you sure you want to delete <strong className="text-slate-900 font-semibold">"{trip.name}"</strong>?
          </p>
          <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-200/80 text-xs text-rose-800 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>
              This action cannot be undone. All itinerary plans, notes, and route stops for this trip will be removed from your collection.
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            isLoading={isDeleting}
            onClick={() => onConfirmDelete(trip)}
            className="bg-rose-600 hover:bg-rose-700 text-white shadow-sm hover:shadow"
            leftIcon={<Trash2 className="w-4 h-4" />}
          >
            Delete Trip
          </Button>
        </div>
      </div>
    </div>
  );
};
