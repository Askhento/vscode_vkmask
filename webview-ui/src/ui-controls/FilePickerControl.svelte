<script lang="ts">
  //   import { extname } from "path";
  //   rollup-plugin-polyfill-node will help with node, or use custom function to retrieve extension
  import { assets } from "../stores.js";

  export let label = "empty",
    value,
    params;

  let extensions;
  // ,
  // type,
  // files;
  $: extensions = new Set(params.extensions);
  //   $: console.log(text);
</script>

<div class="text-control-wrapper">
  {#if label}
    <span class="label">{label}</span>
    <!-- <input class="value" type="text" bind:value /> -->

    <vscode-dropdown
      {value}
      on:change={(e) => {
        value = e.target.value;
      }}
    >
      {#each $assets as asset, i}
        <!-- will not work with more that 3 char extensions -->
        {#if extensions.has(asset.path.slice(-3))}
          <vscode-option>{asset.path}</vscode-option>
        {/if}
      {/each}
    </vscode-dropdown>
  {/if}
</div>

<style>
  * {
    margin: 5px;
  }
  .text-control-wrapper {
    position: relative;
    display: flex;
  }

  select.options {
    flex-grow: 1;
  }
  span.label {
    flex-grow: 1;
  }
</style>
