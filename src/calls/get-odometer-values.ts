import { z } from 'zod';
import type { QueryEnvelope } from '../common/types.js';

export type GetOdometerValuesOfTripsInput = QueryEnvelope<{
  /** Ids of trips. */
  trip_ids: string[];
}>;

const odometerReadingSchema = z.object({
  value: z.number(),
  timestamp: z.string(),
});

const odometerValuesSchema = z.object({
  trip_id: z.string(),
  trip_start: odometerReadingSchema.optional(),
  trip_finish: odometerReadingSchema.optional(),
});

export const getOdometerValuesOfTripsResponseSchema = z.object({
  items: z.array(odometerValuesSchema),
});

export type GetOdometerValuesOfTripsResponse = z.infer<
  typeof getOdometerValuesOfTripsResponseSchema
>;
