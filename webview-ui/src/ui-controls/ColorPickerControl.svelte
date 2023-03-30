<script lang="ts">
  export let label, value, params;

  let color, alpha;

  if (value === undefined) value = params.default;

  // console.log(TextureObject._def.typeName);

  function roundColor(num) {
    return Math.round((num + Number.EPSILON) * 100) / 100;
  }
  function hexToRGB(hex, alpha) {
    if (!hex) return;
    var r = parseFloat((parseInt(hex.slice(1, 3), 16) / 255).toFixed(2)),
      g = parseFloat((parseInt(hex.slice(3, 5), 16) / 255).toFixed(2)),
      b = parseFloat((parseInt(hex.slice(5, 7), 16) / 255).toFixed(2));

    if (alpha) {
      return [r, g, b, alpha];
    } else {
      return [r, g, b];
    }
  }

  $: value = hexToRGB(color, alpha);
</script>

<div class="color-control-wrapper">
  {#if label}
    <span class="label">{label}</span>
    <!-- <span class="color">{value}</span> -->
    <input class="color" type="color" bind:value={color} />
    {#if params.alpha}
      <input
        class="alpha"
        type="range"
        bind:value={alpha}
        min="0"
        max="1"
        step="0.02"
      />
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

  input.alpha {
    display: inline-block;
    flex: 1 0 0px;
  }
</style>
