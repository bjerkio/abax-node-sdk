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
/** Creates search params from a one-dimensional object. Supports array values. */
export function makeSearchParams(
  data: Record<string, unknown>,
): URLSearchParams {
  const params = new URLSearchParams();
  Object.entries(data).forEach(([key, value]) => {
    if (value) {
      if (Object.prototype.toString.call(value) === '[object Array]') {
        Object.values(value).forEach(v => {
          params.append(key, makeStringFromSeachParam(v));
        });
      } else {
        params.append(key, makeStringFromSeachParam(value));
      }
    }
  });

  return params;
}

function makeStringFromSeachParam(value: unknown): string {
  if (value instanceof Date) {
    return formatDateTime(value);
  }

  return String(value);
}

export function withZod<T extends z.ZodTypeAny, Output = z.infer<T>>(
  schema: T,
): (data: unknown) => Output {
  return data => {
    return schema.parse(data) as Output;
  };
}
