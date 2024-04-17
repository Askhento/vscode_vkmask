// extension and common modules
import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import esbuild from "rollup-plugin-esbuild";
import typescript from "@rollup/plugin-typescript"; // esbuild have issues with svelte
import json from "@rollup/plugin-json";

/** @type {import("rollup").RollupOptions} */
export const extensionConfig = {
    input: "src/extension.ts",
    external: ["vscode"],
    output: {
        sourcemap: true,
        format: "cjs",
        file: "./out/extension.js",
    },
    plugins: [
        nodeResolve({
            preferBuiltins: true,
        }),
        commonjs({
            ignoreDynamicRequires: true,
        }),
        // typescript({}),
        esbuild({}),
        json(),
    ],
    watch: {
        clearScreen: false,
        skipWrite: false,
    },
};

export default extensionConfig;
