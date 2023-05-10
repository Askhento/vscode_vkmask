<script lang="ts">
  //   import { extname } from "path";
  //   rollup-plugin-polyfill-node will help with node, or use custom function to retrieve extension
  import { assets } from "../stores.js";

  export let label = "empty",
    value,
    params;

  let extensions;
  let fileTypes;
  $: {
    extensions = new Set(params.extensions);
    fileTypes = params.types ? new Set(params.types) : undefined;
  }

  function filterAsset(asset) {
    if (fileTypes !== undefined) {
      return fileTypes.has(asset.type);
    } else {
      // <!-- will not work with more that 3 char extensions --
      return extensions.has(asset.path.slice(-3));
    }
  }
</script>

<div class="control-wrapper">
  {#if label !== undefined}
    <span class="label">{label}</span>

    <!-- <input class="value" type="text" bind:value /> -->
    <!-- add REd color if file not found in options -->
    <vscode-dropdown
      position="above"
      {value}
      on:change={(e) => {
        value = e.target.value;
      }}
    >
      {#each $assets as asset, i}
        {#if filterAsset(asset)}
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
  .control-wrapper {
    position: relative;
    display: flex;
  }

  /* select.options {
    flex-grow: 1;
  } */
  span.label {
    flex-grow: 1;
  }
</style>
