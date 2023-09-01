<script lang="ts">
    import { createEventDispatcher, onMount, tick } from "svelte";

    export let label = "empty",
        value,
        path,
        params;

    let step = 0.01,
        displayValue = value;

    // $: console.log("from slider", params);

    $: step = (params.max - params.min) / 20.0;

    const dispatch = createEventDispatcher();

    function sendValue() {
        console.log("should send value");
        dispatch("changed", {
            value,
            path,
        });
    }
</script>

<!-- {#if label} -->
<span class="label">{label}</span>
<span class="control-wrapper">
    <input
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
    />
    <input
        class="slider"
        type="range"
        bind:value
        on:mouseup={() => {
            displayValue = value;
            sendValue();
        }}
        min={params.min || 0}
        max={params.max || 1}
        {step}
    />
</span>

<!-- {/if} -->

<style>
    * {
        margin: var(--global-margin);
    }
    /* .number-control-wrapper {
        position: relative;
        display: flex;
        justify-content: start;
    } */

    .control-wrapper {
        /* display: inline-block; */
        /* flex-grow: 1; */
        /* width: 50%; */
    }
    input.number {
        display: block;
        /* margin-left: auto; */
        max-height: 1em;
        text-align: end;
    }
    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }
    span.label {
        justify-self: var(--label-justify);
    }

    input.slider {
        display: block;
        margin-left: auto;

        /* flex: 2 0 0px; */
    }

    input[type="range"] {
        -webkit-appearance: none;
        appearance: none;
        background: transparent;
        cursor: pointer;
        /* width: 100%; */
        width: 150px;
    }
    /***** Track Styles *****/
    /***** Chrome, Safari, Opera, and Edge Chromium *****/
    input[type="range"]::-webkit-slider-runnable-track {
        /* background: #053a5f; */
        height: 6px;
        border-radius: 3px;
        /* color: var(--input-foreground); */
        background: var(--input-background);
    }

    input[type="range"]::-webkit-slider-thumb {
        -webkit-appearance: none; /* Override default look */
        appearance: none;
        margin-top: -7px; /* Centers thumb on the track */
        background-color: var(--input-foreground);
        /* border-color: wheat; */
        /* border: 1px solid var(--button-icon-background); */

        height: 20px;
        width: 20px;
        border-radius: 10px;
    }
    input[type="range"]:focus {
        outline: none;
    }
    /***** Chrome, Safari, Opera, and Edge Chromium *****/
    input[type="range"]:focus::-webkit-slider-thumb {
        border: 1px solid var(--focus-border);
        outline: 2px solid var(--focus-border);
        outline-offset: 0.125rem;
    }
</style>
