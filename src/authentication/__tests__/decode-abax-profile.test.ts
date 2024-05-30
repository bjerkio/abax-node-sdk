import { describe, expect, it } from 'vitest';
import { decodeAbaxProfileToken } from '../decode-abax-profile';

describe('decode-abax.profile.ts', () => {
  it('should be able to decode a JWT id token correctly', () => {
    const token =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2lkZW50aXR5LmFiYXguY2xvdWQiLCJuYmYiOjEyMywiaWF0IjoxMjMsImV4cCI6MTIzLCJhdWQiOiJoZWxsbyIsImFtciI6WyJoZWxsbyJdLCJhdF9oYXNoIjoiMTIzYWJjIiwic2lkIjoiMTIzRUYiLCJzdWIiOiIxMjMiLCJhdXRoX3RpbWUiOjEyMywiaWRwIjoibG9jYWwiLCJodHRwOi8vc2NoZW1hcy5hYmF4Lm5vL2lkZW50aXR5L2NsYWltcy91c2VybmFtZSI6ImhlbGxvQGV4YW1wbGUuY29tIiwicm9sZSI6IkFkbWluaXN0cmF0b3IiLCJuYW1lIjoiTmFtZSBOYW1leSIsImxvY2FsZSI6Im5vIiwiaHR0cDovL3NjaGVtYXMuYWJheC5uby9pZGVudGl0eS9jbGFpbXMvb3JnYW5pemF0aW9uaWQiOiIxMjMiLCJodHRwOi8vc2NoZW1hcy5hYmF4Lm5vL2lkZW50aXR5L2NsYWltcy9jb3VudHJ5Y29kZSI6Ik5PIiwiZW1haWwiOiJoZWxsb0BleGFtcGxlLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaG9uZV9udW1iZXIiOiIrNDc5OTk5OTk5OSIsImh0dHA6Ly9zY2hlbWFzLmFiYXgubm8vaWRlbnRpdHkvY2xhaW1zL3NlY3VyaXR5c3RhbXAiOiIxMjNhYmMifQ.9NTEjVBPoFye2ZLu4OSSGc4j8fIpRFyEoJEFLw9-C2U';

    const decoded = decodeAbaxProfileToken(token);

    expect(decoded).toMatchObject({
      iss: 'https://identity.abax.cloud',
      nbf: 123,
      iat: 123,
      exp: 123,
      aud: 'hello',
      amr: ['hello'],
      sid: '123EF',
      sub: '123',
      idp: 'local',
      role: 'Administrator',
      name: 'Name Namey',
      locale: 'no',
      email: 'hello@example.com',
      username: 'hello@example.com',
      organizationId: '123',
      countryCode: 'NO',
      securityStamp: '123abc',
      atHash: '123abc',
      authTime: 123,
      emailVerified: true,
      phoneNumber: '+4799999999',
    });
  });
  it('should fail to decode a bad token', () => {
    const token = 'asdf';
    expect(() => decodeAbaxProfileToken(token)).toThrow();
  });
});
