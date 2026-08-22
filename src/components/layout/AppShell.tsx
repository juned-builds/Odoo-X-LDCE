import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { DashboardView } from '../dashboard/DashboardView';
import { CreateTripView } from '../trip/CreateTripView';
import { MyTripsView } from '../trips/MyTripsView';
import { ExploreView } from '../explore/ExploreView';
import { ActivitiesView } from '../activities/ActivitiesView';
import { ViewTripModal } from '../trips/ViewTripModal';
import { ItineraryBuilderView } from '../itinerary/ItineraryBuilderView';
import { ItineraryViewScreen } from '../itinerary/ItineraryViewScreen';
import { BudgetViewScreen } from '../budget/BudgetViewScreen';
import { PublicItineraryView } from '../share/PublicItineraryView';
import { ShareTripModal } from '../share/ShareTripModal';
import { SettingsView } from '../settings/SettingsView';
import { PlaceholderModal } from '../common/PlaceholderModal';
import { NavSection, Trip, Destination, TripActivityAssignment } from '../../types/dashboard';
import { Activity } from '../../types/activity';
import { AuthenticatedUser } from '../../types/auth';
import { MOCK_RECENT_TRIPS } from '../../data/mockDashboardData';
import { ALL_DESTINATIONS } from '../../data/destinationsData';
import { getTripShareId, cloneTripForCopy } from '../../utils/shareUtils';
import {
  fetchTripsApi,
  createTripApi,
  updateTripApi,
  deleteTripApi,
  fetchSavedDestinationIdsApi,
  saveDestinationApi,
  removeSavedDestinationApi,
} from '../../utils/tripsApi';

interface AppShellProps {
  user: AuthenticatedUser | null;
  onLogout: () => void;
  onUpdateUser?: (updatedUser: AuthenticatedUser) => void;
  onDeleteAccount?: () => void;
}

