// .vscode-test.js
const { defineConfig } = require("@vscode/test-cli");

module.exports = defineConfig([
    {
        label: "unitTests",
        files: "out/test/**/*.test.js",
        version: "stable",
        // workspaceFolder: "F:/PROJECTOS_SSD/urhovk/222",
        mocha: {
            ui: "tdd",
            timeout: 0,
        },
    },
    // you can specify additional test configurations, too
]);
