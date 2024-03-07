<script lang="ts">
    import * as l10n from "@vscode/l10n";

    import { createEventDispatcher } from "svelte";
    import InfoBox from "../components/InfoBox.svelte";

    export let label, value, path, params;
    let infoVisible = false;

    let steps = params.steps ?? 100;
    // console.log("steps", steps, params);
    let step = (params.max - params.min) / steps;

    value = value ?? params.defValue;
    // value = 0.5;

    // $: console.log("from slider", params);

    const dispatch = createEventDispatcher();

    function sendValue() {
        // console.log("numberSlider change : ", value, path);
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
    <!-- <div class="overlay-wrapper"> -->
    <div class="display-value">
        <span>{params.valueTemplate?.(value) ?? value}</span>
    </div>
    {#if params.valueLabel}
        <div class="value-label">
            <span class="value-overlay">{l10n.t(params.valueLabel)}</span>
        </div>
    {/if}
    <!-- </div> -->
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
    <InfoBox visible={infoVisible} info={params.info} />
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
        padding-right: var(--global-body-padding-right);
        margin: unset;
        position: relative;
        display: flex;
        justify-content: center;
        align-content: center;
    }

    div.display-value {
        pointer-events: none;
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        margin: unset;
        padding-right: var(--global-body-padding-right);

        display: flex;
        justify-content: center;
        align-items: center;
    }

    div.value-label {
        pointer-events: none;
        color: var(--vscode-descriptionForeground);

        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        margin: unset;
        padding-right: var(--global-body-padding-right);
        display: flex;
        justify-content: end;
        align-items: center;
    }
    .value-overlay {
        /* margin: unset; */
        padding-right: var(--global-margin);
    }

    span.label {
        padding: var(--global-margin);
        padding-left: var(--global-body-padding-left);
        padding-right: var(--global-label-control-gap);
        margin: var(--global-margin) 0 var(--global-margin) 0;
        height: 100%;

        /* justify-self: var(--label-justify); */
        height: var(--global-block-height);
        display: flex;
        justify-content: var(--label-justify);
    }

    span.label > span {
        margin: 0;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }

    input.slider {
        display: block;
        margin: 0;
        margin: var(--global-margin);

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
