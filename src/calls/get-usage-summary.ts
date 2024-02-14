import { z } from 'zod';

export interface GetUsageSummaryInput {
  // the id of the vehicle
  vehicle_id?: string;

  /** The period cannot be longer than 3 months */
  date_from: Date;

  /** The period cannot be longer than 3 months */
  date_to: Date;
}

const usage = z.object({
  distance_driven_in_meters: z.number(),
  total_toll_stations_passed: z.number(),
  total_road_toll_cost: z.number(),
});

export type Usage = z.infer<typeof usage>;

export const usageSummarySchema = z.object({
  private_usage_summary: usage,
  corporate_usage_summary: usage,
});

export type UsageSummary = z.infer<typeof usageSummarySchema>;

export type GetUsageSummaryResponse = UsageSummary;
