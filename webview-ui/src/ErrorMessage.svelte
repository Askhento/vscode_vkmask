<script lang="ts">
  import { vscode } from "./utils/vscode";

  export let message = "";
  let errorLocation = undefined;
  let errorToken;

  function getErrorString() {
    errorLocation = message.match(/(?<=at position\s)\d+/gm);
    errorToken = message.match(/(?<=token )\S+/gm);
    console.log("err loc : ", errorLocation);
    console.log("err token : ", errorToken);
    return JSON.stringify(message, null, "  ");
  }

  function sendShowError() {
    vscode.postMessage({
      type: "showErrorLocation",
      value: {
        location: parseInt(errorLocation[0]),
        token: errorToken[0],
      },
    });
  }
</script>

<div class="text-control-wrapper">
  <div>Error :</div>
  <pre class="error">{getErrorString()}</pre>
  {#if errorLocation}
    <vscode-button class="add-key-btn" on:click={sendShowError}>
      <span slot="start" class="codicon codicon-search" />
      Show error
    </vscode-button>
  {/if}
</div>

<style>
  * {
    margin: 5px;
  }
  .text-control-wrapper {
    width: 100%;
  }
  pre {
    white-space: pre-wrap; /* Since CSS 2.1 */
  }
</style>
