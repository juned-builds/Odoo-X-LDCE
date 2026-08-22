import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Wallet,
  Plus,
  ArrowLeft,
  Calendar,
  Layers,
  PieChart,
  List,
  Sparkles,
  TrendingUp,
  Download,
  Share2,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { Trip } from '../../types/dashboard';
import { ExpenseItem } from '../../types/budget';
import { calculateTripFinancials, getAllTripExpenses } from '../../utils/budgetCalculations';
import { BudgetOverviewHeader } from './BudgetOverviewHeader';
import { CategoryDonutChart } from './CategoryDonutChart';
import { CategoryBreakdownTable } from './CategoryBreakdownTable';
import { DailySpendingBreakdown } from './DailySpendingBreakdown';
import { ExpenseListTable } from './ExpenseListTable';
import { AddEditExpenseModal } from './AddEditExpenseModal';
import { EditTripBudgetModal } from './EditTripBudgetModal';
import { DeleteExpenseConfirmModal } from './DeleteExpenseConfirmModal';
import { Button } from '../ui/Button';

interface BudgetViewScreenProps {
  initialTrip?: Trip;
  trips: Trip[];
  onUpdateTrip: (updatedTrip: Trip) => void;
  onBack?: () => void;
  onNavigateToItinerary?: (trip: Trip) => void;
}

