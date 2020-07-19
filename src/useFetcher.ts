import Errors from "./errors";
import { useToken } from "DecodeProvider";
import { DecodeParams, transformFn } from "types";

// Would like this to use something like this, but alas:
// https://github.com/microsoft/TypeScript/issues/17867
// interface DecodeParamsWithBody {
//   body: any;
//   [key: string]: string | number | string[] | number[];
// }

export function useFetcher<Data>(postProcessor?: transformFn<Data>) {
  let token = useToken();
  return async (slug: string, params?: object) => {
    let result = await fetcher(slug, token, params);
    if (postProcessor) {
      return postProcessor(result);
    }
    return result;
  };
}

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
