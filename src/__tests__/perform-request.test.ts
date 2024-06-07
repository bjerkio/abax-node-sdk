import { describe, expect, it } from 'vitest';
import { initialiseClientAndMockPool } from '../test-utils';

describe('perform request', () => {
  it.skip('Should back off and retry on 429', async () => {
    const { client, mockPool } = initialiseClientAndMockPool();

    mockPool
      .intercept({
        path: '/v2/equipment/90c5b884d50b46afa6eb3aa14792f782',
        method: 'GET',
      })
      .reply(429, {})
      .times(3);

    await expect(
      client.getEquipment({ id: '90c5b884d50b46afa6eb3aa14792f782' }),
    ).rejects.toMatchSnapshot();
  });

  it('Should throw rejected error on 403', async () => {
    const { client, mockPool } = initialiseClientAndMockPool();

    mockPool
      .intercept({
        path: '/v2/equipment/90c5b884d50b46afa6eb3aa14792f782',
        method: 'GET',
      })
      .reply(403, {
        error: 'Forbidden',
        message: 'Access denied',
      })
      .times(1);

    await expect(
      client.getEquipment({ id: '90c5b884d50b46afa6eb3aa14792f782' }),
    ).rejects.toMatchSnapshot();
  });

  it('Should throw unauthorized error on 401', async () => {
    const { client, mockPool } = initialiseClientAndMockPool();

    mockPool
      .intercept({
        path: '/v2/equipment/90c5b884d50b46afa6eb3aa14792f782',
        method: 'GET',
      })
      .reply(401, {
        error: 'Unauthorized',
        message: 'Invalid token',
      })
      .times(1);

    await expect(
      client.getEquipment({ id: '90c5b884d50b46afa6eb3aa14792f782' }),
    ).rejects.toMatchSnapshot();
  });

  it('Should throw not found error on 404 with message', async () => {
    const { client, mockPool } = initialiseClientAndMockPool();

    mockPool
      .intercept({
        path: '/v2/equipment/90c5b884d50b46afa6eb3aa14792f782',
        method: 'GET',
      })
      .reply(404, {
        error: 'Not Found',
        message: 'Equipment by id not found',
      })
      .times(1);

    await expect(
      client.getEquipment({ id: '90c5b884d50b46afa6eb3aa14792f782' }),
    ).rejects.toMatchSnapshot();
  });

  it('should pass through error message on 400', async () => {
    const { client, mockPool } = initialiseClientAndMockPool();

    mockPool
      .intercept({
        path: '/v2/equipment/90c5b884d50b46afa6eb3aa14792f782',
        method: 'GET',
      })
      .reply(400, {
        error: 'Bad Request',
        message: 'Equipment id is invalid',
      })
      .times(1);

    await expect(
      client.getEquipment({ id: '90c5b884d50b46afa6eb3aa14792f782' }),
    ).rejects.toMatchSnapshot();
  });

  const errorCodes = [400, 401, 403, 404];
  errorCodes.forEach(errorCode => {
    it(`Should handle ${errorCode} error without message`, async () => {
      const { client, mockPool } = initialiseClientAndMockPool();

      mockPool
        .intercept({
          path: '/v2/equipment/90c5b884d50b46afa6eb3aa14792f782',
          method: 'GET',
        })
        .reply(errorCode, {})
        .times(1);

      await expect(
        client.getEquipment({ id: '90c5b884d50b46afa6eb3aa14792f782' }),
      ).rejects.toMatchSnapshot();
    });
  });
});
