<script>
    // https://github.com/EugeneDae/vscode-mac-color-picker - native color picker for macos
    import { createEventDispatcher } from "svelte";
    import * as l10n from "@vscode/l10n";

    // import { onMount } from "svelte";
    import NumberSliderControl from "./NumberSliderControl.svelte";
    import InfoBox from "../components/InfoBox.svelte";

    export let label, value, path, params;
    let infoVisible = false;
    if (value == null) value = params.defValue;
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

    function onChanged() {
        if (path == undefined) return;
        dispatch("changed", [
            {
                value,
                path,
            },
        ]);
    }
</script>

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
    <input
        class="color"
        type="color"
        bind:value={color}
        on:change={(e) => {
            // console.log("color picker on change!!!!");
            // color = e.target.value;
            hexToRGB();
            onChanged();
        }}
    />
    <InfoBox bind:visible={infoVisible} info={params.info} />
</span>

{#if params.alpha}
    <NumberSliderControl
        label={l10n.t("locale.controls.colorPicker.alpha.label")}
        params={{
            min: 0,
            max: 1,
            defValue: 1.0,
            valueTemplate: (val) => Math.floor(val * 100),
            valueLabel: "%",
            info: {
                infoList: "locale.controls.colorPicker.alpha.infoList",
            },
        }}
        bind:value={alpha}
        on:changed={(e) => {
            // <!-- bind:value={alpha} -->
            // alpha = e.detail.value;
            // console.log("color alpha slider changed", alpha, e);
            hexToRGB();
            onChanged();
        }}
    />
{/if}

<style>
    * {
        margin: unset;
        padding: unset;
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
    }

    span.label {
        padding: var(--global-margin);
        padding-left: var(--global-body-padding-left);
        padding-right: var(--global-label-control-gap);
        /* margin: var(--global-margin) 0 var(--global-margin) 0; */
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

    input.color {
        -webkit-appearance: none;
        /* -moz-appearance: none; */
        appearance: none;
        /* display: block; */
        margin: unset;
        background-color: transparent; /* var(--input-background); */
        border: none;
        /* padding: 0; */
        /* border-radius: 4px; */
        border-radius: var(--global-border-raduis);
        height: var(--global-block-height);
        height: 100%;
    }

    input[type="color"] {
        appearance: none;
        -moz-appearance: none;
        -webkit-appearance: none;
        background: none;
        border: 0;
        cursor: pointer;
        height: var(--global-block-height-borded);
        width: 100%;
        outline: none;
        padding: 0;
    }

    ::-webkit-color-swatch-wrapper {
        padding: 0;
    }

    ::-webkit-color-swatch {
        border: 0;
        border-radius: var(--global-border-raduis);
    }

    /* input.alpha {
    display: inline-block;
    flex: 1 0 0px;
  } */
</style>
