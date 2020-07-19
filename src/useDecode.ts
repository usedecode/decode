import { useRef } from "react";
import { useFetcher } from "./useFetcher";
import useSWR, { responseInterface, ConfigInterface } from "swr";
import { transformFn, DecodeParams } from "types";

type KeyFunction = () => string | [string, DecodeParams] | null;
type SWRKey = string | KeyFunction | null;
type FirstArg = SWRKey | [string, DecodeParams] | KeyFunction;

function useDecode<Data = any, Error = any>(
  firstArg: FirstArg
): responseInterface<Data, Error>;
function useDecode<Data = any, Error = any>(
  firstArg: FirstArg,
  config?: ConfigInterface<Data, Error>
): responseInterface<Data, Error>;
function useDecode<Data = any, Error = any>(
  firstArg: FirstArg,
  fn?: transformFn<Data>,
  config?: ConfigInterface<Data, Error>
): responseInterface<Data, Error>;
function useDecode<Data = any, Error = any>(
  ...args: any[]
): responseInterface<Data, Error> {
  let fn: transformFn<Data> | undefined | null,
    config: undefined | ConfigInterface<Data, Error> = {};

  let [key, params] = parseFirstArg(args[0]);

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
  let fetcher = fn ? useFetcher<Data>(fn) : useFetcher();

  let useSWRFirstArg = params ? [key, JSON.stringify(params)] : key;

  return useSWR<Data, Error>(useSWRFirstArg, fetcher, config);
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

let parseFirstArg = (arg: FirstArg): [SWRKey, DecodeParams | null] => {
  let key: SWRKey, params: DecodeParams | null;
  if (typeof arg === "function") {
    try {
      arg = arg();
    } catch (err) {
      // dependencies not ready
      key = "";
      return [key, null];
    }

    return parseFirstArg(arg);
  }

  if (Array.isArray(arg)) {
    key = arg[0];
    params = arg[1];
  } else {
    key = arg;
    params = null;
  }
  return [key, params];
};

export { useDecode };
