import * as dotenv from 'dotenv';
dotenv.config();

import { db } from './index.ts';
import { destinations } from './schema/destinations.ts';
import { activities } from './schema/activities.ts';
import { ALL_DESTINATIONS } from '../data/destinationsData.ts';
import { ALL_ACTIVITIES } from '../data/activitiesData.ts';

export async function seedCatalog() {
  console.log('--- Starting GlobeTrotter Master Catalog Seed ---');

  // 1. Seed Destinations (Idempotent Upsert)
  console.log(`Seeding ${ALL_DESTINATIONS.length} destinations...`);
  for (const dest of ALL_DESTINATIONS) {
    await db
      .insert(destinations)
      .values({
        id: dest.id,
        city: dest.city,
        country: dest.country,
        region: dest.region,
        description: dest.description,
        shortDescription: dest.shortDescription || null,
        costIndex: dest.costIndex,
        popularity: dest.popularity,
        rating: dest.rating.toFixed(2),
        reviewCount: dest.reviewCount,
        imageUrl: dest.image,
        bestSeason: dest.bestSeason || null,
        highlights: dest.highlights || [],
        tags: dest.tags || [],
      })
      .onConflictDoUpdate({
        target: destinations.id,
        set: {
          city: dest.city,
          country: dest.country,
          region: dest.region,
          description: dest.description,
          shortDescription: dest.shortDescription || null,
          costIndex: dest.costIndex,
          popularity: dest.popularity,
          rating: dest.rating.toFixed(2),
          reviewCount: dest.reviewCount,
          imageUrl: dest.image,
          bestSeason: dest.bestSeason || null,
          highlights: dest.highlights || [],
          tags: dest.tags || [],
        },
      });
  }
  console.log(`✓ Destinations seed complete (${ALL_DESTINATIONS.length} records processed).`);

  // 2. Seed Activities (Idempotent Upsert)
  console.log(`Seeding ${ALL_ACTIVITIES.length} activities...`);
  for (const act of ALL_ACTIVITIES) {
    await db
      .insert(activities)
      .values({
        id: act.id,
        destinationId: act.destinationId,
        destinationCity: act.destinationCity,
        destinationCountry: act.destinationCountry,
        name: act.name,
        type: act.type,
        description: act.description,
        costDisplay: act.cost,
        costTier: act.costTier,
        costNumeric: act.costNumeric.toFixed(2),
        durationDisplay: act.duration,
        durationMinutes: act.durationMinutes,
        durationRange: act.durationRange,
        rating: act.rating.toFixed(2),
        reviewCount: act.reviewCount,
        imageUrl: act.image,
        bestTime: act.bestTime || null,
        tags: act.tags || [],
        popularity: act.popularity,
        location: act.location || null,
      })
      .onConflictDoUpdate({
        target: activities.id,
        set: {
          destinationId: act.destinationId,
          destinationCity: act.destinationCity,
          destinationCountry: act.destinationCountry,
          name: act.name,
          type: act.type,
          description: act.description,
          costDisplay: act.cost,
          costTier: act.costTier,
          costNumeric: act.costNumeric.toFixed(2),
          durationDisplay: act.duration,
          durationMinutes: act.durationMinutes,
          durationRange: act.durationRange,
          rating: act.rating.toFixed(2),
          reviewCount: act.reviewCount,
          imageUrl: act.image,
          bestTime: act.bestTime || null,
          tags: act.tags || [],
          popularity: act.popularity,
          location: act.location || null,
        },
      });
  }
  console.log(`✓ Activities seed complete (${ALL_ACTIVITIES.length} records processed).`);
  console.log('--- Catalog Seed Finished Successfully ---');
}

// Allow direct execution via CLI
if (process.argv[1]?.endsWith('seed.ts')) {
  seedCatalog()
    .then(() => {
      console.log('Seeding completed.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Seeding failed:', err);
      process.exit(1);
    });
}
