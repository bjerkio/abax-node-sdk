# abax-node-sdk

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
