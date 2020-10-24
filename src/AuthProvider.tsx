import React, { useContext, useEffect, useState } from "react";
import Loading from "Loading";
import { ConfigInterface, SWRConfig } from "swr";
import { authProviderHelper } from "authProviderHelper";

const code_param_name = "__decode_code";
const localStorageKey = "decodeauth:v0.1";
// const oneDay = 86400000;
const oneMinute = 60_000;

let getLocalStorage = () => localStorage?.getItem(localStorageKey);
let setLocalStorage = (accessToken: string, expiresAt: number) =>
  localStorage?.setItem(
    localStorageKey,
    JSON.stringify({ accessToken, expiresAt })
  );
let delLocalStorage = () => localStorage?.removeItem(localStorageKey);
let fetchTokenIfNotExpiringSoon = () => {
  let stored = getLocalStorage();
  if (stored) {
    try {
      let { accessToken, expiresAt } = JSON.parse(stored);
      if (expiresAt - Date.now() > oneMinute * 60) {
        return accessToken;
      }
    } catch (e) {}
  }
};
let getTokenExpiry = () => {
  let stored = getLocalStorage();
  if (stored) {
    try {
      let { expiresAt } = JSON.parse(stored);
      return expiresAt;
    } catch (e) {}
  }

  return -1;
};

enum AuthState {
  Initializing = "Initializing",
  LoggedIn = "LoggedIn",
  LoggedOut = "LoggedOut",
}

interface Context {
  authState: AuthState;
  initialized?: boolean;
  token?: string;
  env?: string;
  onError(code: 401): void;
  logout(redirectUrl?: string): void;
}

export const AuthContext = React.createContext<Context>({
  authState: AuthState.Initializing,
  onError: () => {},
  logout: () => {},
});

interface Props {
  swrConfig?: ConfigInterface;
  cacheToken?: boolean;
  org?: string;
  env?: string;
}

let AuthProvider: React.FC<Props> = ({
  swrConfig,
  cacheToken = true,
  org,
  env,
  children,
}) => {
  let [authState, setAuthState] = useState(AuthState.Initializing);

  let [token, setToken] = useState<string | undefined>();
  let [tokenExpiry, setTokenExpiry] = useState<number>(-1);

  useEffect(() => {
    authProviderHelper.init();
  }, []);

  useEffect(() => {
    let timeout: number;

    if (tokenExpiry >= 0) {
      let tokenDuration = tokenExpiry - Date.now();
      timeout = window.setTimeout(
        () => setAuthState(AuthState.LoggedOut),
        tokenDuration - 30
      );
    }
    return () => {
      timeout && clearTimeout(timeout);
    };
  }, [tokenExpiry]);

  let onError = (error: 401) => {
    switch (error) {
      case 401: {
        // do nothing for now
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
        setTokenExpiry(expiresAt);
        authProviderHelper.setToken(token);

        setAuthState(AuthState.LoggedIn);
      } else if (storedToken) {
        setToken(storedToken);
        setTokenExpiry(getTokenExpiry());
        authProviderHelper.setToken(storedToken);

        setAuthState(AuthState.LoggedIn);
      } else {
        setAuthState(AuthState.LoggedOut);
      }
    };
    doEffect();
  }, []);

  useEffect(() => {
    if (authState === AuthState.LoggedOut) {
      let orgAppendix = org ? `&org=${org}` : "";
      window.location.href =
        `https://api.decodeauth.com/auth/start?redirect_url=${window.encodeURIComponent(
          window.location.href
        )}` + orgAppendix;
    }
  }, [authState]);

  let logout = (redirectUrl?: string) => {
    delLocalStorage();
    if (redirectUrl) {
      window.location.href = `https://api.decodeauth.com/auth/logout?redirect_url=${window.encodeURIComponent(
        redirectUrl
      )}`;
    } else {
      window.location.href = `https://api.decodeauth.com/auth/logout`;
    }
  };

  if (!token) {
    return <Loading msg="Logging you in..." />;
  }

  return (
    <AuthContext.Provider
      value={{ initialized: true, logout, token, env, onError, authState }}
    >
      <SWRConfig value={swrConfig ?? {}}>{children}</SWRConfig>
    </AuthContext.Provider>
  );
};

let exchangeCode = async (
  code: string
): Promise<{ token: string; expiresAt: number }> => {
  let res = await fetch("https://api.decodeauth.com/auth/exchange_code", {
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

let useAuthContext = (): Context => {
  let ctx = useContext(AuthContext);

  if (!ctx.initialized) {
    throw new Error(
      "You tried to use a Decode Auth resource (eg `wrapFetch`) without having a parent <AuthProvider /> component in the tree. Please wrap your app in <AuthProvider /> near the top of the component tree, like this: <AuthProvider><App /></AuthProvider>."
    );
  }

  return ctx;
};

export let useToken = () => useAuthContext().token;
export let useEnv = () => useAuthContext().env;
export let useOnError = () => useAuthContext().onError;
export let useLogout = () => useAuthContext().logout;

export default AuthProvider;