export const AppShell: React.FC<AppShellProps> = ({
  user,
  onLogout,
  onUpdateUser,
  onDeleteAccount,
}) => {
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
  const [budgetTrip, setBudgetTrip] = useState<Trip | null>(null);

  // Module 11: Saved Destinations state
  const [savedDestinationIds, setSavedDestinationIds] = useState<string[]>([
    'dest-tokyo',
    'dest-santorini',
    'dest-swiss-alps',
  ]);

  // Load trips and saved destinations from PostgreSQL
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      if (!user) return;
      try {
        const [serverTrips, serverSavedIds] = await Promise.all([
          fetchTripsApi().catch(() => []),
          fetchSavedDestinationIdsApi().catch(() => []),
        ]);

        if (!isMounted) return;

        if (serverTrips && serverTrips.length > 0) {
          setTrips(serverTrips);
        } else {
          // Fresh user: seed initial mock trips into PostgreSQL database so they have persistent default trips
          const seededTrips: Trip[] = [];
          for (const mockTrip of MOCK_RECENT_TRIPS) {
            try {
              const created = await createTripApi(mockTrip);
              seededTrips.push(created);
            } catch (err) {
              console.error('Error seeding initial trip:', err);
            }
          }
          if (isMounted && seededTrips.length > 0) {
            setTrips(seededTrips);
          }
        }

        if (serverSavedIds && serverSavedIds.length > 0) {
          setSavedDestinationIds(serverSavedIds);
        }
      } catch (err) {
        console.error('Failed to load trips or saved destinations from server:', err);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  // Derived saved destinations list
  const savedDestinations = useMemo(() => {
    return ALL_DESTINATIONS.filter((d) => savedDestinationIds.includes(d.id));
  }, [savedDestinationIds]);

  const handleToggleSaveDestination = async (destination: Destination) => {
    const isSaved = savedDestinationIds.includes(destination.id);
    if (isSaved) {
      setSavedDestinationIds((prev) => prev.filter((id) => id !== destination.id));
      try {
        await removeSavedDestinationApi(destination.id);
      } catch (err) {
        console.error('Error removing saved destination:', err);
      }
    } else {
      setSavedDestinationIds((prev) => [...prev, destination.id]);
      try {
        await saveDestinationApi(destination.id);
      } catch (err) {
        console.error('Error saving destination:', err);
      }
    }
  };

  const handleRemoveSavedDestination = async (destinationId: string) => {
    setSavedDestinationIds((prev) => prev.filter((id) => id !== destinationId));
    try {
      await removeSavedDestinationApi(destinationId);
    } catch (err) {
      console.error('Error removing saved destination:', err);
    }
  };

  // Module 10: Shared / Public Itinerary State
  const [shareModalTrip, setShareModalTrip] = useState<Trip | null>(null);
  const [publicShareId, setPublicShareId] = useState<string | null>(null);

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

  // URL Hash Listener for direct public share links (e.g. #/share/:shareId)
  useEffect(() => {
    const handleHashChange = () => {
      if (typeof window !== 'undefined') {
        const hash = window.location.hash;
        if (hash.startsWith('#/share/')) {
          const id = hash.replace('#/share/', '').trim();
          setPublicShareId(id || null);
        } else if (hash.startsWith('#/shared/')) {
          const id = hash.replace('#/shared/', '').trim();
          setPublicShareId(id || null);
        } else if (hash === '#/my-trips') {
          setPublicShareId(null);
          setActiveSection('my-trips');
        } else if (hash === '#/dashboard') {
          setPublicShareId(null);
          setActiveSection('dashboard');
        }
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleSelectSection = (section: NavSection) => {
    setPublicShareId(null);
    setActiveSection(section);
    if (section !== 'create-trip') {
      setEditingTrip(null);
    }
    if (section !== 'itinerary' && section !== 'itinerary-builder' && section !== 'calendar') {
      setItineraryTrip(null);
    }
    if (section !== 'budget') {
      setBudgetTrip(null);
    }

    if (
      section !== 'dashboard' &&
      section !== 'create-trip' &&
      section !== 'my-trips' &&
      section !== 'explore' &&
      section !== 'activities' &&
      section !== 'itinerary' &&
      section !== 'itinerary-builder' &&
      section !== 'calendar' &&
      section !== 'budget' &&
      section !== 'settings'
    ) {
      setPlaceholderInfo({
        isOpen: true,
        title: 'Upcoming Screen',
        description: 'This screen is planned for subsequent development modules.',
        moduleName: 'Module: Feature Screen',
      });
    }
  };

  const handleOpenBudget = (trip?: Trip) => {
    setPublicShareId(null);
    if (trip) {
      setBudgetTrip(trip);
    }
    setPreviousSection(activeSection === 'budget' ? 'dashboard' : activeSection);
    setActiveSection('budget');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateTrip = async (updatedTrip: Trip) => {
    setTrips((prevTrips) =>
      prevTrips.map((t) => (t.id === updatedTrip.id ? updatedTrip : t))
    );
    if (budgetTrip?.id === updatedTrip.id) {
      setBudgetTrip(updatedTrip);
    }
    if (itineraryTrip?.id === updatedTrip.id) {
      setItineraryTrip(updatedTrip);
    }
    if (viewingTrip?.id === updatedTrip.id) {
      setViewingTrip(updatedTrip);
    }
    if (shareModalTrip?.id === updatedTrip.id) {
      setShareModalTrip(updatedTrip);
    }

    try {
      const persisted = await updateTripApi(updatedTrip.id, updatedTrip);
      setTrips((prevTrips) =>
        prevTrips.map((t) => (t.id === persisted.id ? persisted : t))
      );
      if (budgetTrip?.id === persisted.id) setBudgetTrip(persisted);
      if (itineraryTrip?.id === persisted.id) setItineraryTrip(persisted);
      if (viewingTrip?.id === persisted.id) setViewingTrip(persisted);
      if (shareModalTrip?.id === persisted.id) setShareModalTrip(persisted);
    } catch (err) {
      console.error('Error saving trip to database:', err);
    }
  };

  const handlePlanTrip = () => {
    setPublicShareId(null);
    setEditingTrip(null);
    setPreviousSection(activeSection);
    setActiveSection('create-trip');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackFromCreate = () => {
    setActiveSection(previousSection);
    setEditingTrip(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTripCreated = async (newTrip: Trip) => {
    setTrips([newTrip, ...trips]);
    setNewlyCreatedTrip(newTrip);
    setNotificationMessage(`Trip "${newTrip.name}" has been created successfully.`);
    setActiveSection('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      const persisted = await createTripApi(newTrip);
      setTrips((prev) => prev.map((t) => (t.id === newTrip.id ? persisted : t)));
      setNewlyCreatedTrip(persisted);
    } catch (err) {
      console.error('Error persisting new trip:', err);
    }
  };

  const handleTripUpdated = async (updatedTrip: Trip) => {
    setTrips(trips.map((t) => (t.id === updatedTrip.id ? updatedTrip : t)));
    setNotificationMessage(`Trip "${updatedTrip.name}" updated successfully.`);
    setActiveSection('my-trips');
    setEditingTrip(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      const persisted = await updateTripApi(updatedTrip.id, updatedTrip);
      setTrips((prev) => prev.map((t) => (t.id === updatedTrip.id ? persisted : t)));
    } catch (err) {
      console.error('Error persisting trip update:', err);
    }
  };

  const handleEditTrip = (trip: Trip) => {
    setPublicShareId(null);
    setEditingTrip(trip);
    setPreviousSection(activeSection);
    setActiveSection('create-trip');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewTrip = (trip: Trip) => {
    setViewingTrip(trip);
  };

  const handleDeleteTrip = async (tripId: string) => {
    const deletedTrip = trips.find((t) => t.id === tripId);
    setTrips(trips.filter((t) => t.id !== tripId));
    if (deletedTrip) {
      setNotificationMessage(`"${deletedTrip.name}" was successfully deleted.`);
    }

    try {
      await deleteTripApi(tripId);
    } catch (err) {
      console.error('Error deleting trip from database:', err);
    }
  };

  const handleAddDestinationToTrip = async (tripId: string, destinationName: string) => {
    const targetTrip = trips.find((t) => t.id === tripId);
    if (!targetTrip) return;

    const currentDests = targetTrip.destinations || [];
    if (currentDests.includes(destinationName)) return;

    const updatedDests = [...currentDests, destinationName];
    const newRoute = updatedDests.join(' → ');
    const newDestCount = updatedDests.length;

    const newStop = {
      id: `stop-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      city: destinationName,
      durationDays: 2,
      order: (targetTrip.stops?.length || 0) + 1,
    };
    const updatedStops = [...(targetTrip.stops || []), newStop];

    const updatedTrip: Trip = {
      ...targetTrip,
      destinations: updatedDests,
      route: newRoute,
      destinationCount: newDestCount,
      stops: updatedStops,
    };

    setTrips((prevTrips) =>
      prevTrips.map((t) => (t.id === tripId ? updatedTrip : t))
    );

    try {
      const persisted = await updateTripApi(tripId, updatedTrip);
      setTrips((prevTrips) =>
        prevTrips.map((t) => (t.id === tripId ? persisted : t))
      );
    } catch (err) {
      console.error('Error adding destination to trip in database:', err);
    }
  };

  const handleCreateTripWithDestination = (destinationName: string) => {
    setPublicShareId(null);
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + 7);

    const initialNewTrip: Trip = {
      id: `trip-${Date.now()}`,
      name: `${destinationName} Discovery`,
      route: destinationName,
      destinationCount: 1,
      startDate: today.toISOString().split('T')[0],
      endDate: futureDate.toISOString().split('T')[0],
      duration: '7 days',
      status: 'planning',
      coverImage:
        'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80',
      progressPercentage: 20,
      budgetTotal: 3000,
      budgetSpent: 450,
      currency: '₹',
      destinations: [destinationName],
      stops: [
        {
          id: `stop-${Date.now()}`,
          city: destinationName,
          durationDays: 7,
          order: 1,
        },
      ],
      createdAt: new Date().toISOString(),
    };

    setEditingTrip(initialNewTrip);
    setPreviousSection('explore');
    setActiveSection('create-trip');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenItinerary = (trip: Trip, defaultView: 'view' | 'builder' = 'view') => {
    setPublicShareId(null);
    setItineraryTrip(trip);
    setPreviousSection(activeSection);
    setActiveSection(defaultView === 'builder' ? 'itinerary-builder' : 'itinerary');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveItinerary = async (updatedTrip: Trip) => {
    setTrips((prevTrips) =>
      prevTrips.map((t) => (t.id === updatedTrip.id ? updatedTrip : t))
    );
    setItineraryTrip(updatedTrip);

    try {
      const persisted = await updateTripApi(updatedTrip.id, updatedTrip);
      setTrips((prevTrips) =>
        prevTrips.map((t) => (t.id === updatedTrip.id ? persisted : t))
      );
      setItineraryTrip(persisted);
    } catch (err) {
      console.error('Error saving itinerary to database:', err);
    }
  };

  const handleAddActivityToTrip = async (
    tripId: string,
    activity: Activity,
    dayNumber?: number,
    date?: string
  ) => {
    const targetTrip = trips.find((t) => t.id === tripId);
    if (!targetTrip) return;

    const currentActivities = targetTrip.activities || [];
    const isAlreadyAdded = currentActivities.some(
      (act) => act.activityId === activity.id
    );
    if (isAlreadyAdded) return;

    const newAssignment: TripActivityAssignment = {
      id: `act-assign-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      activityId: activity.id,
      name: activity.name,
      duration: activity.duration,
      cost: activity.cost,
      dayNumber: dayNumber || 1,
      date: date || targetTrip.startDate,
      startTime: '10:00 AM',
      destinationCity: activity.destinationCity,
      destinationId: activity.destinationId,
      type: activity.type,
      image: activity.image,
      description: activity.description,
    };

    const updatedActivities = [...currentActivities, newAssignment];

    let updatedStops = targetTrip.stops;
    if (updatedStops && updatedStops.length > 0) {
      const targetStopIndex = updatedStops.findIndex(
        (s) => s.city.toLowerCase() === activity.destinationCity.toLowerCase()
      );
      if (targetStopIndex >= 0) {
        const stop = updatedStops[targetStopIndex];
        const stopActs = stop.activities || [];
        if (!stopActs.some((a) => a.activityId === activity.id)) {
          const updatedStop = {
            ...stop,
            activities: [...stopActs, newAssignment],
          };
          updatedStops = [
            ...updatedStops.slice(0, targetStopIndex),
            updatedStop,
            ...updatedStops.slice(targetStopIndex + 1),
          ];
        }
      }
    }

    const updatedTrip: Trip = {
      ...targetTrip,
      activities: updatedActivities,
      stops: updatedStops || targetTrip.stops,
    };

    setTrips((prevTrips) =>
      prevTrips.map((t) => (t.id === tripId ? updatedTrip : t))
    );

    try {
      const persisted = await updateTripApi(tripId, updatedTrip);
      setTrips((prevTrips) =>
        prevTrips.map((t) => (t.id === tripId ? persisted : t))
      );
    } catch (err) {
      console.error('Error adding activity to database:', err);
    }
  };

  const handleRemoveActivityFromTrip = async (tripId: string, activityId: string) => {
    const targetTrip = trips.find((t) => t.id === tripId);
    if (!targetTrip) return;

    const currentActivities = targetTrip.activities || [];
    const updatedActivities = currentActivities.filter(
      (act) => act.activityId !== activityId && act.id !== activityId
    );

    let updatedStops = targetTrip.stops;
    if (updatedStops) {
      updatedStops = updatedStops.map((stop) => ({
        ...stop,
        activities: stop.activities
          ? stop.activities.filter(
              (act) => act.activityId !== activityId && act.id !== activityId
            )
          : [],
      }));
    }

    const updatedTrip: Trip = {
      ...targetTrip,
      activities: updatedActivities,
      stops: updatedStops || targetTrip.stops,
    };

    setTrips((prevTrips) =>
      prevTrips.map((t) => (t.id === tripId ? updatedTrip : t))
    );

    try {
      const persisted = await updateTripApi(tripId, updatedTrip);
      setTrips((prevTrips) =>
        prevTrips.map((t) => (t.id === tripId ? persisted : t))
      );
    } catch (err) {
      console.error('Error removing activity in database:', err);
    }
  };

  const handleExploreActivitiesForDestination = (destination: Destination) => {
    setPublicShareId(null);
    setActivityDestinationCity(destination.city);
    setActiveSection('activities');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Module 10: Share Handlers
  const handleOpenShareModal = (trip: Trip) => {
    setShareModalTrip(trip);
  };

  const handleOpenPublicView = (shareId: string) => {
    setPublicShareId(shareId);
    if (typeof window !== 'undefined') {
      window.location.hash = `#/share/${shareId}`;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExitPublicView = () => {
    setPublicShareId(null);
    if (typeof window !== 'undefined') {
      window.location.hash = '#/dashboard';
    }
    setActiveSection('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePlanTripFromPublic = () => {
    setPublicShareId(null);
    if (typeof window !== 'undefined') {
      window.location.hash = '';
    }
    handlePlanTrip();
  };

  const handleCopyTripFromPublic = (clonedTrip: Trip) => {
    setTrips((prev) => [clonedTrip, ...prev]);
    setNotificationMessage(`"${clonedTrip.name}" successfully added to your trip collection.`);
    setItineraryTrip(clonedTrip);
    setPublicShareId(null);
    if (typeof window !== 'undefined') {
      window.location.hash = '#/my-trips';
    }
    setActiveSection('my-trips');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopyTripDirect = (sourceTrip: Trip) => {
    const cloned = cloneTripForCopy(sourceTrip);
    setTrips((prev) => [cloned, ...prev]);
    setNotificationMessage(`"${cloned.name}" added to your trips.`);
    setItineraryTrip(cloned);
    setActiveSection('my-trips');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 0. IF PUBLIC SHARE VIEW IS ACTIVE: Render standalone public webpage (NO AUTH APP SHELL)
  if (publicShareId) {
    return (
      <PublicItineraryView
        shareId={publicShareId}
        allTrips={trips}
        onPlanYourOwnTrip={handlePlanTripFromPublic}
        onCopyTripSuccess={handleCopyTripFromPublic}
        onBackToApp={handleExitPublicView}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-row font-sans antialiased text-slate-900">
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
          onOpenSettings={() => {
            setPublicShareId(null);
            setActiveSection('settings');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
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
              onViewBudget={handleOpenBudget}
              onShareTrip={handleOpenShareModal}
              onNavigateToExplore={() => {
                setActiveSection('explore');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          ) : activeSection === 'budget' ? (
            <BudgetViewScreen
              initialTrip={budgetTrip || itineraryTrip || trips[0]}
              trips={trips}
              onUpdateTrip={handleUpdateTrip}
              onBack={() => {
                setActiveSection(previousSection === 'budget' ? 'dashboard' : previousSection);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onNavigateToItinerary={(trip) => handleOpenItinerary(trip, 'view')}
            />
          ) : activeSection === 'my-trips' ? (
            <MyTripsView
              trips={trips}
              onPlanTrip={handlePlanTrip}
              onEditTrip={handleEditTrip}
              onViewTrip={handleViewTrip}
              onDeleteTrip={handleDeleteTrip}
              onBuildItinerary={handleOpenItinerary}
              onShareTrip={handleOpenShareModal}
              notificationMessage={notificationMessage}
              onDismissNotification={() => setNotificationMessage(null)}
            />
          ) : activeSection === 'explore' ? (
            <ExploreView
              trips={trips}
              savedDestinationIds={savedDestinationIds}
              onToggleSaveDestination={handleToggleSaveDestination}
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
          ) : activeSection === 'settings' ? (
            <SettingsView
              user={user}
              onUpdateUser={onUpdateUser}
              savedDestinations={savedDestinations}
              onRemoveSavedDestination={handleRemoveSavedDestination}
              onLogout={onLogout}
              onDeleteAccount={onDeleteAccount}
              onNavigateToExplore={() => {
                setActiveSection('explore');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onAddToTrip={(dest) => handleCreateTripWithDestination(dest.city)}
              onExploreActivities={handleExploreActivitiesForDestination}
            />
          ) : activeSection === 'itinerary' && (itineraryTrip || trips[0]) ? (
            <ItineraryViewScreen
              trip={itineraryTrip || trips[0]}
              onBack={() => {
                setActiveSection(previousSection === 'itinerary' ? 'my-trips' : previousSection);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onEditItinerary={() => {
                setPreviousSection('itinerary');
                setActiveSection('itinerary-builder');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onSaveTrip={handleSaveItinerary}
              onOpenPublicView={handleOpenPublicView}
              onCopyTrip={handleCopyTripDirect}
              initialViewMode="list"
            />
          ) : activeSection === 'itinerary-builder' && (itineraryTrip || trips[0]) ? (
            <ItineraryBuilderView
              trip={itineraryTrip || trips[0]}
              onBack={() => {
                setActiveSection(previousSection === 'itinerary-builder' ? 'my-trips' : previousSection);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onSaveTrip={handleSaveItinerary}
              onViewItinerary={() => {
                setPreviousSection('itinerary-builder');
                setActiveSection('itinerary');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onNavigateToExplore={() => {
                setActiveSection('explore');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          ) : activeSection === 'calendar' && (itineraryTrip || trips[0]) ? (
            <ItineraryViewScreen
              trip={itineraryTrip || trips[0]}
              onBack={() => {
                setActiveSection('dashboard');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onEditItinerary={() => {
                setPreviousSection('calendar');
                setActiveSection('itinerary-builder');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onSaveTrip={handleSaveItinerary}
              onOpenPublicView={handleOpenPublicView}
              onCopyTrip={handleCopyTripDirect}
              initialViewMode="calendar"
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
        onShare={(trip) => {
          setViewingTrip(null);
          handleOpenShareModal(trip);
        }}
      />

      {/* Global Share Trip Modal */}
      <ShareTripModal
        isOpen={!!shareModalTrip}
        trip={shareModalTrip}
        onClose={() => setShareModalTrip(null)}
        onOpenPublicView={handleOpenPublicView}
        onCopyTrip={handleCopyTripDirect}
        onToggleShareStatus={(t, isShared) => {
          handleUpdateTrip({
            ...t,
            isShared,
          });
        }}
      />

      {/* Secondary Nav Item Feedback Modal for Settings */}
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
