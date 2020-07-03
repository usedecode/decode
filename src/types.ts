export type DecodeParams = {
  [k: string]: string | number | string[] | number[];
};
export type transformFn<Data> = (...args: any) => Data | Promise<Data>;
