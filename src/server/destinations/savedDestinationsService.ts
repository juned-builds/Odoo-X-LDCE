import { db } from '../../db/index.ts';
import { savedDestinations } from '../../db/schema/savedDestinations.ts';
import { destinations } from '../../db/schema/destinations.ts';
import { eq, and } from 'drizzle-orm';
import { ApiError } from '../utils/apiError.ts';

export class SavedDestinationsService {
  /**
   * Get all saved destination IDs for a user
   */
  static async getSavedDestinationIds(userId: string): Promise<string[]> {
    const records = await db
      .select({ destinationId: savedDestinations.destinationId })
      .from(savedDestinations)
      .where(eq(savedDestinations.userId, userId));

    return records.map((r) => r.destinationId);
  }

  /**
   * Save / bookmark a destination for a user
   */
  static async saveDestination(userId: string, destinationId: string): Promise<{ success: boolean; destinationId: string }> {
    // Check if valid destination in catalog
    const [dest] = await db
      .select({ id: destinations.id })
      .from(destinations)
      .where(eq(destinations.id, destinationId));

    if (!dest) {
      throw ApiError.notFound('Destination not found in catalog.', 'NOT_FOUND');
    }

    await db
      .insert(savedDestinations)
      .values({
        userId,
        destinationId,
      })
      .onConflictDoNothing();

    return { success: true, destinationId };
  }

  /**
   * Remove a saved destination for a user
   */
  static async removeSavedDestination(userId: string, destinationId: string): Promise<{ success: boolean; destinationId: string }> {
    await db
      .delete(savedDestinations)
      .where(
        and(
          eq(savedDestinations.userId, userId),
          eq(savedDestinations.destinationId, destinationId)
        )
      );

    return { success: true, destinationId };
  }
}
