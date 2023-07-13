<script lang="ts">
  import type { MessageHandlerData } from "src/MessageHandler";
  import { MessageHandler } from "../common/MessageHandler";
  const origin = "vkmask.inspector";

  const messageHandler = new MessageHandler(handleMessageApp, origin);

  // Handle messages sent from the extension to the webview
  let message;

  function handleMessageApp(event) {
    // message = event.data.payload; // The json data that the extension sent
    // console.log(event);
  }

  console.log("Asset manager : " + crypto.randomUUID());
</script>

<!-- <svelte:window on:message={handleMessageApp} /> -->

<div>HELLO WORLD!</div>

{#if message}
  <pre>
        {message}
    </pre>
{/if}

<button
  on:click={async () => {
    console.log("getting data");
    const resp = await messageHandler.request({
      target: "vkmask.assets_manager",
    });

    console.log(resp);

    message = resp.payload;
  }}>get data!</button
>

<style>
  div {
    background: #dd1111;
  }
</style>
