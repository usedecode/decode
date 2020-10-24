import { authProviderHelper } from "authProviderHelper";
import withNotification from "withNotification";
import Errors from "./errors";

type fetchFunc = (
  input: RequestInfo,
  init?: RequestInit | undefined
) => Promise<Response>;

interface Options {
  notifications?: boolean;
}

export function wrapFetch(fetch: fetchFunc, opts: Options = {}): fetchFunc {
  if (opts.notifications) {
    fetch = wrapNotifications(fetch);
  }

  fetch = wrapTokenSafe(fetch);

  return (input, init) => getDecodeFetch(fetch, input, init);
}

function wrapTokenSafe(fetch: fetchFunc): fetchFunc {
  return (input, init) => getTokenSafeFetch(fetch, input, init);
}

function wrapNotifications(fetch: fetchFunc): fetchFunc {
  return (input, init) => getNotificationsFetch(fetch, input, init);
}

async function getTokenSafeFetch(
  fetch: fetchFunc,
  input: RequestInfo,
  init?: RequestInit | undefined
) {
  let token = authProviderHelper.getToken();

  if (!token) {
    return new Promise<Response>((resolve) => {
      setTimeout(async () => {
        token = authProviderHelper.getToken();

        if (token) {
          resolve(await fetch(input, init));
        } else {
          resolve(await getTokenSafeFetch(fetch, input, init));
        }
      }, 50);
    });
  }

  return await fetch(input, init);
}

async function getNotificationsFetch(
  fetch: fetchFunc,
  input: RequestInfo,
  init?: RequestInit | undefined
) {
  // Show notifications only on fail if request is a GET
  let onlyFail = !init || !init.method || init.method.toLowerCase() === "get";

  return await withNotification(
    () => fetch(input, init),
    input.toString(),
    onlyFail ? "fail" : "all"
  );
}

async function getDecodeFetch(
  fetch: fetchFunc,
  input: RequestInfo,
  init?: RequestInit | undefined
) {
  let token = authProviderHelper.getToken();

  let decodeUrl = getDecodeUrl(input.toString());
  let decodeHeaders = new Headers(init && init.headers ? init.headers : {});

  decodeHeaders.append("Authorization", `Bearer ${token}`);

  let decodeOptions: RequestInit = {
    ...init,
    headers: decodeHeaders,
  };

  let res = await fetch(decodeUrl, decodeOptions);

  if (!res.ok) {
    if (res.status === 401) {
      throw new Errors.NotAuthorized(`Received a 401 from Decode.`);
    }

    throw new Errors.UnexpectedError(
      `Decode received an unexpected error while fetching`,
      { response: res }
    );
  }

  return res;
}

function getDecodeUrl(url: string) {
  let resolvedUrl = new URL(url, window.location.href);
  let safeUrl = encodeURI(
    resolvedUrl.host + resolvedUrl.pathname + resolvedUrl.search
  );

  return `https://api.decodeauth.com/p/${safeUrl}`;
}