export const BudgetViewScreen: React.FC<BudgetViewScreenProps> = ({
  initialTrip,
  trips,
  onUpdateTrip,
  onBack,
  onNavigateToItinerary,
}) => {
  // Active selected trip
  const [selectedTripId, setSelectedTripId] = useState<string>(
    initialTrip?.id || (trips.length > 0 ? trips[0].id : 'trip-1')
  );

  // Find active trip object from shared trips state
  const currentTrip = useMemo(() => {
    return trips.find((t) => t.id === selectedTripId) || initialTrip || trips[0];
  }, [trips, selectedTripId, initialTrip]);

  // Active view tab: 'all' (unified dashboard), 'categories', 'daily', 'expenses'
  const [activeTab, setActiveTab] = useState<'all' | 'categories' | 'daily' | 'expenses'>('all');

  // Modals state
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseItem | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<ExpenseItem | null>(null);
  const [isEditBudgetOpen, setIsEditBudgetOpen] = useState(false);
  const [targetDayNumber, setTargetDayNumber] = useState<number | undefined>(undefined);
  const [targetDateStr, setTargetDateStr] = useState<string | undefined>(undefined);

  // Calculate financials for current trip
  const financials = useMemo(() => {
    if (!currentTrip) {
      return calculateTripFinancials({
        id: 'empty',
        name: 'Empty Trip',
        route: '',
        destinationCount: 0,
        startDate: '',
        endDate: '',
        duration: '1 day',
        status: 'planning',
        coverImage: '',
        progressPercentage: 0,
        budgetTotal: 0,
        budgetSpent: 0,
        currency: '₹',
        destinations: [],
      });
    }
    return calculateTripFinancials(currentTrip);
  }, [currentTrip]);

  // Handle Switch Trip
  const handleSwitchTrip = (trip: Trip) => {
    setSelectedTripId(trip.id);
  };

  // Handle Save Total Budget
  const handleSaveBudget = (newBudget: number) => {
    if (!currentTrip) return;
    const updatedTrip: Trip = {
      ...currentTrip,
      budgetTotal: newBudget,
    };
    onUpdateTrip(updatedTrip);
  };

  // Handle Save Manual Expense (Add or Edit)
  const handleSaveExpense = (
    expenseData: Omit<ExpenseItem, 'id' | 'tripId' | 'source'> & { id?: string }
  ) => {
    if (!currentTrip) return;

    const currentExpenses = currentTrip.expenses || getAllTripExpenses(currentTrip).filter((e) => e.source === 'manual');

    let updatedExpenses: ExpenseItem[];

    if (expenseData.id) {
      // Editing existing expense
      updatedExpenses = currentExpenses.map((exp) =>
        exp.id === expenseData.id
          ? {
              ...exp,
              category: expenseData.category,
              name: expenseData.name,
              amount: expenseData.amount,
              date: expenseData.date,
              dayNumber: expenseData.dayNumber,
              notes: expenseData.notes,
            }
          : exp
      );
    } else {
      // Adding new manual expense
      const newExpense: ExpenseItem = {
        id: `exp-${Date.now()}`,
        tripId: currentTrip.id,
        category: expenseData.category,
        name: expenseData.name,
        amount: expenseData.amount,
        date: expenseData.date,
        dayNumber: expenseData.dayNumber,
        source: 'manual',
        notes: expenseData.notes,
        createdAt: new Date().toISOString(),
      };
      updatedExpenses = [newExpense, ...currentExpenses];
    }

    const updatedTrip: Trip = {
      ...currentTrip,
      expenses: updatedExpenses,
    };

    onUpdateTrip(updatedTrip);
  };

  // Handle Delete Expense
  const handleConfirmDelete = () => {
    if (!currentTrip || !deletingExpense) return;

    const currentExpenses = currentTrip.expenses || getAllTripExpenses(currentTrip).filter((e) => e.source === 'manual');
    const updatedExpenses = currentExpenses.filter((e) => e.id !== deletingExpense.id);

    const updatedTrip: Trip = {
      ...currentTrip,
      expenses: updatedExpenses,
    };

    onUpdateTrip(updatedTrip);
    setDeletingExpense(null);
  };

  // Open add expense pre-configured for a day
  const handleAddExpenseForDay = (dayNumber: number, dateStr: string) => {
    setTargetDayNumber(dayNumber);
    setTargetDateStr(dateStr);
    setEditingExpense(null);
    setIsAddExpenseOpen(true);
  };

  if (!currentTrip) {
    return (
      <div className="py-12 text-center space-y-4">
        <p className="text-slate-500">No active trips available to calculate budget.</p>
        {onBack && (
          <Button variant="outline" size="sm" onClick={onBack}>
            Back to Trips
          </Button>
        )}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8 pb-16 max-w-7xl mx-auto"
    >
      {/* Navigation & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
              aria-label="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-slate-900">
              Trip Budget & Cost Breakdown
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Live financial tracking, category allocation & daily spending targets
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2.5">
          {onNavigateToItinerary && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigateToItinerary(currentTrip)}
              leftIcon={<Calendar className="w-3.5 h-3.5" />}
            >
              View Itinerary
            </Button>
          )}

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setEditingExpense(null);
              setTargetDayNumber(undefined);
              setTargetDateStr(undefined);
              setIsAddExpenseOpen(true);
            }}
            leftIcon={<Plus className="w-4 h-4 stroke-[2.5]" />}
          >
            Add Expense
          </Button>
        </div>
      </div>

      {/* 1. Header Overview & Summary Cards */}
      <BudgetOverviewHeader
        trip={currentTrip}
        financials={financials}
        onEditBudget={() => setIsEditBudgetOpen(true)}
        availableTrips={trips}
        onSwitchTrip={handleSwitchTrip}
      />

      {/* 2. Sub-View Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200/90 pb-3">
        <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/60 overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`
              px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer
              ${
                activeTab === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }
            `}
          >
            <TrendingUp className="w-3.5 h-3.5 text-teal-600" />
            <span>Complete Overview</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('categories')}
            className={`
              px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer
              ${
                activeTab === 'categories'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }
            `}
          >
            <PieChart className="w-3.5 h-3.5 text-indigo-600" />
            <span>Category Analytics</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('daily')}
            className={`
              px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer
              ${
                activeTab === 'daily'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }
            `}
          >
            <Calendar className="w-3.5 h-3.5 text-amber-600" />
            <span>Daily Targets</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('expenses')}
            className={`
              px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer
              ${
                activeTab === 'expenses'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }
            `}
          >
            <List className="w-3.5 h-3.5 text-teal-600" />
            <span>All Expenses ({financials.allExpenses.length})</span>
          </button>
        </div>

        <span className="hidden md:inline-block text-xs text-slate-400 font-medium">
          {financials.automaticExpensesCount} Activities Synced • {financials.manualExpensesCount} Manual
        </span>
      </div>

      {/* 3. Tab Views Content Rendering */}
      {activeTab === 'all' ? (
        <div className="space-y-8">
          {/* Top Row: Category Donut Chart + Category Breakdown Table */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            <div className="lg:col-span-6 xl:col-span-6">
              <CategoryDonutChart financials={financials} />
            </div>
            <div className="lg:col-span-6 xl:col-span-6">
              <CategoryBreakdownTable financials={financials} />
            </div>
          </div>

          {/* Middle Row: Daily Spending Targets & Over-Budget Alerts */}
          <DailySpendingBreakdown
            financials={financials}
            onAddExpenseForDay={handleAddExpenseForDay}
          />

          {/* Bottom Row: Full Expense Directory Table */}
          <ExpenseListTable
            financials={financials}
            onAddExpense={() => {
              setEditingExpense(null);
              setTargetDayNumber(undefined);
              setTargetDateStr(undefined);
              setIsAddExpenseOpen(true);
            }}
            onEditExpense={(expense) => {
              setEditingExpense(expense);
              setIsAddExpenseOpen(true);
            }}
            onDeleteExpense={(expense) => {
              setDeletingExpense(expense);
            }}
          />
        </div>
      ) : activeTab === 'categories' ? (
        <div className="space-y-6">
          <CategoryDonutChart financials={financials} />
          <CategoryBreakdownTable financials={financials} />
        </div>
      ) : activeTab === 'daily' ? (
        <div className="space-y-6">
          <DailySpendingBreakdown
            financials={financials}
            onAddExpenseForDay={handleAddExpenseForDay}
          />
        </div>
      ) : (
        <div className="space-y-6">
          <ExpenseListTable
            financials={financials}
            onAddExpense={() => {
              setEditingExpense(null);
              setTargetDayNumber(undefined);
              setTargetDateStr(undefined);
              setIsAddExpenseOpen(true);
            }}
            onEditExpense={(expense) => {
              setEditingExpense(expense);
              setIsAddExpenseOpen(true);
            }}
            onDeleteExpense={(expense) => {
              setDeletingExpense(expense);
            }}
          />
        </div>
      )}

      {/* Add / Edit Expense Modal */}
      <AddEditExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => {
          setIsAddExpenseOpen(false);
          setEditingExpense(null);
        }}
        onSave={handleSaveExpense}
        trip={currentTrip}
        initialExpense={editingExpense}
        defaultDayNumber={targetDayNumber}
        defaultDate={targetDateStr}
      />

      {/* Edit Trip Total Budget Modal */}
      <EditTripBudgetModal
        isOpen={isEditBudgetOpen}
        onClose={() => setIsEditBudgetOpen(false)}
        onSave={handleSaveBudget}
        trip={currentTrip}
        currentEstimatedCost={financials.totalEstimatedCost}
      />

      {/* Delete Expense Confirmation Dialog */}
      <DeleteExpenseConfirmModal
        isOpen={!!deletingExpense}
        onClose={() => setDeletingExpense(null)}
        onConfirm={handleConfirmDelete}
        expense={deletingExpense}
        currency={financials.currency}
      />
    </motion.div>
  );
};
