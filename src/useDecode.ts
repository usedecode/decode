import { useFetcher } from "./useFetcher";
import useSWR, { responseInterface, ConfigInterface } from "swr";

export type TransformFn<D, R> = (data: D) => R | Promise<R>;
export type DecodeParams = object | string;

type KeyFunction = () => string | [string, DecodeParams] | null;
type SWRKey = string | KeyFunction | null;
export type FetchKey = SWRKey | [string, DecodeParams] | KeyFunction;

function useDecode<D = any>(firstArg: FetchKey): responseInterface<D, any>;
function useDecode<D = any>(
  firstArg: FetchKey,
  config?: ConfigInterface<D>
): responseInterface<D, any>;
function useDecode<D = any, R = any>(
  firstArg: FetchKey,
  fn?: TransformFn<D, R>,
  config?: ConfigInterface<D>
): responseInterface<R, any>;
function useDecode<D = any, R = any>(...args: any[]) {
  let fn: TransformFn<D, R> | undefined | null,
    config: undefined | ConfigInterface<D> = {};

  let [key, params] = parseFirstArg(args[0]);

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
  let fetcher = fn ? useFetcher<D, R>(fn) : useFetcher();

  let useSWRFirstArg = params ? [key, JSON.stringify(params)] : key;

  return useSWR<D>(useSWRFirstArg, fetcher, config);
}

let parseFirstArg = (arg: FetchKey): [SWRKey, DecodeParams | null] => {
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

export default useDecode;
