import { buildCall } from 'typical-fetch';
import { z } from 'zod';
import { withZod } from '../common/utils.js';

export interface GetTokenInput {
  code?: string;
  clientId: string;
  clientSecret: string;
  redirectUri?: string;
}

export const authCodeResponseSchema = z
  .object({
    idToken: z.string().optional(),
    accessToken: z.string(),
    expiresIn: z.number(),
    tokenType: z.literal('Bearer'),
    refreshToken: z.string().optional(),
  })
  .transform(data => ({
    idToken: data.idToken,
    accessToken: data.accessToken,
    expiresIn: data.expiresIn,
    tokenType: data.tokenType,
    refreshToken: data.refreshToken,
  }));

export const getTokenCall = buildCall()
  .args<{ input: GetTokenInput }>()
  .path('/connect/token')
  .headers({
    'user-agent': 'abax-node-sdk/1.0',
    'Content-Type': 'application/x-www-form-urlencoded',
  })
  .method('post')
  .body(({ input }) => {
    const body = new URLSearchParams();

    const grantType = input.code ? 'authorization_code' : 'client_credentials';
    body.append('grant_type', grantType);
    body.append('client_id', input.clientId);
    body.append('client_secret', input.clientSecret);
    if (input.code) {
      body.append('code', input.code);
    }
    if (input.redirectUri) {
      body.append('redirect_uri', input.redirectUri);
    }

    return body;
  })
  .parseJson(withZod(authCodeResponseSchema))
  .build();

export interface RefreshAccessTokenInput {
  refreshToken: string;
  clientId: string;
  clientSecret: string;
}

export const refreshCall = buildCall()
  .args<{ input: RefreshAccessTokenInput }>()
  .path('/connect/token')
  .headers({
    'User-Agent': 'abax-node-sdk/1.0',
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
