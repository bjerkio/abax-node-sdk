<img src="https://github.com/bjerkio/abax-node-sdk/raw/main/.github/logo.svg" alt="Abax Node SDK">

ABAX API client built using Typescript for Node.js. This SDK is used by multiple
integrations with the ABAX API, but it is still in early development.

## Features

- Built with Typescript
- Uses [undici](https://github.com/nodejs/undici) (Faster requests 🚀)
- Pure ESM

The endpoints currently supported are:

- GET v1/vehicles
- GET v1/trips
- GET v1/trips/odometerReadings
- GET v1/trips/expense
- GET v2/equipment
- GET v2/equipment/{id}
- GET v2/equipment/usage-log

**Note**: We have yet to add any tests, but we will add them as soon as
possible.

## Installation

```bash
pnpm add abax-node-sdk
```

## Usage

```typescript
import { AbaxClient } from 'abax-node-sdk';

const client = new AbaxClient({
  apiKey: 'xxxxx',
});

client.getVehicles().then(vehicles => {
  console.log(vehicles);
});
```

## Authentication

If you don't know how to authenticate with the Abax API, you should consult
[their documentation][abax-auth-docs]. This SDK comes packed with `AbaxAuth`
which helps you solve the authentication part.

## When using Authorization Code Flow

The first step is to create an instance of `AbaxAuth` and pass in your
`clientId` and `clientSecret`. You can then use the `getAuthorizationUrl` method
to get the URL you need to redirect the user to. After the user has authorized
your application, they will be redirected to the `redirectUri` you specified
when creating the `AbaxAuth` instance. The `redirectUri` will contain a `code`
query parameter which you can use to get an access token.

```typescript
import { AbaxAuth } from 'abax-node-sdk';

const auth = new AbaxAuth({
  clientId: 'xxxxx',
  clientSecret: 'xxxxx',
  redirectUri: 'https://example.com/auth/callback',
});

const authorizationUrl = auth.getAuthorizationUrl();
```

After the user has authorized your application, they will be redirected to the
`redirectUri` you specified when creating the `AbaxAuth` instance. The
`redirectUri` will contain a `code` query parameter which you can use to get an
access token.

```typescript
import { AbaxAuth } from 'abax-node-sdk';

const auth = new AbaxAuth({
  clientId: 'xxxxx',
  clientSecret: 'xxxxx',
  redirectUri: 'https://example.com/auth/callback',
});

const authorizationCode = 'xxxxx';
await auth.getCredentialsFromCode(authorizationCode);

/**
 * You can pass auth.getAccessToken() to the AbaxClient constructor.
 * This will automatically refresh the access token when it expires.
 */

const client = new AbaxClient({
  accessToken: () => auth.getAccessToken(),
});
```

## When using Client Credentials Flow

```typescript
import { AbaxAuth } from 'abax-node-sdk';

const auth = new AbaxAuth({
  clientId: 'xxxxx',
  clientSecret: 'xxxxx',
});

await auth.getCredentialsFromClientCredentials();

/**
 * You can pass auth.getAccessToken() to the AbaxClient constructor.
 * This will automatically refresh the access token when it expires.
 */

const client = new AbaxClient({
  accessToken: () => auth.getAccessToken(),
});
```

[abax-auth-docs]:
  https://developers.abax.cloud/getting-started#authentication-and-authorization-details

## Contributing

We love contributions! Please read our [Contributing Guide](CONTRIBUTING.md) to
learn how to contribute to this project.
