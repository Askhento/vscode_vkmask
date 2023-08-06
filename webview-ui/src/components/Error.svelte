<script lang="ts">
    export let error; //, onShowError, onFixError;
    //   //   let errorLocation = undefined;
    //   //   let errorToken;

    console.log("error.svlete", error);
    function getErrorString() {
        return JSON.stringify(error.value, null, "  ");
    }

    //   //   {
    //   //         location: parseInt(errorLocation[0]),
    //   //         token: errorToken[0],
    //   //       }

    //   function sendShowError() {
    //     vscode.postMessage({
    //       type: "showError",
    //       value: error,
    //     });
    //   }
</script>

<div class="text-control-wrapper">
    <div>Error :</div>
    <pre class="error">{getErrorString()}</pre>
    <!-- {#if error.path}
    <pre>at path : {error.path}</pre>
  {/if}

  {#if error.location || error.path}
    <vscode-button class="add-key-btn" on:click={sendShowError}>
      <span slot="start" class="codicon codicon-search" />
      Show error
    </vscode-button>
  {/if} -->
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
