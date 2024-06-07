import { describe, expect, it } from 'vitest';
import { startOfTheNextMinute } from '../../common';

describe('utils', () => {
  it('should get the start of the next minute correctly', () => {
    const now = new Date('2023-01-01T16:47:36.351Z');
    const next = startOfTheNextMinute(now);

    expect(next.toISOString()).toBe('2023-01-01T16:48:00.000Z');
  });
});
