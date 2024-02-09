import { format, isAfter } from 'date-fns';
import { invariant } from 'ts-invariant';
import { type CallReturn, TypicalHttpError, buildCall } from 'typical-fetch';
import {
  type GetEquipmentInput,
  type GetEquipmentResponse,
  equipmentSchema,
} from './calls/get-equipment.js';
import {
  type GetOdometerValuesOfTripsInput,
  type GetOdometerValuesOfTripsResponse,
  getOdometerValuesOfTripsResponseSchema,
} from './calls/get-odometer-values.js';
import {
  type ListCapabilitiesResponse,
  listCapabilitiesResponseSchema,
} from './calls/list-capabilities.js';
import {
  type ListEquipmentLogsInput,
  type ListEquipmentLogsResponse,
  listEquipmentLogsResponseSchema,
} from './calls/list-equipment-logs.js';
import {
  type ListEquipmentInput,
  type ListEquipmentResponse,
  listEquipmentResponse,
} from './calls/list-equipment.js';
import {
  type ListTripExpensesInput,
  type listTripExpensesResponse,
  listTripExpensesSchema,
} from './calls/list-trip-expenses.js';
import {
  type ListTripsInput,
  type ListTripsResponse,
  listTripsResponseSchema,
} from './calls/list-trips.js';
import {
  type ListUsageSummaryInput,
  type ListUsageSummaryResponse,
  listUsageSummaryResponseSchema,
} from './calls/list-usage-summary.js';
import {
  type ListVehiclesInput,
  type ListVehiclesResponse,
  listVehiclesResponseSchema,
} from './calls/list-vehicles.js';
import { makeQuery, startOfTheNextMinute, withZod } from './common/utils.js';

export type ApiKeyFunc = () => string | Promise<string>;

export interface AbaxClientConfig {
  /**
   * Abax API key
   */
  apiKey: string | ApiKeyFunc;

  /**
   * @default 'production'
   */
  environment?: 'sandbox' | 'production';

  /**
   * When set, overrides the environment setting
   */
  baseUrl?: string;

  /**
   * @default 'abax-node-sdk/1.0'
   */
  userAgent?: string;
}

const apiUrls = {
  sandbox: 'https://api-test.abax.cloud',
  production: 'https://api.abax.cloud',
};

export class AbaxClient {
  constructor(private readonly config: AbaxClientConfig) {}

  /** Gets paged list of Vehicles. Required scopes: `abax_profile`, `open_api`, `open_api.vehicles`.  */
  listVehicles(
    input: ListVehiclesInput = { query: undefined },
  ): Promise<ListVehiclesResponse> {
    const call = this.authenticatedCall()
      .args<{ input: ListVehiclesInput }>()
      .method('get')
      .path('v1/vehicles')
      .query(({ input }) => makeQuery(input))
      .parseJson(withZod(listVehiclesResponseSchema))
      .build();

    return this.performRequest(apiKey => call({ input, apiKey }));
  }

  /** Gets paged list of Trips. Required scopes: `abax_profile`, `open_api`, `open_api.trips`.  */
  listTrips(input: ListTripsInput): Promise<ListTripsResponse> {
    const call = this.authenticatedCall()
      .args<{ input: ListTripsInput }>()
      .method('get')
      .path('v1/trips')
      .query(({ input }) =>
        makeQuery({
          query: {
            page: input.query.page,
            pageSize: input.query.pageSize,
            dateFrom: format(input.query.dateFrom, 'yyyy-MM-dd'),
            dateTo: format(input.query.dateTo, 'yyyy-MM-dd'),
            vehicleId: input.query.vehicleId,
          },
        }),
      )
      .parseJson(withZod(listTripsResponseSchema))
      .build();

    return this.performRequest(apiKey => call({ input, apiKey }));
  }

  listUsageSummary(
    input: ListUsageSummaryInput,
  ): Promise<ListUsageSummaryResponse> {
    // URL: /v1/vehicles/{vehicle-id}/usage-summary?from=<datetime>&to=<datetime>
    const call = this.authenticatedCall()
      .args<{ input: ListUsageSummaryInput }>()
      .method('get')
      .path(
        ({ input: { vehicleId } }) =>
          `/v1/vehicles/${vehicleId}/usage-summary`,
      )
      .query(({ input }) => {
        const queryParams = new URLSearchParams();
        queryParams.append('from', format(input.dateFrom, 'yyyy-MM-dd'));
        queryParams.append('to', format(input.dateTo, 'yyyy-MM-dd'));
        return queryParams;
      })
      .parseJson(withZod(listUsageSummaryResponseSchema))
      .build();

    return this.performRequest(apiKey => call({ input, apiKey }));
  }

