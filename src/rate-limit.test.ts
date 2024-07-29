import { addMilliseconds } from 'date-fns';
import { describe, expect, it } from 'vitest';
import { initialiseClientAndMockPool } from './test-utils.js';

describe('rate-limit-handling', () => {
  const { client, mockPool } = initialiseClientAndMockPool();

  it('should time out when getting 429', async () => {
    mockPool
      .intercept({
        path: '/v1/vehicles',
        method: 'GET',
      })
      .reply(() => ({
        statusCode: 429,
        responseOptions: {
          headers: {
            'X-Rate-Limit-Reset': addMilliseconds(
              new Date(),
              100,
            ).toISOString(),
          },
        },
      }))
      .times(4);

    await expect(() => client.listVehicles()).rejects.toThrow(
      'Request timed out',
    );
  });

  it('should retry thrice when getting 429', async () => {
    mockPool
      .intercept({
        path: '/v1/vehicles',
        method: 'GET',
      })
      .reply(() => ({
        statusCode: 429,
        responseOptions: {
          headers: {
            'X-Rate-Limit-Reset': addMilliseconds(
              new Date(),
              100,
            ).toISOString(),
          },
        },
      }))
      .times(3);

    mockPool
      .intercept({
        path: '/v1/vehicles',
        method: 'GET',
      })
      .reply(() => ({
        statusCode: 200,
        data: {
          page: 1,
          page_size: 150,
          items: [],
        },
      }))
      .times(1);

    const vehicles = await client.listVehicles();
    expect(vehicles).toEqual({
      items: [],
      page: 1,
      page_size: 150,
    });
  });
});
