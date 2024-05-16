import { describe, expect, it } from 'vitest';
import { initialiseClientAndMockPool } from '../../test-utils';

describe('list equipment logs', () => {
  it('should list equipment logs', async () => {
    const { client, mockPool } = initialiseClientAndMockPool();

    mockPool
      .intercept({
        path: '/v2/equipment/usage-log?date_from=2019-09-27T10%3A54%3A47%2B02%3A00&date_to=2019-11-20T09%3A54%3A47%2B01%3A00',
        method: 'GET',
      })
      .reply(200, {
        page: 1,
        page_size: 1500,
        items: [
          {
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
              id: '6eeae0c2096a4173bf7a484a025aa91f',
              serial_number: 'PCX000123',
              type: 'Abax5',
              health: 'Healthy',
              status: 'Active',
            },
            location: {
              latitude: 67.879802,
              longitude: 12.977594,
              in_movement: false,
              timestamp: '2019-09-27T08:54:47.432+00:00',
              signal_source: 'Gps',
            },
            organization: {
              id: 'cc9c6ad1ed36418aaa4dd232bbdad80a',
              name: 'ABAX',
            },
            initial_operating_hours: {
              hours: 5,
              unit_driven: true,
            },
            notes: 'To be used only in Oslo',
            temperature: {
              value: 20,
              timestamp: '2019-09-27T08:54:47.433+00:00',
            },
          },
          {
            id: '2b9132e94ca64a5bbe879bc5e25c11ad',
            asset_id: '5d3211659d0e4006af58fdb6b0126d2a',
            alias: 'Small concrete pump trailor',
            serial_number: 'UHX020127',
            model: {
              name: 'Reed Concrete Pump trailor A30HP',
            },
            operating_hours: {
              hours: 100,
              unit_driven: true,
            },
            unit: {
              id: '11ef83e83e4d4b82a7b38cd6a8bb1ebe',
              serial_number: 'PCX220124',
              type: 'Abax5',
              health: 'Healthy',
              status: 'Active',
            },
            location: {
              latitude: 67.879802,
              longitude: 12.977594,
              in_movement: true,
              speed: 20,
              course: 172,
              timestamp: '2019-09-27T08:54:47.433+00:00',
              signal_source: 'Gps',
            },
            organization: {
              id: 'b493e3d514624eecbac34c3944589d97',
              name: 'ABAX',
            },
            initial_operating_hours: {
              hours: 5,
              unit_driven: true,
            },
            notes: 'To be used only in Larvik',
            temperature: {
              value: 20,
              timestamp: '2019-09-27T08:54:47.433+00:00',
            },
          },
        ],
      })
      .times(1);

    const equipment = await client.listEquipmentLogs({
      date_from: new Date('2019-09-27T08:54:47.433+00:00'),
      date_to: new Date('2019-11-20T08:54:47.433+00:00'),
    });
    expect(equipment).toMatchSnapshot();
  });
});
