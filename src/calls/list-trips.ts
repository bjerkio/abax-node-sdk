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

const locationPointSchema = z
  .object({
    latitude: z.number(),
    longitude: z.number(),
    timestamp: z.string(),
    signal_source: z.enum(['Gps', 'Gsm']),
    accuracy_radius: z.number().optional(),
  })
  .transform(({ signal_source, accuracy_radius, ...data }) => ({
    ...data,
    signalSource: signal_source,
    accuracyRadius: accuracy_radius,
  }));

const tripPointSchema = z.object({
  location: locationPointSchema,
  address: z.string().optional(),
});

const tripSchema = z
  .object({
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
  })
  .transform(({ commercial_class, ...data }) => ({
    ...data,
    commercialClass: commercial_class,
  }));

export type Trip = z.infer<typeof tripSchema>;

export const listTripsResponseSchema = z
  .object({
    page: z.number(),
    page_size: z.number(),
    items: z.array(tripSchema),
  })
  .transform(data => ({
    pageSize: data.page_size,
    page: data.page,
    items: data.items,
  }));

export type ListTripsResponse = z.infer<typeof listTripsResponseSchema>;
