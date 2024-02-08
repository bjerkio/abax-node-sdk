import { z } from 'zod';
import type { QueryEnvelope } from '../common/types.js';

export type ListTripExpensesInput = QueryEnvelope<{
  /** Ids of trips. Can have up to 150 ids */
  tripIds: string[];
}>;

const expenseSchema = z.object({
  parking: z.number().optional(),
  easyParkPrivate: z.number().optional(),
  easyParkCorporate: z.number().optional(),
  tollRoadAdmin: z.number().optional(),
  tollCharge: z.number().optional(),
  ferry: z.number().optional(),
});

export type Expense = z.infer<typeof expenseSchema>;

const extraSchema = z.object({
  distanceWithBadRoadInKm: z.number().optional(),
  distanceWithTrailerInKm: z.number().optional(),
  distanceWithCaravanInKm: z.number().optional(),
  distanceWithCanteenInKm: z.number().optional(),
  distanceWithHeavyLoadInKm: z.number().optional(),
  distanceWithDogInKm: z.number().optional(),
  distanceWithPassengerInKm: z.number().optional(),
  passengerName: z.string().optional(),
});

export type Extra = z.infer<typeof extraSchema>;

export const listTripExpensesSchema = z.object({
  items: z.array(
    z.object({
      tripId: z.string(),

      expense: expenseSchema,

      extra: extraSchema,
    }),
  ),
});

export type listTripExpensesResponse = z.infer<typeof listTripExpensesSchema>;
