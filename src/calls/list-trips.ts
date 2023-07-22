import { z } from 'zod';
import { listResponseEnvelope } from '../common/response-types.js';
import { camelize } from '../common/types.js';
import { driverSchema, vehicleCommercialClassSchema } from './shared.js';

export interface ListTripsInput {
  /** Defaults to 1 */
  page?: number;

  /** Defaults to 1500 */
  pageSize?: number;

  /** The period cannot be longer than 3 months */
  dateFrom: Date;

  /** The period cannot be longer than 3 months */
  dateTo: Date;

  vehicleId?: string;
}

const locationPointSchema = z
  .object({
    latitude: z.number(),
    longitude: z.number(),
    timestamp: z.string(),
    signal_source: z.any(),
    accuracy_radius: z.number().optional(),
  })
  .transform(camelize);

const tripPointSchema = z.object({
  location: locationPointSchema,
  address: z.string().optional(),
});

const tripVehicleSchema = z
  .object({
    id: z.string(),
    alias: z.string().optional(),
    commercial_class: vehicleCommercialClassSchema,
  })
  .transform(camelize);

const tripSchema = z
  .object({
    id: z.string(),
    vehicle: tripVehicleSchema,
    driver: driverSchema.optional(),
    start: tripPointSchema,
    finish: tripPointSchema,
    distance: z.number().optional(),
    purpose: z.string().optional(),
    commercial_class: z.enum([
      'Unknown',
      'PrivateTrip',
      'BusinessTrip',
      'Commute',
    ]),
    notes: z.string().optional(),
    duration: z.number().optional(),
    source: z.enum(['Automatic', 'Manual']),
  })
  .transform(camelize);

export type Trip = z.output<typeof tripSchema>;
export const listTripsResponseSchema = listResponseEnvelope(tripSchema);
export type ListTripsResponse = z.infer<typeof listTripsResponseSchema>;
