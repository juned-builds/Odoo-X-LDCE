import React, { useState, useEffect } from 'react';
import { X, Wallet, AlertCircle, Check, ArrowRight } from 'lucide-react';
import { Trip } from '../../types/dashboard';
import { Button } from '../ui/Button';

interface EditTripBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newBudget: number) => void;
  trip: Trip;
  currentEstimatedCost: number;
}

export const EditTripBudgetModal: React.FC<EditTripBudgetModalProps> = ({
  isOpen,
  onClose,
  onSave,
  trip,
  currentEstimatedCost,
}) => {
  const [budgetInput, setBudgetInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setBudgetInput(trip.budgetTotal ? trip.budgetTotal.toString() : '0');
      setError(null);
    }
  }, [isOpen, trip]);

  if (!isOpen) return null;

  const handleClose = () => {
    if (typeof onClose === 'function') {
      onClose();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(budgetInput);
    if (isNaN(val) || val < 0) {
      setError('Please enter a valid non-negative number.');
      return;
    }
    onSave(val);
    handleClose();
  };

  const handleQuickAdd = (amountToAdd: number) => {
    const current = parseFloat(budgetInput) || 0;
    setBudgetInput((current + amountToAdd).toString());
    setError(null);
  };

  const handleMatchEstimated = () => {
    setBudgetInput(currentEstimatedCost.toString());
    setError(null);
  };

  const currency = trip.currency || '₹';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
        onClick={handleClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden z-10 animate-fadeIn">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-white">
                Set Trip Budget
              </h3>
              <p className="text-xs text-slate-400">
                Financial target for {trip.name}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Budget Limit ({currency})
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">
                {currency}
              </span>
              <input
                type="number"
                min="0"
                step="any"
                value={budgetInput}
                onChange={(e) => {
                  setBudgetInput(e.target.value);
                  if (error) setError(null);
                }}
                className={`
                  w-full pl-9 pr-4 py-3 rounded-2xl border text-xl font-bold font-display text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all
                  ${error ? 'border-rose-300 bg-rose-50/40' : 'border-slate-200 bg-slate-50/60 focus:bg-white'}
                `}
                placeholder="e.g. 80000"
                autoFocus
              />
            </div>
            {error && (
              <p className="text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{error}</span>
              </p>
            )}
          </div>

          {/* Planned comparison note */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Currently Planned:</span>
            <span className="font-bold text-slate-900 font-display">
              {currency}{currentEstimatedCost.toLocaleString()}
            </span>
          </div>

          {/* Quick Adjustment Shortcuts */}
          <div className="space-y-1.5">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Quick Shortcuts
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleQuickAdd(5000)}
                className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                +5,000
              </button>
              <button
                type="button"
                onClick={() => handleQuickAdd(10000)}
                className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                +10,000
              </button>
              <button
                type="button"
                onClick={() => handleQuickAdd(25000)}
                className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                +25,000
              </button>
              <button
                type="button"
                onClick={handleMatchEstimated}
                className="px-2.5 py-1 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                Match Planned ({currency}{currentEstimatedCost.toLocaleString()})
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <Button variant="ghost" size="sm" type="button" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Budget
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
