import { defineConfig } from "vitest/config";
import { svelte } from "@sveltejs/vite-plugin-svelte";

// https://github.com/wd-David/svelte-component-test-recipes
export default defineConfig(({ mode }) => ({
    plugins: [svelte()],
    resolve: {
        conditions: mode === "test" ? ["browser"] : [],
    },
    test: {
        include: ["./test/**"],

        environment: "jsdom",
        setupFiles: ["./vitest-setup.js"],
        disableConsoleIntercept: false,
    },
}));
