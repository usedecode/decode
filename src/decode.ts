import { useState, useEffect, useRef, useContext } from "react";
import { useToken } from "./DecodeProvider";
import Errors, { DecodeError } from "./errors";

type DecodeParams = { [k: string]: string | number | string[] | number[] };

type DecodeRes = {
  raw: ReadableStream<Uint8Array> | null;
  json: object | null;
};

type DecodeParallelRes = {
  raws: Array<ReadableStream<Uint8Array> | null>;
  jsons: Array<object | null>;
};

export const useDecodeParallel = (
  slugs: string[],
  allParams?: DecodeParams[]
) => {
  let token = useToken();
  let [results, setResults] = useState<DecodeParallelRes>({
    raws: [],
    jsons: [],
  });
  let [loading, setLoading] = useState(true);
  let [error, setError] = useState<undefined | DecodeError>();
  let lastFetchStartedAt = useRef<number | undefined>();

  if (allParams && allParams.length > 0) {
    allParams.forEach((params) => {
      let invalidField = Object.keys(params).find(
        (k) =>
          !["string", "number"].includes(typeof params[k]) &&
          !Array.isArray(params[k])
      );
      if (invalidField) {
        throw new Errors.InvalidParams(
          `Invalid field supplied for \`${invalidField}\`. Field value must be a string or number.`
        );
      }
    });
  }

  useEffect(() => {
    let doEffect = async () => {
      setLoading(true);
      let fetchStartedAt = Date.now();
      lastFetchStartedAt.current = fetchStartedAt;

      let allResults: DecodeParallelRes = { raws: [], jsons: [] };
      let fetchers = slugs.map((slug, idx) => {
        let params = allParams ? allParams[idx] : undefined;
        return new Promise<FetchDecodeRes>(async (resolve) => {
          let res = await fetchDecode(slug, token, params);
          resolve(res);
        });
      });
      try {
        let awaited: FetchDecodeRes[] = await Promise.all(fetchers);

        allResults = awaited.reduce((memo, fetcher) => {
          return {
            raws: memo.raws.concat(fetcher.raw),
            jsons: memo.jsons.concat(fetcher.json),
          };
        }, allResults);
      } catch (e) {
        if (fetchStartedAt === lastFetchStartedAt.current) {
          setLoading(false);
          setError(e);
        }
      }
      if (fetchStartedAt === lastFetchStartedAt.current) {
        setResults(allResults);
        setLoading(false);
      }
    };
    doEffect();

    return () => {
      // will effectively cancel all current fetches
      lastFetchStartedAt.current = Date.now() + 1;
    };
  }, [...slugs]);

  return { error, raws: results.raws, jsons: results.jsons, loading };
};

export const useDecode = (slug: string, params?: DecodeParams) => {
  let token = useToken();
  let [results, setResults] = useState<DecodeRes>({ raw: null, json: null });
  let [loading, setLoading] = useState(true);
  let [error, setError] = useState<undefined | DecodeError>();
  let lastFetchStartedAt = useRef<number | undefined>();

  if (params) {
    let invalidField = Object.keys(params).find(
      (k) =>
        !["string", "number"].includes(typeof params[k]) &&
        !Array.isArray(params[k])
    );
    if (invalidField) {
      throw new Errors.InvalidParams(
        `Invalid field supplied for \`${invalidField}\`. Field value must be a string or number.`
      );
    }
  }

  let fieldsFingerprint = "";
  if (params) {
    Object.keys(params).forEach((k) => {
      fieldsFingerprint += `${k}:${params[k]}`;
    });
  }

  useEffect(() => {
    let doEffect = async () => {
      setLoading(true);
      let fetchStartedAt = Date.now();
      lastFetchStartedAt.current = fetchStartedAt;

      let res: DecodeRes = { raw: null, json: null };
      try {
        res = await fetchDecode(slug, token, params);
      } catch (e) {
        if (fetchStartedAt === lastFetchStartedAt.current) {
          setLoading(false);
          setError(e);
        }
      }
      if (fetchStartedAt === lastFetchStartedAt.current) {
        setResults(res);
        setLoading(false);
      }
    };
    doEffect();

    return () => {
      // will effectively cancel all current fetches
      lastFetchStartedAt.current = Date.now() + 1;
    };
  }, [slug, fieldsFingerprint]);

  return { error, raw: results.raw, json: results.json, loading };
};

export const useMutation = () => {
  let token = useToken();
  return async (slug: string, params?: DecodeParams) => {
    return fetchDecode(slug, token, params);
  };
};
//
type FetchDecodeRes = {
  raw: ReadableStream<Uint8Array> | null;
  json: object | null;
};

let fetchDecode = async (
  slug: string,
  token: string,
  params?: DecodeParams
): Promise<FetchDecodeRes> => {
  let res = await fetch(`https://api.usedecode.com/e/${slug}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(params ?? {}),
  });
  let j = null;
  try {
    j = await res.json();
  } catch (e) {}

  if (!res.ok) {
    if (res.status === 404) {
      throw new Errors.NotFound(
        `The Decode slug you tried to use, ${slug}, is not registered.`
      );
    }

    throw new Errors.UnexpectedError(
      `Decode received an unexpected error while fetching`,
      { response: res, json: j }
    );
  }

  if (!j) {
    throw new Errors.UnexpectedError(
      "Something went wrong :-( Decode returned a 200 but the body was unparsable",
      { response: res, json: j }
    );
  }

  return { raw: res.body, json: j };
};
