import { MockAgent, setGlobalDispatcher } from 'undici';
import { describe, expect, it, vi } from 'vitest';
import { AbaxAuth } from '../abax-auth';

const agent = new MockAgent();
agent.disableNetConnect();
setGlobalDispatcher(agent);

describe('abax auth', async () => {
  it('should get a redirect url to authorize a client', async () => {
    const auth = new AbaxAuth({
      clientId: 'clientId',
      clientSecret: 'clientSecret',
      redirectUri: 'https://redirect.uri',
    });

    const url = auth.getAuthorizationUrl();
    expect(url).toBe(
      'https://identity.abax.cloud/connect/authorize?client_id=clientId&response_type=code&redirect_uri=https%3A%2F%2Fredirect.uri',
    );
  });

  it('should get a redirect url to authorize a client with state', async () => {
    const auth = new AbaxAuth({
      clientId: 'clientId',
      clientSecret: 'clientSecret',
      redirectUri: 'https://redirect.uri',
    });

    const url = auth.getAuthorizationUrl('state');
    expect(url).toBe(
      'https://identity.abax.cloud/connect/authorize?client_id=clientId&response_type=code&redirect_uri=https%3A%2F%2Fredirect.uri&state=state',
    );
  });

  it('should get access token from code', async () => {
    agent
      .get('https://identity.abax.cloud')
      .intercept({
        path: '/connect/token',
        method: 'POST',
      })
      .reply(200, {
        access_token: 'access_token',
        expires_in: 3600,
        id_token: 'id_token',
        token_type: 'Bearer',
        refresh_token: 'refresh_token',
      });

    const date = new Date(2000, 1, 1, 13);
    vi.setSystemTime(date);

    const auth = new AbaxAuth({
      clientId: 'not-a-secret',
      clientSecret: 'not-a-secret',
      redirectUri: 'https://redirect.uri',
    });

    const credentials = await auth.getCredentialsFromCode('code');
    expect(credentials).toMatchInlineSnapshot(`
      {
        "accessToken": "access_token",
        "expiresAt": 2000-02-01T13:00:00.000Z,
        "idToken": "id_token",
        "refreshToken": "refresh_token",
        "tokenType": "Bearer",
      }
    `);
  });
});
