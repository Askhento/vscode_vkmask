// import { terser } from "rollup-plugin-terser";
// import typescript from "@rollup/plugin-typescript";
// import css from "rollup-plugin-css-only";
// import copy from "rollup-plugin-copy-watch";

import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import esbuild from "rollup-plugin-esbuild";
import * as fs from "fs";

const production = !process.env.ROLLUP_WATCH;

// "dev": "npm run clear && npm run generateBuiltins && conc  \"npm:dev:webview\" \"npm:watch\"",
fs.mkdirSync("./out/panels/webview-build", { recursive: true }); // for watcher attach folder

// for config autocomplete
/** @type {import("rollup").RollupOptions} */
const config = {
    input: "src/extension.ts",
    external: ["vscode"],
    output: {
        sourcemap: true,
        format: "cjs",
        file: "out/extension.js",
    },
    plugins: [commonjs(), nodeResolve(), esbuild()],
    watch: {
        clearScreen: false,
    },
};

export default config;
