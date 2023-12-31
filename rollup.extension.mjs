// extension and common modules
import { terser } from "rollup-plugin-terser";
import css from "rollup-plugin-css-only";
import copy from "rollup-plugin-copy-watch";
import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript"; // esbuild have issues with svelte
import esbuild from "rollup-plugin-esbuild";
import json from "@rollup/plugin-json";

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
    plugins: [nodeResolve(), commonjs({}), esbuild(), json()],
    watch: {
        clearScreen: false,
        skipWrite: false,
    },
};

export default extensionConfig;
