<script lang="ts">
    import * as l10n from "@vscode/l10n";

    import { createEventDispatcher } from "svelte";

    export let label = "empty",
        value,
        path;

    let displayValue = value;
    //   $: console.log(text);
    // console.log("text contorl value : ", value);

    const dispatch = createEventDispatcher();

    function sendValue() {
        // console.log("should send value");
        dispatch("changed", [
            {
                value,
                path,
            },
        ]);
    }

    // on:change={(e) => {
    //         if (e.target) {
    //             value = e.target.value;
    //         }
    //     }}
</script>

{#if label}
    <span class="label" title={l10n.t(label)}><span>{l10n.t(label)}</span></span>
    <div class="control-wrapper">
        <vscode-text-field
            class="value"
            type="text"
            {value}
            on:keydown={({ key, target }) => {
                // console.log(key);
                if (key === "Enter") {
                    value = target.value;
                    target.blur();
                    sendValue();
                } else if (key === "Escape") {
                    target.value = value;
                    target.blur();
                }
            }}
        />
    </div>
{/if}

<style>
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    .control-wrapper {
        padding-right: var(--global-body-padding-right);
        padding-bottom: var(--global-margin);
        padding-top: var(--global-margin);
        padding-left: var(--global-margin);

        margin: unset;
        position: relative;
        display: flex;
        justify-content: center;
        align-content: center;
        height: var(--global-block-height);
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

        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }

    vscode-text-field {
        /* margin: unset; */
        height: 100%;
        /* height: var(--global-block-height); */
        text-align: center;
        /* padding-right: var(--global-body-padding-right); */
    }

    vscode-text-field::part(root) {
        min-width: 0;
        width: 100%;
    }

    /* input {
        color: var(--vscode-editor-foreground);
        background-color: var(--vscode-input-background);
        border-width: 0;
        height: calc(var(--input-height) * 1px);
    } */
</style>
