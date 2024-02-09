import { z } from 'zod';

export interface GetEquipmentInput {
  id: string;
}
const operatingHoursSchema = z.object({
  hours: z.number(),
  unit_driven: z.boolean(),
}).transform(data => ({
  unitDriven: data.unit_driven
}));

export const equipmentSchema = z.object({
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
  unit: z.object({
    id: z.string(),
    serial_number: z.string().optional(),
    type: z.string(),
    health: z.enum(['Unknown', 'Healthy', 'Degraded', 'Unhealthy']),
    status: z.enum(['Unknown', 'Active', 'Deactivated']),
  }),
  location: z
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
    .optional(),
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
}).transform(data => ({
  assetId: data.asset_id,
  serialNumber: data.serial_number,
  registeredAt: data.registered_at,
  operatingHours: data.operating_hours,
  initialOperatingHours: data.initial_operating_hours
}))

export type AbaxEquipment = z.infer<typeof equipmentSchema>;
export type GetEquipmentResponse = AbaxEquipment;
