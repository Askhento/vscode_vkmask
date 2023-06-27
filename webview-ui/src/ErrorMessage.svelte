<script lang="ts">
  import { vscode } from "./utils/vscode";

  export let error;
  //   let errorLocation = undefined;
  //   let errorToken;

  function getErrorString() {
    return JSON.stringify(error.message, null, "  ");
  }

  //   {
  //         location: parseInt(errorLocation[0]),
  //         token: errorToken[0],
  //       }

  function sendShowError() {
    vscode.postMessage({
      type: "showError",
      value: error,
    });
  }
</script>

<div class="text-control-wrapper">
  <div>Error :</div>
  <pre class="error">{getErrorString()}</pre>
  {#if error.location || error.path}
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
