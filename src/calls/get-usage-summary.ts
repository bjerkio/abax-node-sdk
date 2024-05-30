import { z } from 'zod';

export interface GetUsageSummaryInput {
  // the id of the vehicle
  vehicleId?: string;

  /** The period cannot be longer than 3 months */
  dateFrom: Date;

  /** The period cannot be longer than 3 months */
  dateTo: Date;
}

const usage = z
  .object({
    distance_driven_in_meters: z.number(),
    total_toll_stations_passed: z.number(),
    total_road_toll_cost: z.number(),
  })
  .transform(data => {
    return {
      distanceDrivenInMeters: data.distance_driven_in_meters,
      totalTollStationsPassed: data.total_toll_stations_passed,
      totalRoadTollCost: data.total_road_toll_cost,
    };
  });

export type Usage = z.infer<typeof usage>;

export const usageSummarySchema = z
  .object({
    private_usage_summary: usage,
    corporate_usage_summary: usage,
  })
  .transform(data => {
    return {
      privateUsageSummary: data.private_usage_summary,
      corporateUsageSummary: data.corporate_usage_summary,
    };
  });

export type UsageSummary = z.infer<typeof usageSummarySchema>;

export type GetUsageSummaryResponse = UsageSummary;
