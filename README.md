<img src=".github/logo.svg" alt="Abax Node SDK">

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

**Note**: We have yet to add any tests, but we will add them as soon as
possible.

## Authentication

If you don't know how to authenticate with the Abax API, you should consult
their documentation. This SDK provides methods that can be used for acquiring
access tokens to the Abax API, but there are a number of steps that must be
taken before then.

`authorizeWithAuthorizationCode` – this method presupposes that the
authorization code is available. In order to get such a code, you must direct
the user's browser to a login URL, and after the user has given your app
permission to use the API on their behalf, they will be redirected to your
redirect URL and the authorization code will be provided as a query parameter.
Then you can call the `authorizeWithAuthorizationCode` function to get an access
token (and optionally a refresh token if offline access was requested).

`refreshAccessToken` – this method presupposes that you have a refresh token.
Use this function to get a new access token and refresh token once your old
access token has expired.

`authorizeWithClientCredentials` – this method presupposes that you have
credentials that have been authorized for a private integration scenario. The
credentials can be created freely in the developer portal, but can only be
granted access to an abax environment manually by Abax support. This method can
then be used to fetch an access token without the active involvement of an end
user.

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

## Contributing

We love contributions! Please read our [Contributing Guide](CONTRIBUTING.md) to
learn how to contribute to this project.
