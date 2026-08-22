import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Button } from '../ui/Button';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: () => void;
  userName?: string;
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  isOpen,
  onClose,
  onConfirmDelete,
  userName = 'Explorer',
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
        {/* Header Icon & Close */}
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
            <AlertTriangle className="w-6 h-6 stroke-[2.2]" />
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

        {/* Text Content */}
        <div className="space-y-2">
          <h3 className="text-xl font-bold font-display text-slate-900 tracking-tight">
            Delete your account?
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            This action will permanently remove your GlobeTrotter account and associated data.
          </p>
          <div className="p-3 rounded-2xl bg-rose-50/70 border border-rose-100 text-xs text-rose-800 space-y-1">
            <p className="font-semibold">What will be cleared:</p>
            <ul className="list-disc list-inside text-[11px] text-rose-700 space-y-0.5">
              <li>Profile data for {userName}</li>
              <li>Saved destination bookmarks</li>
              <li>Custom session preferences and draft changes</li>
            </ul>
          </div>
        </div>

        {/* Modal Buttons */}
        <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>

          <button
            type="button"
            onClick={onConfirmDelete}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm hover:shadow transition-all active:scale-[0.98] cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Account</span>
          </button>
        </div>
      </div>
    </div>
  );
};
