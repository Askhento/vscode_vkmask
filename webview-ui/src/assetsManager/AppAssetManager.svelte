<script lang="ts">
    import { MessageHandler } from "../common/MessageHandler";
    import type { MessageHandlerData } from "../common/MessageHandler";

    import { RequestTarget, RequestCommand } from "../../../src/types";
    import type { Selection } from "../../../src/types";

    import { logger, logDump } from "../logger";
    const print = logger("Inspector.svelte");

    const origin = RequestTarget.assetsManager;

    const messageHandler = new MessageHandler(handleMessageApp, origin);
    // Handle messages sent from the extension to the webview
    let message;
    let assets = [];

    messageHandler
        .request({
            target: RequestTarget.extension,
            command: RequestCommand.getAssets,
        })
        .then((data) => {
            //   console.log("assets_manager", data);
            assets = data.payload;
        });

    function handleMessageApp(data: MessageHandlerData<any>) {
        const { command, payload, target } = data;
        console.log("assets_manager", data);

        switch (command) {
            case "updateAssets":
                assets = payload;
                break;

            case RequestCommand.getLogs:
                returnLogs(data);
                break;

            default:
                break;
        }
        // const data = event.data as MessageHandlerData<any>; // The json data that the extension sent
        // console.log(event);
        // if (data.requestId) {
        //   // responding with payload
        //   messageHandler.send({
        //     requestId: data.requestId,
        //     target: data.origin,
        //     payload: inputValue,
        //     command: "",
        //   });
        // }
    }

    function returnLogs(data: MessageHandlerData<any>) {
        messageHandler.send({
            ...data,
            target: data.origin,
            payload: logDump,
        });
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

{#if assets}
    {#each assets as asset}
        <div>{asset.path}</div>
    {/each}
{:else}
    <div>empty assets</div>
{/if}

<style>
    * {
        box-sizing: border-box;
    }
    input {
        background-color: aquamarine;
    }
</style>
