import { useFetcher, transformFn } from "./useFetcher";
import useSWR, { keyInterface, responseInterface, ConfigInterface } from "swr";

function useDecode<Data = any, Error = any>(
  key: keyInterface
): responseInterface<Data, Error>;
function useDecode<Data = any, Error = any>(
  key: keyInterface,
  config?: ConfigInterface<Data, Error>
): responseInterface<Data, Error>;
function useDecode<Data = any, Error = any>(
  key: keyInterface,
  fn?: transformFn<Data>,
  config?: ConfigInterface<Data, Error>
): responseInterface<Data, Error>;
function useDecode<Data = any, Error = any>(
  ...args: any[]
): responseInterface<Data, Error> {
  let _key: keyInterface,
    fn: transformFn<Data> | undefined,
    config: ConfigInterface<Data, Error> = {};

  _key = args[0];
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
  return useSWR(_key, fetcher);
}
export { useDecode };
