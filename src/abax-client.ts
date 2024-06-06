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
  type GetUsageSummaryInput,
  type GetUsageSummaryResponse,
  usageSummarySchema,
} from './calls/get-usage-summary.js';
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
  type Trip,
  listTripsResponseSchema,
} from './calls/list-trips.js';
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

  async listTrips(input: ListTripsInput): Promise<ListTripsResponse> {
    if (input.query.page_size === 0) {
      const trips = await this.listNextPagesOfTrips(input, 1);

      return { page: 1, page_size: 0, items: trips };
    }

    return this.listTripsPage(input);
  }

  listUsageSummary(
    input: GetUsageSummaryInput,
  ): Promise<GetUsageSummaryResponse> {
    // URL: /v1/vehicles/{vehicle-id}/usage-summary?from=<datetime>&to=<datetime>
    const call = this.authenticatedCall()
      .args<{ input: GetUsageSummaryInput }>()
      .method('get')
      .path(
        ({ input: { vehicle_id } }) =>
          `/v1/vehicles/${vehicle_id}/usage-summary`,
      )
      .query(({ input }) => {
        const queryParams = new URLSearchParams();
        queryParams.append('from', format(input.date_from, 'yyyy-MM-dd'));
        queryParams.append('to', format(input.date_to, 'yyyy-MM-dd'));
        return queryParams;
      })
      .parseJson(withZod(usageSummarySchema))
      .build();

    return this.performRequest(apiKey => call({ input, apiKey }));
  }

  async listTripExpenses(
    input: ListTripExpensesInput,
  ): Promise<listTripExpensesResponse> {
    const tripIdBatches = input.query.trip_ids.reduce<string[][]>(
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
        query: { trip_ids: batch },
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
    const tripIdBatches = input.query.trip_ids.reduce<string[][]>(
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
        query: { trip_ids: batch },
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
      .query(({ input: { page, page_size, unit_types } }) => {
        const queryParams = new URLSearchParams();

        if (page) {
          queryParams.append('page', String(page));
        }
        if (page_size) {
          queryParams.append('page_size', String(page_size));
        }

        if (unit_types) {
          queryParams.append('unit_types', String(unit_types));
        }

        return queryParams;
      })
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
      .query(({ input: { page, page_size, date_from, date_to } }) => {
        const queryParams = new URLSearchParams();

        queryParams.append(
          'date_from',
          format(date_from, "yyyy-MM-dd'T'HH:mm:ssxxx"),
        );

        queryParams.append(
          'date_to',
          format(date_to, "yyyy-MM-dd'T'HH:mm:ssxxx"),
        );

        if (page) {
          queryParams.append('page', String(page));
        }
        if (page_size) {
          queryParams.append('page_size', String(page_size));
        }

        return queryParams;
      })
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
    if (input.query.trip_ids.length === 0) {
      return Promise.resolve({ items: [] });
    }

    if (input.query.trip_ids.length > 150) {
      return this.listTripExpenses(input);
    }

    const call = this.authenticatedCall()
      .args<{ input: ListTripExpensesInput }>()
      .method('get')
      .path('v1/trips/expense')
      .query(({ input }) => {
        const params = new URLSearchParams();
        input.query.trip_ids.forEach(id => params.append('trip_ids', id));
        return params;
      })
      .parseJson(withZod(listTripExpensesSchema))
      .build();

    return this.performRequest(apiKey => call({ input, apiKey }));
  }

  /** Recursively list all pages starting from the provided page number. Uses page size 1500 (maximum). */
  private async listNextPagesOfTrips(
    input: { query: Omit<ListTripsInput['query'], 'page' | 'page_size'> },
    page: number,
  ): Promise<Trip[]> {
    const response = await this.listTripsPage({
      query: { ...input.query, page_size: 1500, page },
    });

    if (response.items.length >= 1500) {
      // There might be more trips, we need to fetch the next page
      const nextPage = await this.listNextPagesOfTrips(input, page + 1);
      return [...response.items, ...nextPage];
    } else {
      // There are less than 1500 trips, so this is the last page
      return response.items;
    }
  }

  /** Gets paged list of Trips. Required scopes: `abax_profile`, `open_api`, `open_api.trips`.  */
  private listTripsPage(input: ListTripsInput): Promise<ListTripsResponse> {
    const call = this.authenticatedCall()
      .args<{ input: ListTripsInput }>()
      .method('get')
      .path('v1/trips')
      .query(({ input }) =>
        makeQuery({
          query: {
            page: input.query.page,
            page_size: input.query.page_size,
            date_from: format(input.query.date_from, 'yyyy-MM-dd'),
            date_to: format(input.query.date_to, 'yyyy-MM-dd'),
            vehicle_id: input.query.vehicle_id,
          },
        }),
      )
      .parseJson(withZod(listTripsResponseSchema))
      .build();

    return this.performRequest(apiKey => call({ input, apiKey }));
  }

  private async getOdometerValuesOf150Trips(
    input: GetOdometerValuesOfTripsInput,
  ): Promise<GetOdometerValuesOfTripsResponse> {
    if (input.query.trip_ids.length === 0) {
      return Promise.resolve({ items: [] });
    }
    if (input.query.trip_ids.length > 150) {
      return this.getOdometerValuesOfTrips(input);
    }

    const call = this.authenticatedCall()
      .args<{ input: GetOdometerValuesOfTripsInput }>()
      .method('get')
      .path('v1/trips/odometerReadings')
      .query(
        ({
          input: {
            query: { trip_ids },
          },
        }) => {
          const params = new URLSearchParams();
          trip_ids.forEach(trip => params.append('trip_ids', trip));
          return params;
        },
      )
      .parseJson(withZod(getOdometerValuesOfTripsResponseSchema))
      .build();

    return this.performRequest(apiKey => call({ input, apiKey }));
  }

  private makeApiUrl() {
    if (this.config.baseUrl) {
      return this.config.baseUrl;
    }

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
      if (error instanceof TypicalHttpError && error.status === 401) {
        if(error.message) {
          throw new Error(`Request was unauthorized: ${error.message}`);
        }
        throw new Error('Request was unauthorized');
      }
      if (error instanceof TypicalHttpError && error.status === 400) {
        if(error.message) {
          throw new Error(`Request was rejected: ${error.message}`);
        }
        throw new Error('Request was rejected');
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
