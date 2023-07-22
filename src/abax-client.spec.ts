import dotenv from 'dotenv';
import { describe, expect, it } from 'vitest';
import { AbaxClient, Scope, authenticateWithClientCredentials } from './main';
dotenv.config();

describe('abax-client', () => {
  const initialiseClient = async () => {
    const clientId = process.env['ABAX_CLIENT_ID'] ?? 'no-client-id';
    const clientSecret =
      process.env['ABAX_CLIENT_SECRET'] ?? 'no-client-secret';

    const authReply = await authenticateWithClientCredentials({
      clientId,
      clientSecret,
      authUrl: 'https://identity.abax.cloud',
      scopes: [Scope.OpenApi, Scope.OpenApiEquipment],
    });

    return new AbaxClient({
      baseUrl: 'production',
      apiKey: authReply.access_token,
    });
  };
  it('should list equipment', async () => {
    const client = await initialiseClient();

    const result = await client.listEquipment({ page: 1, page_size: 2 });

    expect(result).toMatchSnapshot();
  });

  it('should get equipment', async () => {
    const client = await initialiseClient();

    const result = await client.getEquipment({
      id: '9107a2942ece5b40a642fe2e4c9a84d4',
    });

    expect(result).toMatchSnapshot();
  });
});
