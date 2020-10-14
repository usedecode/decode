import { useState } from "react";
import { useFetcher, FetchKey } from "./index";
import withNotification from "withNotification";

interface Options {
  showNotifications: boolean;
}

export default function useRequest(options?: Options) {
  let [processing, setProcessing] = useState(false);
  let fetcher = useFetcher();

  let showNotifications = !(options && !options.showNotifications);

  let fn = async (arg: FetchKey) => {
    setProcessing(true);

    let slug: any;
    let params: any;
    if (Array.isArray(arg)) {
      slug = arg[0];
      params = arg[1];
    } else {
      slug = arg;
    }

    try {
      let res = showNotifications
        ? await withNotification(() => fetcher(slug, params), slug)
        : await fetcher(slug, params);

      setProcessing(false);
      return [res, null];
    } catch (e) {
      setProcessing(false);
      return [null, e];
    }
  };

  return { request: fn, isProcessing: processing };
}
