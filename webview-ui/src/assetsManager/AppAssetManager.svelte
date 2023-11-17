<script>
    import { setContext, tick } from "svelte";
    import { MessageHandler } from "../common/MessageHandler";
    import { provideVSCodeDesignSystem, allComponents } from "@vscode/webview-ui-toolkit";
    import * as l10n from "@vscode/l10n";

    import { RequestTarget, RequestCommand, SelectionType } from "../../../src/types";
    import Asset from "./Asset.svelte";
    import { logger, logDump } from "../logger";
    import { writable } from "svelte/store";
    const print = logger("AssetManager.svelte");
    provideVSCodeDesignSystem().register(allComponents);

    const origin = RequestTarget.assetsManager;

    const messageHandler = new MessageHandler(handleMessageApp, origin);
    const selection = writable();
    const assets = writable([]);
    let assetGroups = {};

    const assetsDefaults = {
        materials: {
            from: ["res", "defaultMaterial.json"],
            to: ["Materials", "defaultMaterial.json"],
        },
    };

    setContext("stores", { selection, messageHandler });

    function handleMessageApp(data) {
        const { command, payload, target } = data;
        console.log("assets_manager", data);

        switch (command) {
            case RequestCommand.updateAssets:
                processAssets(payload);
                break;

            case RequestCommand.getLogs:
                returnLogs(data);
                break;

            case RequestCommand.updateSelection:
                processSelection(payload);
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
        print("new assets count ", newAssets.length);

        $assets = newAssets;
        assetGroups = {
            materials: {
                expanded: true,
                elements: $assets.filter((a) => a.type === "json_material" && a.projectFile),
            },
        };
    }

    async function getSelection() {
        const { payload } = await messageHandler.request({
            target: RequestTarget.extension,
            command: RequestCommand.getSelection,
        });

        processSelection(payload);
    }

    function sendSelect() {
        messageHandler.send({
            command: RequestCommand.updateSelection,
            target: RequestTarget.all,
            payload: $selection,
        });
    }

    function processSelection(newSelection) {
        $selection = newSelection;
        // print("new selection", $selection);
    }

    function returnLogs(data) {
        messageHandler.send({
            ...data,
            target: data.origin,
            payload: logDump,
        });
    }

    async function createAsset(assetType) {
        if (!(assetType in assetsDefaults)) {
            print(`asset type ${assetType} not in defaults`);
            return;
        }

        const { payload } = await messageHandler.request({
            command: RequestCommand.getCreatedAssets,
            target: RequestTarget.extension,
            payload: assetsDefaults[assetType],
            //{ from: ["res", "empty-project", "main.as"], to: ["main.as"] },
        });

        print("created asset : ", payload);
    }

    async function removeAsset(assetPath) {
        if ($selection.type === SelectionType.asset) {
            if ($selection.path === assetPath) {
                $selection = { type: SelectionType.empty };
                sendSelect();
            }
            $selection = $selection;
        }

        // !!!! only if asset exist
        messageHandler.request({
            command: RequestCommand.removeAsset,
            target: RequestTarget.extension,
            payload: [assetPath],
        });
    }

    async function init() {
        await getSelection();
        await getAssets();

        // await tick();
        // skippedInit = true;
    }

    init();

    // let skippedInit = false;

    // $: {
    //     if (skippedInit) print("changed selection", $selection);
    // }
</script>

{#key $selection}
    {#key $assets}
        {#if assets}
            {#each Object.entries(assetGroups) as [groupName, groupData]}
                <!-- content here -->
                <vscode-divider class="divider" role="separator" />
                <div
                    class="group-label"
                    on:click={() => {
                        groupData.expanded = !groupData.expanded;
                    }}
                >
                    <i class="codicon codicon-chevron-{groupData.expanded ? 'down' : 'right'}" />

                    <span>{l10n.t(groupName)}</span>
                    <vscode-button
                        class="add-btn"
                        appearance="icon"
                        on:click|stopPropagation={() => {
                            console.log("add!");
                            createAsset(groupName);
                            // removeElement(index);
                        }}
                    >
                        <span class="codicon codicon-add" />
                    </vscode-button>
                </div>
                {#if groupData.expanded}
                    {#each groupData.elements as asset}
                        <Asset
                            value={asset}
                            onSelect={sendSelect}
                            onDelete={() => {
                                removeAsset(asset.path);
                            }}
                        />
                    {/each}
                {/if}
            {/each}
            <!-- group -->
        {:else}
            <div>empty assets</div>
        {/if}
    {/key}
{/key}

<style>
    * {
        box-sizing: border-box;
    }

    .group-label > span {
        /* color: red; */
        display: inline-block;
        margin-left: var(--global-margin);
    }

    .group-label {
        cursor: pointer;
        color: var(--vscode-descriptionForeground);
        margin: var(--global-margin);
        display: flex;
        /* justify-items: end; */
    }

    .add-btn {
        /* align-self: flex-end; */
        margin-left: auto;
    }

    vscode-divider {
        width: 200vw;
        margin-left: -50vw;
        /* calc(0px - var(--global-body-padding-left)); */
    }
</style>
