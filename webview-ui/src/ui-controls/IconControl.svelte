<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { logger } from "../logger";
    const print = logger("IconControl.svelte");
    import { getContext } from "svelte";
    import { RequestCommand, RequestTarget } from "src/types";
    //@ts-expect-error
    const { assets, settings, messageHandler } = getContext("stores");

    const missingIconData =
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAYAAACpSkzOAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAKDSURBVHgB3VVdbtNAEJ5dr+PWkYhRfqAJglRKW27FGbhBuUGvhAQXaAWCtigpCkkpqHUeYlO762XHzc6ugxAvxA/9pJU9++14x/PL5vOrV0zBUQEqms1nsFgswGA4HML21jbJp+dnIKUEUACe8GB/NCIuTX/B5OKC5FbUgv7THWAAE2DsUIBSh1ovYqsDCqpgzrtSqlyWY5Vzak17xQ6ZUkccX2DDwB8RyyQB18Jms0nyXZ5DUlgrt4KAzPQ8DxKta9g8zyq6vu+XvIGYfLV+HfT70H/UInmsfZ6k9vDB3j4IfQECY/Xp7JS4MAxh9/kLkmMd67HzbQ41YXMXsTXx5OQjBaHAvCkKIjEObiLJQlpFxoBzaydmY+HoIudmpei02yR803UUO3W0q+sodOros47JnZRkxEsdM4MkTXVMJyRHUQQDXUd0MdSE2i5ib9+9pyh0211ohtZVs8tLyHR9mDg9Gwyc9C5gOptSCMPtEHqdLuliDV39/GFaBog8y+2tejX8BslKF6vLI0cXcQmZw+Ui17xvL8K93PK1uU4E2FZWQDfcZrck+76AQNo/zLIMpHdvG3aGIGiQWznjFV1ssEHD6rL57DvF6F/pjS1HrtJbCAEHoz3i/kjvVgsGO32SH2B6Hx9/UCYF8ekONq7bTNlUzNZ6/3LnHPv70MR9Ueb6Cjgmov84JjDmZDTUhPpidP5lTK5dLpfgjvbHOkV9pxaub67L1mPQ7XToHbvATRyTjF0CO7iBaOoeZRDrg+6cf9LrVepoOp3SmMBYuboJpBXdhjbS5bkeTjFsHhOuCvlap/SkUAVNTbOwqeK+WdyzHNd/5HKl1Y4ufuueU7EevW9+A/ImPneuprflAAAAAElFTkSuQmCC";

    export let label = "empty",
        value,
        params,
        path;

    let waiting = false;
    let iconAsset = null;

    $: {
        checkIconExists();
        $assets;
    }

    async function uploadIcon() {
        waiting = true;
        const { payload } = await messageHandler.request({
            command: RequestCommand.getUploadedAsset,
            target: RequestTarget.extension,
            payload: [
                ["*.png", "*.png"],
                ["*.jpg", "*.jpg"],
            ],
        });

        if (payload) {
            value = payload;
            print("asset", value);
            checkIconExists();
        }

        waiting = false;
    }

    // async function createIcon() {
    //     waiting = true;
    //     const { payload } = await messageHandler.request({
    //         command: RequestCommand.getCreatedAssets,
    //         target: RequestTarget.extension,
    //         payload: { from: ["res", "empty-project", "icon.png"], to: ["icon.png"] },
    //     });

    //     if (payload) {
    //         value = payload;
    //         print("created asset : ", value);
    //     }

    //     waiting = false;
    // }

    function checkIconExists() {
        // console.log("assets", $assets, value);
        const assetIndex = $assets.findIndex((element) => {
            return element.path === value;
        });

        // console.log("mainicon", assetIndex);
        if (assetIndex < 0) {
            iconAsset = null;
            return;
        }

        iconAsset = $assets[assetIndex];
    }

    async function removeIcon() {
        waiting = true;

        await messageHandler.request({
            command: RequestCommand.removeAsset,
            target: RequestTarget.extension,
            payload: [value],
        });

        value = null;
        waiting = false;
    }

    function getIconUri() {
        let iconUri = {
            scheme: "file",
            path: iconAsset.absPath,
            authority: "",
        };
        return `command:vscode.open?${encodeURIComponent(JSON.stringify(iconUri))}`;
    }

    const dispatch = createEventDispatcher();
    $: {
        dispatch("changed", {
            value,
            path,
        });
    }
</script>

{#if label !== undefined}
    <span class="label"><span>{label}</span></span>

    <span class="control-wrapper">
        <!-- <div class="value-text">
            {#if value == null}
                <span class="text-center">Upload or create a scirpt file</span>
            {:else if iconAsset}
                <vscode-link href={getIconUri()}>{value}</vscode-link>
            {:else}
                <span class="text-center missing-file">{value}</span>
            {/if}

        
        </div> -->

        <span>
            {#if iconAsset && iconAsset.preview}
                <a href={getIconUri()}>
                    <img src={"data:image/png;base64," + iconAsset.preview} class="file-preview" />
                </a>
            {:else}
                <img src={missingIconData} class="file-preview" />
            {/if}
        </span>

        {#if value == null}
            <vscode-button
                appearance={"primary"}
                disabled={waiting}
                class="upload-button"
                on:click|stopPropagation={() => {
                    uploadIcon();
                }}
            >
                Upload icon
            </vscode-button>
        {:else}
            <vscode-button
                disabled={value == null || waiting}
                appearance="secondary"
                class="remove-button"
                on:click|stopPropagation={() => {
                    removeIcon();
                }}
            >
                Remove icon
            </vscode-button>
        {/if}
        <!-- <vscode-button
            appearance={value == null ? "primary" : "secondary"}
            disabled={waiting}
            class="create-button"
            on:click|stopPropagation={() => {
                createIcon();
            }}
        >
            Create icon
        </vscode-button> -->
        {#if waiting}
            <vscode-progress-ring />
        {/if}
    </span>
{/if}

<style>
    * {
        margin: var(--global-margin);
        /* padding: 0; */
        box-sizing: border-box;
    }

    a {
        margin: unset;
    }

    span.label {
        justify-self: var(--label-justify);
        height: var(--global-block-height);
        display: flex;
        justify-content: center;
    }

    span.control-wrapper {
        margin: unset;
        position: relative;
        display: flex;
        flex-direction: row;
    }

    .value-text {
        height: var(--global-block-height);
        display: flex;
        justify-items: center;
        position: relative;
    }

    img.file-preview {
        display: inline-block;
        height: var(--global-block-height);
        width: var(--global-block-height);
        margin: unset;
    }

    vscode-progress-ring {
        position: absolute;
        left: calc(100%);
        top: var(--global-margin);
        margin: unset;
        height: var(--global-block-height);
        width: var(--global-block-height);
    }

    vscode-button {
        overflow: hidden;
        text-overflow: ellipsis;
        height: var(--global-block-height);
        flex-grow: 1;
    }
</style>
