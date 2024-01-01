// extension and common modules
import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import esbuild from "rollup-plugin-esbuild";
// import json from "@rollup/plugin-json";

// for config autocomplete
/** @type {import("rollup").RollupOptions} */
export const extensionConfig = {
    input: "src/extension.ts",
    external: ["vscode", "sharp"],
    output: {
        sourcemap: true,
        format: "cjs",
        file: "out/extension.js",
    },
    plugins: [nodeResolve(), commonjs({}), esbuild()], // json()
    watch: {
        clearScreen: false,
        skipWrite: false,
    },
};

export default extensionConfig;
