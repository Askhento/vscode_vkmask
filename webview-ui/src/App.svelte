<!-- https://microsoft.github.io/vscode-codicons/dist/codicon.html -->

<script lang="ts">
  import { logDump, logger } from "./logger";
  const print = logger("App.svelte");

  import {
    provideVSCodeDesignSystem,
    allComponents,
  } from "@vscode/webview-ui-toolkit";
  import Effects from "./Effects.svelte";
  import Inspector from "./Inspector.svelte";
  import { vscode } from "./utils/vscode";
  import { assets, effects, selection } from "./stores";
  import WelcomeScreen from "./WelcomeScreen.svelte";

  let appStates = {
    LOADING: 0,
    RUNNING: 1,
    WELCOME: 2,
  };
  let appState = appStates.LOADING;

  let updateLock = true;
  //   $: {

  //   }

  $: print("selection changes : ", $selection);
  $: print("effects changes : ", $effects);

  effects.subscribe((newEffects) => {
    if (updateLock) {
      updateLock = false;
      print("lock return ");
    } else {
      //   print($effects);
      sendEffects(newEffects);
    }
  });

  const sendDelay = 500; // move to prefernces
  let sendTimeout;
  // here trying to accumulate changes and send them once ui settled down
  function sendEffects(newEffects) {
    if (sendTimeout) clearTimeout(sendTimeout);

    sendTimeout = setTimeout(() => {
      print("sending effects");
      vscode.postMessage({
        type: "effectsUpdate",
        value: newEffects,
      });
    }, sendDelay);
  }

  // Handle messages sent from the extension to the webview
  function handleMessageApp(event) {
    const message = event.data; // The json data that the extension sent
    // print("app.svelte " + message);
    switch (message.type) {
      case "requestLogs": {
        vscode.postMessage({
          type: "returnLogs",
          value: logDump,
        });
        break;
      }
      case "assetsChanged": {
        $assets = message.assets;
        break;
      }
      case "showWelcome": {
        appState = appStates.WELCOME;
        break;
      }
      case "updateEffects": {
        print("received updatingEffects");
        updateLock = true;
        if (message.effects === undefined) return;
        appState = appStates.RUNNING;
        $effects = message.effects;
        print("new effects!", $effects);

        // uiElements = EffectParserForUI.safeParse($effects);
        // if (!uiElements.success) print(fromZodError(uiElements.error));
        // print("wzp frontend!", uiElements);
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
  {#if $selection}
    <Inspector />
  {/if}
{:else if appState === appStates.LOADING}
  <div>Loading...</div>
  <vscode-progress-ring />
{/if}

<style>
  /* .done {
    opacity: 0.4;
  } */
</style>
