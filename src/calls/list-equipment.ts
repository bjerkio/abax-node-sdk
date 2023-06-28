import { z } from 'zod';
import { equipmentSchema } from './get-equipment';

export interface ListEquipmentInput {
  /** Defaults to 1 */
  page?: number;

  /** Defaults to 1500 */
  page_size?: number;

  /** By default endpoint returns information about all unit types excluding Mini.
   * To get data about Minis, you have to explicitly provide "Mini" as a parameter (only Mini information will be returned) */
  unit_types?: 'Mini';
}

export const listEquipmentResponse = z.object({
  page: z.number(),
  page_size: z.number(),
  items: z.array(equipmentSchema),
});

export type ListEquipmentResponse = z.infer<typeof listEquipmentResponse>;
