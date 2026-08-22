import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { ExpenseItem } from '../../types/budget';
import { Button } from '../ui/Button';

interface DeleteExpenseConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  expense: ExpenseItem | null;
  currency?: string;
}

export const DeleteExpenseConfirmModal: React.FC<DeleteExpenseConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  expense,
  currency = '₹',
}) => {
  if (!isOpen || !expense) return null;

  const handleClose = () => {
    if (typeof onClose === 'function') {
      onClose();
    }
  };

  const handleConfirm = () => {
    if (typeof onConfirm === 'function') {
      onConfirm();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
        onClick={handleClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden z-10 animate-fadeIn">
        <div className="p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-600 mx-auto">
            <Trash2 className="w-6 h-6" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-lg font-bold font-display text-slate-900">
              Delete this expense?
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
              Are you sure you want to remove <span className="font-semibold text-slate-800">"{expense.name}"</span> ({currency}{expense.amount.toLocaleString()})? Your budget totals and category breakdowns will be recalculated immediately.
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-600 flex items-center justify-between">
            <span className="font-medium capitalize">{expense.category}</span>
            <span className="font-bold text-slate-900 font-display">
              {currency}{expense.amount.toLocaleString()}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={handleClose}>
              Cancel
            </Button>
            <button
              type="button"
              onClick={handleConfirm}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              Delete Expense
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
