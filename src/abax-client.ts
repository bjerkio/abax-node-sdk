import { format } from 'date-fns';
import { TypicalHttpError, buildCall } from 'typical-fetch';
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
import { performRequest } from './common/perform-request.js';
import { makeQuery, withZod } from './common/utils.js';

export interface AbaxClientConfig {
  /**
   * Abax API key
   */
  apiKey: string;

  /**
   * @default 'production'
   */
  baseUrl?: string | 'sandbox' | 'production';

  /**
   * @default 'abax-node-sdk/1.0'
   */
  userAgent?: string;
}

const apiUrls = {
  sandbox: 'https://api-test.abax.cloud/v1',
  production: 'https://api.abax.cloud/v1',
};

export class AbaxClient {
  constructor(private readonly config: AbaxClientConfig) {}

  /** Gets paged list of Vehicles. Required scopes: `abax_profile`, `open_api`, `open_api.vehicles`.  */
  listVehicles(
    input: ListVehiclesInput = { query: undefined },
  ): Promise<ListVehiclesResponse> {
    const call = this.buildCall()
      .args<ListVehiclesInput>()
      .method('get')
      .path('v1/vehicles')
      .query(input => makeQuery(input))
      .parseJson(withZod(listVehiclesResponseSchema))
      .build();

    return performRequest(() => call(input));
  }

  /** Gets paged list of Trips. Required scopes: `abax_profile`, `open_api`, `open_api.trips`.  */
  listTrips(input: ListTripsInput): Promise<ListTripsResponse> {
    const call = this.buildCall()
      .args<ListTripsInput>()
      .method('get')
      .path('v1/trips')
      .query(({ query }) =>
        makeQuery({
          query: {
            page: query.page,
            page_size: query.page_size,
            date_from: format(query.date_from, 'yyyy-MM-dd'),
            date_to: format(query.date_to, 'yyyy-MM-dd'),
            vehicle_id: query.vehicle_id,
          },
        }),
      )
      .parseJson(withZod(listTripsResponseSchema))
      .build();

    return performRequest(() => call(input));
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
      .args<GetOdometerValuesOfTripsInput>()
      .method('get')
      .path('v1/trips/odometerReadings')
      .query(({ query: { trip_ids } }) => {
        const params = new URLSearchParams();
        trip_ids.forEach(trip => params.append('trip_ids', trip));
        return params;
      })
      .parseJson(withZod(getOdometerValuesOfTripsResponseSchema))
      .build();

    return performRequest(() => call(input));
  }
  /** Gets equipment by ID. Required scopes: `abax_profile`, `open_api`, `open_api.equipment` */
  getEquipment(input: GetEquipmentInput): Promise<GetEquipmentResponse> {
    const call = this.buildCall()
      .args<{ input: GetEquipmentInput }>()
      .method('get')
      .path(({ input: { id } }) => `/v2/equipment/${id}`)
      .parseJson(withZod(equipmentSchema))
      .build();

    return performRequest(() => call({ input }));
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

    return performRequest(() => call({ input }));
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

        // 2020-04-17T08:46:17+00:00
        // 2022-11-30T13:46:36+02:00
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

    return performRequest(() => call({ input }));
  }

  private list150TripExpenses(
    input: ListTripExpensesInput,
  ): Promise<listTripExpensesResponse> {
    const call = this.buildCall()
      .args<ListTripExpensesInput>()
      .method('get')
      .path('v1/trips/expense')
      .query(({ query }) => {
        const params = new URLSearchParams();

        query.trip_ids.forEach(id => params.append('trip_ids', id));

        return params;
      })
      .parseJson(withZod(listTripExpensesSchema))
      .build();

    return performRequest(() => call(input));
  }

  private makeApiUrl() {
    if (this.config.baseUrl === 'production' || !this.config.baseUrl) {
      return apiUrls.production;
    }

    if (this.config.baseUrl === 'sandbox') {
      return apiUrls.sandbox;
    }

    return this.config.baseUrl;
  }

  private buildCall() {
    const url = new URL(this.makeApiUrl());

    return buildCall()
      .baseUrl(url)
      .headers({
        'user-agent': this.config.userAgent ?? 'abax-node-sdk/1.0',
        Authorization: `Bearer ${this.config.apiKey}`,
      })
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
