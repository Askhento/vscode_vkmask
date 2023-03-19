<script lang="ts">
  import {
    provideVSCodeDesignSystem,
    vsCodeButton,
    allComponents,
  } from "@vscode/webview-ui-toolkit";
  import Effects from "./Effects.svelte";
  import Inspector from "./Inspector.svelte";
  import { vscode } from "./utils/vscode";
  import { assets } from "./stores";

  // Handle messages sent from the extension to the webview
  function handleMessageApp(event) {
    const message = event.data; // The json data that the extension sent
    // console.log("app.svelte " + message);
    switch (message.type) {
      case "assetsChanged": {
        $assets = message.assets;
        break;
      }
    }
  }

  console.log("wzp!!!");

  provideVSCodeDesignSystem().register(allComponents);
</script>

<svelte:window on:message={handleMessageApp} />

<Effects />
<vscode-divider role="presentation" />
<Inspector />

<style>
  /* .done {
    opacity: 0.4;
  } */
</style>
