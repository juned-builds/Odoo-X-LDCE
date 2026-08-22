import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { DashboardView } from '../dashboard/DashboardView';
import { CreateTripView } from '../trip/CreateTripView';
import { MyTripsView } from '../trips/MyTripsView';
import { ExploreView } from '../explore/ExploreView';
import { ActivitiesView } from '../activities/ActivitiesView';
import { ViewTripModal } from '../trips/ViewTripModal';
import { ItineraryBuilderView } from '../itinerary/ItineraryBuilderView';
import { PlaceholderModal } from '../common/PlaceholderModal';
import { NavSection, Trip, Destination, TripActivityAssignment } from '../../types/dashboard';
import { Activity } from '../../types/activity';
import { AuthenticatedUser } from '../../types/auth';
import { MOCK_RECENT_TRIPS } from '../../data/mockDashboardData';

interface AppShellProps {
  user: AuthenticatedUser | null;
  onLogout: () => void;
}

export const AppShell: React.FC<AppShellProps> = ({ user, onLogout }) => {
  const [activeSection, setActiveSection] = useState<NavSection>('dashboard');
  const [trips, setTrips] = useState<Trip[]>(MOCK_RECENT_TRIPS);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [viewingTrip, setViewingTrip] = useState<Trip | null>(null);
  const [previousSection, setPreviousSection] = useState<NavSection>('dashboard');
  const [newlyCreatedTrip, setNewlyCreatedTrip] = useState<Trip | null>(null);
  const [notificationMessage, setNotificationMessage] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activityDestinationCity, setActivityDestinationCity] = useState<string>('Paris');
  const [itineraryTrip, setItineraryTrip] = useState<Trip | null>(null);

  const [placeholderInfo, setPlaceholderInfo] = useState<{
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

  const handleSelectSection = (section: NavSection) => {
    setActiveSection(section);
    if (section !== 'create-trip') {
      setEditingTrip(null);
    }
    if (section !== 'itinerary') {
      setItineraryTrip(null);
    }

    if (
      section !== 'dashboard' &&
      section !== 'create-trip' &&
      section !== 'my-trips' &&
      section !== 'explore' &&
      section !== 'activities' &&
      section !== 'itinerary'
    ) {
      const sectionLabels: Record<string, string> = {
        calendar: 'Travel Calendar & Scheduling',
        budget: 'Budget & Expense Management',
        settings: 'Preferences & Account Settings',
      };

      setPlaceholderInfo({
        isOpen: true,
        title: sectionLabels[section] || 'Upcoming Screen',
        description: `The ${sectionLabels[section]} screen is planned for later development modules. You can explore destinations, plan journeys, and manage your full trip collection.`,
        moduleName: `Module: ${sectionLabels[section]}`,
      });
    }
  };

  const handleOpenItinerary = (trip: Trip) => {
    setItineraryTrip(trip);
    setPreviousSection(activeSection === 'itinerary' ? 'my-trips' : activeSection);
    setActiveSection('itinerary');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveItinerary = (updatedTrip: Trip) => {
    setTrips((prevTrips) =>
      prevTrips.map((t) => (t.id === updatedTrip.id ? updatedTrip : t))
    );
    setItineraryTrip(updatedTrip);
    setNotificationMessage(`Itinerary for "${updatedTrip.name}" saved successfully.`);
  };

  const handlePlanTrip = () => {
    setEditingTrip(null);
    setPreviousSection(activeSection === 'create-trip' ? 'dashboard' : activeSection);
    setActiveSection('create-trip');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditTrip = (trip: Trip) => {
    setEditingTrip(trip);
    setPreviousSection(activeSection === 'create-trip' ? 'my-trips' : activeSection);
    setActiveSection('create-trip');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewTrip = (trip: Trip) => {
    setViewingTrip(trip);
  };

  const handleDeleteTrip = (tripId: string) => {
    const deletedTrip = trips.find((t) => t.id === tripId);
    setTrips((prevTrips) => prevTrips.filter((t) => t.id !== tripId));
    setNotificationMessage(
      `"${deletedTrip?.name || 'Trip'}" was removed from your collection.`
    );
  };

  const handleTripCreated = (newTrip: Trip, actionType: 'save' | 'continue') => {
    // Add new trip to the trips collection
    setTrips((prevTrips) => [newTrip, ...prevTrips]);
    setNewlyCreatedTrip(newTrip);
    setEditingTrip(null);

    if (actionType === 'continue') {
      setActiveSection('my-trips');
    } else {
      setActiveSection('dashboard');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTripUpdated = (updatedTrip: Trip) => {
    // Update existing trip in collection
    setTrips((prevTrips) =>
      prevTrips.map((t) => (t.id === updatedTrip.id ? updatedTrip : t))
    );
    setEditingTrip(null);
    setNotificationMessage(`"${updatedTrip.name}" has been updated successfully.`);

    // Return to the previous screen (e.g. My Trips or Dashboard)
    setActiveSection(previousSection === 'create-trip' ? 'my-trips' : previousSection);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackFromCreate = () => {
    setEditingTrip(null);
    setActiveSection(previousSection || 'dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Module 5: Add Destination to an Existing Trip in shared state
  const handleAddDestinationToTrip = (tripId: string, destination: Destination) => {
    setTrips((prevTrips) =>
      prevTrips.map((t) => {
        if (t.id !== tripId) return t;

        const alreadyHasCity = t.destinations.some(
          (d) => d.toLowerCase() === destination.city.toLowerCase()
        );

        const updatedDestinations = alreadyHasCity
          ? t.destinations
          : [...t.destinations, destination.city];

        const updatedRoute = alreadyHasCity
          ? t.route
          : t.route
          ? `${t.route} → ${destination.city}`
          : destination.city;

        const updatedStops = [
          ...(t.stops || []),
          {
            destinationId: destination.id,
            city: destination.city,
            country: destination.country,
            order: (t.stops?.length || 0) + 1,
          },
        ];

        return {
          ...t,
          destinations: updatedDestinations,
          destinationCount: updatedDestinations.length,
          route: updatedRoute,
          stops: updatedStops,
        };
      })
    );
  };

  // Module 5: Quick Start New Trip with a specific destination
  const handleCreateTripWithDestination = (destination: Destination) => {
    setEditingTrip({
      id: `trip-${Date.now()}`,
      name: `Trip to ${destination.city}`,
      route: destination.city,
      destinations: [destination.city],
      destinationCount: 1,
      startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      duration: '7 days',
      status: 'planning',
      coverImage: destination.image,
      progressPercentage: 25,
      budgetTotal: 65000,
      budgetSpent: 0,
      currency: '₹',
      description: `Exploring iconic landmarks, cuisine, and cultural highlights across ${destination.city}, ${destination.country}.`,
      stops: [
        {
          destinationId: destination.id,
          city: destination.city,
          country: destination.country,
          order: 1,
        },
      ],
    });
    setPreviousSection('explore');
    setActiveSection('create-trip');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Module 6: Add Activity to a specific Trip & Stop
  const handleAddActivityToTrip = (
    tripId: string,
    stopCity: string,
    activity: Activity
  ) => {
    const newAssignment: TripActivityAssignment = {
      id: `act-assign-${Date.now()}`,
      activityId: activity.id,
      destinationCity: stopCity || activity.destinationCity,
      destinationId: activity.destinationId,
      name: activity.name,
      type: activity.type,
      cost: activity.cost,
      costTier: activity.costTier,
      duration: activity.duration,
      image: activity.image,
      addedAt: new Date().toISOString(),
    };

    setTrips((prevTrips) =>
      prevTrips.map((t) => {
        if (t.id !== tripId) return t;

        const currentActivities = t.activities || [];
        const exists = currentActivities.some((a) => a.activityId === activity.id);
        const updatedActivities = exists
          ? currentActivities.map((a) =>
              a.activityId === activity.id ? newAssignment : a
            )
          : [...currentActivities, newAssignment];

        // Also update stops if present
        const updatedStops = t.stops?.map((stop) => {
          if (stop.city.toLowerCase() === (stopCity || activity.destinationCity).toLowerCase()) {
            const stopActivities = stop.activities || [];
            const stopHasAct = stopActivities.some((a) => a.activityId === activity.id);
            return {
              ...stop,
              activities: stopHasAct
                ? stopActivities.map((a) => (a.activityId === activity.id ? newAssignment : a))
                : [...stopActivities, newAssignment],
            };
          }
          return stop;
        });

        return {
          ...t,
          activities: updatedActivities,
          stops: updatedStops || t.stops,
        };
      })
    );
  };

  // Module 6: Remove Activity from a Trip
  const handleRemoveActivityFromTrip = (
    tripId: string,
    activityId: string,
    stopCity?: string
  ) => {
    setTrips((prevTrips) =>
      prevTrips.map((t) => {
        if (t.id !== tripId) return t;

        const updatedActivities = (t.activities || []).filter(
          (a) => a.activityId !== activityId
        );

        const updatedStops = t.stops?.map((stop) => {
          if (!stopCity || stop.city.toLowerCase() === stopCity.toLowerCase()) {
            return {
              ...stop,
              activities: (stop.activities || []).filter(
                (a) => a.activityId !== activityId
              ),
            };
          }
          return stop;
        });

        return {
          ...t,
          activities: updatedActivities,
          stops: updatedStops || t.stops,
        };
      })
    );
  };

  // Module 6: Navigate to Activities view pre-filtered by destination
  const handleExploreActivitiesForDestination = (destination: Destination) => {
    setActivityDestinationCity(destination.city);
    setActiveSection('activities');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-row">
      {/* 1. Sidebar Navigation */}
      <Sidebar
        activeSection={activeSection}
        onSelectSection={handleSelectSection}
        onPlanTrip={handlePlanTrip}
        user={user}
        onLogout={onLogout}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        tripsCount={trips.length}
      />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Sticky TopBar */}
        <TopBar
          user={user}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onPlanTrip={handlePlanTrip}
          onLogout={onLogout}
        />

        {/* Scrollable Body Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeSection === 'dashboard' ? (
            <DashboardView
              user={user}
              onPlanTrip={handlePlanTrip}
              trips={trips}
              newlyCreatedTrip={newlyCreatedTrip}
              onDismissSuccessBanner={() => setNewlyCreatedTrip(null)}
              onViewAllTrips={() => {
                setActiveSection('my-trips');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onEditTrip={handleEditTrip}
              onViewTrip={handleViewTrip}
              onBuildItinerary={handleOpenItinerary}
              onNavigateToExplore={() => {
                setActiveSection('explore');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          ) : activeSection === 'my-trips' ? (
            <MyTripsView
              trips={trips}
              onPlanTrip={handlePlanTrip}
              onEditTrip={handleEditTrip}
              onViewTrip={handleViewTrip}
              onDeleteTrip={handleDeleteTrip}
              onBuildItinerary={handleOpenItinerary}
              notificationMessage={notificationMessage}
              onDismissNotification={() => setNotificationMessage(null)}
            />
          ) : activeSection === 'explore' ? (
            <ExploreView
              trips={trips}
              onAddDestinationToTrip={handleAddDestinationToTrip}
              onCreateTripWithDestination={handleCreateTripWithDestination}
              onViewTrip={handleViewTrip}
              onExploreActivities={handleExploreActivitiesForDestination}
            />
          ) : activeSection === 'activities' ? (
            <ActivitiesView
              initialDestinationCity={activityDestinationCity}
              trips={trips}
              onAddActivityToTrip={handleAddActivityToTrip}
              onRemoveActivityFromTrip={handleRemoveActivityFromTrip}
              onCreateNewTrip={handlePlanTrip}
            />
          ) : activeSection === 'itinerary' && (itineraryTrip || trips[0]) ? (
            <ItineraryBuilderView
              trip={itineraryTrip || trips[0]}
              onBack={() => {
                setActiveSection(previousSection === 'itinerary' ? 'my-trips' : previousSection);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onSaveTrip={handleSaveItinerary}
              onNavigateToExplore={() => {
                setActiveSection('explore');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          ) : activeSection === 'create-trip' ? (
            <CreateTripView
              onBackToDashboard={handleBackFromCreate}
              onTripCreated={handleTripCreated}
              onTripUpdated={handleTripUpdated}
              editingTrip={editingTrip}
              fromSection={
                previousSection === 'my-trips'
                  ? 'my-trips'
                  : previousSection === 'explore'
                  ? 'explore'
                  : previousSection === 'activities'
                  ? 'activities'
                  : 'dashboard'
              }
            />
          ) : (
            <div className="py-12 text-center space-y-4">
              <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm max-w-lg mx-auto space-y-4">
                <h3 className="text-xl font-bold font-display text-slate-900">
                  {placeholderInfo.title || 'Screen in development'}
                </h3>
                <p className="text-sm text-slate-500">
                  {placeholderInfo.description ||
                    'This section will be introduced in subsequent modules.'}
                </p>
                <button
                  type="button"
                  onClick={() => setActiveSection('dashboard')}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* View Trip Modal */}
      <ViewTripModal
        isOpen={!!viewingTrip}
        trip={viewingTrip}
        onClose={() => setViewingTrip(null)}
        onEdit={(trip) => {
          setViewingTrip(null);
          handleEditTrip(trip);
        }}
        onBuildItinerary={(trip) => {
          setViewingTrip(null);
          handleOpenItinerary(trip);
        }}
      />

      {/* Secondary Nav Item Feedback Modal for Calendar, Budget, Settings */}
      <PlaceholderModal
        isOpen={placeholderInfo.isOpen}
        onClose={() => setPlaceholderInfo({ ...placeholderInfo, isOpen: false })}
        title={placeholderInfo.title}
        description={placeholderInfo.description}
        moduleName={placeholderInfo.moduleName}
      />
    </div>
  );
};

