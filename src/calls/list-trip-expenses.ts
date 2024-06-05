import { z } from 'zod';

export interface ListTripExpensesInput {
  /** Ids of trips.
   *
   * If more than 150 ids are provided, multiple queries will be made in sequence
   * containing up to 150 ids each.
   * */
  tripIds: string[];
}

const expenseSchema = z
  .object({
    parking: z.number().optional(),
    easy_park_private: z.number().optional(),
    easy_park_corporate: z.number().optional(),
    toll_road_admin: z.number().optional(),
    toll_charge: z.number().optional(),
    ferry: z.number().optional(),
  })
  .transform(data => ({
    easyParkPrivate: data.easy_park_private,
    easyParkCorporate: data.easy_park_corporate,
    tollRoadAdmin: data.toll_road_admin,
    tollCharge: data.toll_charge,
    parking: data.parking,
    ferry: data.ferry,
  }));

export type Expense = z.infer<typeof expenseSchema>;

const extraSchema = z
  .object({
    distance_with_bad_road_in_km: z.number().optional(),
    distance_with_trailer_in_km: z.number().optional(),
    distance_with_caravan_in_km: z.number().optional(),
    distance_with_canteen_in_km: z.number().optional(),
    distance_with_heavy_load_in_km: z.number().optional(),
    distance_with_dog_in_km: z.number().optional(),
    distance_with_passenger_in_km: z.number().optional(),
    passenger_name: z.string().optional(),
  })
  .transform(data => ({
    didistanceWithBadRoadInKm: data.distance_with_bad_road_in_km,
    distanceWithTrailerInKm: data.distance_with_trailer_in_km,
    distanceWithCaravanInKm: data.distance_with_caravan_in_km,
    distanceWithCanteenInKm: data.distance_with_canteen_in_km,
    distanceWithHeavyLoadInKm: data.distance_with_heavy_load_in_km,
    distanceWithDogInKm: data.distance_with_dog_in_km,
    distanceWithPassengerInKm: data.distance_with_passenger_in_km,
    passengerName: data.passenger_name,
  }));

export type Extra = z.infer<typeof extraSchema>;

export const listTripExpensesSchema = z.object({
  items: z.array(
    z
      .object({
        trip_id: z.string(),
        expense: expenseSchema,
        extra: extraSchema,
      })
      .transform(({ trip_id, ...data }) => ({
        ...data,
        tripId: trip_id,
      })),
  ),
});

export type listTripExpensesResponse = z.infer<typeof listTripExpensesSchema>;
