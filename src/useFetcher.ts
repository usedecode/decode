import Errors from "./errors";
import { useToken, useOnError } from "DecodeProvider";
import { TransformFn } from "./useDecode";
import { useRef } from "react";

// Would like this to use something like this, but alas:
// https://github.com/microsoft/TypeScript/issues/17867
// interface DecodeParamsWithBody {
//   body: any;
//   [key: string]: string | number | string[] | number[];
// }

export function useFetcher<Data, TransformedData = any>(
  postProcessor?: TransformFn<Data, TransformedData>
) {
  let token = useToken();
  let onError = useOnError();
  // used to prevent runaway fetching in development
  let recentFetchesTimestamps = useRef<number[]>([]);
  return async (slug: string, params?: object) => {
    recentFetchesTimestamps.current = recentFetchesTimestamps.current
      .filter((ts) => {
        return Date.now() - ts < 2000;
      })
      .concat(Date.now());
    checkThrottle(recentFetchesTimestamps.current);

    try {
      let result = await fetcher(slug, token, params);
      if (postProcessor) {
        return postProcessor(result);
      }
      return result;
    } catch (e) {
      if (e instanceof Errors.NotAuthorized) {
        onError(401);
      } else {
        throw e;
      }
    }
  };
}

let checkThrottle = (ts: number[]) => {
  if (ts.length > 10) {
    throw new Error(
      `Fetches to Decode were invoked way too many times in rapid succession. This is likely a bug with the library. Please let us know!`
    );
  }
};

let fetcher = async (slug: string, token: string, params?: unknown) => {
  let body = typeof params === "string" ? params : JSON.stringify(params ?? {});
  let res = await fetch(`https://api.usedecode.com/e/${slug}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body,
  });
  let json = null;
  try {
    let text = await res.text();
    json = text ? JSON.parse(text, timestampReviver) : null;
  } catch (e) {}

  if (!res.ok) {
    if (res.status === 404) {
      throw new Errors.NotFound(
        `The Decode slug you tried to use, ${slug}, is not registered.`
      );
    }

    if (res.status === 401) {
      throw new Errors.NotAuthorized(`Received a 401 from Decode.`);
    }

    throw new Errors.UnexpectedError(
      `Decode received an unexpected error while fetching`,
      { response: res, json: json }
    );
  }

  return json;
};

let dateFormat = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.?\d*Z?$/;

let timestampReviver = (_key: any, val: unknown) => {
  if (typeof val === "string" && dateFormat.test(val)) {
    return new Date(val);
  }

  return val;
};
