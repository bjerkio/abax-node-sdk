import { getTokenCall, refreshCall } from './calls';
import {
  type AbaxCredentials,
  AbaxGetTokenError,
  AbaxRefreshTokenError,
} from './types';

export type AbaxScope =
  | 'openid' // request the JWT id_token
  | 'abax_profile' //  request the id_token to include information about the user (name, email and organization id among others)
  | 'open_api' // Request access to the production ABAX Open API
  | 'open_api.equipment' // Request access to equipment
  | 'open_api.vehicles' // Request access to vehicles
  | 'open_api.trips' // Request access to trips
  | 'open_api.driving_behaviour' // Request access to driving behaviour
  | 'open_api.organization' // Request access to organization
  | 'open_api.sandbox' // Request access to the sandbox ABAX Open API
  | 'open_api.sandbox.equipment' // Request access to equipment
  | 'open_api.sandbox.vehicles' // Request access to vehicles
  | 'open_api.sandbox.trips' // Request access to trips
  | 'open_api.sandbox.driving_behaviour' // Request access to driving behaviour
  | 'open_api.sandbox.organization' // Request access to organization
  | 'offline_access';

export interface AbaxAuthConfig {
  /**
   * The client ID
   */
  clientId: string;

  /**
   * The client secret.
   */
  clientSecret: string;

  /**
   * The redirect URI.
   *
   * Must be set when using authorization code.
   */
  redirectUri?: string;

  /**
   * The scopes to request.
   */
  scope?: AbaxScope[] | undefined;

  /**
   * The base URL of the Abax Identity API.
   *
   * @default https://identity.abax.cloud
   */
  baseUrl?: string | undefined;
}

export class AbaxAuth {
  private baseUrl = 'https://identity.abax.cloud';
  private credentials?: AbaxCredentials;

  constructor(private readonly config: AbaxAuthConfig) {
    if (config.baseUrl) {
      this.baseUrl = config.baseUrl;
    }
  }

  /**
   * This method returns a URL that can be used to redirect the user to the
   * Abax Identity API to authorize the application.
   *
   * @param state a unique ID that will be returned in the callback
   * @returns URL to redirect the user to
   */
  getAuthorizationUrl(state?: string): string {
    if (!this.config.redirectUri) {
      throw new Error('redirectUrl must be set when using authorization code');
    }

    const url = new URL('/connect/authorize', this.baseUrl);
    url.searchParams.append('client_id', this.config.clientId);
    url.searchParams.append('response_type', 'code');
    url.searchParams.append('redirect_uri', this.config.redirectUri);

    if (this.config.scope) {
      url.searchParams.append('scope', this.config.scope.join(' ') ?? 'openid');
    }

    if (state) {
      url.searchParams.append('state', state);
    }

    return url.toString();
  }

  /**
   * Get credentials from an authorization code.
   *
   * Note: Stores the credentials internally.
   *
   * @param code authorization code
   * @returns abax credentials
   */
  async getCredentialsFromCode(code: string): Promise<AbaxCredentials> {
    if (!this.config.redirectUri) {
      throw new Error('redirectUrl must be set when using authorization code');
    }

    const result = await getTokenCall({
      baseUrl: this.baseUrl,
      input: {
        clientId: this.config.clientId,
        clientSecret: this.config.clientSecret,
        redirectUri: this.config.redirectUri,
        code,
      },
    });

    if (!result.success) {
      throw new AbaxGetTokenError(result.error.message);
    }

    const { expiresIn, ...rawCredentials } = result.body;
    const credentials = {
      expiresAt: new Date(Date.now() + expiresIn * 1000),
      ...rawCredentials,
    };

    this.setCredentials(credentials);

    return credentials;
  }

  async getCredentialsFromClientCredentials(): Promise<AbaxCredentials> {
    const result = await getTokenCall({
      baseUrl: this.baseUrl,
      input: {
        clientId: this.config.clientId,
        clientSecret: this.config.clientSecret,
      },
    });

    if (!result.success) {
      throw new AbaxGetTokenError(result.error.message);
    }

    const { expiresIn, ...rawCredentials } = result.body;
    const credentials = {
      expiresAt: new Date(Date.now() + expiresIn * 1000),
      ...rawCredentials,
    };

    this.setCredentials(credentials);
    return credentials;
  }

  /**
   * Refresh credentials.
   *
   * Note: Stores the credentials internally.
   *
   * @returns abax credentials
   */
  async refreshCredentials(): Promise<AbaxCredentials> {
    if (!this.credentials?.refreshToken) {
      throw new Error('No refresh token available');
    }

    const result = await refreshCall({
      baseUrl: this.baseUrl,
      input: {
        refreshToken: this.credentials.refreshToken,
        clientId: this.config.clientId,
        clientSecret: this.config.clientSecret,
      },
    });

    if (!result.success) {
      throw new AbaxRefreshTokenError(result.error.message);
    }

    const { expiresIn, ...rawCredentials } = result.body;

    const credentials = {
      expiresAt: new Date(Date.now() + expiresIn * 1000),
      ...rawCredentials,
    };

    this.setCredentials(credentials);

    return credentials;
  }

  setCredentials(credentials: AbaxCredentials): void {
    this.credentials = credentials;
  }

  getCredentials(): AbaxCredentials | undefined {
    return this.credentials;
  }

  /**
   * Get the access token.
   *
   * Refreshes the token if it is expired.
   */
  async getAccessToken(): Promise<string | undefined> {
    if (!this.credentials) {
      return undefined;
    }

    // check if token is expired
    if (
      this.credentials.refreshToken &&
      this.credentials.expiresAt.getTime() < Date.now()
    ) {
      await this.refreshCredentials();
    }

    return this.credentials.accessToken;
  }
}
