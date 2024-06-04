import { describe, expect, it } from 'vitest';
import { initialiseClientAndMockPool } from '../../test-utils';
import { makeSearchParams } from '../../common';

describe('get-usage-summary', () => {
  it('should return equipment', async () => {
    const { client, mockPool } = initialiseClientAndMockPool();

    const searchParams = makeSearchParams({
      from: new Date('2024-01-01'),
      to: new Date('2024-02-28'),
    })
    const path = `/v1/vehicles/394f39098dee561fb248b443e327c790/usage-summary?${searchParams.toString()}`;
    mockPool
      .intercept({
        path: path,
        method: 'GET',
      })
      .reply(200, {
        private_usage_summary: {
          distance_driven_in_meters: 1500,
          total_toll_stations_passed: 2,
          total_road_toll_cost: 40,
        },
        corporate_usage_summary: {
          distance_driven_in_meters: 468,
          total_toll_stations_passed: 4,
          total_road_toll_cost: 80,
        },
      })
      .times(1);
    
    const usageSummary = await client.listUsageSummary({
      vehicleId: '394f39098dee561fb248b443e327c790',
      dateFrom: new Date('2024-01-01'),
      dateTo: new Date('2024-02-28'),
    });

    expect(usageSummary).toMatchSnapshot();
  });
});
