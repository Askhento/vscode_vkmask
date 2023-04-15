<!-- https://microsoft.github.io/vscode-codicons/dist/codicon.html -->

<script lang="ts">
  import {
    provideVSCodeDesignSystem,
    vsCodeButton,
    allComponents,
  } from "@vscode/webview-ui-toolkit";
  import Effects from "./Effects.svelte";
  import Inspector from "./Inspector.svelte";
  import { vscode } from "./utils/vscode";
  import { assets, effects, selection } from "./stores";
  import WelcomeScreen from "./WelcomeScreen.svelte";

  let showingWelcome = true;
  let appStates = {
    LOADING: 0,
    RUNNING: 1,
    WELCOME: 2,
  };
  let appState = appStates.LOADING;

  // Handle messages sent from the extension to the webview
  function handleMessageApp(event) {
    const message = event.data; // The json data that the extension sent
    // console.log("app.svelte " + message);
    switch (message.type) {
      case "assetsChanged": {
        $assets = message.assets;
        break;
      }
      case "showWelcome": {
        appState = appStates.WELCOME;
        break;
      }
      case "updateEffects": {
        console.log("main.js : received updatingEffects");
        // updateLock = true;
        if (message.effects === undefined) return;
        appState = appStates.RUNNING;
        $effects = message.effects;
        console.log("new effects!", $effects);

        // uiElements = EffectParserForUI.safeParse($effects);
        // if (!uiElements.success) console.log(fromZodError(uiElements.error));
        // console.log("wzp frontend!", uiElements);
        break;
      }
      case "deselect": {
        $selection = undefined;
        break;
      }
    }
  }

  provideVSCodeDesignSystem().register(allComponents);
</script>

<svelte:window on:message={handleMessageApp} />

{#if appState === appStates.WELCOME}
  <WelcomeScreen />
{:else if appState === appStates.RUNNING}
  <Effects />
  <vscode-divider role="presentation" />
  <Inspector />
{:else if appState === appStates.LOADING}
  <div>Loading...</div>
  <vscode-progress-ring />
{/if}

<style>
  /* .done {
    opacity: 0.4;
  } */
</style>
