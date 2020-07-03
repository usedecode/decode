import Errors from "./errors";
import { useToken } from "DecodeProvider";
import { DecodeParams, transformFn } from "types";

export function useFetcher<Data>(postProcessor?: transformFn<Data>) {
  let token = useToken();
  return async (slug: string, params?: DecodeParams) => {
    let { result } = await fetcher(slug, token, params);
    if (postProcessor) {
      return postProcessor(result);
    }
    return result;
  };
}

export let getFetcher = (token: string) => (
  slug: string,
  params?: DecodeParams
) => {
  return fetcher(slug, token, params);
};

interface DecodeMutationParams extends DecodeParams {
  slug: string;
}

export function mutationDecode(params: DecodeMutationParams) {
  let { slug, ...rest } = params;
  if (!slug) {
    throw new Error(
      "Object passed to `mutationDecode` must include a `slug` property"
    );
  }
  let token = useToken();
  return fetcher(slug, token, rest);
}

let fetcher = async (slug: string, token: string, params?: DecodeParams) => {
  let res = await fetch(`https://api.usedecode.com/e/${slug}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(params ?? {}),
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
