import { buildCall } from 'typical-fetch';
import { z } from 'zod';
import { performRequest } from '../common/perform-request';
import { withZod } from '../common/utils';
import { authCodeResponseSchema } from './authorization-code';

interface RefreshAccessTokenInput {
  refreshToken: string;
  clientId: string;
  clientSecret: string;
  authUrl: string;
}

type RefreshAccessTokenResponse = z.infer<typeof authCodeResponseSchema>;

/** Obtain tokens from a refresh token.
 * Note: Refresh token can only be used once. When refreshing the access token next time, use the new refresh token returned on the last refresh.
 */
export function refreshAccessToken(
  input: RefreshAccessTokenInput,
): Promise<RefreshAccessTokenResponse> {
  const call = buildCall()
    .args<{ input: RefreshAccessTokenInput }>()
    .path('/connect/token')
    .baseUrl(new URL(input.authUrl))
    .headers({
      'Content-Type': 'application/x-www-form-urlencoded',
    })
    .method('post')
    .body(({ input }) => {
      const body = new URLSearchParams();

      body.append('grant_type', 'refresh_token');
      body.append('refresh_token', input.refreshToken);
      body.append('client_id', input.clientId);
      body.append('client_secret', input.clientSecret);

      return body;
    })
    .parseJson(withZod(authCodeResponseSchema))
    .build();

  return performRequest(() => call({ input }));
}
