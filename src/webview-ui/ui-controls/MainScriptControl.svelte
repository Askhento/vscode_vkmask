<script lang="ts">
    import * as l10n from "@vscode/l10n";
    import { createEventDispatcher } from "svelte";
    // import { onMount, tick } from "svelte";
    import { logger } from "../logger";
    const print = logger("MainScriptControl.svelte");
    import { getContext } from "svelte";
    import { RequestCommand, RequestTarget } from "src/types";
    import InfoBox from "../components/InfoBox.svelte";
    import Loading from "../components/Loading.svelte";
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
            onChanged();
            // print("asset", value);
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
            onChanged();
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
        onChanged();
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
    function onChanged() {
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
        on:mouseenter={() => {
            infoVisible = true;
        }}><span>{l10n.t(label)}</span></span
    >

    <span
        class="control-wrapper"
        on:mouseleave={() => {
            infoVisible = false;
        }}
        on:mouseenter={() => {
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
            >
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
        {#if waiting}
            <!-- <div class="waiting">
                <vscode-progress-ring />
            </div> -->
            <Loading scale={2} dark={true} />
        {/if}
        <InfoBox info={params.info} bind:visible={infoVisible} />
    </span>
{/if}

<style>
    * {
        margin: 0;
        /* padding: 0; */
        box-sizing: border-box;
    }

    span.label {
        padding: var(--global-margin);
        padding-left: var(--global-body-padding-left);
        padding-right: var(--global-label-control-gap);

        height: var(--global-block-height);
        display: flex;
        justify-content: var(--label-justify);
        align-items: var(--label-align);
    }

    span.label > span {
        height: fit-content;

        margin: 0;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }

    span.control-wrapper {
        padding-right: var(--global-body-padding-right);
        padding-bottom: var(--global-margin);
        padding-top: var(--global-margin);
        padding-left: var(--global-margin);

        margin: unset;
        position: relative;
        display: flex;
        row-gap: var(--global-margin);
        flex-direction: column;
    }

    .value-text {
        height: var(--global-block-height-borded);
        display: flex;
        align-items: center;
        position: relative;
    }

    .value-text > span {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }

    vscode-link {
        height: fit-content;
    }

    .text-center {
        height: 1rem;
    }

    .missing-file {
        color: var(--missing-asset-color);
    }

    vscode-button {
        height: var(--global-block-height-borded);
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
        height: fit-content;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }
</style>
