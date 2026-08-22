import React from 'react';
import { SectionHeader } from '../common/SectionHeader';
import { TripCard } from './TripCard';
import { Trip } from '../../types/dashboard';

interface RecentTripsSectionProps {
  trips: Trip[];
  onViewTrip: (trip: Trip) => void;
  onEditTrip: (trip: Trip) => void;
  onViewAllTrips: () => void;
}

export const RecentTripsSection: React.FC<RecentTripsSectionProps> = ({
  trips,
  onViewTrip,
  onEditTrip,
  onViewAllTrips,
}) => {
  return (
    <section className="space-y-4">
      <SectionHeader
        title="Recent Trips"
        subtitle="Manage itineraries, review past journeys, or continue drafting plans."
        action={{
          label: 'View all trips →',
          onClick: onViewAllTrips,
        }}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {trips.map((trip) => (
          <TripCard
            key={trip.id}
            trip={trip}
            onView={onViewTrip}
            onEdit={onEditTrip}
          />
        ))}
      </div>
    </section>
  );
};
