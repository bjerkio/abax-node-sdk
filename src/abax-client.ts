import { format } from 'date-fns';
import { backOff } from 'exponential-backoff';
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
  listCapabilitiesResponseSchema,
  type ListCapabilitiesResponse,
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
  type ListVehiclesInput,
  type ListVehiclesResponse,
  listVehiclesResponseSchema,
} from './calls/list-vehicles.js';
import { makeQuery, withZod } from './common/utils.js';

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
    const call = this.buildCall()
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
    const call = this.buildCall()
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

    const expenses = await Promise.all(
      tripIdBatches.map(batch =>
        this.list150TripExpenses({ query: { trip_ids: batch } }),
      ),
    );

    return { items: expenses.flatMap(expense => expense.items) };
  }

  async getOdometerValuesOfTrips(
    input: GetOdometerValuesOfTripsInput,
  ): Promise<GetOdometerValuesOfTripsResponse> {
    // TODO: batch trips in batches of 150 (max allowed per query), similar to listTripExpenses
    if (input.query.trip_ids.length > 150) {
      throw new Error(
        'Cannot get odometer values of more than 150 trips at once',
      );
    }
    const call = this.buildCall()
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
  /** Gets equipment by ID. Required scopes: `abax_profile`, `open_api`, `open_api.equipment` */
  getEquipment(input: GetEquipmentInput): Promise<GetEquipmentResponse> {
    const call = this.buildCall()
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
    const call = this.buildCall()
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
    const call = this.buildCall()
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
    const call = this.buildCall()
      .method('get')
      .path('/v1/api-capabilities')
      .parseJson(withZod(listCapabilitiesResponseSchema))
      .build();

    return this.performRequest(apiKey => call({ apiKey }));
  }

  private list150TripExpenses(
    input: ListTripExpensesInput,
  ): Promise<listTripExpensesResponse> {
    const call = this.buildCall()
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
    const requestCall = async (apiKey: string) => {
      const res = await call(apiKey);

      if (res.success) {
        return res.body;
      }

      throw res.error;
    };

    const apiKey = await this.makeApiKey();

    return backOff(() => requestCall(apiKey), {
      retry: error => {
        if (error instanceof TypicalHttpError && error.status === 429) {
          return true;
        }
        return false;
      },
    });
  }

  private buildCall() {
    const url = new URL(this.makeApiUrl());

    return buildCall()
      .baseUrl(url)
      .args<{ apiKey: string }>()
      .headers(({ apiKey }) => ({
        'user-agent': this.config.userAgent ?? 'abax-node-sdk/1.0',
        Authorization: `Bearer ${apiKey}`,
      }))
      .mapError(async error => {
        if (error instanceof TypicalHttpError) {
          if (error.res.status === 401) {
            // TODO: throw 401
            throw error;
          }
          throw error;
        }
        throw error;
      });
  }
}
