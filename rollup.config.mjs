// svelte modules
import svelte from "rollup-plugin-svelte";
import sveltePreprocess from "svelte-preprocess";

// extension and common modules
import { terser } from "rollup-plugin-terser";
import css from "rollup-plugin-css-only";
import copy from "rollup-plugin-copy-watch";
import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript"; // esbuild have issues with svelte
import esbuild from "rollup-plugin-esbuild";

import { extensionConfig } from "./rollup.extension.mjs";

// ? production env var?
const production = !process.env.ROLLUP_WATCH;

// "dev": "npm run clear && npm run generateBuiltins && conc  \"npm:dev:webview\" \"npm:watch\"",
// fs.mkdirSync("./out/panels/webview-build", { recursive: true }); // for watcher attach folder

// /** @type {import("rollup").RollupOptions} */
// const builtinsConfig = {
//     input : "src/generateBuiltins.ts",

// }

// for config autocomplete
/** @type {import("rollup").RollupOptions} */
const svelteCommon = {
    plugins: [
        // !!! this will copy to the same dir for every webivew
        copy({
            // watch: "./src/global.css",
            // copyOnce: false,
            targets: [{ src: "./webview-ui/src/global.css", dest: "./out/panels/webview-build" }],
        }),

        typescript({
            tsconfig: "./webview-ui/tsconfig.json",
            // rootDirs: ["./src", "../src"],
            sourceMap: true,
            inlineSources: !production,
        }),
        svelte({
            include: "./webview-ui/src/**/*.svelte",
            preprocess: [sveltePreprocess({ sourceMap: true })],
            // preprocess: sveltePreprocess({
            //     typescript({ content, filename }) {
            //         const { js: code } = transformSync(content, {
            //             loader: "ts",
            //             keepNames: true,
            //             minify: false,
            //         });
            //         return { code };
            //     },
            // }),
            compilerOptions: {
                // enable run-time checks when not in production
                dev: !production,
                enableSourcemap: true,
                accessors: true, // svelte component properties from parents
            },
            onwarn: (warning, handler) => {
                if (warning.code.startsWith("a11y-")) {
                    return;
                }
                handler(warning);
            },
        }),
        // we'll extract any component CSS out into
        // a separate file - better for performance
        css({ output: "bundle.css" }),

        // If you have external dependencies installed from
        // npm, you'll most likely need these plugins. In
        // some cases you'll need additional configuration -
        // consult the documentation for details:
        // https://github.com/rollup/plugins/tree/master/packages/commonjs
        nodeResolve({
            browser: true,
            dedupe: ["svelte"],
            extensions: [".js", ".ts", ".svelte"], //  added to solve UNRESOLVED it helped!
        }),
        commonjs(),

        // If we're building for production (npm run build
        // instead of npm run dev), minify
        production && terser(),
    ],
    watch: {
        clearScreen: false,
        skipWrite: false,
        // exclude: "../out",
    },
};

function getSvelteEntry(name) {
    return {
        input: `./webview-ui/src/${name}/main.ts`,

        output: {
            sourcemap: true,
            format: "iife",
            name: "app",
            file: `./out/panels/webview-build/${name}/bundle.js`, //!!!! add path resolve, for cross platform
        },
        ...svelteCommon,
    };
}

// export default extensionConfig;

export default [
    getSvelteEntry("effects"),
    getSvelteEntry("plugins"),
    getSvelteEntry("projectManager"),
    getSvelteEntry("assetsManager"),
    getSvelteEntry("parameters"),
    getSvelteEntry("liquifiedWarpEditor"),
    extensionConfig,
];
