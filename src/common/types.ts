import camelcaseKeys from 'camelcase-keys';

export interface QueryEnvelope<C> { query: C }

export interface BodyEnvelope<C> { body: C }

export const camelize = <
  T extends readonly unknown[] | Record<string, unknown>,
>(
  val: T,
) => camelcaseKeys(val);
