import { addMinutes, set } from 'date-fns';
import type { z } from 'zod';

export function withZod<T extends z.ZodTypeAny, Output = z.infer<T>>(
  schema: T,
): (data: unknown) => Output {
  return data => {
    return schema.parse(data) as Output;
  };
}

/** Make URL params in query  */
export function makeQuery(data: {
  query: Record<string, unknown> | undefined;
}): URLSearchParams {
  const params = new URLSearchParams();

  if (!data.query) {
    return params;
  }

  Object.entries(data.query).forEach(([key, value]) => {
    if (value) {
      params.append(key, String(value));
    }
  });

  return params;
}

/** Make URL params in body */
export function makeBody(data: {
  body: Record<string, unknown>;
}): URLSearchParams {
  const params = new URLSearchParams();

  Object.entries(data.body).forEach(([key, value]) => {
    if (value) {
      params.append(key, String(value));
    }
  });

  return params;
}

export function startOfTheNextMinute(fromDate?: Date): Date {
  const now = fromDate ?? new Date();

  const zeroSeconds = set(now, {
    seconds: 0,
    milliseconds: 0,
  });

  return addMinutes(zeroSeconds, 1);
}
