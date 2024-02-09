import { createDecoder } from 'fast-jwt';
import { z } from 'zod';

export const abaxIdTokenPayload = z.object({
  iss: z.string(),
  nbf: z.number(),
  iat: z.number(),
  exp: z.number(),
  aud: z.string(),
  amr: z.array(z.string()),
  at_hash: z.string(),
  sid: z.string(),
  sub: z.string(),
  auth_time: z.number(),
  idp: z.string(),
  'http://schemas.abax.no/identity/claims/username': z.string(),
  role: z.string(),
  name: z.string(),
  locale: z.string(),
  'http://schemas.abax.no/identity/claims/organizationid': z.string(),
  'http://schemas.abax.no/identity/claims/countrycode': z.string(),
  email: z.string(),
  email_verified: z.boolean(),
  phone_number: z.string().optional(),
  'http://schemas.abax.no/identity/claims/securitystamp': z.string(),
}).transform(({ at_hash, 
  auth_time, 
  email_verified, 
  phone_number, 
  'http://schemas.abax.no/identity/claims/username': username,
  'http://schemas.abax.no/identity/claims/organizationid': organizationId, 
  'http://schemas.abax.no/identity/claims/countrycode': countryCode,
  'http://schemas.abax.no/identity/claims/securitystamp': securityStamp,
  ...data }) => ({
  ...data,
  username,
  organizationId,
  countryCode,
  securityStamp,
  atHash: at_hash,
  authTime: auth_time,
  emailVerified: email_verified,
  phoneNumber: phone_number,
})
)

export type AbaxIdTokenPayload = z.infer<typeof abaxIdTokenPayload>;

/** Extract Abax Profile data from a JWT id token that was retrieved with the `abax_profile` scope. */
export function decodeAbaxProfileToken(idToken: string): AbaxIdTokenPayload {
  const decode = createDecoder();

  return abaxIdTokenPayload.parse(decode(idToken));
}
