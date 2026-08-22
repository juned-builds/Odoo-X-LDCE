import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Sparkles, X, Compass } from 'lucide-react';
import { DashboardHeader } from './DashboardHeader';
import { UpcomingTripCard } from './UpcomingTripCard';
import { RecentTripsSection } from './RecentTripsSection';
import { RecommendedDestinationsSection } from './RecommendedDestinationsSection';
import { BudgetHighlightCard } from './BudgetHighlightCard';
import { PlaceholderModal } from '../common/PlaceholderModal';
import { AuthenticatedUser } from '../../types/auth';
import {
  MOCK_UPCOMING_TRIP,
  MOCK_RECENT_TRIPS,
  MOCK_RECOMMENDED_DESTINATIONS,
  MOCK_BUDGET_HIGHLIGHT,
} from '../../data/mockDashboardData';
import { Trip } from '../../types/dashboard';

interface DashboardViewProps {
  user: AuthenticatedUser | null;
  onPlanTrip: () => void;
  trips?: Trip[];
  newlyCreatedTrip?: Trip | null;
  onDismissSuccessBanner?: () => void;
<<<<<<< Updated upstream
  onViewAllTrips?: () => void;
  onEditTrip?: (trip: Trip) => void;
  onViewTrip?: (trip: Trip) => void;
=======
>>>>>>> Stashed changes
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  onPlanTrip,
  trips = MOCK_RECENT_TRIPS,
  newlyCreatedTrip,
  onDismissSuccessBanner,
<<<<<<< Updated upstream
  onViewAllTrips,
  onEditTrip,
  onViewTrip,
=======
>>>>>>> Stashed changes
}) => {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    moduleName: string;
  }>({
    isOpen: false,
    title: '',
    description: '',
    moduleName: '',
  });

  const handleOpenPlaceholder = (
    title: string,
    description: string,
    moduleName: string = 'Upcoming Module'
  ) => {
    setModalState({
      isOpen: true,
      title,
      description,
      moduleName,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8 pb-12"
    >
      {/* Newly Created Trip Success Alert Banner */}
      {newlyCreatedTrip && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-sm flex items-center justify-between gap-3 text-emerald-900 animate-fadeIn">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                <span>Trip Created Successfully:</span>
                <span className="text-emerald-700 underline truncate">{newlyCreatedTrip.name}</span>
              </p>
              <p className="text-[11px] text-emerald-700">
                {newlyCreatedTrip.duration} • Scheduled from {newlyCreatedTrip.startDate} to {newlyCreatedTrip.endDate}. Added to your active trip collection.
              </p>
            </div>
          </div>

          {onDismissSuccessBanner && (
            <button
              type="button"
              onClick={onDismissSuccessBanner}
              className="p-1.5 text-emerald-600 hover:text-emerald-900 hover:bg-emerald-100 rounded-lg transition-colors"
              aria-label="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* 1. Welcoming Hero Dashboard Header */}
      <DashboardHeader user={user} onPlanTrip={onPlanTrip} />

      {/* 2. Upcoming Trip & Budget Highlights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column (8 cols): Hero Upcoming Trip */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xl font-bold font-display tracking-tight text-slate-900">
              Next Upcoming Journey
            </h2>
            <span className="text-xs text-slate-500 font-medium">Starts in 14 days</span>
          </div>
          <UpcomingTripCard
<<<<<<< Updated upstream
            trip={upcomingTrip}
            onViewItinerary={(trip) => {
              if (onViewTrip) {
                onViewTrip(trip);
              } else {
                handleOpenPlaceholder(
                  `Itinerary: ${trip.name}`,
                  `The full day-by-day interactive itinerary builder for ${trip.route} will be introduced in subsequent modules. You can review scheduled days, flights, and booked stays here.`,
                  'Module: Itinerary Builder'
                );
              }
            }}
=======
            trip={MOCK_UPCOMING_TRIP}
            onViewItinerary={(trip) =>
              handleOpenPlaceholder(
                `Itinerary: ${trip.name}`,
                `The full day-by-day interactive itinerary builder for ${trip.route} will be introduced in subsequent modules. You can review scheduled days, flights, and booked stays here.`,
                'Module: Itinerary Builder'
              )
            }
>>>>>>> Stashed changes
          />
        </div>

        {/* Right Column (5 cols): Compact Budget Overview */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xl font-bold font-display tracking-tight text-slate-900">
              Trip Budget
            </h2>
            <span className="text-xs text-teal-700 font-semibold bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
              ₹11,500 Left
            </span>
          </div>
          <BudgetHighlightCard
            budget={MOCK_BUDGET_HIGHLIGHT}
            onViewBudgetDetails={() =>
              handleOpenPlaceholder(
                'Comprehensive Budget Planner',
                'The detailed expense logger, currency converter, split-cost calculator, and receipt manager will be available in the upcoming Budget module.',
                'Module: Budget Manager'
              )
            }
          />
        </div>
      </div>

      {/* 3. Recent Trips Section */}
      <RecentTripsSection
        trips={trips}
        onViewTrip={(trip) =>
          handleOpenPlaceholder(
            `Trip Overview: ${trip.name}`,
            `Viewing ${trip.name} (${trip.route}) covering ${trip.destinationCount} destination(s) between ${trip.startDate} and ${trip.endDate}. Detailed timeline will unlock in the Trip View module.`,
            'Module: Trip Explorer'
          )
        }
        onEditTrip={(trip) =>
          handleOpenPlaceholder(
            `Edit ${trip.name}`,
            `Editing dates, waypoints, travelers, and transport details for ${trip.name} will be supported in the Trip Editor module.`,
            'Module: Trip Editor'
          )
        }
        onViewAllTrips={() =>
          handleOpenPlaceholder(
            'All Trips Archive',
            'Browse and filter your complete archive of past, ongoing, and wishlisted journeys in the upcoming My Trips library.',
            'Module: My Trips'
          )
        }
      />

      {/* 4. Recommended Destinations Section */}
      <RecommendedDestinationsSection
        destinations={MOCK_RECOMMENDED_DESTINATIONS}
        onExploreDestination={(dest) =>
          handleOpenPlaceholder(
            `Explore ${dest.city}, ${dest.country}`,
            `${dest.city} guide: ${dest.shortDescription} Best season to visit: ${dest.bestTimeToVisit}. Interactive local spot curations and map routes will be available in the Explore module.`,
            'Module: City & Activity Guide'
          )
        }
        onExploreAll={() =>
          handleOpenPlaceholder(
            'Global Destination Directory',
            'Discover hand-curated itineraries and hidden gems for hundreds of cities worldwide in the upcoming Explore Hub.',
            'Module: Explore Hub'
          )
        }
      />

      {/* Reusable Informative Feedback Modal */}
      <PlaceholderModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        title={modalState.title}
        description={modalState.description}
        moduleName={modalState.moduleName}
      />
    </motion.div>
  );
};
