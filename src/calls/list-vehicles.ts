import { z } from 'zod';
import type { QueryEnvelope } from '../common/types.js';
import { driverSchema, vehicleCommercialClassSchema } from './shared.js';

export type ListVehiclesInput = QueryEnvelope<
  | {
      page: number;
      pageSize: number;
    }
  | undefined
>;

const manufacturerSchema = z.object({ name: z.string() });

const modelSchema = z.object({ name: z.string() });

const licensePlateSchema = z.object({
  number: z.string(),
  registrationDate: z.string().optional(),
});

const vehicleUnitSchema = z.object({
  id: z.string(),
  serialNumber: z.string().optional(),
  type: z.string(),
  health: z.enum(['Unknown', 'Healthy', 'Degraded', 'Unhealthy']),
  status: z.enum(['Unknown', 'Active', 'Deactivated']),
});

const locationSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  speed: z.number().optional(),
  inMovement: z.boolean().optional(),
  course: z.number().optional(),
  timestamp: z.string(),
  signalSource: z.enum(['Gps', 'Gsm']),
  accuracyRadius: z.number().optional(),
});

export const vehicleSchema = z.object({
  id: z.string(),
  vin: z.string().optional(),
  alias: z.string().optional(),
  manufacturer: manufacturerSchema.optional(),
  model: modelSchema.optional(),
  licensePlate: licensePlateSchema.optional(),
  commercialClass: vehicleCommercialClassSchema,
  registeredAt: z.string().optional(),
  unit: vehicleUnitSchema.optional(),
  location: locationSchema.optional(),
  driver: driverSchema.optional(),
  organization: z.object({ id: z.string(), name: z.string() }),
  odometer: z
    .object({
      value: z.number(),
      timestamp: z.string().optional(),
    })
    .optional(),
  notes: z.string().optional(),
  temperature: z
    .object({
      value: z.number(),
      timestamp: z.string().optional(),
    })
    .optional(),
  fuelType: z.enum([
    'Unknown',
    'Petrol',
    'Electricity',
    'Diesel',
    'Lpg',
    'DieselHybrid',
    'PetrolHybrid',
  ]),

  engineSize: z.number().optional(),
  color: z.string().optional(),
  co2Emissions: z.number().optional(),
});

export const listVehiclesResponseSchema = z.object({
  page: z.number(),
  pageSize: z.number(),
  items: z.array(vehicleSchema),
});

export type Vehicle = z.infer<typeof vehicleSchema>;

export type ListVehiclesResponse = z.infer<typeof listVehiclesResponseSchema>;
