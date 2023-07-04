import { format } from 'date-fns';
import { buildCall } from 'typical-fetch';
import type { z } from 'zod';

export function formatDate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Formats in Minuba API date time format
 * @param date ISO 8601 date string
 */
export function formatDateTime(date: Date): string {
  return date.toISOString();
}

export function withZod<T extends z.ZodTypeAny, Output = z.infer<T>>(
  schema: T,
): (data: unknown) => Output {
  return data => {
    return schema.parse(data);
  };
}

export function makeSearchParams(
  data: Record<string, unknown>,
): URLSearchParams {
  const params = new URLSearchParams();

  Object.entries(data).forEach(([key, value]) => {
    if (value) {
      params.append(key, String(value));
    }
  });

  return params;
}
