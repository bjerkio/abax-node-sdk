import { z } from 'zod';

export const driverSchema = z.object({
  id: z.string(),
  external_id: z.string().optional(),
  name: z.string().optional(),
  phone_number: z.string().optional(),
  email: z.string().optional(),
}).transform(data => ({
  externalId: data.external_id,
  phoneNumber: data.phone_number
}))

export const vehicleCommercialClassSchema = z.enum([
  'Unknown',
  'Private',
  'Company',
  'Commercial',
  'CommercialWithPrivateUse',
]);
