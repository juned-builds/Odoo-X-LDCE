import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Train,
  Bed,
  Compass,
  Utensils,
  Calendar,
  DollarSign,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { ExpenseItem, ExpenseCategory } from '../../types/budget';
import { Trip } from '../../types/dashboard';
import { Button } from '../ui/Button';
import { CATEGORY_CONFIG } from '../../data/budgetData';

interface AddEditExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expenseData: Omit<ExpenseItem, 'id' | 'tripId' | 'source'> & { id?: string }) => void;
  trip: Trip;
  initialExpense?: ExpenseItem | null;
  defaultDayNumber?: number;
  defaultDate?: string;
}

export const AddEditExpenseModal: React.FC<AddEditExpenseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  trip,
  initialExpense,
  defaultDayNumber,
  defaultDate,
}) => {
  const [category, setCategory] = useState<ExpenseCategory>('transport');
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [dayNumber, setDayNumber] = useState<number>(1);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<{ name?: string; amount?: string }>({});

  useEffect(() => {
    if (initialExpense) {
      setCategory(initialExpense.category);
      setName(initialExpense.name);
      setAmount(initialExpense.amount ? initialExpense.amount.toString() : '');
      setDate(initialExpense.date || trip.startDate || '');
      setDayNumber(initialExpense.dayNumber || 1);
      setNotes(initialExpense.notes || '');
    } else {
      setCategory('transport');
      setName('');
      setAmount('');
      setDate(defaultDate || trip.startDate || '');
      setDayNumber(defaultDayNumber || 1);
      setNotes('');
    }
    setErrors({});
  }, [initialExpense, isOpen, trip, defaultDate, defaultDayNumber]);

  if (!isOpen) return null;

  const handleClose = () => {
    if (typeof onClose === 'function') {
      onClose();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { name?: string; amount?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Expense name is required.';
    }

    const parsedAmount = parseFloat(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount < 0) {
      newErrors.amount = 'Please enter a valid amount (≥ 0).';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      id: initialExpense?.id,
      category,
      name: name.trim(),
      amount: parsedAmount,
      date: date || trip.startDate,
      dayNumber: Number(dayNumber) || 1,
      notes: notes.trim() || undefined,
    });

    handleClose();
  };

  const categories: ExpenseCategory[] = ['transport', 'accommodation', 'activities', 'meals'];

  const renderIcon = (cat: ExpenseCategory) => {
    switch (cat) {
      case 'transport':
        return <Train className="w-4 h-4" />;
      case 'accommodation':
        return <Bed className="w-4 h-4" />;
      case 'activities':
        return <Compass className="w-4 h-4" />;
      case 'meals':
        return <Utensils className="w-4 h-4" />;
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
      <div className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden z-10 animate-fadeIn">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-white">
                {initialExpense ? 'Edit Manual Expense' : 'Log New Expense'}
              </h3>
              <p className="text-xs text-slate-400">
                Track custom costs for {trip.name}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Category Picker */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Expenditure Category <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {categories.map((cat) => {
                const isSelected = category === cat;
                const config = CATEGORY_CONFIG[cat];
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`
                      p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all text-xs font-bold cursor-pointer
                      ${
                        isSelected
                          ? `${config.bgColor} ${config.borderColor} ${config.textColor} shadow-xs ring-2 ring-teal-500/30`
                          : 'bg-slate-50/80 border-slate-200/80 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }
                    `}
                  >
                    {renderIcon(cat)}
                    <span className="capitalize">{cat}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Expense Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              Expense Description / Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Paris → Amsterdam Eurostar Train, Hotel Le Marais"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors({ ...errors, name: undefined });
              }}
              className={`
                w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all
                ${errors.name ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200 bg-slate-50/50 focus:bg-white'}
              `}
            />
            {errors.name && (
              <p className="text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errors.name}</span>
              </p>
            )}
          </div>

          {/* Amount & Date Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Amount */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Amount ({trip.currency || '₹'}) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                  {trip.currency || '₹'}
                </span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="e.g. 5500"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    if (errors.amount) setErrors({ ...errors, amount: undefined });
                  }}
                  className={`
                    w-full pl-8 pr-3.5 py-2.5 rounded-xl border text-sm font-display font-bold text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all
                    ${errors.amount ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200 bg-slate-50/50 focus:bg-white'}
                  `}
                />
              </div>
              {errors.amount && (
                <p className="text-xs text-rose-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.amount}</span>
                </p>
              )}
            </div>

            {/* Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Expense Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Optional Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>Notes & Booking Details</span>
              <span className="text-[11px] font-normal text-slate-400">Optional</span>
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Confirmation #849102, reserved window seats, includes breakfast"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all resize-none"
            />
          </div>

          {/* Modal Footer Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <Button variant="ghost" size="sm" type="button" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              {initialExpense ? 'Update Expense' : 'Save Expense'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
