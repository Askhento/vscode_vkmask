import svelte from "rollup-plugin-svelte";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import livereload from "rollup-plugin-livereload";
import { terser } from "rollup-plugin-terser";
import sveltePreprocess from "svelte-preprocess";
import typescript from "@rollup/plugin-typescript";
import css from "rollup-plugin-css-only";

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

const common = {
    plugins: [
        typescript({
            tsconfig: "./tsconfig.json",
            rootDirs: ["./src", "../src"],

            sourceMap: true,
            inlineSources: !production,
        }),
        svelte({
            include: "src/**/*.svelte",
            preprocess: [sveltePreprocess({ sourceMap: true })],
            compilerOptions: {
                // enable run-time checks when not in production
                dev: !production,
                enableSourcemap: true,
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
            extensions: [".js", ".ts", ".svelte"], // !!! added to solve UNRESOLVED it helped!
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
    },
};

export default [
    {
        input: "src/main/main.ts",

        output: {
            sourcemap: true,
            format: "iife",
            name: "app",
            file: "../out/panels/webview-build/main/bundle.js", //!!!! add path resolve
        },
        ...common,
    },
    {
        input: "src/inspector/main.ts",

        output: {
            sourcemap: true,
            format: "iife",
            name: "inspector",
            file: "../out/panels/webview-build/inspector/bundle.js",
        },
        ...common,
    },
    {
        input: "src/assets_manager/main.ts",

        output: {
            sourcemap: true,
            format: "iife",
            name: "assets_manager",
            file: "../out/panels/webview-build/assets_manager/bundle.js",
        },
        ...common,
    },
];