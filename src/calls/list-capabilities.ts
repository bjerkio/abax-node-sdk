import { z } from 'zod';

const capabilitiesSchema = z.object({
  capability: z.enum([
    'query-equipment',
    'query-equipment-locations',
    'query-people',
    'query-vehicles',
    'query-vehicle-locations',
    'query-vehicle-location-history',
    'query-vehicle-drive-states',
    'query-trips',
    'query-trip-route',
    'query-trip-expense-and-extra',
  ]),
});

export const listCapabilitiesResponseSchema = z.object({
  items: z.array(capabilitiesSchema),
});

export type Capabilities = z.infer<typeof capabilitiesSchema>;
export type ListCapabilitiesResponse = z.infer<
  typeof listCapabilitiesResponseSchema
>;
