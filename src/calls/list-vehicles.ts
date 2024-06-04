import { z } from 'zod';
import { driverSchema, vehicleCommercialClassSchema } from './shared.js';

export type ListVehiclesInput = {
      page: number;
      pageSize: number;
    }
  | undefined
;

const manufacturerSchema = z.object({ name: z.string() });

const modelSchema = z.object({ name: z.string() });

const licensePlateSchema = z
  .object({
    number: z.string(),
    registration_date: z.string().optional(),
  })
  .transform(data => ({
    number: data.number,
    registrationDate: data.registration_date,
  }));

const vehicleUnitSchema = z
  .object({
    id: z.string(),
    serial_number: z.string().optional(),
    type: z.string(),
    health: z.enum(['Unknown', 'Healthy', 'Degraded', 'Unhealthy']),
    status: z.enum(['Unknown', 'Active', 'Deactivated']),
  })
  .transform(({ serial_number, ...data }) => ({
    ...data,
    serialNumber: serial_number,
  }));

const locationSchema = z
  .object({
    latitude: z.number(),
    longitude: z.number(),
    speed: z.number().optional(),
    in_movement: z.boolean().optional(),
    course: z.number().optional(),
    timestamp: z.string(),
    signal_source: z.enum(['Gps', 'Gsm']),
    accuracy_radius: z.number().optional(),
  })
  .transform(({ in_movement, signal_source, accuracy_radius, ...data }) => ({
    ...data,
    inMovement: in_movement,
    signalSource: signal_source,
    accuracyRadius: accuracy_radius,
  }));

export const vehicleSchema = z
  .object({
    id: z.string(),
    vin: z.string().optional(),
    alias: z.string().optional(),
    manufacturer: manufacturerSchema.optional(),
    model: modelSchema.optional(),
    license_plate: licensePlateSchema.optional(),
    commercial_class: vehicleCommercialClassSchema,
    registered_at: z.string().optional(),
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
    fuel_type: z.enum([
      'Unknown',
      'Petrol',
      'Electricity',
      'Diesel',
      'Lpg',
      'DieselHybrid',
      'PetrolHybrid',
    ]),

    engine_size: z.number().optional(),
    color: z.string().optional(),
    co2_emissions: z.number().optional(),
  })
  .transform(
    ({
      license_plate,
      commercial_class,
      registered_at,
      fuel_type,
      engine_size,
      co2_emissions,
      ...data
    }) => ({
      ...data,
      licensePlate: license_plate,
      commercialClass: commercial_class,
      registeredAt: registered_at,
      fuelType: fuel_type,
      engineSize: engine_size,
      co2Emissions: co2_emissions,
    }),
  );

export const listVehiclesResponseSchema = z
  .object({
    page: z.number(),
    page_size: z.number(),
    items: z.array(vehicleSchema),
  })
  .transform(data => ({
    pageSize: data.page_size,
    page: data.page,
    items: data.items,
  }));

export type Vehicle = z.infer<typeof vehicleSchema>;

export type ListVehiclesResponse = z.infer<typeof listVehiclesResponseSchema>;
