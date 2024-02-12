import { describe, expect, it } from 'vitest';
import { initialiseClientAndMockPool } from '../../test-utils';

describe('get odometer values', () => {
  it('should get odometer values', async () => {
    const { client, mockPool } = initialiseClientAndMockPool();

    mockPool
      .intercept({
        path: '/v1/trips/odometerReadings?trip_ids=871c120e54cb4c58b4fb5ee457bb968a&trip_ids=0e2d0a84463e411dbedab16560b60430&trip_ids=129769b3470354568ae6995e7b3c70f5',
        method: 'GET',
      })
      .reply(200, {
        items: [
          {
            trip_id: '871c120e54cb4c58b4fb5ee457bb968a',
            trip_start: {
              value: 100000000,
              timestamp: '2019-01-10T10:00:00.000+00:00',
            },
            trip_finish: {
              value: 100134000,
              timestamp: '2019-01-10T11:33:12.000+00:00',
            },
          },
          {
            trip_id: '0e2d0a84463e411dbedab16560b60430',
            trip_start: {
              value: 83000,
              timestamp: '2019-01-10T10:00:00.000+00:00',
            },
            trip_finish: {
              value: 89000,
              timestamp: '2019-01-10T11:33:12.000+00:00',
            },
          },
          {
            trip_id: '129769b3470354568ae6995e7b3c70f5',
          },
        ],
      })
      .times(1);

    const odometerValues = client.getOdometerValuesOfTrips({
      query: {
        trip_ids: [
          '871c120e54cb4c58b4fb5ee457bb968a',
          '0e2d0a84463e411dbedab16560b60430',
          '129769b3470354568ae6995e7b3c70f5',
        ],
      },
    });
    expect(odometerValues).toMatchSnapshot();
  });
});
