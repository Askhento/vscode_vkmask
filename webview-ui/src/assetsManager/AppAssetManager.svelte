<script lang="ts">
    import { MessageHandler } from "../common/MessageHandler";
    import type { MessageHandlerData } from "../common/MessageHandler";

    import { RequestTarget, RequestCommand } from "../../../src/types";
    import type { Selection } from "../../../src/types";

    import { logger, logDump } from "../logger";
    import { writable } from "svelte/store";
    const print = logger("AssetManager.svelte");

    const origin = RequestTarget.assetsManager;

    const messageHandler = new MessageHandler(handleMessageApp, origin);
    // Handle messages sent from the extension to the webview
    let message;
    const assets = writable([]);
    let materials = [];

    function handleMessageApp(data: MessageHandlerData<any>) {
        const { command, payload, target } = data;
        console.log("assets_manager", data);

        switch (command) {
            case RequestCommand.updateAssets:
                processAssets(payload);
                break;

            case RequestCommand.getLogs:
                returnLogs(data);
                break;

            default:
                break;
        }
    }

    async function getAssets() {
        const { payload } = await messageHandler.request({
            target: RequestTarget.extension,
            command: RequestCommand.getAssets,
        });

        processAssets(payload);
    }

    function processAssets(newAssets) {
        print("new assets", newAssets);
        $assets = newAssets;
        materials = $assets.filter((a) => a.type === "xml_material");
    }

    function returnLogs(data: MessageHandlerData<any>) {
        messageHandler.send({
            ...data,
            target: data.origin,
            payload: logDump,
        });
    }

    async function init() {
        await getAssets();
    }

    init();
</script>

{#if assets}
    {#each materials as asset}
        <div>{asset.baseName}</div>
    {/each}
{:else}
    <div>empty assets</div>
{/if}

<style>
    * {
        box-sizing: border-box;
    }
</style>
