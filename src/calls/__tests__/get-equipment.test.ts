import { describe, expect, it } from 'vitest';
import { initialiseClientAndMockPool } from '../../test-utils';

describe('get-equipment', () => {
  it('should return equipment', async () => {
    const { client, mockPool } = initialiseClientAndMockPool();

    mockPool
      .intercept({
        path: '/v2/equipment/90c5b884d50b46afa6eb3aa14792f782',
        method: 'GET',
      })
      .reply(200, {
        id: '90c5b884d50b46afa6eb3aa14792f782',
        asset_id: '947a0543bb4446dc98e17069f659be7c',
        alias: 'Concrete Pump Yellow',
        serial_number: 'UHR000123',
        model: {
          name: 'Reed Concrete Pump C50-HP',
        },
        operating_hours: {
          hours: 100,
          unit_driven: true,
        },
        unit: {
          id: '3ba46063c2064276becc484d3dc432fc',
          serial_number: 'PCX000123',
          type: 'Abax5',
          health: 'Healthy',
          status: 'Active',
        },
        location: {
          latitude: 67.879802,
          longitude: 12.977594,
          in_movement: false,
          timestamp: '2019-09-27T08:59:41.821+00:00',
          signal_source: 'Gps',
        },
        organization: {
          id: '9953da6a1ce7404591680b20fc67a1b1',
          name: 'ABAX',
        },
        initial_operating_hours: {
          hours: 5,
          unit_driven: true,
        },
        notes: 'To be used only in Oslo',
        temperature: {
          value: 20,
          timestamp: '2019-09-27T08:59:41.821+00:00',
        },
      })
      .times(1);

    const equipment = await client.getEquipment({
      id: '90c5b884d50b46afa6eb3aa14792f782',
    });

    expect(equipment).toMatchSnapshot();
  });
});
