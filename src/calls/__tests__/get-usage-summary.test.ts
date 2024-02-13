import { describe, expect, it } from 'vitest';
import { initialiseClientAndMockPool } from '../../test-utils';

describe('get-usage-summary', () => {
  it('should return equipment', async () => {
    const { client, mockPool } = initialiseClientAndMockPool();

    mockPool
      .intercept({
        path: '/v1/vehicles/394f39098dee561fb248b443e327c790/usage-summary?from=2024-01-01&to=2024-02-28',
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
      vehicle_id: '394f39098dee561fb248b443e327c790',
      date_from: new Date('2024-01-01'),
      date_to: new Date('2024-02-28'),
    });

    expect(usageSummary).toMatchSnapshot();
  });
});
