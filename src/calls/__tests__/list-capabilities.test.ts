import { describe, expect, it } from 'vitest';
import { initialiseClientAndMockPool } from '../../test-utils.js';

describe('list capabilities', () => {
  it('should list capabilitites', async () => {
    const { client, mockPool } = initialiseClientAndMockPool();

    mockPool
      .intercept({
        path: '/v1/api-capabilities',
        method: 'GET',
      })
      .reply(200, {
        items: [
          {
            capability: 'query-equipment',
          },
          {
            capability: 'query-equipment-locations',
          },
          {
            capability: 'query-people',
          },
        ],
      })
      .times(1);
    const capabilites = await client.listCapabilities();

    expect(capabilites).toMatchSnapshot();
  });
});
