import React, { useContext, useEffect, useState } from "react";
import Loading from "Loading";
import { ConfigInterface, SWRConfig } from "swr";

const code_param_name = "__decode_code";
const localStorageKey = "decode:v0.1";
// const oneDay = 86400000;
const oneMinute = 60_000;

let getLocalStorage = () => localStorage.getItem(localStorageKey);
let setLocalStorage = (token: string) =>
  localStorage.setItem(
    localStorageKey,
    JSON.stringify({ token, exp: Date.now() + oneMinute * 120 })
  );
let fetchTokenIfNotExpiringSoon = () => {
  let stored = getLocalStorage();
  if (stored) {
    try {
      let { token, exp } = JSON.parse(stored);
      if (exp - Date.now() > oneMinute * 60) {
        return token;
      }
    } catch (e) {}
  }
};

interface Context {
  token: string;
}

export const DecodeContext = React.createContext<Context>({
  token: "",
});

interface Props {
  swrConfig?: ConfigInterface;
  cacheDecodeToken?: boolean;
}

let DecodeProvider: React.FC<Props> = ({
  swrConfig,
  cacheDecodeToken,
  children,
}) => {
  let [token, setToken] = useState("");

  if (cacheDecodeToken == undefined) {
    if (process.env.NODE_ENV === "production") {
      cacheDecodeToken = false;
    } else {
      cacheDecodeToken = true;
    }
  }

  useEffect(() => {
    let doEffect = async () => {
      let storedToken = cacheDecodeToken && fetchTokenIfNotExpiringSoon();
      let { [code_param_name]: code, ...rest } = getParams();

      if (code) {
        let token = await exchangeCode(code as string);
        setToken(token);
        cacheDecodeToken && setLocalStorage(token);
        let { origin, pathname } = window.location;
        let search = encodeParams(rest);
        let url = search ? origin + pathname + "?" + search : origin + pathname;
        window.history.pushState({}, "", url);
      } else if (storedToken) {
        setToken(storedToken);
      } else {
        window.location.href = `https://api.usedecode.com/auth/start?redirect_url=${window.location.href}`;
      }
    };
    doEffect();
  }, []);

  if (!token) {
    return <Loading msg="Logging you in..." />;
  }

  return (
    <DecodeContext.Provider value={{ token }}>
      <SWRConfig value={swrConfig ?? {}}>{children}</SWRConfig>
    </DecodeContext.Provider>
  );
};

let exchangeCode = async (code: string): Promise<string> => {
  let res = await fetch("https://api.usedecode.com/auth/exchange_code", {
    method: "POST",
    body: JSON.stringify({ code }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    throw new Error(
      `Received an unexpected error exchange decode code for token (${res.status}): ${res.body}`
    );
  }
  let { token } = await res.json();
  return token;
};

type Params = { [k: string]: string | number | boolean };
// I'm lazy af
// https://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript/21152762#21152762
let getParams = (): Params => {
  let qd: any = {};
  if (window.location.search)
    window.location.search
      .substr(1)
      .split("&")
      .forEach((item) => {
        let s = item.split("="),
          k = s[0],
          v = s[1] && decodeURIComponent(s[1]);
        qd[k] = v;
      });
  return qd;
};

const encodeParams = (p: Params) =>
  Object.entries(p)
    .map((kv) => kv.map(encodeURIComponent).join("="))
    .join("&");

export let useToken = () => useContext(DecodeContext).token;

export default DecodeProvider;
