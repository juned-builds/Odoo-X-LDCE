import React from 'react';
import {
  Wallet,
  Coins,
  TrendingDown,
  Calendar,
  AlertTriangle,
  Edit3,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import { Trip } from '../../types/dashboard';
import { BudgetFinancials } from '../../types/budget';
import { formatTripDateRange } from '../../utils/dateUtils';

interface BudgetOverviewHeaderProps {
  trip: Trip;
  financials: BudgetFinancials;
  onEditBudget: () => void;
  onSelectTripClick?: () => void;
  availableTrips?: Trip[];
  onSwitchTrip?: (trip: Trip) => void;
}

export const BudgetOverviewHeader: React.FC<BudgetOverviewHeaderProps> = ({
  trip,
  financials,
  onEditBudget,
  availableTrips = [],
  onSwitchTrip,
}) => {
  const {
    totalBudget,
    totalEstimatedCost,
    remainingBudget,
    isOverBudget,
    overBudgetAmount,
    percentageUsed,
    averageDailyCost,
    baselineDailyBudget,
    tripDurationDays,
    currency,
  } = financials;

  return (
    <div className="space-y-6">
      {/* Top Banner / Trip Selector Bar */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white p-6 sm:p-8 shadow-md relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5" />
                <span>Trip Budget Planner</span>
              </span>

              {isOverBudget ? (
                <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center gap-1.5 animate-pulse">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Over Budget by {currency}{overBudgetAmount.toLocaleString()}</span>
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Budget Healthy ({100 - percentageUsed}% Remaining)</span>
                </span>
              )}
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-display tracking-tight text-white">
                {trip.name}
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="text-teal-300 font-semibold">{trip.route || trip.destinations.join(' → ')}</span>
                <span className="text-slate-500">•</span>
                <span>{formatTripDateRange(trip.startDate, trip.endDate)}</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-200 font-medium">{tripDurationDays} Days Journey</span>
              </p>
            </div>
          </div>

          {/* Trip Selector Switcher */}
          {availableTrips.length > 1 && onSwitchTrip && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/15">
              <label htmlFor="trip-select" className="text-xs font-medium text-slate-300 pl-2">
                Budget for:
              </label>
              <select
                id="trip-select"
                value={trip.id}
                onChange={(e) => {
                  const selected = availableTrips.find((t) => t.id === e.target.value);
                  if (selected) onSwitchTrip(selected);
                }}
                className="bg-slate-900/90 text-white text-xs font-semibold rounded-xl px-3 py-2 border border-slate-700 hover:border-teal-400 focus:outline-hidden focus:ring-2 focus:ring-teal-400 transition-all cursor-pointer"
              >
                {availableTrips.map((t) => (
                  <option key={t.id} value={t.id} className="bg-slate-900 text-white">
                    {t.name} ({t.currency || '₹'}{t.budgetTotal.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Critical Over-Budget Warning Banner if exceeded */}
      {isOverBudget && (
        <div className="p-4 sm:p-5 rounded-2xl bg-rose-50 border border-rose-200 shadow-sm flex items-start gap-3.5 text-rose-950 animate-fadeIn">
          <div className="w-10 h-10 rounded-xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-1 flex-1 min-w-0">
            <h4 className="text-sm font-bold text-rose-950 flex items-center gap-2">
              <span>Trip is over budget by {currency}{overBudgetAmount.toLocaleString()}</span>
              <span className="text-[11px] font-semibold bg-rose-200/80 text-rose-900 px-2 py-0.5 rounded-full">
                {percentageUsed}% Allocated
              </span>
            </h4>
            <p className="text-xs text-rose-700 leading-relaxed">
              Your estimated total expenses ({currency}{totalEstimatedCost.toLocaleString()}) exceed your set budget of {currency}{totalBudget.toLocaleString()}. You can increase your trip budget or trim expenses and activities to maintain financial balance.
            </p>
          </div>
          <button
            type="button"
            onClick={onEditBudget}
            className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            Adjust Budget
          </button>
        </div>
      )}

      {/* 4 Financial Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* 1. Total Budget */}
        <div className="rounded-3xl bg-white border border-slate-200/90 shadow-sm p-5 sm:p-6 space-y-3 relative group hover:border-teal-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5 text-teal-600" />
              <span>Total Budget</span>
            </span>
            <button
              type="button"
              onClick={onEditBudget}
              title="Edit Trip Budget"
              className="p-1.5 text-slate-400 hover:text-teal-700 hover:bg-teal-50 rounded-xl transition-colors cursor-pointer"
              aria-label="Edit Trip Budget"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div>
            <div className="text-2xl sm:text-3xl font-bold font-display text-slate-900">
              {currency}
              {totalBudget.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
              <span>Target Ceiling</span>
              <button
                type="button"
                onClick={onEditBudget}
                className="text-teal-600 hover:underline font-semibold"
              >
                Change
              </button>
            </p>
          </div>
        </div>

        {/* 2. Estimated / Planned Cost */}
        <div className="rounded-3xl bg-white border border-slate-200/90 shadow-sm p-5 sm:p-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-indigo-600" />
              <span>Planned Cost</span>
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isOverBudget
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-indigo-50 text-indigo-700'
              }`}
            >
              {percentageUsed}% used
            </span>
          </div>

          <div>
            <div className="text-2xl sm:text-3xl font-bold font-display text-slate-900">
              {currency}
              {totalEstimatedCost.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Combined activities & manual expenses
            </p>
          </div>
        </div>

        {/* 3. Remaining Budget */}
        <div className="rounded-3xl bg-white border border-slate-200/90 shadow-sm p-5 sm:p-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <TrendingDown className={`w-3.5 h-3.5 ${isOverBudget ? 'text-rose-600' : 'text-emerald-600'}`} />
              <span>Remaining</span>
            </span>
            {isOverBudget ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                Over Budget
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Available
              </span>
            )}
          </div>

          <div>
            <div
              className={`text-2xl sm:text-3xl font-bold font-display ${
                isOverBudget ? 'text-rose-600' : 'text-emerald-600'
              }`}
            >
              {remainingBudget < 0 ? '-' : ''}
              {currency}
              {Math.abs(remainingBudget).toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {isOverBudget
                ? `Exceeded budget limit by ${currency}${overBudgetAmount.toLocaleString()}`
                : 'Safe reserve for spontaneous spending'}
            </p>
          </div>
        </div>

        {/* 4. Average Cost Per Day */}
        <div className="rounded-3xl bg-white border border-slate-200/90 shadow-sm p-5 sm:p-6 space-y-3 min-w-0">
          <div className="flex items-center justify-between min-w-0">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 min-w-0 truncate">
              <Calendar className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="truncate">Average / Day</span>
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 shrink-0">
              {tripDurationDays} Days
            </span>
          </div>

          <div className="min-w-0">
            <div className="text-2xl sm:text-3xl font-bold font-display text-slate-900 flex flex-wrap items-baseline gap-x-1 min-w-0">
              <span className="whitespace-nowrap">{currency}{averageDailyCost.toLocaleString()}</span>
              <span className="text-xs font-normal text-slate-500 whitespace-nowrap">/day</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 truncate">
              Target baseline: {currency}{baselineDailyBudget.toLocaleString()}/day
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
