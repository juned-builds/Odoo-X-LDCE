import React from 'react';
import { SectionHeader } from '../common/SectionHeader';
import { DestinationCard } from './DestinationCard';
import { RecommendedDestination } from '../../types/dashboard';

interface RecommendedDestinationsSectionProps {
  destinations: RecommendedDestination[];
  onExploreDestination: (destination: RecommendedDestination) => void;
  onExploreAll: () => void;
}

export const RecommendedDestinationsSection: React.FC<RecommendedDestinationsSectionProps> = ({
  destinations,
  onExploreDestination,
  onExploreAll,
}) => {
  return (
    <section className="space-y-4">
      <SectionHeader
        title="Recommended Destinations"
        subtitle="Curated sample destinations tailored for cultural exploration, adventure, and scenic routes."
        badge="Inspiration"
        action={{
          label: 'Explore all guides →',
          onClick: onExploreAll,
        }}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {destinations.map((dest) => (
          <DestinationCard
            key={dest.id}
            destination={dest}
            onExplore={onExploreDestination}
          />
        ))}
      </div>
    </section>
  );
};
