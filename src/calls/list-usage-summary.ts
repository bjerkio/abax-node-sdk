import { z } from 'zod';

export interface ListUsageSummaryInput {
  // the id of the vehicle
  vehicleId?: string;

  /** The period cannot be longer than 3 months */
  dateFrom: Date;

  /** The period cannot be longer than 3 months */
  dateTo: Date;
}

export const listUsageSummaryResponseSchema = z.object({
  PrivateUsage: z.object({
    DistanceDrivenInMeter: z.number(),
    TotalTollStationsPassed: z.number(),
  }),
  CorporateUsageSummary: z.object({
    DistanceDrivenInMeter: z.number(),
    TotalTollStationsPassed: z.number(),
  }),
});

export type ListUsageSummaryResponse = z.infer<
  typeof listUsageSummaryResponseSchema
>;
