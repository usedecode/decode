import Errors from "./errors";
import { useToken } from "DecodeProvider";
import { TransformFn } from "./useDecode";
import { useRef } from "react";

// Would like this to use something like this, but alas:
// https://github.com/microsoft/TypeScript/issues/17867
// interface DecodeParamsWithBody {
//   body: any;
//   [key: string]: string | number | string[] | number[];
// }

export function useFetcher<Data>(postProcessor?: TransformFn<Data>) {
  let token = useToken();
  // used to prevent runaway fetching in development
  let recentFetchesTimestamps = useRef<number[]>([]);
  return async (slug: string, params?: object) => {
    recentFetchesTimestamps.current = recentFetchesTimestamps.current
      .filter((ts) => {
        return Date.now() - ts < 2000;
      })
      .concat(Date.now());
    checkThrottle(recentFetchesTimestamps.current);

    let result = await fetcher(slug, token, params);
    if (postProcessor) {
      return postProcessor(result);
    }
    return result;
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
    json = await res.json();
  } catch (e) {}

  if (!res.ok) {
    if (res.status === 404) {
      throw new Errors.NotFound(
        `The Decode slug you tried to use, ${slug}, is not registered.`
      );
    }

    throw new Errors.UnexpectedError(
      `Decode received an unexpected error while fetching`,
      { response: res, json: json }
    );
  }

  if (!json) {
    throw new Errors.UnexpectedError(
      "Something went wrong :-( Decode returned a 200 but the body was unparsable",
      { response: res, json: json }
    );
  }

  return json;
};
