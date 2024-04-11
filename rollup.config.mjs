// svelte modules
import svelte from "rollup-plugin-svelte";
import sveltePreprocess from "svelte-preprocess";

// extension and common modules
import terser from "@rollup/plugin-terser";
import css from "rollup-plugin-css-only";
import copy from "rollup-plugin-copy-watch";
import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript"; // esbuild have issues with svelte
// import esbuild from "rollup-plugin-esbuild";
// import { transformSync } from "esbuild";

// import { typescript as svelteTypescript } from "svelte-preprocess-esbuild";
import { extensionConfig } from "./rollup.extension.mjs";
// import { startRamDisk } from "./ramdisk_scripts/ramdisk.mjs";

// ? production env var?
const production = !process.env.ROLLUP_WATCH;

// !!!!!!!
// if (!production) await startRamDisk();

// "dev": "npm run clear && npm run generateBuiltins && conc  \"npm:dev:webview\" \"npm:watch\"",
// fs.mkdirSync("./out/panels/webview-build", { recursive: true }); // for watcher attach folder

/** @type {import("rollup").PluginImpl} */
function demoWatcherPlugin(globs) {
    let doTheAction = false;
    return {
        closeWatcher() {
            console.log("close watcher");
        },
        closeBundle() {
            console.log("close bundle");
        },
        watchChange(id, change) {
            console.log("change", id, change.event);
        },
        async buildEnd() {
            console.log("build end");
            // if (doTheAction) {
            //     // Do the action you want to perform when certain files change
            // }
        },
    };
}
//, "global.d.ts", "logger.ts", "actions", "common", "ui-controls", "assetsManager", "effects", "liquifiedWarpEditor", "parameters", "plugins", "projectManager", "utils"
// for config autocomplete

/** @type {import("rollup").RollupOptions} */
const svelteCommon = {
    plugins: [
        // demoWatcherPlugin(),
        // !!! this will copy to the same dir for every webivew
        copy({
            // watch: "./src/global.css",
            // copyOnce: false,
            targets: [{ src: "./src/webview-ui/global.css", dest: "./out/panels/webview-build" }],
        }),

        typescript({
            tsconfig: "./src/webview-ui/tsconfig.json",
            // rootDirs: ["./src", "../src"],
            sourceMap: true,
            inlineSources: !production,
        }),
        // esbuild({
        //     tsconfig: "./src/webview-ui/tsconfig.json",
        // }),
        svelte({
            include: "./src/webview-ui/**/*.svelte",
            preprocess: [
                sveltePreprocess({
                    sourceMap: true,
                    // typescript: true,
                    // typescript({ content, filename }) {
                    //     const { js: code } = transformSync(content, {
                    //         loader: "ts",

                    //     });
                    //     return { code };
                    // },
                }),
                // svelteTypescript({
                //     tsconfig: "./src/webview-ui/tsconfig.json",
                //     // define: {
                //     //     "process.browser": "true",
                //     // },
                //     loglevel: "verbose",

                //     define: {
                //         "process.browser": "true",
                //     },
                // }),
            ],
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
                loopGuardTimeout: 5000, // prevent infinte loops.
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
        buildDelay: 500,
        // exclude: "../out",
    },
};

function getSvelteEntry(name) {
    return {
        input: `./src/webview-ui/${name}/main.ts`,

        output: {
            sourcemap: true,
            format: "iife",
            name: "app",
            file: `./out/panels/webview-build/${name}/bundle.js`,
        },
        ...svelteCommon,
    };
}

export default [
    // getSvelteEntry("effects"),
    // getSvelteEntry("plugins"),
    // getSvelteEntry("projectManager"),
    // getSvelteEntry("assetsManager"),
    getSvelteEntry("parameters"),
    // getSvelteEntry("liquifiedWarpEditor"),
    extensionConfig,
];
