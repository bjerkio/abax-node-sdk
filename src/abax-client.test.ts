import { addMilliseconds } from 'date-fns';
import { type Interceptable, MockAgent, setGlobalDispatcher } from 'undici';
import { beforeEach, describe, expect, it } from 'vitest';
import { AbaxClient } from './main.js';

let mockAgent: MockAgent;
let mockPool: Interceptable;

beforeEach(() => {
  mockAgent = new MockAgent();
  mockAgent.disableNetConnect(); // prevent actual requests to Discord
  setGlobalDispatcher(mockAgent); // enabled the mock client to intercept requests

  mockPool = mockAgent.get('https://api.abax.cloud');
});

describe('abax-client', () => {
  const initialiseClient = async () => {
    return new AbaxClient({
      baseUrl: 'production',
      apiKey:
        'eyJhbGciOiJSUzI1NiIsImtpZCI6IjkzQUY3OTA3RTVERkU0Qjc4NDU5MkMzMkE5RUZDRjZEQUJFMDdDNDhSUzI1NiIsIng1dCI6Ims2OTVCLVhmNUxlRVdTd3lxZV9QYmF2Z2ZFZyIsInR5cCI6ImF0K2p3dCJ9.eyJpc3MiOiJodHRwczovL2lkZW50aXR5LmFiYXguY2xvdWQiLCJuYmYiOjE3MDI1Njg3MDAsImlhdCI6MTcwMjU2ODcwMCwiZXhwIjoxNzAyNTcyMzAwLCJhdWQiOiJvcGVuX2FwaSIsInNjb3BlIjpbIm9wZW5pZCIsImFiYXhfcHJvZmlsZSIsIm9wZW5fYXBpIiwib3Blbl9hcGkuZXF1aXBtZW50Iiwib3Blbl9hcGkudmVoaWNsZXMiLCJvcGVuX2FwaS50cmlwcyJdLCJhbXIiOlsicHdkIl0sImNsaWVudF9pZCI6Ik9UcUVDUzZiREpraVpxZUxWUjhzUkRvZlJmbEpwZktsIiwiaHR0cDovL3NjaGVtYXMuYWJheC5uby9pZGVudGl0eS9jbGFpbXMvY29uc3VtZXJpZCI6IjNjY2MxMTBiLTc1NzktNDIzMS04NDY4LWY0MWU2NGU0ZWI0NSIsInN1YiI6IjExMTU3NTQiLCJhdXRoX3RpbWUiOjE3MDI1Njg3MDAsImlkcCI6ImxvY2FsIiwicm9sZSI6IkFkbWluaXN0cmF0b3IiLCJodHRwOi8vc2NoZW1hcy5hYmF4Lm5vL2lkZW50aXR5L2NsYWltcy9vcmdhbml6YXRpb25pZCI6IjU0MzQwIiwiaHR0cDovL3NjaGVtYXMuYWJheC5uby9pZGVudGl0eS9jbGFpbXMvc2VjdXJpdHlzdGFtcCI6ImNjOGFjN2E4MWE5MzRlN2M4MmUyYmNkMzI3ZTI0YmNmIiwic2lkIjoiRTlFOTg4OEQ0NzQ5QzRGNjJGM0IxOTAyQTJEQThFMjcifQ.eX1p3P66erquMxGmU5FwoZDze-H_Fo7llScmy5sGOL72Z5nggN9ZxAlH1ntX9ICRNNCA7xcoKE5F1jUG7aOBV8iga28j1IULV92qemND6xoA0fgrhUZtukr6MRYWu6cTS_gsaeHzihrPjKaiTo7XFHaIZxj6W6LLnkSo1Bl8w8R1CoRasrBET1eYMyuJiecT4ZAaEVhu8Oy4C18svBaTFptvfAJ9Ql8FFuvRKBe51myyAa1LJsvpbRQFw-G1fvY5ba8-rV79QpX-oVkDAubrI9-y2smuakJc6qVHYRJ_yMiYi8hdlfn3torGWNuJIhlvpON6fR0kssuuviEKqWSYeqhnJupDQg8JN_6zrogWr1fcNWasU8up1qVXv3DnVv2Q0CXNmidTq6ZgknrhrEIBVYqjTNkm-SG-QIsNBKWWcV-B_lvtzeYb4h71oTv_cub62xJU9rIkLpMS20ng3e0OE5azc0qSJZIxTpAMJHg20mAQyJq3Qe_0vHDTCg49h534BfDewt4C1hFDW7ZFz6p6by7YIFTpJYwTaF9Eit6RQ73xWfXqMrvhIQ1O21bXyI1rWJEtDVoaFIyRMJ3KDTZq7q7GX80nSzqeDqlJHEIooT1bmao3uzqMxovhTERf7GgK26RJprHD9dVzSNmh_1Qsq4UEFGfCrCmVDQX3VTdth3o',
    });
  };

  it('should time out when getting 429', async () => {
    const client = await initialiseClient();

    mockPool
      .intercept({
        path: '/v1/vehicles',
        method: 'GET',
      })
      .reply(() => ({
        statusCode: 429,
        responseOptions: {
          headers: {
            'X-Rate-Limit-Reset': addMilliseconds(
              new Date(),
              100,
            ).toISOString(),
          },
        },
      }))
      .times(4);

    await expect(() => client.listVehicles()).rejects.toThrow(
      'Request timed out',
    );
  });

  it('should retry thrice when getting 429', async () => {
    const client = await initialiseClient();

    mockPool
      .intercept({
        path: '/v1/vehicles',
        method: 'GET',
      })
      .reply(() => ({
        statusCode: 429,
        responseOptions: {
          headers: {
            'X-Rate-Limit-Reset': addMilliseconds(
              new Date(),
              100,
            ).toISOString(),
          },
        },
      }))
      .times(3);

    mockPool
      .intercept({
        path: '/v1/vehicles',
        method: 'GET',
      })
      .reply(() => ({
        statusCode: 200,
        data: {
          page: 1,
          pageSize: 150,
          items: [],
        },
      }))
      .times(1);

    const vehicles = await client.listVehicles();
    expect(vehicles).toEqual({
      items: [],
      page: 1,
      pageSize: 150,
    });
  });
});
