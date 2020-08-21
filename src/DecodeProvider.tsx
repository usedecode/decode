import React, { useContext, useEffect, useState } from "react";
import Loading from "Loading";
import { ConfigInterface, SWRConfig } from "swr";

const code_param_name = "__decode_code";
const localStorageKey = "decode:v0.1";
// const oneDay = 86400000;
const oneMinute = 60_000;

let getLocalStorage = () => localStorage.getItem(localStorageKey);
let setLocalStorage = (token: string, expiresAt: number) =>
  localStorage.setItem(
    localStorageKey,
    JSON.stringify({ token, exp: expiresAt })
  );
let delLocalStorage = () => localStorage.removeItem(localStorageKey);
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
  onError(code: 401): void;
  logout(redirectUrl?: string): void;
}

export const DecodeContext = React.createContext<Context>({
  token: "",
  onError: () => {},
  logout: () => {},
});

interface Props {
  swrConfig?: ConfigInterface;
  cacheToken?: boolean;
  org?: string;
}

let DecodeProvider: React.FC<Props> = ({
  swrConfig,
  cacheToken,
  org,
  children,
}) => {
  let [token, setToken] = useState("");
  let [shouldRedirect, setShouldRedirect] = useState(false);

  if (cacheToken == undefined) {
    if (process.env.NODE_ENV === "production") {
      cacheToken = false;
    } else {
      cacheToken = true;
    }
  }

  let onError = (error: 401) => {
    switch (error) {
      case 401: {
        setShouldRedirect(true);
        return;
      }
      default: {
        throw new Error(`No error handler registered for error code: ${error}`);
      }
    }
  };

  useEffect(() => {
    let doEffect = async () => {
      let storedToken = cacheToken && fetchTokenIfNotExpiringSoon();
      let { [code_param_name]: code, ...rest } = getParams();

      if (code) {
        let { token, expiresAt } = await exchangeCode(code as string);
        cacheToken && setLocalStorage(token, expiresAt);
        let { origin, pathname } = window.location;
        let search = encodeParams(rest);
        let url = search ? origin + pathname + "?" + search : origin + pathname;
        window.history.pushState({}, "", url);
        setToken(token); // hack -- set state after window.pushState() to force re-render
      } else if (storedToken) {
        setToken(storedToken);
      } else {
        setShouldRedirect(true);
      }
    };
    doEffect();
  }, []);

  useEffect(() => {
    if (shouldRedirect) {
      let orgAppendix = org ? `&org=${org}` : "";
      window.location.href =
        `https://api.usedecode.com/auth/start?redirect_url=${window.location.href}` +
        orgAppendix;
    }
  }, [shouldRedirect]);

  let logout = (redirectUrl?: string) => {
    delLocalStorage();
    if (redirectUrl) {
      window.location.href = `https://api.usedecode.com/auth/logout?redirect_url=${redirectUrl}`;
    } else {
      window.location.href = `https://api.usedecode.com/auth/logout`;
    }
  };

  if (!token) {
    return <Loading msg="Logging you in..." />;
  }

  return (
    <DecodeContext.Provider value={{ token, onError, logout }}>
      <SWRConfig value={swrConfig ?? {}}>{children}</SWRConfig>
    </DecodeContext.Provider>
  );
};

let exchangeCode = async (
  code: string
): Promise<{ token: string; expiresAt: number }> => {
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
  let { token, expires_at: expiresAt } = await res.json();
  return { token, expiresAt: expiresAt * 1000 };
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
export let useOnError = () => useContext(DecodeContext).onError;
export let useLogout = () => useContext(DecodeContext).logout;

export default DecodeProvider;
