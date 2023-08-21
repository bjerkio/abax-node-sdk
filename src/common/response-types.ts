import { z } from 'zod';
import { camelize } from './types';

export function listResponseEnvelope<TMessageType extends z.ZodType>(
  zodType: TMessageType,
) {
  return z
    .object({
      page: z.number(),
      pageSize: z.number(),
      items: z.array(zodType),
    })
    .transform(camelize);
}
