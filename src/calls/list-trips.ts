import { z } from 'zod';
import type { QueryEnvelope } from '../common/types.js';
import { driverSchema, vehicleCommercialClassSchema } from './shared.js';

export type ListTripsInput = QueryEnvelope<{
  /** Defaults to 1 */
  page?: number;

  /** Defaults to 1500 */
  page_size?: number;

  /** The period cannot be longer than 3 months */
  date_from: Date;

  /** The period cannot be longer than 3 months */
  date_to: Date;

  vehicle_id?: string;
}>;

const locationPointSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  timestamp: z.string(),
  signal_source: z.any(),
  accuracy_radius: z.number().optional(),
});

const tripPointSchema = z.object({
  location: locationPointSchema,
  address: z.string().optional(),
});

const tripSchema = z.object({
  id: z.string(),
  vehicle: z.object({
    id: z.string(),
    alias: z.string().optional(),
    commercial_class: vehicleCommercialClassSchema,
  }),
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
});

export type Trip = z.infer<typeof tripSchema>;

export const listTripsResponseSchema = z.object({
  page: z.number(),
  page_size: z.number(),
  items: z.array(tripSchema),
});

export type ListTripsResponse = z.infer<typeof listTripsResponseSchema>;
