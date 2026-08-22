import React from 'react';
import {
  Wallet,
  ArrowRight,
  TrendingUp,
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
    <div className="rounded-3xl bg-white border border-slate-200/90 shadow-sm p-5 sm:p-6 space-y-5 min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100 min-w-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 shrink-0">
            <Wallet className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-display font-bold text-base sm:text-lg text-slate-900 truncate">
                Budget Overview
              </h3>
              <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200 truncate max-w-[140px]">
                {budget.tripName}
              </span>
            </div>
            <p className="text-xs text-slate-500 truncate">
              Live financial snapshot for your active {budget.tripDurationDays}-day itinerary
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onViewBudgetDetails}
          className="text-xs font-semibold text-teal-600 hover:text-teal-700 hover:underline inline-flex items-center gap-1 shrink-0 self-start sm:self-auto cursor-pointer"
        >
          <span>Budget details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Numbers Grid: Responsive for narrow right-column (1 col on desktop sidebar/mobile, 3 cols on tablet) */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-1 gap-3 min-w-0">
        {/* Total Spent vs Planned */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-100/90 space-y-1 min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 truncate">
            Total Spent
          </p>
          <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 min-w-0">
            <span className="text-xl sm:text-2xl font-bold font-display text-slate-900 tracking-tight whitespace-nowrap">
              {budget.currency}{budget.amountSpent.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
              / {budget.currency}{budget.totalPlanned.toLocaleString()}
            </span>
          </div>
          <p className="text-[11px] text-teal-700 font-medium">
            {percentageSpent}% of planned allocation
          </p>
        </div>

        {/* Remaining Budget */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-100/90 space-y-1 min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 truncate">
            Remaining Available
          </p>
          <div className="text-xl sm:text-2xl font-bold font-display text-emerald-600 tracking-tight whitespace-nowrap">
            {budget.remainingAmount < 0 ? '-' : ''}
            {budget.currency}{Math.abs(budget.remainingAmount).toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500">
            Safe buffer for spontaneous activities
          </p>
        </div>

        {/* Daily Average Cost */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-100/90 space-y-1 min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 truncate">
            Average Daily Cost
          </p>
          <div className="flex flex-wrap items-baseline gap-x-1 min-w-0">
            <span className="text-xl sm:text-2xl font-bold font-display text-slate-900 tracking-tight whitespace-nowrap">
              {budget.currency}{budget.averageDailyCost.toLocaleString()}
            </span>
            <span className="text-xs sm:text-sm font-normal text-slate-500 whitespace-nowrap">/day</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Calculated across {budget.tripDurationDays} journey days
          </p>
        </div>
      </div>

      {/* Progress Bar with multi-segment breakdown */}
      <div className="space-y-3 min-w-0">
        <div className="flex items-center justify-between text-xs gap-2 min-w-0">
          <span className="font-semibold text-slate-700 flex items-center gap-1.5 min-w-0 truncate">
            <TrendingUp className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span className="truncate">Category Spending Distribution</span>
          </span>
          <span className="text-slate-500 text-[11px] shrink-0 whitespace-nowrap">
            {budget.categories.length} Categories Tracked
          </span>
        </div>

        {/* Stacked category bar */}
        <div className="w-full h-3 rounded-full bg-slate-100 flex overflow-hidden p-0.5 gap-0.5 border border-slate-200/60">
          {budget.categories.map((cat) => (
            <div
              key={cat.name}
              className={`h-full rounded-xs transition-all duration-500 ${cat.color}`}
              style={{ width: `${Math.max(cat.percentage, 2)}%` }}
              title={`${cat.name}: ${cat.percentage}% (${budget.currency}${cat.spent.toLocaleString()})`}
            />
          ))}
        </div>

        {/* Category Pill Grid: 2 columns on mobile/desktop sidebar, 4 columns on tablet */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 gap-2 sm:gap-2.5 pt-1 min-w-0">
          {budget.categories.map((cat) => (
            <div
              key={cat.name}
              className="p-2.5 sm:p-3 rounded-2xl bg-slate-50/80 border border-slate-100/90 flex flex-col justify-between min-w-0 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-1.5 mb-1.5 min-w-0">
                <span className={`w-2 h-2 rounded-full shrink-0 ${cat.color}`} />
                <span className="text-xs font-semibold text-slate-700 truncate min-w-0">
                  {cat.name}
                </span>
              </div>
              <div className="flex flex-wrap items-baseline justify-between gap-x-1.5 gap-y-0.5 min-w-0">
                <span className="text-xs sm:text-[13px] font-bold text-slate-900 tracking-tight whitespace-nowrap min-w-0">
                  {budget.currency}{cat.spent.toLocaleString()}
                </span>
                <span className="text-[10px] sm:text-[11px] text-slate-500 font-semibold px-1.5 py-0.5 rounded-md bg-white border border-slate-200/60 shrink-0">
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
