import nodeResolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";

const config = () => ({
  input: "src/index.ts",
  plugins: [
    typescript(),
    {
      resolveId: (source) => {
        if (source === "React") {
          return { id: "react", external: true };
        }
        if (source === "ReactDOM") {
          return { id: "react-dom", external: true };
        }
        return null;
      },
    },
    nodeResolve(),
  ],
  output: {
    file: `dist/decode.js`,
    format: "cjs",
  },
  external: ["react", "react-dom"],
});

export default config();
