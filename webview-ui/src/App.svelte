<!-- https://microsoft.github.io/vscode-codicons/dist/codicon.html -->

<script lang="ts">
  import { logger, logDump } from "./logger";
  const print = logger("App.svelte");
  import { provideVSCodeDesignSystem, allComponents } from "@vscode/webview-ui-toolkit";
  import Effects from "./Effects.svelte";
  import Inspector from "./Inspector.svelte";
  import ErrorMessage from "./ErrorMessage.svelte";
  import Settings from "./Settings.svelte";

  import { vscode } from "./utils/vscode";
  import { assets, effects, selection, userSettings } from "./stores";
  import WelcomeScreen from "./WelcomeScreen.svelte";
  import { onMount } from "svelte";
  import Header from "./Header.svelte";

  let appStates = {
    LOADING: 0,
    RUNNING: 1,
    WELCOME: 2,
    ERROR: 3,
  };
  let appState = appStates.LOADING;
  $: print("state change : ", appState);
  let errorMessage = "";
  let updateLock = true;
  let inspectorMountLock = false;
  //   $: {

  //   }

  $: {
    print("selection changes : ", $selection);
    // if (!$selection) inspectorMountLock = true;
  }

  $: {
    // print("mount lock ", inspectorMountLock);
    print("effects changes : ", $effects);
  }

  effects.subscribe((newEffects) => {
    // print("effects mount lock", inspectorMountLock);
    if (updateLock || inspectorMountLock) {
      updateLock = false;
      print("lock return ");
    } else {
      //   print($effects);
      sendEffects(newEffects);
    }
  });

  selection.subscribe((newSelection) => {
    print("selection update");
    vscode.postMessage({
      type: "selectionUpdate",
      value: newSelection,
    });
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
    switch (message.type) {
      case "requestLogs": {
        print("trying to send logs");
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

      case "userSettings": {
        $userSettings = message.userSettings;

        break;
      }
      case "showWelcome": {
        appState = appStates.WELCOME;
        break;
      }
      case "error": {
        appState = appStates.ERROR;
        print("error received", message.error);
        print("message", message);
        errorMessage = message.error;
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

  onMount(() => {
    vscode.postMessage({
      type: "webviewReady",
    });
  });
</script>

<svelte:window on:message={handleMessageApp} />
<!-- {#if $userSettings}
  <pre>{JSON.stringify($userSettings, null, "\t")}</pre>
{/if} -->
{#if appState === appStates.WELCOME}
  <WelcomeScreen />
{:else if appState === appStates.RUNNING}
  <Header />

  <vscode-divider role="presentation" />
  <Effects />
  <vscode-divider role="presentation" />
  {#if $selection}
    {#key $selection || $effects}
      <Inspector
        bind:mountLock={inspectorMountLock}
        on:changed={() => {
          sendEffects($effects);
        }}
      />
    {/key}
  {/if}
{:else if appState === appStates.LOADING}
  <div>Loading...</div>
  <vscode-progress-ring />
{:else if appState === appStates.ERROR}
  {#key errorMessage}
    <ErrorMessage bind:message={errorMessage} />
  {/key}
{/if}

<style>
</style>
