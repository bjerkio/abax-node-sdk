import { buildCall } from 'typical-fetch';
import { z } from 'zod';
import { performRequest } from '../common/perform-request';
import { withZod } from '../common/utils';

export interface AuthorizationCodeInput {
  authorizationCode: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  authUrl: string;
}

export const authCodeResponseSchema = z.object({
  id_token: z.string(),
  access_token: z.string(),
  expires_in: z.number(),
  token_type: z.literal('Bearer'),
  refresh_token: z.string(),
});

export type AuthorizationCodeResponse = z.infer<typeof authCodeResponseSchema>;

/** Obtain tokens from an authorization code.
 * See https://developers.abax.cloud/getting-started#authorization-code-flow
 */
export function authorizeWithAuthorizationCode(
  input: AuthorizationCodeInput,
): Promise<AuthorizationCodeResponse> {
  const call = buildCall()
    .args<{ input: AuthorizationCodeInput }>()
    .path('/connect/token')
    .baseUrl(new URL(input.authUrl))
    .headers({
      // TODO: allow user to set user-agent
      'user-agent': 'abax-node-sdk/1.0',
      'Content-Type': 'application/x-www-form-urlencoded',
    })
    .method('post')
    .body(({ input }) => {
      const body = new URLSearchParams();

      body.append('grant_type', 'authorization_code');
      body.append('code', input.authorizationCode);
      body.append('client_id', input.clientId);
      body.append('client_secret', input.clientSecret);
      body.append('redirect_uri', input.redirectUri);

      return body;
    })
    .parseJson(withZod(authCodeResponseSchema))
    .build();

  return performRequest(() => call({ input }));
}
