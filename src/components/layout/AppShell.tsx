import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { DashboardView } from '../dashboard/DashboardView';
import { CreateTripView } from '../trip/CreateTripView';
import { MyTripsView } from '../trips/MyTripsView';
import { ViewTripModal } from '../trips/ViewTripModal';
import { PlaceholderModal } from '../common/PlaceholderModal';
import { NavSection, Trip } from '../../types/dashboard';
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

    if (
      section !== 'dashboard' &&
      section !== 'create-trip' &&
      section !== 'my-trips'
    ) {
      const sectionLabels: Record<string, string> = {
        explore: 'Explore Destinations',
        calendar: 'Travel Calendar & Scheduling',
        budget: 'Budget & Expense Management',
        settings: 'Preferences & Account Settings',
      };

      setPlaceholderInfo({
        isOpen: true,
        title: sectionLabels[section] || 'Upcoming Screen',
        description: `The ${sectionLabels[section]} screen is planned for later development modules. You can manage your full trip collection in My Trips and Create Trip.`,
        moduleName: `Module: ${sectionLabels[section]}`,
      });
    }
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
            />
          ) : activeSection === 'my-trips' ? (
            <MyTripsView
              trips={trips}
              onPlanTrip={handlePlanTrip}
              onEditTrip={handleEditTrip}
              onViewTrip={handleViewTrip}
              onDeleteTrip={handleDeleteTrip}
              notificationMessage={notificationMessage}
              onDismissNotification={() => setNotificationMessage(null)}
            />
          ) : activeSection === 'create-trip' ? (
            <CreateTripView
              onBackToDashboard={handleBackFromCreate}
              onTripCreated={handleTripCreated}
              onTripUpdated={handleTripUpdated}
              editingTrip={editingTrip}
              fromSection={previousSection === 'my-trips' ? 'my-trips' : 'dashboard'}
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
      />

      {/* Secondary Nav Item Feedback Modal for Explore, Calendar, Budget, Settings */}
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
