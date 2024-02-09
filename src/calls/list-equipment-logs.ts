import { z } from 'zod';

export interface ListEquipmentLogsInput {
  /** Defaults to 1 */
  page?: number;

  /** Defaults to 1500 */
  pageSize?: number;

  /** The period cannot be longer than 3 months */
  dateFrom: Date;

  /** The period cannot be longer than 3 months */
  dateTo: Date;
}
const equipmentLogSchema = z.object({
  equipment_id: z.string(),
  usage_log_id: z.number(),
  address: z.string(),
  start_time: z.string(),
  end_time: z.string(),
  input_type: z.enum(['Yellow', 'White', 'Blue']),
  usage: z.number(),
}).transform(data => ({
  equipmentId: data.equipment_id,
  usageLogId: data.usage_log_id,
  startTime: data.start_time,
  endTime: data.end_time,
  inputType: data.input_type,
}))

export const listEquipmentLogsResponseSchema = z.object({
  page: z.number(),
  page_size: z.number(),
  items: z.array(equipmentLogSchema),
}).transform(data => ({
  pageSize: data.page_size
}))

export type EquipmentLog = z.infer<typeof equipmentLogSchema>;
export type ListEquipmentLogsResponse = z.infer<
  typeof listEquipmentLogsResponseSchema
>;
