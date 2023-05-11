<script lang="ts">
  import { logger } from "../logger";
  const print = logger("FilePickerControl.svelte");

  import { assets } from "../stores.js";

  export let label = "empty",
    value,
    params;

  let extensions;
  let fileTypes;
  let filteredAssets;
  let searchValue = "";
  let dropdownOpened = false;
  let dropdown;
  let controlElement;
  let focused;
  $: {
    extensions = new Set(params.extensions);
    print("new extensions", extensions);
    fileTypes = params.types ? new Set(params.types) : undefined;
    searchValue = searchValue;
    filteredAssets = $assets.filter(filterAsset);
  }
  $: {
    // print("filterd", filteredAssets);
  }

  $: {
    if (dropdown) {
      controlElement = dropdown.shadowRoot.querySelector(
        "div.control div slot"
      );
    }
  }

  function filterAsset(asset) {
    const assetPath = asset.path.toLowerCase();
    if (searchValue.length > 0 && !assetPath.match(searchValue.toLowerCase())) {
      return false;
    }
    if (fileTypes !== undefined) {
      return fileTypes.has(asset.type);
    } else {
      const extension = assetPath.split(".").at(-1);
      return extensions.has(extension);
    }
  }
</script>

<div class="control-wrapper">
  {#if label !== undefined}
    <span class="label">{label}</span>

    <!-- <input class="value" type="text" bind:value /> -->
    <!-- add REd color if file not found in options -->
    <span class="dropdown-wrapper">
      <vscode-dropdown
        class="dropdown"
        position="above"
        open={dropdownOpened}
        bind:this={dropdown}
        on:blur={(e) => {
          searchValue = "";
          controlElement.innerText = value;
          dropdownOpened = false;
        }}
        on:keydown={(e) => {
          if (e.key.length === 1) {
            //// character key
            searchValue += e.key;
            controlElement.innerText = searchValue;
            dropdownOpened = true;
          } else {
            switch (e.key) {
              case "Enter":
                value = filteredAssets.length
                  ? dropdown.getAttribute("current-value")
                  : searchValue;
                searchValue = "";
                controlElement.innerText = value;
                dropdownOpened = false;
                break;
              case "Escape":
                e.target.blur();
                break;
              case "Backspace":
                if (searchValue.length > 0) {
                  searchValue = searchValue.slice(0, -1);
                  controlElement.innerText = searchValue;
                }
                break;
            }
          }

          filteredAssets = $assets.filter(filterAsset);
        }}
        on:change={(e) => {
          value = e.target.value;
          controlElement.innerText = e.target.value;
          searchValue = "";
        }}
      >
        {#each filteredAssets as asset, i}
          <vscode-option>{asset.path}</vscode-option>
        {/each}
      </vscode-dropdown>
    </span>
  {/if}
</div>

<style>
  * {
    /* margin: 5px; */
    box-sizing: border-box;
  }

  .control-wrapper {
    position: relative;
    display: flex;
  }

  /* select.options {
    flex-grow: 1;
  } */

  vscode-dropdown {
    width: 200px;
  }
  .dropdown-wrapper {
    position: relative;
  }
  /* vscode-text-field {
    margin: unset;
    position: absolute;
    width: 200px;
    z-index: 1;
  }

  vscode-text-field > section {
    margin: unset;
  }

  vscode-text-field > section > vscode-button {
    margin: unset;
  }
  .dropdown-btn {
    display: inline-block;
  } */
  span.label {
    flex-grow: 1;
  }
</style>
