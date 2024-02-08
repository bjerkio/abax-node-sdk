import { z } from 'zod';
import type { QueryEnvelope } from '../common/types.js';
import { driverSchema, vehicleCommercialClassSchema } from './shared.js';

export type ListTripsInput = QueryEnvelope<{
  /** Defaults to 1 */
  page?: number;

  /** Defaults to 1500 */
  pageSize?: number;

  /** The period cannot be longer than 3 months */
  dateFrom: Date;

  /** The period cannot be longer than 3 months */
  dateTo: Date;

  vehicleId?: string;
}>;

const locationPointSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  timestamp: z.string(),
  signalSource: z.any(),
  accuracyRadius: z.number().optional(),
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
    commercialClass: vehicleCommercialClassSchema,
  }),
  driver: driverSchema.optional(),
  start: tripPointSchema,
  finish: tripPointSchema,
  distance: z.number().optional(),
  purpose: z.string().optional(),
  commercialClass: z.enum([
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
  pageSize: z.number(),
  items: z.array(tripSchema),
});

export type ListTripsResponse = z.infer<typeof listTripsResponseSchema>;
