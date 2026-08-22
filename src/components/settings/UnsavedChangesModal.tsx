import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import { Button } from '../ui/Button';

interface UnsavedChangesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDiscard: () => void;
  onSave: () => void;
}

export const UnsavedChangesModal: React.FC<UnsavedChangesModalProps> = ({
  isOpen,
  onClose,
  onDiscard,
  onSave,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs transition-opacity animate-fadeIn"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-scaleUp z-10 p-6 sm:p-7 space-y-5">
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <AlertCircle className="w-6 h-6 stroke-[2.2]" />
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Cancel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-1.5">
          <h3 className="text-xl font-bold font-display text-slate-900 tracking-tight">
            Unsaved profile changes
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            You have unsaved changes in your profile. Would you like to save them before leaving?
          </p>
        </div>

        <div className="pt-2 flex flex-wrap items-center justify-end gap-2.5 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onDiscard}>
            Discard Changes
          </Button>

          <Button variant="primary" size="sm" onClick={onSave}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};
