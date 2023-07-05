export class AbaxGetTokenError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class AbaxRefreshTokenError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export interface AbaxCredentials {
  idToken?: string | undefined;
  accessToken: string;
  expiresAt: Date;
  tokenType: 'Bearer';
  refreshToken?: string | undefined;
}
