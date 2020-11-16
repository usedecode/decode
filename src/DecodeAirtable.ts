/**
 * Usage:
 *
 * DecodeAirtable.configure({
 *   endpointUrl: "https://api.decodeauth.com",
 * });
 *
 * const base = DecodeAirtable.base("app__base_id__");
 *
 * base("Jobs")
 *   .select({
 *     maxRecords: 3,
 *     view: "Grid view",
 *   })
 *   .eachPage(function page(records, fetchNextPage) {
 *     records.forEach(function (record) {
 *       console.log("Retrieved", record.get("Phone Number"));
 *     });
 *   })
 *   .catch((error) => console.error(error));
 *
 * Needs to be used within <DecodeProvider>.
 */
import Base from "airtable/lib/base";
import Record from "airtable/lib/record";
import Table from "airtable/lib/table";
import AirtableError from "airtable/lib/airtable_error";
import { authProviderHelper } from "authProviderHelper";

export type AirtableBase = {
  (tableName: string): Table;
  getId: Base["getId"];
  makeRequest: Base["makeRequest"];
  table: Base["table"];
};

export type ObjectMap<K extends PropertyKey, V> = { [P in K]: V };

type CustomHeaders = ObjectMap<string, string | number | boolean>;

export default class DecodeAirtable {
  // All the read-only properties below are set inside constructor via `Object.defineProperties()`, but
  // the compiler doesn't seem to respect that and shows errors. We'll use @ts-ignore to suppress errors.
  // @ts-ignore
  readonly _apiKey: string;
  // @ts-ignore
  readonly _apiVersion: string;
  // @ts-ignore
  readonly _apiVersionMajor: string;
  // @ts-ignore
  readonly _customHeaders: CustomHeaders;
  // @ts-ignore
  readonly _endpointUrl: string;
  // @ts-ignore
  readonly _noRetryIfRateLimited: boolean;

  requestTimeout: number;

  static Base = Base;
  static Record = Record;
  static Table = Table;
  static Error = AirtableError;

  static apiKey: string;
  static apiVersion: string;
  static endpointUrl: string;
  static noRetryIfRateLimited: boolean;

  constructor(
    opts: {
      apiKey?: string;
      apiVersion?: string;
      customHeaders?: CustomHeaders;
      endpointUrl?: string;
      noRetryIfRateLimited?: boolean;
      requestTimeout?: number;
    } = {}
  ) {
    const defaultConfig = DecodeAirtable.default_config();

    const apiVersion = opts.apiVersion || DecodeAirtable.apiVersion || defaultConfig.apiVersion;

    Object.defineProperties(this, {
      _apiKey: {
        // always get the key via the authProviderHelper
        get: () => authProviderHelper.__internal_getToken(),
      },
      _apiVersion: {
        value: apiVersion,
      },
      _apiVersionMajor: {
        value: apiVersion.split(".")[0],
      },
      _customHeaders: {
        value: opts.customHeaders || {},
      },
      _endpointUrl: {
        value:
          opts.endpointUrl ||
          DecodeAirtable.endpointUrl ||
          defaultConfig.endpointUrl,
      },
      _noRetryIfRateLimited: {
        value:
          opts.noRetryIfRateLimited ||
          DecodeAirtable.noRetryIfRateLimited ||
          defaultConfig.noRetryIfRateLimited,
      },
    });

    this.requestTimeout = opts.requestTimeout || defaultConfig.requestTimeout;
  }

  base(baseId: string): AirtableBase {
    // @ts-ignore
    return Base.createFunctor(this, baseId);
  }

  static default_config(): {
    endpointUrl: string;
    apiKey: string;
    apiVersion: string;
    noRetryIfRateLimited: boolean;
    requestTimeout: number;
  } {
    return {
      endpointUrl:
        process.env.AIRTABLE_ENDPOINT_URL || "https://api.airtable.com",
      apiVersion: "0.1.0",
      // keep it empty until we init the provider
      apiKey: "",
      noRetryIfRateLimited: false,
      requestTimeout: 300 * 1000, // 5 minutes
    };
  }

  static configure({
    apiKey,
    endpointUrl,
    apiVersion,
    noRetryIfRateLimited,
  }: {
    apiKey: string;
    endpointUrl: string;
    apiVersion: string;
    noRetryIfRateLimited: boolean;
  }): void {
    DecodeAirtable.apiKey = apiKey;
    DecodeAirtable.endpointUrl = endpointUrl;
    DecodeAirtable.apiVersion = apiVersion;
    DecodeAirtable.noRetryIfRateLimited = noRetryIfRateLimited;
  }

  static base(baseId: string): AirtableBase {
    return new DecodeAirtable().base(baseId);
  }
}
