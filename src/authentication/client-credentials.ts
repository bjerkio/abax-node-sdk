import { buildCall } from 'typical-fetch';
import { z } from 'zod';
import { withZod } from '../common/utils';

export interface ClientCredentialsInput {
  authUrl: string;
  clientId: string;
  clientSecret: string;
  scopes: Scope[] | SandboxScope[];
}

export enum SandboxScope {
  OpenApiSandbox = 'open_api.sandbox',
  OpenApiSandboxEquipment = 'open_api.sandbox.equipment',
  OpenApiSandboxVehicles = 'open_api.sandbox.vehicles',
  OpenApiSandboxTrips = 'open_api.sandbox.trips',
  OpenApiSandboxDrivingBehaviour = 'open_api.sandbox.driving_behaviour',
  OpenApiSandboxOrganization = 'open_api.sandbox.organization',
}

export enum Scope {
  OpenApi = 'open_api',
  OpenApiEquipment = 'open_api.equipment',
  OpenApiVehicles = 'open_api.vehicles',
  OpenApiTrips = 'open_api.trips',
  OpenApiDrivingBehaviour = 'open_api.driving_behaviour',
  OpenApiOrganization = 'open_api.organization',
}

export const clientCredentialsResponseSchema = z.object({
  access_token: z.string(),
  token_type: z.literal('Bearer'),
  expires_in: z.number(),
  scope: z.string(),
});

export type ClientCredentialsResponse = z.infer<
  typeof clientCredentialsResponseSchema
>;

/** Obtain access token with client credentials.
 * See https://developers.abax.cloud/getting-started#client-credentials-flow
 */
export async function authenticateWithClientCredentials(
  input: ClientCredentialsInput,
): Promise<ClientCredentialsResponse> {
  const call = buildCall()
    .args<{ input: ClientCredentialsInput }>()
    .baseUrl(new URL(input.authUrl))
    .headers({
      // TODO: allow user to set user-agent
      'user-agent': 'abax-node-sdk/1.0',
      'Content-Type': 'application/x-www-form-urlencoded',
    })
    .path('/connect/token')
    .method('post')
    .body(({ input: { clientId, clientSecret, scopes } }) => {
      const body = new URLSearchParams();

      body.append('grant_type', 'client_credentials');
      body.append('scope', scopes.join(' '));
      body.append('client_id', clientId);
      body.append('client_secret', clientSecret);

      return body;
    })
    .parseJson(withZod(clientCredentialsResponseSchema))
    .build();

  const res = await call({ input });

  if (res.success) {
    return res.body;
  }

  throw res.error;
}
