import { describe, expect, it } from 'vitest';
import { makeSearchParams } from '../../common';

describe('makeSearchParams', () => {
  it('should convert dates to ISO with timezone offset', () => {
    const searchParams = makeSearchParams({
      from: new Date('2024-01-01'),
      to: new Date('2024-02-28'),
    });

    expect(searchParams.toString()).toBe(
      'from=2024-01-01T00%3A00%3A00%2B00%3A00&to=2024-02-28T00%3A00%3A00%2B00%3A00',
    );
  });
  it('should accept date with timestamp', () => {
    const searchParams = makeSearchParams({
      from: new Date('2024-01-01T00:00:00.000Z'),
      to: new Date('2024-02-28T00:00:00.000Z'),
    });

    expect(searchParams.toString()).toBe(
      'from=2024-01-01T00%3A00%3A00%2B00%3A00&to=2024-02-28T00%3A00%3A00%2B00%3A00',
    );
  });
  it('should return a string with a single key-value pair', () => {
    const searchParams = makeSearchParams({
      foo: 'bar',
    });

    expect(searchParams.toString()).toBe('foo=bar');
  });
  it('should return a string with page and pagesize', () => {
    const searchParams = makeSearchParams({
      page: 1,
      pageSize: 1500,
    });

    expect(searchParams.toString()).toBe('page=1&pageSize=1500');
  });
  it('should accept an array of values', () => {
    const searchParams = makeSearchParams({
      foo: ['bar', 'baz'],
    });

    expect(searchParams.toString()).toBe('foo=bar&foo=baz');
  });
  it('should ignore nullish values', () => {
    const searchParams = makeSearchParams({
      foo: null,
      bar: undefined,
    });

    expect(searchParams.toString()).toBe('');
  });
});
