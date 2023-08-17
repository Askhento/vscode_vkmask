<script lang="ts">
    import { RequestCommand, RequestTarget } from "src/types";
    import { getContext } from "svelte";
    export let error; //, onShowError, onFixError;

    let { type, value } = error;
    //@ts-expect-error
    const { messageHandler } = getContext("stores");

    //   //   let errorLocation = undefined;
    //   //   let errorToken;

    console.log("error.svlete", error);
    function getErrorString() {
        return JSON.stringify(value.message, null, "  ");
    }

    //   //   {
    //   //         location: parseInt(errorLocation[0]),
    //   //         token: errorToken[0],
    //   //       }

    function sendShowError() {
        messageHandler.send({
            command: RequestCommand.showError,
            target: RequestTarget.extension,
            payload: error,
        });
        // vscode.postMessage({
        //   type: "showError",
        //   value: error,
        // });
    }
</script>

<div class="text-control-wrapper">
    <div>Error :</div>
    <pre class="error">{getErrorString()}</pre>
    {#if value.path}
        <pre>at path : {value.path}</pre>
    {/if}

    {#if value.location || value.path}
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
