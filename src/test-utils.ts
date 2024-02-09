import { MockAgent, type Interceptable, setGlobalDispatcher } from 'undici';
import { AbaxClient } from './abax-client';

export function initialiseClientAndMockPool(): {
  client: AbaxClient;
  mockPool: Interceptable;
} {
  const mockAgent = new MockAgent();
  mockAgent.disableNetConnect();
  setGlobalDispatcher(mockAgent);

  const mockPool = mockAgent.get('https://api.abax.cloud');

  const client = new AbaxClient({
    baseUrl: 'production',
    apiKey: 'kanonball!',
  });

  return { client, mockPool };
}
