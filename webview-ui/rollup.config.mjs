import svelte from "rollup-plugin-svelte";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import livereload from "rollup-plugin-livereload";
import { terser } from "rollup-plugin-terser";
import sveltePreprocess from "svelte-preprocess";
import typescript from "@rollup/plugin-typescript";
import css from "rollup-plugin-css-only";
// import copy from "rollup-plugin-copy";
import copy from "rollup-plugin-copy-watch";
// import esbuild from "rollup-plugin-esbuild";
// import { typescript } from "svelte-preprocess-esbuild";
// import { transformSync } from "esbuild";

const production = !process.env.ROLLUP_WATCH; // !!!!! wtf
// ! added sourcemaps
// function serve() {
//     let server;

//     function toExit() {
//         if (server) server.kill(0);
//     }

//     return {
//         writeBundle() {
//             if (server) return;
//             server = require('child_process').spawn('npm', ['run', 'dev', '--', '--dev'], {
//                 stdio: ['ignore', 'inherit', 'inherit'],
//                 shell: true
//             });

//             process.on('SIGTERM', toExit);
//             process.on('exit', toExit);
//         }
//     };
// }

// for config autocomplete
/** @type {import("rollup").RollupOptions} */
const common = {
    plugins: [
        // !!! this will copy to the same dir for every webivew
        copy({
            // watch: "./src/global.css",
            // copyOnce: false,

            targets: [{ src: "./src/global.css", dest: "../out/panels/webview-build" }],
        }),

        typescript({
            tsconfig: "./tsconfig.json",
            rootDirs: ["./src", "../src"],

            sourceMap: true,
            inlineSources: !production,
        }),
        svelte({
            include: "src/**/*.svelte",
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
                accessors: true,
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
        resolve({
            browser: true,
            dedupe: ["svelte"],
            extensions: [".js", ".ts", ".svelte"], //  added to solve UNRESOLVED it helped!
        }),
        commonjs(),

        // // In dev mode, call `npm run start` once
        // // the bundle has been generated
        // !production && serve(),

        // // Watch the `build` directory and refresh the
        // // browser on changes when not in production
        // !production && livereload('../out/panels/webview-build'),

        // If we're building for production (npm run build
        // instead of npm run dev), minify
        production && terser(),
    ],
    watch: {
        clearScreen: false,
        // exclude: "../out",
    },
};

function getSvelteEntry(name) {
    return {
        input: `src/${name}/main.ts`,

        output: {
            sourcemap: true,
            format: "iife",
            name: "app",
            file: `../out/panels/webview-build/${name}/bundle.js`, //!!!! add path resolve, for cross platform
        },
        ...common,
    };
}

export default [
    getSvelteEntry("effects"),
    getSvelteEntry("plugins"),
    getSvelteEntry("projectManager"),
    getSvelteEntry("assetsManager"),
    getSvelteEntry("parameters"),
    getSvelteEntry("liquifiedWarpEditor"),
];
