import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";

const config = () => ({
  input: "src/index.ts",
  plugins: [
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
  ],
  output: {
    file: `dist/decode.js`,
    format: "cjs",
  },
  external: ["react"],
});

export default config();
