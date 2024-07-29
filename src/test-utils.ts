import { type Interceptable, MockAgent, setGlobalDispatcher } from 'undici';
import { AbaxClient } from './abax-client.js';

export function initialiseClientAndMockPool(
  /** A unique base URL can be provided if there is a need to test against a different endpoint.
   * The MockPool will not work when this option is provided */
  baseUrl?: string,
): {
  client: AbaxClient;
  mockPool: Interceptable;
} {
  const mockAgent = new MockAgent();

  const mockPool = mockAgent.get('https://api.abax.cloud');

  if (baseUrl) {
    setGlobalDispatcher(mockAgent);
    const client = new AbaxClient({
      baseUrl,
      apiKey: 'kanonball!',
    });

    return { client, mockPool };
  }

  mockAgent.disableNetConnect();
  setGlobalDispatcher(mockAgent);
  const client = new AbaxClient({
    apiKey: 'kanonball!',
  });

  return { client, mockPool };
}
