import { describe, expect, it } from 'vitest';
import { AbaxClient } from './main.js';

describe('abax-client', () => {
  const initialiseClient = async () => {
    return new AbaxClient({
      baseUrl: 'production',
      apiKey: 'not-a-secret',
    });
  };

  it.skip('should list equipment', async () => {
    const client = await initialiseClient();

    const result = await client.listEquipment({ page: 1, page_size: 2 });

    expect(result).toMatchSnapshot();
  });

  it.skip('should get equipment', async () => {
    const client = await initialiseClient();

    const result = await client.getEquipment({
      id: '9107a2942ece5b40a642fe2e4c9a84d4',
    });

    expect(result).toMatchSnapshot();
  });
});
