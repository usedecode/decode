export type DecodeParams =
  | {
      [k: string]: string | number | string[] | number[];
    }
  | string;
export type transformFn<Data> = (...args: any) => Data | Promise<Data>;
