import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import { Button } from '../ui/Button';

interface UnsavedChangesModalProps {
  isOpen: boolean;
  onKeepEditing: () => void;
  onDiscardChanges: () => void;
}

export const UnsavedChangesModal: React.FC<UnsavedChangesModalProps> = ({
  isOpen,
  onKeepEditing,
  onDiscardChanges,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
        onClick={onKeepEditing}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 overflow-hidden animate-scaleUp z-10 space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>

          <button
            type="button"
            onClick={onKeepEditing}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-bold font-display text-slate-900">
            You have unsaved itinerary changes
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            You've made modifications to this itinerary timeline. If you leave now without saving, your recent reorders, additions, or time adjustments will be lost.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onDiscardChanges}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 transition-all cursor-pointer"
          >
            Discard Changes
          </button>

          <Button variant="primary" size="sm" onClick={onKeepEditing}>
            Keep Editing
          </Button>
        </div>
      </div>
    </div>
  );
};
