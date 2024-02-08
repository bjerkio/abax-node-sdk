import { z } from 'zod';

export interface GetEquipmentInput {
  id: string;
}
const operatingHoursSchema = z.object({
  hours: z.number(),
  unitDriven: z.boolean(),
});

export const equipmentSchema = z.object({
  id: z.string(),
  assetId: z.string().optional(),
  alias: z.string().optional(),
  serialNumber: z.string().optional(),
  registeredAt: z.date().optional(),
  model: z
    .object({
      name: z.string(),
    })
    .optional(),
  operatingHours: operatingHoursSchema.optional(),
  unit: z.object({
    id: z.string(),
    serialNumber: z.string().optional(),
    type: z.string(),
    health: z.enum(['Unknown', 'Healthy', 'Degraded', 'Unhealthy']),
    status: z.enum(['Unknown', 'Active', 'Deactivated']),
  }),
  location: z
    .object({
      latitude: z.number(),
      longitude: z.number(),
      speed: z.number().optional(),
      inMovement: z.boolean().optional(),
      course: z.number().optional(),
      timestamp: z.string(),
      signalSource: z.enum(['Gps', 'Gsm']),
      accuracyRadius: z.number().optional(),
    })
    .optional(),
  organization: z.object({
    id: z.string(),
    name: z.string(),
  }),
  initialOperatingHours: operatingHoursSchema.optional(),
  notes: z.string().optional(),
  temperature: z
    .object({
      value: z.number(),
      timestamp: z.string(),
    })
    .optional(),
});

export type AbaxEquipment = z.infer<typeof equipmentSchema>;
export type GetEquipmentResponse = AbaxEquipment;
