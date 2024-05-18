import esbuild from "esbuild";
import esbuildSvelte from "esbuild-svelte";
import sveltePreprocess from "svelte-preprocess";
import { globSync } from "glob";
import { commonjs } from "@hyrious/esbuild-plugin-commonjs";

const production = (process.env.NODE_ENV ?? "production").trim() == "production";

const timePlugin = {
    name: "rebuild-log",
    setup({ onStart, onEnd }) {
        var t;
        onStart(() => {
            t = Date.now();
        });
        onEnd((result) => {
            if (result.errors.length !== 0) {
                console.error("build failed", result.errors);
                return;
            }
            console.log(`build complete, time ${Date.now() - t}ms`);
        });
    },
};

/** @type {import("esbuild").BuildOptions} */
const configCommon = {
    outbase: "./src",
    outdir: "./out",
    bundle: true,
    external: ["vscode"],
    minify: false,
    logLevel: "info",
    sourcemap: production ? undefined : "inline",
};

/** @type {import("esbuild").BuildOptions} */
const extensionCfg = {
    ...configCommon,
    entryPoints: ["./src/extension.ts"],
    format: "cjs",
    tsconfig: "./tsconfig.json",
    platform: "node",
    plugins: [
        // ! not sure why i was using it for
        // commonjs({
        //     requireReturnsDefault: true,
        // }),
        timePlugin,
    ],
};

const svelteCfg = {
    ...configCommon,
    entryPoints: [
        "./src/webview-ui/global.css",
        ...globSync("./src/webview-ui/**/main.ts", { absolute: true }),
    ],
    format: "iife",
    tsconfig: "./src/webview-ui/tsconfig.json",
    platform: "browser",
    treeShaking: true,
    plugins: [
        esbuildSvelte({
            mainFields: ["svelte", "browser", "module", "main"],
            conditions: ["svelte", "browser"],
            preprocess: [sveltePreprocess({})],

            compilerOptions: {
                // customElement: true,
                accessors: true,
                css: "external",
            },
            // suppress a11y
            filterWarnings: (warning) => !warning.code.startsWith("a11y-"),
        }),
        commonjs({}),
        timePlugin,
    ],
};

if (!production) {
    const extensionCtx = await esbuild.context(extensionCfg);
    const svelteCtx = await esbuild.context(svelteCfg);
    await Promise.all([extensionCtx.watch({}), svelteCtx.watch({})]);
} else {
    await Promise.all([esbuild.build(extensionCfg), esbuild.build(svelteCfg)]);
}
