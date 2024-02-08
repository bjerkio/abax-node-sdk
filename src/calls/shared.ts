import { z } from 'zod';

export const driverSchema = z.object({
  id: z.string(),
  externalId: z.string().optional(),
  name: z.string().optional(),
  phoneNumber: z.string().optional(),
  email: z.string().optional(),
});

export const vehicleCommercialClassSchema = z.enum([
  'Unknown',
  'Private',
  'Company',
  'Commercial',
  'CommercialWithPrivateUse',
]);
