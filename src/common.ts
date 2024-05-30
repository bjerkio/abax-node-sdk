import { addMinutes, format, set } from 'date-fns';
import type { z } from 'zod';

export function formatDate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * @param date ISO 8601 date string
 * @returns formatted matching Abax API date format
 */
export function formatDateTime(date: Date): string {
  return date.toISOString();
}

export function startOfTheNextMinute(fromDate?: Date): Date {
  const now = fromDate ?? new Date();

  const zeroSeconds = set(now, {
    seconds: 0,
    milliseconds: 0,
  });

  return addMinutes(zeroSeconds, 1);
}

/**
 *
 * @param data search parameters
 * @returns the parameters formatted as URLSearchParams
 *
 * @example  makeSearchParams({ foo: 'bar', baz: 42 }) => 'foo=bar&baz=42'
 *
 * Create search parameters from a flat object.
 */
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

export function withZod<T extends z.ZodTypeAny, Output = z.infer<T>>(
  schema: T,
): (data: unknown) => Output {
  return data => {
    return schema.parse(data) as Output;
  };
}
