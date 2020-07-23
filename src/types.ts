export type DecodeParams =
  | {
      [k: string]: string | number | string[] | number[];
    }
  | string;
export type TransformFn<Data> = (...args: any) => Data | Promise<Data>;
