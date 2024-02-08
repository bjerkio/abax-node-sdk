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
  equipmentId: z.string(),
  usageLogId: z.number(),
  address: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  inputType: z.enum(['Yellow', 'White', 'Blue']),
  usage: z.number(),
});

export const listEquipmentLogsResponseSchema = z.object({
  page: z.number(),
  pageSize: z.number(),
  items: z.array(equipmentLogSchema),
});

export type EquipmentLog = z.infer<typeof equipmentLogSchema>;
export type ListEquipmentLogsResponse = z.infer<
  typeof listEquipmentLogsResponseSchema
>;
