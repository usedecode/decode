import { useEffect, useRef } from "react";
import { format } from "date-fns";

// Wed Aug 05 2020 15:22:40 GMT-0700
// see: https://date-fns.org/v2.15.0/docs/format
export let renderDate = (date: Date) => {
  return date instanceof Date
    ? format(date, "eee MMM dd y HH:mm:ss xxxx")
    : date;
};

export let usePrevious = <T>(value: T) => {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
};

export let getClassName = (str: string, styles: any) => {
  const strs = str.split(" ");
  return strs.map((s) => styles[s]).reduce((p, c) => p + " " + c);
};
