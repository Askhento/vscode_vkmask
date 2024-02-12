<script>
    import { setContext, tick } from "svelte";
    import { MessageHandler } from "../common/MessageHandler";
    import { provideVSCodeDesignSystem, allComponents } from "@vscode/webview-ui-toolkit";
    import * as l10n from "@vscode/l10n";

    import { RequestTarget, RequestCommand, AppState, SelectionType } from "../../../src/types";
    import Asset from "./Asset.svelte";
    import { logger, logDump } from "../logger";
    import { writable } from "svelte/store";
    const print = logger("AssetManager.svelte");
    provideVSCodeDesignSystem().register(allComponents);

    const origin = RequestTarget.assetsManager;

    const messageHandler = new MessageHandler(handleMessageApp, origin);
    const selection = writable();
    const assets = writable([]);
    const tabInfo = writable({});
    let assetGroups = {};
    let appState = AppState.loading;

    const assetsDefaults = {
        material: {
            from: ["res", "defaultMaterial.json"],
            to: ["Materials", "defaultMaterial.json"],
        },
    };

    setContext("stores", { selection, messageHandler });

    function handleMessageApp(data) {
        const { command, payload, target } = data;
        // console.log("assets_manager", data);

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

            case RequestCommand.updateTabInfo:
                processTabInfo(payload);
                break;

            case RequestCommand.updateAppState:
                processAppState(payload);
                break;

            default:
                break;
        }
    }

    async function getAppState() {
        const { payload } = await messageHandler.request({
            target: RequestTarget.extension,
            command: RequestCommand.getAppState,
        });
        processAppState(payload);
    }

    function processAppState(payload) {
        appState = payload.state;
    }

    async function getAssets() {
        const { payload } = await messageHandler.request({
            target: RequestTarget.extension,
            command: RequestCommand.getAssets,
        });

        processAssets(payload);
    }

    async function getLocatization() {
        const { payload } = await messageHandler.request({
            target: RequestTarget.extension,
            command: RequestCommand.getLocalization,
        });

        if (payload) {
            l10n.config({
                contents: payload,
            });
        }
    }

    async function getTabInfo() {
        const { payload } = await messageHandler.request({
            target: RequestTarget.extension,
            command: RequestCommand.getTabInfo,
            payload: {
                viewId: origin,
            },
        });

        processTabInfo(payload);
    }

    function processTabInfo(newTabInfo) {
        print("new tabInfo ", newTabInfo);
        $tabInfo = newTabInfo;
    }

    function sendTabInfo() {
        messageHandler.send({
            command: RequestCommand.updateTabInfo,
            target: RequestTarget.extension,
            payload: {
                viewId: origin,
                value: $tabInfo,
            },
        });
    }

    // const assetGroupKeys = [
    //     ["json_material", "xml_material"],
    //     ["model3d"],
    //     ["image"]
    // ]

    const assetTypeMap = {
        json_material: "material",
        xml_material: "material",
        model3d: "model3d",
        image: "image",
    };

    const assetLocaleLabels = {
        material: "locale.assetManager.assetGroups.material.label",
        model3d: "locale.assetManager.assetGroups.model3d.label",
        image: "locale.assetManager.assetGroups.image.label",
    };

    function processAssets(newAssets) {
        $assets = newAssets.filter((asset) => asset.projectFile);
        print("new project assets count ", $assets.length);
        assetGroups = {};

        $assets.forEach((asset) => {
            const type = assetTypeMap[asset.type];
            if (!type) return;
            if (!(type in $tabInfo)) $tabInfo[type] = true;

            if (!(type in assetGroups))
                assetGroups[type] = { expanded: $tabInfo[type], elements: [] };
            assetGroups[type].elements.push(asset);
        });

        // print("asset groups", assetGroups);
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

    async function processSelection(newSelection) {
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
        // await getLocatization();

        // await getTabInfo();
        // await getSelection();
        // await getAssets();

        await Promise.all([getLocatization(), getSelection(), getTabInfo(), getAssets()]);

        await getAppState();
    }

    init();

    // let skippedInit = false;

    // $: {
    //     if (skippedInit) print("changed selection", $selection);
    // }
</script>

{#if appState === AppState.running}
    {#key $selection}
        {#key $assets}
            {#if Object.keys(assetGroups).length}
                {#each Object.entries(assetGroups) as [groupName, groupData]}
                    <!-- content here -->
                    <vscode-divider class="divider" role="separator" />
                    <div
                        class="group-label"
                        on:click={() => {
                            groupData.expanded = !groupData.expanded;

                            // const tabKey = [groupName].join(".");
                            $tabInfo[groupName] = groupData.expanded;
                            sendTabInfo();
                        }}
                    >
                        <i
                            class="codicon codicon-chevron-{groupData.expanded ? 'down' : 'right'}"
                        />

                        <span>{l10n.t(assetLocaleLabels[groupName])}</span>
                        <!-- {#if groupName === "material"}
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
                    {/if} -->
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
                <p class="empty-assets">{l10n.t("locale.assetManager.emptyAssetsHint")}</p>
            {/if}
        {/key}
    {/key}
{:else}
    <vscode-progress-ring />
{/if}

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

    vscode-divider {
        width: 200vw;
        margin-left: -50vw;
        margin-top: 0;
        /* calc(0px - var(--global-body-padding-left)); */
    }

    p.empty-assets {
        padding-left: var(--global-body-padding-left);
    }
</style>