  async listTripExpenses(
    input: ListTripExpensesInput,
  ): Promise<listTripExpensesResponse> {
    const tripIdBatches = input.query.tripIds.reduce<string[][]>(
      (batches, tripId) => {
        const currentBatchIndex = batches.length - 1;

        if (batches[currentBatchIndex]?.length === 150) {
          batches.push([tripId]);
        } else if (batches[currentBatchIndex]) {
          batches[currentBatchIndex]?.push(tripId);
        } else {
          batches[currentBatchIndex] = [tripId];
        }

        return batches;
      },
      [[]],
    );

    const expenses: listTripExpensesResponse['items'][] = [];

    for (const batch of tripIdBatches) {
      const response = await this.list150TripExpenses({
        query: { tripIds: batch },
      });

      expenses.push(response.items);
    }

    const items = expenses.flat(1);

    return { items };
  }

  /** Gets odometer values of trips. Required scopes: `abax_profile`, `open_api`, `open_api.trips`.*/
  async getOdometerValuesOfTrips(
    input: GetOdometerValuesOfTripsInput,
  ): Promise<GetOdometerValuesOfTripsResponse> {
    const tripIdBatches = input.query.tripIds.reduce<string[][]>(
      (batches, tripId) => {
        const currentBatchIndex = batches.length - 1;

        if (batches[currentBatchIndex]?.length === 150) {
          batches.push([tripId]);
        } else if (batches[currentBatchIndex]) {
          batches[currentBatchIndex]?.push(tripId);
        } else {
          batches[currentBatchIndex] = [tripId];
        }

        return batches;
      },
      [[]],
    );

    const odometerValues: GetOdometerValuesOfTripsResponse['items'][] = [];

    for (const batch of tripIdBatches) {
      const response = await this.getOdometerValuesOf150Trips({
        query: { tripIds: batch },
      });

      odometerValues.push(response.items);
    }

    const items = odometerValues.flat(1);

    return { items };
  }

  /** Gets equipment by ID. Required scopes: `abax_profile`, `open_api`, `open_api.equipment` */
  getEquipment(input: GetEquipmentInput): Promise<GetEquipmentResponse> {
    const call = this.authenticatedCall()
      .args<{ input: GetEquipmentInput }>()
      .method('get')
      .path(({ input: { id } }) => `/v2/equipment/${id}`)
      .parseJson(withZod(equipmentSchema))
      .build();

    return this.performRequest(apiKey => call({ input, apiKey }));
  }

  /** Gets paged list of equipment. Required scopes: `abax_profile`, `open_api`, `open_api.equipment`.  */
  listEquipment(
    input: ListEquipmentInput = {},
  ): Promise<ListEquipmentResponse> {
    const call = this.authenticatedCall()
      .args<{ input: ListEquipmentInput }>()
      .method('get')
      .path('/v2/equipment/')
      .query(
        ({ input: { page, pageSize: pageSize, unitTypes: unitTypes } }) => {
          const queryParams = new URLSearchParams();

          if (page) {
            queryParams.append('page', String(page));
          }
          if (pageSize) {
            queryParams.append('page_size', String(pageSize));
          }

          if (unitTypes) {
            queryParams.append('unit_types', String(unitTypes));
          }

          return queryParams;
        },
      )
      .parseJson(withZod(listEquipmentResponse))
      .build();

    return this.performRequest(apiKey => call({ input, apiKey }));
  }

  /** Get paged list of usage logs. Required scopes: `abax_profile`, `open_api`, `open_api.equipment` */
  async listEquipmentLogs(
    input: ListEquipmentLogsInput,
  ): Promise<ListEquipmentLogsResponse> {
    const call = this.authenticatedCall()
      .args<{ input: ListEquipmentLogsInput }>()
      .method('get')
      .path('/v2/equipment/usage-log')
      .query(
        ({
          input: {
            page,
            pageSize,
            dateFrom,
            dateTo,
          },
        }) => {
          const queryParams = new URLSearchParams();

          queryParams.append(
            'date_from',
            format(dateFrom, "yyyy-MM-dd'T'HH:mm:ssxxx"),
          );

          queryParams.append(
            'date_to',
            format(dateTo, "yyyy-MM-dd'T'HH:mm:ssxxx"),
          );

          if (page) {
            queryParams.append('page', String(page));
          }
          if (pageSize) {
            queryParams.append('page_size', String(pageSize));
          }

          return queryParams;
        },
      )
      .parseJson(withZod(listEquipmentLogsResponseSchema))
      .build();

    return this.performRequest(apiKey => call({ input, apiKey }));
  }

