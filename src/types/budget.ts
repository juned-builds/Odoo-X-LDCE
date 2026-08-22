export type ExpenseCategory = 'transport' | 'accommodation' | 'activities' | 'meals';

export type ExpenseSource = 'automatic' | 'manual';

export interface ExpenseItem {
  id: string;
  tripId: string;
  category: ExpenseCategory;
  name: string;
  amount: number;
  date?: string; // YYYY-MM-DD
  dayNumber?: number; // 1-indexed day in trip
  source: ExpenseSource;
  notes?: string;
  activityAssignmentId?: string; // Linked activity ID if source is 'automatic'
  destinationCity?: string;
  createdAt?: string;
}

export interface CategorySummary {
  category: ExpenseCategory;
  label: string;
  amount: number;
  percentage: number;
  itemCount: number;
  color: string; // Tailwind class
  hexColor: string; // Hex for chart
  bgColor: string;
  borderColor: string;
  textColor: string;
  iconName: 'train' | 'bed' | 'compass' | 'utensils';
}

export interface DailySpendingSummary {
  dateStr: string;
  dayNumber: number;
  formattedDate: string;
  destinationCity: string;
  totalSpent: number;
  baselineDailyBudget: number;
  isOverBudget: boolean;
  overAmount: number;
  percentageOfDailyTarget: number;
  items: ExpenseItem[];
}

export interface BudgetFinancials {
  totalBudget: number;
  totalEstimatedCost: number;
  remainingBudget: number;
  isOverBudget: boolean;
  overBudgetAmount: number;
  percentageUsed: number;
  averageDailyCost: number;
  baselineDailyBudget: number;
  tripDurationDays: number;
  currency: string;
  categories: Record<ExpenseCategory, CategorySummary>;
  dailyBreakdown: DailySpendingSummary[];
  allExpenses: ExpenseItem[];
  manualExpensesCount: number;
  automaticExpensesCount: number;
}
