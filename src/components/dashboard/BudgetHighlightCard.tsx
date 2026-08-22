import React from 'react';
import {
  Wallet,
  ArrowRight,
  TrendingUp,
  PieChart,
  DollarSign,
  Info,
  Sparkles,
} from 'lucide-react';
import { BudgetHighlight } from '../../types/dashboard';

interface BudgetHighlightCardProps {
  budget: BudgetHighlight;
  onViewBudgetDetails: () => void;
}

export const BudgetHighlightCard: React.FC<BudgetHighlightCardProps> = ({
  budget,
  onViewBudgetDetails,
}) => {
  const percentageSpent = Math.round(
    (budget.amountSpent / budget.totalPlanned) * 100
  );

  return (
    <div className="rounded-3xl bg-white border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 shrink-0">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-lg text-slate-900">
                Budget Overview
              </h3>
              <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                {budget.tripName}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Live financial snapshot for your active 10-day itinerary
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onViewBudgetDetails}
          className="text-xs font-semibold text-teal-600 hover:text-teal-700 hover:underline inline-flex items-center gap-1 self-start sm:self-auto"
        >
          <span>Budget details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Numbers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Spent vs Planned */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Total Spent
          </p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-bold font-display text-slate-900">
              {budget.currency}{budget.amountSpent.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              / {budget.currency}{budget.totalPlanned.toLocaleString()}
            </span>
          </div>
          <p className="text-[11px] text-teal-700 font-medium">
            {percentageSpent}% of planned allocation
          </p>
        </div>

        {/* Remaining Budget */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Remaining Available
          </p>
          <div className="text-xl sm:text-2xl font-bold font-display text-emerald-600">
            {budget.currency}{budget.remainingAmount.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500">
            Safe buffer for spontaneous activities
          </p>
        </div>

        {/* Daily Average Cost */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Average Daily Cost
          </p>
          <div className="text-xl sm:text-2xl font-bold font-display text-slate-900">
            {budget.currency}{budget.averageDailyCost.toLocaleString()}
            <span className="text-xs font-normal text-slate-500">/day</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Calculated across {budget.tripDurationDays} journey days
          </p>
        </div>
      </div>

      {/* Progress Bar with multi-segment breakdown */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-700 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-teal-600" />
            <span>Category Spending Distribution</span>
          </span>
          <span className="text-slate-500 text-[11px]">
            {budget.categories.length} Categories Tracked
          </span>
        </div>

        {/* Stacked category bar */}
        <div className="w-full h-3 rounded-full bg-slate-100 flex overflow-hidden p-0.5 gap-0.5 border border-slate-200/60">
          {budget.categories.map((cat) => (
            <div
              key={cat.name}
              className={`h-full rounded-xs transition-all duration-500 ${cat.color}`}
              style={{ width: `${cat.percentage}%` }}
              title={`${cat.name}: ${cat.percentage}% (${budget.currency}${cat.spent.toLocaleString()})`}
            />
          ))}
        </div>

        {/* Category Pill Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          {budget.categories.map((cat) => (
            <div
              key={cat.name}
              className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-100 flex flex-col justify-between"
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span className={`w-2 h-2 rounded-full ${cat.color}`} />
                <span className="text-xs font-semibold text-slate-700 truncate">
                  {cat.name}
                </span>
              </div>
              <div className="flex items-baseline justify-between text-xs">
                <span className="font-bold text-slate-900">
                  {budget.currency}{cat.spent.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {cat.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