  listCapabilities(): Promise<ListCapabilitiesResponse> {
    const call = this.authenticatedCall()
      .method('get')
      .path('/v1/api-capabilities')
      .parseJson(withZod(listCapabilitiesResponseSchema))
      .build();

    return this.performRequest(apiKey => call({ apiKey }));
  }

  private list150TripExpenses(
    input: ListTripExpensesInput,
  ): Promise<listTripExpensesResponse> {
    if (input.query.tripIds.length === 0) {
      return Promise.resolve({ items: [] });
    }

    if (input.query.tripIds.length > 150) {
      return this.listTripExpenses(input);
    }

    const call = this.authenticatedCall()
      .args<{ input: ListTripExpensesInput }>()
      .method('get')
      .path('v1/trips/expense')
      .query(({ input }) => {
        const params = new URLSearchParams();
        input.query.tripIds.forEach(id => params.append('trip_ids', id));
        return params;
      })
      .parseJson(withZod(listTripExpensesSchema))
      .build();

    return this.performRequest(apiKey => call({ input, apiKey }));
  }

  private async getOdometerValuesOf150Trips(
    input: GetOdometerValuesOfTripsInput,
  ): Promise<GetOdometerValuesOfTripsResponse> {
    if (input.query.tripIds.length === 0) {
      return Promise.resolve({ items: [] });
    }
    if (input.query.tripIds.length > 150) {
      return this.getOdometerValuesOfTrips(input);
    }

    const call = this.authenticatedCall()
      .args<{ input: GetOdometerValuesOfTripsInput }>()
      .method('get')
      .path('v1/trips/odometerReadings')
      .query(
        ({
          input: {
            query: { tripIds: tripIds },
          },
        }) => {
          const params = new URLSearchParams();
          tripIds.forEach(trip => params.append('trip_ids', trip));
          return params;
        },
      )
      .parseJson(withZod(getOdometerValuesOfTripsResponseSchema))
      .build();

    return this.performRequest(apiKey => call({ input, apiKey }));
  }

  private makeApiUrl() {
    if (this.config.environment === 'production' || !this.config.environment) {
      return apiUrls.production;
    }

    if (this.config.environment === 'sandbox') {
      return apiUrls.sandbox;
    }

    invariant(this.config.baseUrl, 'baseUrl must be set when using custom env');

    return this.config.baseUrl;
  }

  private async makeApiKey() {
    if (typeof this.config.apiKey === 'function') {
      return this.config.apiKey();
    }

    return this.config.apiKey;
  }

  private async performRequest<R, E>(
    call: (apiKey: string) => Promise<CallReturn<R, E>>,
  ): Promise<R> {
    const apiKey = await this.makeApiKey();

    for (let n = 0; n <= 3; n++) {
      const res = await call(apiKey);

      if (res.success) {
        return res.body;
      }

      const { error } = res;

      if (error instanceof TypicalHttpError && error.status === 429) {
        if (n >= 3) {
          throw new Error('Request timed out');
        }

        const resetHeader =
          error.res.headers?.get('X-Rate-Limit-Reset') ??
          startOfTheNextMinute();
        const resetTime = new Date(resetHeader);

        const now = new Date();

        if (isAfter(resetTime, now)) {
          await new Promise(resolve =>
            setTimeout(resolve, resetTime.getTime() - now.getTime()),
          );
        }
      }
    }

    throw new Error('Not able to perform request');
  }

  private authenticatedCall() {
    const url = new URL(this.makeApiUrl());

    return buildCall()
      .baseUrl(url)
      .args<{ apiKey: string }>()
      .headers(({ apiKey }) => ({
        'user-agent': this.config.userAgent ?? 'abax-node-sdk/1.0',
        Authorization: `Bearer ${apiKey}`,
      }));
  }
}
