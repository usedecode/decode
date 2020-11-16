import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import autoprefixer from "autoprefixer";
import postcss from "rollup-plugin-postcss";
import json from '@rollup/plugin-json';

const config = () => ({
  input: "src/index.ts",
  plugins: [
    json(),
    typescript({
      exclude: "node_modules/**",
    }),
    {
      resolveId: (source) => {
        if (source === "React") {
          return { id: "react", external: true };
        }

        return null;
      },
    },
    nodeResolve(),
    commonjs(),
    postcss({
      plugins: [autoprefixer()],
      sourceMap: true,
      extract: false,
      minimize: true,
    }),
  ],
  output: {
    file: `dist/decode.js`,
    format: "cjs",
  },
  external: ["react"],
});

export default config();
