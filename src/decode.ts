import { useState, useEffect, useRef, useContext } from "react";
import { useToken } from "./DecodeProvider";

type DecodeParams = { [k: string]: string | number | string[] | number[] };

type DecodeRes = {
  raw: ReadableStream<Uint8Array> | null;
  json: object | null;
};

export const useDecode = (slug: string, params?: DecodeParams) => {
  let token = useToken();
  let [results, setResults] = useState<DecodeRes>({ raw: null, json: null });
  let [loading, setLoading] = useState(true);
  let [error, setError] = useState();
  let lastFetchStartedAt = useRef<number | undefined>();

  if (params) {
    let invalidField = Object.keys(params).find(
      (k) =>
        !["string", "number"].includes(typeof params[k]) &&
        !Array.isArray(params[k])
    );
    if (invalidField) {
      throw new Error(
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
      setError(undefined);
      let fetchStartedAt = Date.now();
      lastFetchStartedAt.current = fetchStartedAt;

      let res: DecodeRes = { raw: null, json: null };
      try {
        res = await fetchDecode(slug, token, params);
      } catch (e) {
        console.error(e);
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

  return { raw: results.raw, json: results.json, loading, error };
};
export const useMutation = () => {
  let token = useToken();
  return async (slug: string, params?: DecodeParams) => {
    return fetchDecode(slug, token, params);
  };
};
//
let fetchDecode = async (
  slug: string,
  token: string,
  params?: DecodeParams
) => {
  let res = await fetch(`https://api.usedecode.com/e/${slug}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(params ?? {}),
  });
  let j;
  try {
    j = await res.json();
  } catch (e) {}

  if (!res.ok) {
    let body = j.error;
    throw new Error(`Received an error (${res.status}): ${body}`);
  }

  return { raw: res.body, json: j };
};
