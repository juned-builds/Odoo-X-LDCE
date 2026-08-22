import React from 'react';
import {
  Train,
  Bed,
  Compass,
  Utensils,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';
import { BudgetFinancials, ExpenseCategory, CategorySummary } from '../../types/budget';

interface CategoryBreakdownTableProps {
  financials: BudgetFinancials;
}

export const CategoryBreakdownTable: React.FC<CategoryBreakdownTableProps> = ({ financials }) => {
  const { categories, totalEstimatedCost, currency } = financials;
  const categoryList: CategorySummary[] = Object.values(categories);

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'train':
        return <Train className="w-4 h-4" />;
      case 'bed':
        return <Bed className="w-4 h-4" />;
      case 'compass':
        return <Compass className="w-4 h-4" />;
      case 'utensils':
        return <Utensils className="w-4 h-4" />;
      default:
        return <Layers className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (percentage: number) => {
    if (percentage >= 40) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
          Major Allocation
        </span>
      );
    }
    if (percentage === 0) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-500">
          No Expenses
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
        Normal Range
      </span>
    );
  };

  return (
    <div className="rounded-3xl bg-white border border-slate-200/90 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 sm:p-7 pb-4 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200/80 flex items-center justify-center text-indigo-600">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-display font-bold text-base sm:text-lg text-slate-900">
              Category Breakdown Table
            </h3>
            <p className="text-xs text-slate-500">
              Structured summary of all 4 required travel expenditure pillars
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
          <Info className="w-3.5 h-3.5" />
          <span>Auto-calculates from itinerary & manual items</span>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-slate-50/80 text-slate-500 text-[11px] font-bold uppercase tracking-wider border-b border-slate-100">
            <tr>
              <th className="py-3.5 px-6">Category</th>
              <th className="py-3.5 px-4">Estimated Cost</th>
              <th className="py-3.5 px-4">% of Total</th>
              <th className="py-3.5 px-4">Items Count</th>
              <th className="py-3.5 px-6 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {categoryList.map((cat) => (
              <tr
                key={cat.category}
                className="hover:bg-slate-50/70 transition-colors"
              >
                {/* Category info */}
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: `${cat.hexColor}15`,
                        color: cat.hexColor,
                      }}
                    >
                      {renderIcon(cat.iconName)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{cat.label}</p>
                      <p className="text-[11px] text-slate-400 hidden sm:block">
                        {cat.category === 'activities'
                          ? 'Automatic itinerary integration'
                          : 'Manually logged items'}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Amount */}
                <td className="py-4 px-4 font-display font-bold text-slate-900">
                  {currency}
                  {cat.amount.toLocaleString()}
                </td>

                {/* % of Total */}
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full ${cat.color}`}
                        style={{ width: `${Math.min(100, cat.percentage)}%` }}
                      />
                    </div>
                    <span className="font-semibold text-slate-700 text-xs">
                      {cat.percentage}%
                    </span>
                  </div>
                </td>

                {/* Items */}
                <td className="py-4 px-4 text-slate-600 font-medium">
                  {cat.itemCount} {cat.itemCount === 1 ? 'record' : 'records'}
                </td>

                {/* Status */}
                <td className="py-4 px-6 text-right">
                  {getStatusBadge(cat.percentage)}
                </td>
              </tr>
            ))}

            {/* Total Row */}
            <tr className="bg-slate-50 font-bold border-t-2 border-slate-200">
              <td className="py-4 px-6 text-slate-900 flex items-center gap-2">
                <span>Total Planned Costs</span>
              </td>
              <td className="py-4 px-4 font-display text-base text-teal-700">
                {currency}
                {totalEstimatedCost.toLocaleString()}
              </td>
              <td className="py-4 px-4 text-slate-900">
                100%
              </td>
              <td className="py-4 px-4 text-slate-700">
                {financials.allExpenses.length} total
              </td>
              <td className="py-4 px-6 text-right">
                <span className="text-xs font-bold text-slate-600">
                  Comprehensive
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
