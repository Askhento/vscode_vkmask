<script lang="ts">
    import * as l10n from "@vscode/l10n";

    import { createEventDispatcher } from "svelte";

    export let label, value, path, params;

    let steps = params.steps ?? 100;
    // console.log("steps", steps, params);
    let step = (params.max - params.min) / steps;

    value = value ?? params.defValue;
    // value = 0.5;

    // $: console.log("from slider", params);

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
</script>

<!-- {#if label} -->
<!-- <span class="control-wrapper"> -->
<!-- <input
        class="number"
        type="number"
        bind:value
        on:keydown={({ key, target }) => {
            // console.log(key);
            if (key === "Enter") {
                displayValue = value;
                //@ts-expect-error
                target.blur();
                sendValue();
            } else if (key === "Escape") {
                value = displayValue;
                //@ts-expect-error
                target.blur();
            }
        }}
    /> -->
<span class="label" title={l10n.t(label)}><span>{l10n.t(label)}</span></span>

<span class="control-wrapper">
    <div class="display-value">{params.valueTemplate?.(value) ?? value}</div>
    {#if params.valueLabel}
        <div class="value-label">{params.valueLabel}</div>
    {/if}
    <input
        class="slider"
        type="range"
        bind:value
        on:mouseup={() => {
            sendValue();
        }}
        min={params.min ?? 0}
        max={params.max ?? 1}
        {step}
    />
</span>

<!-- </span> -->

<!-- {/if} -->

<style>
    * {
        margin: var(--global-margin);
        padding: 0;
        /* padding: var(--global-margin); */
        /* margin: 0; */
        box-sizing: border-box;
    }
    /* .number-control-wrapper {
        position: relative;
        display: flex;
        justify-content: start;
    } */

    /*     
    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    } */

    .control-wrapper {
        position: relative;
        display: flex;
        justify-content: center;
    }

    div.display-value {
        position: absolute;
        /* left: calc(50%); */
        /* width: 100%; */
        /* text-align: center; */
        /* top: calc(50% - 0.5rem - var(--global-margin)); */
        /* vertical-align: middle; */
        /* width: 800px; */
        pointer-events: none;
    }

    div.value-label {
        position: absolute;
        /* left: calc(50%); */
        width: 100%;
        text-align: end;
        top: calc(50% - 0.5rem - var(--global-margin));
        right: var(--global-margin);
        /* vertical-align: middle; */
        /* width: 800px; */
        white-space: pre;
        pointer-events: none;
        color: var(--vscode-descriptionForeground);
    }

    span.label {
        padding-left: var(--global-body-padding-left);

        /* justify-self: var(--label-justify); */
        height: var(--global-block-height);
        display: flex;
        justify-content: var(--label-justify);
    }

    span.label > span {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }

    input.slider {
        display: block;
        margin: 0;
        /* flex: 2 0 0px; */
    }

    input[type="range"] {
        -webkit-appearance: none;
        appearance: none;
        background: var(--input-background);
        cursor: pointer;
        width: 100%;
        /* width: 150px; */
        height: var(--global-block-height);
        /* height: calc(var(--global-box-height) * 1px); */
        /*  slider progress trick  */
        /* overflow: hidden; */
        border-radius: var(--global-border-raduis);
        /* border: 2px solid var(--vscode-widget-border); */
    }
    /***** Track Styles *****/
    /***** Chrome, Safari, Opera, and Edge Chromium *****/
    input[type="range"]::-webkit-slider-runnable-track {
        /* background: #053a5f; */
        height: 100%;
        /* border-radius: var(--globel-border-raduis); */
        /* color: var(--input-foreground); */
        overflow: hidden;

        /* background: var(--input-background); */
        border-radius: var(--global-border-raduis);
        border: var(--global-border-width) solid var(--vscode-widget-border);
    }

    input[type="range"]::-webkit-slider-thumb {
        -webkit-appearance: none; /* Override default look */
        appearance: none;
        /* margin-top: -7px; Centers thumb on the track */
        /* background-color: var(--input-foreground); */
        /* border-color: wheat; */

        height: 0px;
        width: 0px;
        /* border-radius: 10px; */
        /* opacity: 0; */
        /* display: none; */
        /*  slider progress trick  */
        box-shadow: -400px 0 0 400px var(--vscode-badge-background);
    }

    /* var(--vscode-badge-background) */

    input[type="range"]:focus {
        outline: none;
    }
    /* **** Chrome, Safari, Opera, and Edge Chromium ****
    input[type="range"]:focus::-webkit-slider-thumb {
        border: 1px solid var(--focus-border);
        outline: 2px solid var(--focus-border);
        outline-offset: 0.125rem;
    } */
</style>
