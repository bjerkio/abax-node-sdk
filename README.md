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

[abax-auth-docs]:
  https://developers.abax.cloud/getting-started#authentication-and-authorization-details

### When using Authorization Code Flow

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

/**
 * Typically you get this code from the query parameters in the redirect URI.
 * e.g. https://example.com/auth/callback?code=xxxxx
 */
const authorizationCode = 'xxxxx';

/**
 * The function below will request the credentials from the Abax Identity API,
 * and store them in memory (it also returns the credentials, if you need them, eg. for storing in database).
 */
await auth.getCredentialsFromCode(authorizationCode);

/**
 * You can pass auth.getAccessToken() to the AbaxClient constructor.
 * This will automatically refresh the access token when it expires.
 */
const client = new AbaxClient({
  accessToken: () => auth.getAccessToken(),
});
```

### When using Client Credentials Flow

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

### Saving and loading credentials

If you want to save the credentials to a database, you can use the
`getCredentials` method on `AbaxAuth`. This will return the credentials as an
object, which you can then store in your database. Alternatively does both
`getCredentialsFromCode` and `getCredentialsFromClientCredentials` return the
credentials, so you can also store them from there.

```typescript
import { AbaxAuth } from 'abax-node-sdk';

const auth = new AbaxAuth({
  clientId: 'xxxxx',
  clientSecret: 'xxxxx',
});

const credentials = await auth.getCredentialsFromCode(authorizationCode);

// Store credentials in database
```

When you want to load the credentials from the database, you can use the
`setCredentials` method on `AbaxAuth`. This will set the credentials on the

```typescript
import { AbaxAuth } from 'abax-node-sdk';

const auth = new AbaxAuth({
  clientId: 'xxxxx',
  clientSecret: 'xxxxx',
});

// Load credentials from database
auth.setCredentials(credentialsFromDatabase);

/**
 * You can pass auth.getAccessToken() to the AbaxClient constructor.
 * This will automatically refresh the access token when it expires.
 */
const client = new AbaxClient({
  accessToken: () => auth.getAccessToken(),
});
```

### Setting scopes and automatic refreshing

You can set the scopes you want to request when authenticating with the Abax
Identity API. You can do this by passing the `scopes` option to `AbaxAuth`.

```typescript
import { AbaxAuth } from 'abax-node-sdk';

const auth = new AbaxAuth({
  clientId: 'xxxxx',
  clientSecret: 'xxxxx',
  scopes: ['open_api', 'open_api.equipment'],
});
```

**Note**: Automatic refreshing of the access token is only supported when using
the `offline_access` scope. As far as we know, this does not give access for
longer than 30 days, so you will have to re-authenticate after 30 days.

See the scopes available in the [Abax Identity API documentation on
scopes][abax-scopes].

[abax-scopes]: https://developers.abax.cloud/getting-started#scopes

## Contributing

We love contributions! Please read our [Contributing Guide](CONTRIBUTING.md) to
learn how to contribute to this project.
