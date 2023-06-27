import { z } from 'zod';
import type { QueryEnvelope } from '../common/types.js';

export type ListTripExpensesInput = QueryEnvelope<{
  /** Ids of trips. Can have up to 150 ids */
  trip_ids: string[];
}>;

const expenseSchema = z.object({
  parking: z.number().optional(),
  easy_park_private: z.number().optional(),
  easy_park_corporate: z.number().optional(),
  toll_road_admin: z.number().optional(),
  toll_charge: z.number().optional(),
  ferry: z.number().optional(),
});

export type Expense = z.infer<typeof expenseSchema>;

const extraSchema = z.object({
  distance_with_bad_road_in_km: z.number().optional(),
  distance_with_trailer_in_km: z.number().optional(),
  distance_with_caravan_in_km: z.number().optional(),
  distance_with_canteen_in_km: z.number().optional(),
  distance_with_heavy_load_in_km: z.number().optional(),
  distance_with_dog_in_km: z.number().optional(),
  distance_with_passenger_in_km: z.number().optional(),
  passenger_name: z.string().optional(),
});

export type Extra = z.infer<typeof extraSchema>;

export const listTripExpensesSchema = z.object({
  items: z.array(
    z.object({
      trip_id: z.string(),

      expense: expenseSchema,

      extra: extraSchema,
    }),
  ),
});

export type listTripExpensesResponse = z.infer<typeof listTripExpensesSchema>;
