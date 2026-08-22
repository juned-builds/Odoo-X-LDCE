import React, { useState } from 'react';
import {
  Train,
  Bed,
  Compass,
  Utensils,
  TrendingUp,
  PieChart as PieChartIcon,
  Percent,
} from 'lucide-react';
import { BudgetFinancials, ExpenseCategory, CategorySummary } from '../../types/budget';

interface CategoryDonutChartProps {
  financials: BudgetFinancials;
}

export const CategoryDonutChart: React.FC<CategoryDonutChartProps> = ({ financials }) => {
  const [hoveredCategory, setHoveredCategory] = useState<ExpenseCategory | null>(null);

  const { categories, totalEstimatedCost, currency } = financials;
  const categoryList: CategorySummary[] = Object.values(categories);

  // SVG dimensions
  const size = 260;
  const center = size / 2;
  const radius = 95;
  const strokeWidth = 32;

  // If 0 total cost, show empty ring
  if (totalEstimatedCost <= 0) {
    return (
      <div className="rounded-3xl bg-white border border-slate-200/90 shadow-sm p-6 sm:p-7 flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
          <PieChartIcon className="w-7 h-7" />
        </div>
        <div>
          <h4 className="font-bold text-slate-800">No Expenses Recorded</h4>
          <p className="text-xs text-slate-500 max-w-xs mt-1">
            Add manual expenses or schedule itinerary activities to see the category distribution.
          </p>
        </div>
      </div>
    );
  }

  // Calculate SVG arc paths
  let accumulatedAngle = -90; // Start at top 12 o'clock

  const arcs = categoryList.map((cat) => {
    const fraction = totalEstimatedCost > 0 ? cat.amount / totalEstimatedCost : 0;
    const angleSpan = fraction * 360;
    const startAngle = accumulatedAngle;
    const endAngle = accumulatedAngle + angleSpan;
    accumulatedAngle += angleSpan;

    // Convert angles to radians
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = center + radius * Math.cos(startRad);
    const y1 = center + radius * Math.sin(startRad);
    const x2 = center + radius * Math.cos(endRad);
    const y2 = center + radius * Math.sin(endRad);

    const largeArcFlag = angleSpan > 180 ? 1 : 0;

    // Path for SVG stroke
    const d = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`;

    return {
      category: cat.category,
      label: cat.label,
      amount: cat.amount,
      percentage: cat.percentage,
      hexColor: cat.hexColor,
      path: d,
      angleSpan,
    };
  });

  const activeCategory = hoveredCategory
    ? categories[hoveredCategory]
    : null;

  const renderCategoryIcon = (iconName: string, className: string) => {
    switch (iconName) {
      case 'train':
        return <Train className={className} />;
      case 'bed':
        return <Bed className={className} />;
      case 'compass':
        return <Compass className={className} />;
      case 'utensils':
        return <Utensils className={className} />;
      default:
        return <PieChartIcon className={className} />;
    }
  };

  return (
    <div className="rounded-3xl bg-white border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-6">
      {/* Card Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200/80 flex items-center justify-center text-teal-600">
            <PieChartIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-display font-bold text-base sm:text-lg text-slate-900">
              Cost Category Distribution
            </h3>
            <p className="text-xs text-slate-500">
              Proportional allocation of planned travel expenses
            </p>
          </div>
        </div>

        <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
          4 Categories
        </span>
      </div>

      {/* Main Chart + Legend Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left: Donut Chart SVG */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center relative py-2">
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="overflow-visible select-none drop-shadow-xs"
          >
            {/* Background base track */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="#f1f5f9"
              strokeWidth={strokeWidth}
            />

            {/* Render Category Arc Segments */}
            {arcs.map((arc) => {
              if (arc.angleSpan <= 0.5) return null;
              const isHovered = hoveredCategory === arc.category;
              return (
                <path
                  key={arc.category}
                  d={arc.path}
                  fill="none"
                  stroke={arc.hexColor}
                  strokeWidth={isHovered ? strokeWidth + 6 : strokeWidth}
                  strokeLinecap="butt"
                  className="transition-all duration-200 cursor-pointer"
                  onMouseEnter={() => setHoveredCategory(arc.category)}
                  onMouseLeave={() => setHoveredCategory(null)}
                />
              );
            })}
          </svg>

          {/* Center Content Overlay in Donut Hole */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
            {activeCategory ? (
              <div className="animate-fadeIn space-y-0.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block truncate max-w-[120px]">
                  {activeCategory.label}
                </span>
                <span className="text-lg sm:text-xl font-bold font-display text-slate-900 block">
                  {currency}
                  {activeCategory.amount.toLocaleString()}
                </span>
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full inline-block"
                  style={{
                    backgroundColor: `${activeCategory.hexColor}15`,
                    color: activeCategory.hexColor,
                  }}
                >
                  {activeCategory.percentage}% of total
                </span>
              </div>
            ) : (
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Total Planned
                </span>
                <span className="text-lg sm:text-xl font-bold font-display text-slate-900 block">
                  {currency}
                  {totalEstimatedCost.toLocaleString()}
                </span>
                <span className="text-[11px] text-slate-500 font-medium block">
                  100% Tracked
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Category Legend Breakdown List */}
        <div className="lg:col-span-7 space-y-3">
          {categoryList.map((cat) => {
            const isHovered = hoveredCategory === cat.category;
            return (
              <div
                key={cat.category}
                onMouseEnter={() => setHoveredCategory(cat.category)}
                onMouseLeave={() => setHoveredCategory(null)}
                className={`
                  p-3 sm:p-3.5 rounded-2xl border transition-all duration-150 cursor-pointer flex items-center justify-between gap-3
                  ${
                    isHovered
                      ? `${cat.bgColor} ${cat.borderColor} shadow-xs scale-[1.01]`
                      : 'bg-slate-50/70 border-slate-100 hover:bg-slate-50 hover:border-slate-200'
                  }
                `}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: `${cat.hexColor}15`,
                      color: cat.hexColor,
                    }}
                  >
                    {renderCategoryIcon(cat.iconName, 'w-4 h-4')}
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {cat.label}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {cat.itemCount} {cat.itemCount === 1 ? 'expense' : 'expenses'} recorded
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-sm font-bold font-display text-slate-900">
                    {currency}
                    {cat.amount.toLocaleString()}
                  </p>
                  <span
                    className="text-[11px] font-bold px-2 py-0.5 rounded-full inline-block"
                    style={{
                      backgroundColor: `${cat.hexColor}15`,
                      color: cat.hexColor,
                    }}
                  >
                    {cat.percentage}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Stacked Horizontal Bar Representation */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-700 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-teal-600" />
            <span>Cumulative Allocation Bar</span>
          </span>
          <span className="text-[11px] text-slate-400">
            Hover segment to highlight
          </span>
        </div>

        <div className="w-full h-3 rounded-full bg-slate-100 flex overflow-hidden p-0.5 gap-0.5 border border-slate-200/60">
          {categoryList.map((cat) => (
            <div
              key={cat.category}
              className={`h-full rounded-xs transition-all duration-300 ${cat.color} ${
                hoveredCategory === cat.category ? 'brightness-110 ring-2 ring-slate-900/20' : ''
              }`}
              style={{ width: `${Math.max(2, cat.percentage)}%` }}
              onMouseEnter={() => setHoveredCategory(cat.category)}
              onMouseLeave={() => setHoveredCategory(null)}
              title={`${cat.label}: ${cat.percentage}% (${currency}${cat.amount.toLocaleString()})`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
