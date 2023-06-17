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
    color = "#" + componentToHex(value[0]) + componentToHex(value[1]) + componentToHex(value[2]);
    if (params.alpha !== undefined) alpha = value[3];
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

  //
  //   $: console.log(color, alpha);
  //   $: console.log(value);
  //   $: if (color !== undefined) hexToRGB();
  $: if (alpha !== undefined && alpha !== value[3]) hexToRGB();

  //   function onAlphaChange() {}
  rgbToHex();
  onMount(() => {
    // console.log("mount", value);
    // if (value === undefined || value.length === 0) value = params.defValue;

    rgbToHex();
    // console.log("alpha picker", alpha, params);
  });

  const dispatch = createEventDispatcher();
  $: if (path !== undefined) {
    dispatch("changed", {
      value,
      path,
    });
  }
</script>

<div class="color-control-wrapper">
  {#if label}
    <span class="label">{label}</span>
    <!-- <span class="color">{value}</span> -->
    <input
      class="color"
      type="color"
      value={color}
      on:change={(e) => {
        console.log("color picker on change!!!!");
        color = e.target.value;
        hexToRGB();
      }}
    />
    {#if params.alpha}
      <NumberSliderControl
        label={"alpha"}
        bind:value={alpha}
        params={{ min: 0, max: 1, defValue: 0.0 }}
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
  {/if}
</div>

<style>
  * {
    margin: 10px;
  }
  .color-control-wrapper {
    position: relative;
    display: flex;
    justify-content: start;
  }

  /* span.color {
    display: inline-block;
    flex: 1 0 0px;
  } */
  span.label {
    display: inline-block;
    flex: 1 0 0px;
  }

  input.color {
    display: inline-block;
    background-color: var(--input-background);
    border: none;
    border-radius: 5px;
    height: 40px;
    width: 40px;
    /* flex: 1 0 0px; */
  }

  /* input.alpha {
    display: inline-block;
    flex: 1 0 0px;
  } */
</style>
