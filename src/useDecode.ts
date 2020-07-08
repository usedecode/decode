import { useMemo, useRef, useCallback } from "react";
import { useFetcher } from "./useFetcher";
import useSWR, { responseInterface, ConfigInterface } from "swr";
import debounce from "lodash.debounce";
import { transformFn, DecodeParams } from "types";
import Hashes from "jshashes";

type KeyFunction = () => string | [string, DecodeParams];
type SWRKey = string | KeyFunction;
type FirstArg =
  | SWRKey
  | [string, DecodeParams]
  | [string, DecodeParams, Options];

interface Options {
  debounce?: number;
}

function useDecode<Data = any, Error = any>(
  key: SWRKey
): responseInterface<Data, Error>;
function useDecode<Data = any, Error = any>(
  key: SWRKey,
  config?: ConfigInterface<Data, Error>
): responseInterface<Data, Error>;
function useDecode<Data = any, Error = any>(
  key: SWRKey,
  fn?: transformFn<Data>,
  config?: ConfigInterface<Data, Error>
): responseInterface<Data, Error>;
function useDecode<Data = any, Error = any>(
  ...args: any[]
): responseInterface<Data, Error> {
  let firstArg: FirstArg,
    fn: transformFn<Data> | undefined | null,
    config: undefined | ConfigInterface<Data, Error> = {},
    key: SWRKey,
    params: DecodeParams | null,
    opts: Options | null;

  firstArg = args[0];
  if (Array.isArray(firstArg)) {
    key = firstArg[0];
    params = firstArg[1];
    opts = firstArg[2] ?? null;
  } else {
    key = firstArg;
    params = null;
    opts = null;
  }

  let debounceFor = opts?.debounce ? opts.debounce : 0;
  let debouncedParams = useRef(
    debounce((p: DecodeParams) => JSON.stringify(p), debounceFor, {
      leading: false,
      trailing: true,
    })
  );

  if (exceedsThrottleLimit()) {
    debugger;
  }

  if (args.length > 2) {
    fn = args[1];
    config = args[2];
  } else {
    if (typeof args[1] === "function") {
      fn = args[1];
    } else if (typeof args[1] === "object") {
      config = args[1];
    }
  }
  let fetcher = fn ? useFetcher(fn) : useFetcher();

  let stringified = params && debouncedParams.current(params);
  let useSWRFirstArg = stringified ? [key, stringified] : key;

  return useSWR(useSWRFirstArg, fetcher, config);
}

let exceedsThrottleLimit = () => {
  let recentInvocationTimestamps = useRef<number[]>([]);
  recentInvocationTimestamps.current = recentInvocationTimestamps.current
    .filter((ts) => {
      return Date.now() - ts < 2000;
    })
    .concat(Date.now());
  if (recentInvocationTimestamps.current.length > 10) {
    return true;
    // throw new Error(
    //   `useDecode() was invoked way too many times in rapid succession. This is likely a bug with the library. Please let us know!`
    // );
  }
  return false;
};

let fingerprintParams = (params: { [k: string]: unknown }) => {
  let invalidParams = Object.keys(params).filter((k) => {
    let value: unknown = params[k];
    if (Array.isArray(value)) {
      // flat arrays ok
      return (value as unknown[]).find((v) => {
        return !isSimpleType(v);
      });
    } else {
      return !isSimpleType(value);
    }
  });

  if (invalidParams.length > 0) {
    throw new Error(
      `Passed invalid query params to useDecode: ${invalidParams.join(
        ", "
      )}. Param values cannot be objects or functions.`
    );
  }

  // Convert to array and sort so we can get deterministic format
  let entries = Object.entries(params).sort(([k1, _v1], [k2, _v2]) => {
    if (k1 < k2) {
      return -1;
    }
    if (k1 > k2) {
      return 1;
    }
    throw new Error(`How did your JS object have duplicate keys?`);
  });
  // Stringify the array
  let stringified = JSON.stringify(entries);
  // Fingerprint it
  return new Hashes.SHA256().b64(stringified);
};

let isSimpleType = (value: unknown) => {
  if (!value) return true;

  if (
    typeof value === "object" ||
    typeof value === "function" ||
    typeof value === "symbol" ||
    Array.isArray(value)
  ) {
    return false;
  }

  return true;
};

export { useDecode };
