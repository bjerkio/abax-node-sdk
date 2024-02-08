import { z } from 'zod';
import type { QueryEnvelope } from '../common/types.js';

export type GetOdometerValuesOfTripsInput = QueryEnvelope<{
  /** Ids of trips. */
  tripIds: string[];
}>;

const odometerReadingSchema = z.object({
  value: z.number(),
  timestamp: z.string(),
});

const odometerValuesSchema = z.object({
  tripId: z.string(),
  tripStart: odometerReadingSchema.optional(),
  tripFinish: odometerReadingSchema.optional(),
});

export const getOdometerValuesOfTripsResponseSchema = z.object({
  items: z.array(odometerValuesSchema),
});

export type GetOdometerValuesOfTripsResponse = z.infer<
  typeof getOdometerValuesOfTripsResponseSchema
>;
