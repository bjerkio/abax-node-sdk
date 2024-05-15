import { z } from 'zod';

export interface GetEquipmentInput {
  id: string;
}
const operatingHoursSchema = z
  .object({
    hours: z.number(),
    unit_driven: z.boolean(),
  })
  .transform(data => ({
    unitDriven: data.unit_driven,
    hours: data.hours,
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

const unitSchema = z
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

export const equipmentSchema = z
  .object({
    id: z.string(),
    asset_id: z.string().optional(),
    alias: z.string().optional(),
    serial_number: z.string().optional(),
    registered_at: z.date().optional(),
    model: z
      .object({
        name: z.string(),
      })
      .optional(),
    operating_hours: operatingHoursSchema.optional(),
    unit: unitSchema,
    location: locationSchema.optional(),
    organization: z.object({
      id: z.string(),
      name: z.string(),
    }),
    initial_operating_hours: operatingHoursSchema.optional(),
    notes: z.string().optional(),
    temperature: z
      .object({
        value: z.number(),
        timestamp: z.string(),
      })
      .optional(),
  })
  .transform(
    ({
      asset_id,
      serial_number,
      registered_at,
      operating_hours,
      initial_operating_hours,
      ...data
    }) => ({
      ...data,

      assetId: asset_id,
      serialNumber: serial_number,
      registeredAt: registered_at,
      operatingHours: operating_hours,
      initialOperatingHours: initial_operating_hours,
    }),
  );

export type AbaxEquipment = z.infer<typeof equipmentSchema>;
export type GetEquipmentResponse = AbaxEquipment;
