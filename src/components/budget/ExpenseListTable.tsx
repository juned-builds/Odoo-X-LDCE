import React, { useState } from 'react';
import {
  Search,
  Plus,
  Filter,
  Train,
  Bed,
  Compass,
  Utensils,
  Edit2,
  Trash2,
  Layers,
  Sparkles,
  Info,
  SlidersHorizontal,
} from 'lucide-react';
import { ExpenseItem, ExpenseCategory, ExpenseSource, BudgetFinancials } from '../../types/budget';
import { formatDateForDisplay } from '../../utils/dateUtils';
import { Button } from '../ui/Button';

interface ExpenseListTableProps {
  financials: BudgetFinancials;
  onAddExpense: () => void;
  onEditExpense: (expense: ExpenseItem) => void;
  onDeleteExpense: (expense: ExpenseItem) => void;
}

export const ExpenseListTable: React.FC<ExpenseListTableProps> = ({
  financials,
  onAddExpense,
  onEditExpense,
  onDeleteExpense,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | 'all'>('all');
  const [selectedSource, setSelectedSource] = useState<ExpenseSource | 'all'>('all');

  const { allExpenses, currency } = financials;

  // Filter expenses
  const filteredExpenses = allExpenses.filter((exp) => {
    // Category match
    if (selectedCategory !== 'all' && exp.category !== selectedCategory) {
      return false;
    }

    // Source match
    if (selectedSource !== 'all' && exp.source !== selectedSource) {
      return false;
    }

    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = exp.name.toLowerCase().includes(q);
      const matchNotes = exp.notes?.toLowerCase().includes(q);
      const matchCity = exp.destinationCity?.toLowerCase().includes(q);
      if (!matchName && !matchNotes && !matchCity) {
        return false;
      }
    }

    return true;
  });

  const renderCategoryIcon = (category: ExpenseCategory) => {
    switch (category) {
      case 'transport':
        return <Train className="w-3.5 h-3.5" />;
      case 'accommodation':
        return <Bed className="w-3.5 h-3.5" />;
      case 'activities':
        return <Compass className="w-3.5 h-3.5" />;
      case 'meals':
        return <Utensils className="w-3.5 h-3.5" />;
      default:
        return <Layers className="w-3.5 h-3.5" />;
    }
  };

  const getCategoryBadgeClass = (category: ExpenseCategory) => {
    switch (category) {
      case 'transport':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'accommodation':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'activities':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'meals':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="rounded-3xl bg-white border border-slate-200/90 shadow-sm overflow-hidden space-y-4 p-6 sm:p-7">
      {/* Header & Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
        <div>
          <h3 className="font-display font-bold text-base sm:text-lg text-slate-900">
            All Recorded Expenses
          </h3>
          <p className="text-xs text-slate-500">
            Combined log of scheduled itinerary activities and manually logged expenses ({allExpenses.length} total)
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={onAddExpense}
          leftIcon={<Plus className="w-4 h-4 stroke-[2.5]" />}
        >
          Add Expense
        </Button>
      </div>

      {/* Filter and Search Bar Controls */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by expense title, city, notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {(['all', 'transport', 'accommodation', 'activities', 'meals'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`
                  px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer
                  ${
                    selectedCategory === cat
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }
                `}
              >
                {cat === 'all' ? 'All' : cat}
              </button>
            ))}
          </div>

          {/* Source Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {(['all', 'manual', 'automatic'] as const).map((src) => (
              <button
                key={src}
                type="button"
                onClick={() => setSelectedSource(src)}
                className={`
                  px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer
                  ${
                    selectedSource === src
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }
                `}
              >
                {src === 'all' ? 'All Sources' : src}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Expenses Table / List */}
      <div className="border border-slate-200/80 rounded-2xl overflow-hidden">
        {filteredExpenses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50/90 text-slate-500 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200/70">
                <tr>
                  <th className="py-3 px-4">Expense Title</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Date / Day</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3">Source</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredExpenses.map((expense) => {
                  const isManual = expense.source === 'manual';

                  return (
                    <tr
                      key={expense.id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      {/* Name & Notes */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5 max-w-xs sm:max-w-md">
                          <p className="font-semibold text-slate-900 line-clamp-1">
                            {expense.name}
                          </p>
                          {expense.notes && (
                            <p className="text-[11px] text-slate-400 line-clamp-1">
                              {expense.notes}
                            </p>
                          )}
                          {expense.destinationCity && (
                            <span className="inline-block text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded-sm">
                              {expense.destinationCity}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Category Badge */}
                      <td className="py-3.5 px-3">
                        <span
                          className={`
                            inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border capitalize
                            ${getCategoryBadgeClass(expense.category)}
                          `}
                        >
                          {renderCategoryIcon(expense.category)}
                          <span>{expense.category}</span>
                        </span>
                      </td>

                      {/* Date / Day */}
                      <td className="py-3.5 px-3 text-slate-600 text-xs">
                        {expense.date ? formatDateForDisplay(expense.date) : `Day ${expense.dayNumber || 1}`}
                        {expense.dayNumber && (
                          <span className="text-[10px] text-slate-400 block">
                            Day {expense.dayNumber}
                          </span>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-3 font-display font-bold text-slate-900 text-sm">
                        {currency}
                        {expense.amount.toLocaleString()}
                      </td>

                      {/* Source Badge */}
                      <td className="py-3.5 px-3">
                        {isManual ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            Manual
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200/80">
                            <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                            <span>Automatic</span>
                          </span>
                        )}
                      </td>

                      {/* Action buttons */}
                      <td className="py-3.5 px-4 text-right">
                        {isManual ? (
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => onEditExpense(expense)}
                              title="Edit Expense"
                              className="p-1.5 text-slate-400 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                              aria-label={`Edit ${expense.name}`}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteExpense(expense)}
                              title="Delete Expense"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              aria-label={`Delete ${expense.name}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span
                            className="text-[10px] text-slate-400 font-medium italic"
                            title="Synced from itinerary activities"
                          >
                            Synced Activity
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 px-6 text-center space-y-3 bg-slate-50/50">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-sm">
                No matching expenses found
              </p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                {searchQuery || selectedCategory !== 'all' || selectedSource !== 'all'
                  ? 'Try adjusting your search query or filters to see all recorded items.'
                  : 'Add your first expense or schedule activities with estimated costs to start tracking your budget.'}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onAddExpense}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Add New Expense
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
