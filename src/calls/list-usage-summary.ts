import { z } from 'zod';

export interface ListUsageSummaryInput {
  // the id of the vehicle
  vehicle_id?: string;

  /** The period cannot be longer than 3 months */
  date_from: Date;

  /** The period cannot be longer than 3 months */
  date_to: Date;
}

export const listUsageSummaryResponseSchema = z.object({
  private_usage_summary: z.object({
    distance_driven_in_meters: z.number(),
    total_toll_stations_passed: z.number(),
    total_road_toll_cost: z.number(),
  }),
  corporate_usage_summary: z.object({
    distance_driven_in_meters: z.number(),
    total_toll_stations_passed: z.number(),
    total_road_toll_cost: z.number(),
  }),
});

export type ListUsageSummaryResponse = z.infer<
  typeof listUsageSummaryResponseSchema
>;
