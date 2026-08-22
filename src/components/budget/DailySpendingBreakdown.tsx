import React, { useState } from 'react';
import {
  Calendar,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  MapPin,
  Tag,
  Clock,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { BudgetFinancials, DailySpendingSummary, ExpenseItem } from '../../types/budget';

interface DailySpendingBreakdownProps {
  financials: BudgetFinancials;
  onAddExpenseForDay?: (dayNumber: number, dateStr: string) => void;
}

export const DailySpendingBreakdown: React.FC<DailySpendingBreakdownProps> = ({
  financials,
  onAddExpenseForDay,
}) => {
  const [expandedDays, setExpandedDays] = useState<Record<number, boolean>>({
    1: true,
    2: true,
  });

  const { dailyBreakdown, baselineDailyBudget, currency, tripDurationDays } = financials;

  const toggleDay = (dayNumber: number) => {
    setExpandedDays((prev) => ({
      ...prev,
      [dayNumber]: !prev[dayNumber],
    }));
  };

  const expandAll = () => {
    const all: Record<number, boolean> = {};
    dailyBreakdown.forEach((d) => (all[d.dayNumber] = true));
    setExpandedDays(all);
  };

  const collapseAll = () => {
    setExpandedDays({});
  };

  const overBudgetDaysCount = dailyBreakdown.filter((d) => d.isOverBudget).length;

  return (
    <div className="rounded-3xl bg-white border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-600">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-base sm:text-lg text-slate-900">
                Daily Spending Breakdown & Targets
              </h3>
              {overBudgetDaysCount > 0 ? (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                  {overBudgetDaysCount} High-Spend {overBudgetDaysCount === 1 ? 'Day' : 'Days'}
                </span>
              ) : (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  All Days on Target
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Baseline daily target: <span className="font-semibold text-slate-700">{currency}{baselineDailyBudget.toLocaleString()}/day</span> across {tripDurationDays} journey days
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={expandAll}
            className="text-xs font-semibold text-teal-600 hover:text-teal-700 hover:underline px-2 py-1 rounded-lg hover:bg-teal-50 transition-colors cursor-pointer"
          >
            Expand All
          </button>
          <span className="text-slate-300">•</span>
          <button
            type="button"
            onClick={collapseAll}
            className="text-xs font-semibold text-slate-500 hover:text-slate-700 hover:underline px-2 py-1 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Daily Cards Stream */}
      <div className="space-y-3.5">
        {dailyBreakdown.map((day) => {
          const isExpanded = !!expandedDays[day.dayNumber];
          const hasItems = day.items.length > 0;

          return (
            <div
              key={day.dayNumber}
              className={`
                rounded-2xl border transition-all duration-200 overflow-hidden
                ${
                  day.isOverBudget
                    ? 'border-amber-200/90 bg-amber-50/20'
                    : 'border-slate-200/80 bg-slate-50/40 hover:border-slate-300'
                }
              `}
            >
              {/* Day Header Accordion Trigger */}
              <div
                onClick={() => toggleDay(day.dayNumber)}
                className="p-4 sm:p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none hover:bg-black/2"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`
                      w-10 h-10 rounded-xl flex flex-col items-center justify-center shrink-0 font-display font-bold text-xs
                      ${
                        day.isOverBudget
                          ? 'bg-amber-100 text-amber-900 border border-amber-200'
                          : 'bg-white text-slate-800 border border-slate-200 shadow-2xs'
                      }
                    `}
                  >
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 font-sans font-semibold">
                      Day
                    </span>
                    <span className="text-sm leading-none">{day.dayNumber}</span>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-slate-900 truncate">
                        {day.formattedDate}
                      </p>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs text-slate-600 font-medium flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-teal-600 shrink-0" />
                        <span>{day.destinationCity}</span>
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 mt-0.5">
                      {hasItems ? (
                        <span>
                          {day.items.length} {day.items.length === 1 ? 'item' : 'items'} planned
                        </span>
                      ) : (
                        <span className="italic text-slate-400">No scheduled expenses</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Right side: Amount & Status */}
                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                  <div className="text-right">
                    <div className="flex items-baseline gap-1.5 justify-end">
                      <span className="text-sm sm:text-base font-bold font-display text-slate-900">
                        {currency}
                        {day.totalSpent.toLocaleString()}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        / {currency}{baselineDailyBudget.toLocaleString()} target
                      </span>
                    </div>

                    {day.isOverBudget ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-100/90 px-2 py-0.5 rounded-full mt-0.5 border border-amber-300/60">
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        <span>+{currency}{day.overAmount.toLocaleString()} over target</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full mt-0.5 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Within target</span>
                      </span>
                    )}
                  </div>

                  <div className="p-1 text-slate-400 rounded-lg">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </div>
              </div>

              {/* Collapsible Details Body */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-1 border-t border-slate-200/60 bg-white/70 space-y-2.5">
                  {hasItems ? (
                    <div className="divide-y divide-slate-100 rounded-xl border border-slate-100 bg-white overflow-hidden">
                      {day.items.map((item) => (
                        <div
                          key={item.id}
                          className="p-3 flex items-center justify-between gap-3 text-xs hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span
                              className={`
                                text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md shrink-0 border
                                ${
                                  item.source === 'automatic'
                                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                                    : 'bg-teal-50 text-teal-800 border-teal-200'
                                }
                              `}
                            >
                              {item.category}
                            </span>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-800 truncate">
                                {item.name}
                              </p>
                              {item.notes && (
                                <p className="text-[11px] text-slate-400 truncate">
                                  {item.notes}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {item.source === 'automatic' && (
                              <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-sm font-medium">
                                Itinerary Activity
                              </span>
                            )}
                            <span className="font-bold text-slate-900 font-display">
                              {currency}
                              {item.amount.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-4 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      No expenses logged for this day yet.
                    </div>
                  )}

                  {onAddExpenseForDay && (
                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => onAddExpenseForDay(day.dayNumber, day.dateStr)}
                        className="text-xs font-semibold text-teal-600 hover:text-teal-700 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>+ Add expense for Day {day.dayNumber}</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
