<script>
    // https://github.com/EugeneDae/vscode-mac-color-picker - native color picker for macos
    import { createEventDispatcher } from "svelte";

    import { onMount } from "svelte";
    import NumberSliderControl from "./NumberSliderControl.svelte";

    export let label, value, path, params;

    let color, alpha;

    // console.log(TextureObject._def.typeName);
    function componentToHex(c) {
        var hex = Math.round(c * 255).toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }

    function rgbToHex() {
        // if (value === undefined) return;
        //! have to limit 0 - 1 range
        color =
            "#" + componentToHex(value[0]) + componentToHex(value[1]) + componentToHex(value[2]);
        if (params.alpha != undefined) alpha = value[3];
        // console.log("RGBtoHEX ", params, value, alpha);
    }

    //   function roundColor(num) {
    //     return Math.round((num + Number.EPSILON) * 100) / 100;
    //   }
    function hexToRGB() {
        // if (!color) {
        //     return params.default;
        // }

        var r = parseFloat((parseInt(color.slice(1, 3), 16) / 255).toFixed(2)),
            g = parseFloat((parseInt(color.slice(3, 5), 16) / 255).toFixed(2)),
            b = parseFloat((parseInt(color.slice(5, 7), 16) / 255).toFixed(2));

        // console.log("h2rgb", color);
        if (params.alpha !== undefined && alpha !== undefined) {
            value = [r, g, b, alpha];
        } else {
            value = [r, g, b];
        }
    }

    rgbToHex();
    const dispatch = createEventDispatcher();

    function onChange() {
        if (path == undefined) return;
        dispatch("changed", {
            value,
            path,
        });
    }
</script>

<span class="label">{label}</span>
<!-- <span class="color">{value}</span> -->
<div class="color-control-wrapper">
    <input
        class="color"
        type="color"
        value={color}
        on:change={(e) => {
            console.log("color picker on change!!!!");
            color = e.target.value;
            hexToRGB();
            onChange();
        }}
    />
</div>
{#if params.alpha}
    <NumberSliderControl
        label={"alpha"}
        params={{ min: 0, max: 1, defValue: 0.0 }}
        value={alpha}
        on:changed={(e) => {
            // <!-- bind:value={alpha} -->
            console.log("color alpha slider changed", alpha);
            alpha = e.detail.value;
            hexToRGB();
            onChange();
        }}
    />
    <!-- <input
        class="alpha"
        type="range"
        bind:value={alpha}
        min="0"
        max="1"
        step="0.02"
      /> -->
{/if}

<style>
    .color-control-wrapper {
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: start;
    }

    /* span.color {
    display: inline-block;
    flex: 1 0 0px;
  } */
    span.label {
        justify-self: var(--label-justify);
    }

    input.color {
        display: block;
        background-color: var(--input-background);
        border: none;
        border-radius: 2px;
        height: var(--global-block-height);
        width: 100%;
        /* height: 40px; */
        /* width: 40px; */
        /* flex: 1 0 0px; */
    }

    /* input.alpha {
    display: inline-block;
    flex: 1 0 0px;
  } */
</style>
