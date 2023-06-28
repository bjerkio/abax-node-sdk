import { z } from 'zod';

export interface ListEquipmentLogsInput {
  /** Defaults to 1 */
  page?: number;

  /** Defaults to 1500 */
  page_size?: number;

  /** The period cannot be longer than 3 months */
  date_from: Date;

  /** The period cannot be longer than 3 months */
  date_to: Date;
}
const equipmentLogSchema = z.object({
  equipment_id: z.string(),
  usage_log_id: z.number(),
  address: z.string(),
  start_time: z.string(),
  end_time: z.string(),
  input_type: z.enum(['Yellow', 'White', 'Blue']),
  usage: z.number(),
});

export const listEquipmentLogsResponseSchema = z.object({
  page: z.number(),
  page_size: z.number(),
  items: z.array(equipmentLogSchema),
});

export type EquipmentLog = z.infer<typeof equipmentLogSchema>;
export type ListEquipmentLogsResponse = z.infer<
  typeof listEquipmentLogsResponseSchema
>;
