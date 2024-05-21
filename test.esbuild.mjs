import esbuild from "esbuild";
import esbuildSvelte from "esbuild-svelte";
import sveltePreprocess from "svelte-preprocess";
import { globSync } from "glob";
import { commonjs } from "@hyrious/esbuild-plugin-commonjs";

const production = true;

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
    outbase: "./test",
    outdir: "./out/test",
    bundle: true,
    external: ["vscode"],
    minify: false,
    logLevel: "info",
};

/** @type {import("esbuild").BuildOptions} */
const extensionCfg = {
    ...configCommon,
    entryPoints: ["./test/integration/*.test.ts"],
    format: "cjs",
    tsconfig: "./tsconfig.json",
    platform: "node",
    plugins: [timePlugin],
};

await esbuild.build(extensionCfg);
