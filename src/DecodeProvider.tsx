import React, { useContext, useEffect, useState } from "react";

const code_param_name = "__decode_code";

interface Context {
  token: string;
}

export const DecodeContext = React.createContext<Context>({
  token: "",
});

interface Props {}

let DecodeProvider: React.FC<Props> = ({ children }) => {
  let [token, setToken] = useState("");

  useEffect(() => {
    let doEffect = async () => {
      let s = window.location.search;
      let { [code_param_name]: code, ...rest } = getParams();
      if (!code) {
        window.location.href = `https://api.usedecode.com/auth/start?redirect_url=${window.location.href}`;
      } else {
        let token = await exchangeCode(code as string);
        setToken(token);
        let { origin, pathname } = window.location;
        let search = encodeParams(rest);
        let url = search ? origin + pathname + "?" + search : origin + pathname;
        window.history.pushState({}, "", url);
      }
    };
    doEffect();
  }, []);

  if (!token) {
    return (
      <p
        style={{
          fontFamily: `apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
      'Noto Sans', sans-serif`,
          color: "#d9d9d9",
        }}
      >
        Loading...
      </p>
    );
  }

  return (
    <DecodeContext.Provider value={{ token }}>
      {children}
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
