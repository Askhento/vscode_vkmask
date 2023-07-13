<script lang="ts">
  import type { MessageHandlerData } from "src/MessageHandler";
  import { MessageHandler } from "../common/MessageHandler";
  const origin = "vkmask.assets_manager";

  const messageHandler = new MessageHandler(handleMessageApp, origin);
  // Handle messages sent from the extension to the webview
  let message;
  function handleMessageApp(data: MessageHandlerData<any>) {
    // const data = event.data as MessageHandlerData<any>; // The json data that the extension sent
    // console.log(event);
    if (data.requestId) {
      // responding with payload
      messageHandler.send({
        requestId: data.requestId,
        target: data.origin,
        payload: inputValue,
      });
    }
  }

  let inputValue = "";

  //   $: {
  //     vscode.postMessage({
  //       target: "vkmask.inspector",
  //       payload: inputValue,
  //     });
  //   }
</script>

<!-- <svelte:window on:message={handleMessageApp} /> -->

<div>HELLO WORLD!</div>

<input bind:value={inputValue} />
{#if message}
  <pre>
        {message}
    </pre>
{/if}

<style>
  input {
    background-color: aquamarine;
  }
  div {
    background: #dd1111;
  }
</style>
