<script lang="ts">
    import * as l10n from "@vscode/l10n";
    import { createEventDispatcher } from "svelte";
    // import { onMount, tick } from "svelte";
    import { logger } from "../logger";
    const print = logger("MainScriptControl.svelte");
    import { getContext } from "svelte";
    import { RequestCommand, RequestTarget } from "src/types";
    import InfoBox from "../components/InfoBox.svelte";
    //@ts-expect-error
    const { assets, settings, messageHandler } = getContext("stores");

    export let label = "empty",
        value,
        params,
        path;

    let waiting = false;
    let scriptPath = "";
    let infoVisible = false;
    let scriptAsset = null;

    $: {
        checkScriptExists();
        $assets;
    }

    async function uploadScript() {
        waiting = true;
        const { payload } = await messageHandler.request({
            command: RequestCommand.getUploadedAsset,
            target: RequestTarget.extension,
            payload: {
                extensions: [["main.as"]],
                to: [""],
            },
        });

        if (payload) {
            value = payload;
            print("asset", value);
        }

        waiting = false;
    }

    async function createScript() {
        waiting = true;
        const { payload } = await messageHandler.request({
            command: RequestCommand.getCreatedAssets,
            target: RequestTarget.extension,
            payload: { from: ["res", "empty-project", "main.as"], to: ["main.as"] },
        });

        if (payload) {
            value = payload;
            print("created asset : ", value);
        }

        waiting = false;
    }

    function checkScriptExists() {
        // console.log("assets", $assets, value);
        const assetIndex = $assets.findIndex((element) => {
            return element.path === value;
        });

        // console.log("mainscript", assetIndex);
        if (assetIndex < 0) {
            scriptAsset = null;
            return;
        }

        scriptAsset = $assets[assetIndex];
    }

    async function removeScript() {
        waiting = true;

        // // !!!! only if asset exist
        // await messageHandler.request({
        //     command: RequestCommand.removeAsset,
        //     target: RequestTarget.extension,
        //     payload: [value],
        // });

        value = null;
        waiting = false;
    }

    function getScriptUri() {
        let scriptUri = {
            scheme: "file",
            path: scriptAsset.absPath,
            authority: "",
        };
        return `command:vscode.open?${encodeURIComponent(JSON.stringify(scriptUri))}`;
    }

    const dispatch = createEventDispatcher();
    $: {
        dispatch("changed", [
            {
                value,
                path,
            },
        ]);
    }
</script>

{#if label !== undefined}
    <span
        class="label"
        title={l10n.t(label)}
        on:mouseleave={() => {
            infoVisible = false;
        }}
        on:mouseover={() => {
            infoVisible = true;
        }}><span>{l10n.t(label)}</span></span
    >

    <span
        class="control-wrapper"
        on:mouseleave={() => {
            infoVisible = false;
        }}
        on:mouseover={() => {
            infoVisible = true;
        }}
    >
        <div class="value-text">
            {#if value == null}
                <span class="text-center"
                    >{l10n.t("locale.projectManager.mainScript.ActionMissingScript")}</span
                >
            {:else if scriptAsset}
                <vscode-link href={getScriptUri()}>{value}</vscode-link>
            {:else}
                <span class="text-center missing-file">{value}</span>
            {/if}

            {#if waiting}
                <vscode-progress-ring />
            {/if}
        </div>
        <vscode-button
            appearance={value == null ? "primary" : "secondary"}
            disabled={waiting}
            class="upload-button"
            on:click|stopPropagation={() => {
                uploadScript();
            }}
        >
            <span class="btn-text"
                >{l10n.t("locale.projectManager.mainScript.buttonUpload.label")}</span
            >
        </vscode-button>
        <vscode-button
            appearance={value == null ? "primary" : "secondary"}
            disabled={waiting || value != null}
            class="create-button"
            on:click|stopPropagation={() => {
                createScript();
            }}
        >
            <span class="btn-text"
                >{l10n.t("locale.projectManager.mainScript.buttonCreate.label")}</span
            >;
        </vscode-button>
        <vscode-button
            disabled={value == null || waiting}
            appearance="secondary"
            class="remove-button"
            on:click|stopPropagation={() => {
                removeScript();
            }}
        >
            <span class="btn-text"
                >{l10n.t("locale.projectManager.mainScript.buttonRemove.label")}</span
            >
        </vscode-button>
        <InfoBox info={params.info} visible={infoVisible} />
    </span>
{/if}

<style>
    * {
        margin: var(--global-margin);
        /* padding: 0; */
        box-sizing: border-box;
    }

    span.label {
        padding: var(--global-margin);
        padding-left: var(--global-body-padding-left);
        padding-right: var(--global-label-control-gap);
        margin: var(--global-margin) 0 var(--global-margin) 0;

        /* height: var(--global-block-height); */
        height: 100%;
        display: flex;
        justify-content: var(--label-justify);
    }

    span.label > span {
        margin: 0;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }

    span.control-wrapper {
        padding-right: var(--global-body-padding-right);
        margin: unset;
        position: relative;
        display: flex;
        flex-direction: column;
    }

    .value-text {
        height: var(--global-block-height);
        display: flex;
        justify-items: center;
        position: relative;
    }

    .value-text > span {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }

    .text-center {
        height: 1rem;
    }

    .missing-file {
        color: var(--missing-asset-color);
    }

    vscode-progress-ring {
        position: absolute;
        left: calc(100% - var(--global-block-height));
        top: 0;
        margin: unset;
        height: var(--global-block-height);
        width: var(--global-block-height);
    }

    vscode-button {
        height: var(--global-block-height);
    }

    vscode-button::part(content) {
        min-width: 0;
    }

    vscode-button::part(control) {
        overflow: hidden;
    }

    .btn-text {
        margin: unset;
        padding: unset;
        /* display: inline-block; */
        width: 100%;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }
</style>
