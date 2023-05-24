<script lang="ts">
  import { onMount, tick } from "svelte";
  import { slide } from "svelte/transition";
  import { logger } from "../logger";
  const print = logger("FilePickerControl.svelte");

  import { assets } from "../stores.js";

  export let label = "empty",
    value,
    params;

  let extensions;
  let fileTypes;
  let filteredAssets; // subset of typedassets with search query applied
  let typedAssets; // subset of assets to specific type/extension
  let searchValue = "";
  let dropdownOpened = false;
  let dropdown;
  let controlElement;
  let focused;
  $: {
    extensions = new Set(params.extensions);
    // print("new extensions", extensions);
    fileTypes = params.types ? new Set(params.types) : undefined;
    searchValue = searchValue;
    typedAssets = $assets.filter((asset) => {
      if (fileTypes !== undefined) {
        return fileTypes.has(asset.type);
      } else {
        const extension = asset.path.split(".").at(-1);
        return extensions.has(extension);
      }
    });
    // print(typedAssets);
    filteredAssets = typedAssets.filter(filterAsset);
    // print(filteredAssets);
    // if (filteredAssets.length === 0) shakeDropdown();
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
    if (searchValue.length === 0) return true;
    return asset.path.toLowerCase().includes(searchValue.toLowerCase());
  }

  function isValueInAssets(newValue) {
    return typedAssets.find((asset) => asset.path === newValue);
  }
  function setDropDownValue(newValue) {
    if (controlElement)
      controlElement.innerText = isValueInAssets(newValue) ? newValue : "-";
  }

  onMount(async () => {
    await tick();

    setDropDownValue(value);
  });

  function shakeDropdown() {
    //
    // -> removing the class
    dropdown.classList.remove("error");

    // -> triggering reflow /* The actual magic */
    // without this it wouldn't work. Try uncommenting the line and the transition won't be retriggered.
    // Oops! This won't work in strict mode. Thanks Felis Phasma!
    // dropdown.offsetWidth = dropdown.offsetWidth;
    // Do this instead:
    void dropdown.offsetWidth;

    // -> and re-adding the class
    dropdown.classList.add("error");
  }
</script>

<div class="control-wrapper">
  {#if label !== undefined}
    <span class="label">{label}</span>

    <!-- <input class="value" type="text" bind:value /> -->
    <!-- add REd color if file not found in options -->
    <span class="dropdown-wrapper">
      <vscode-dropdown
        class:error={filteredAssets.length === 0}
        position="above"
        open={dropdownOpened}
        bind:this={dropdown}
        on:blur={(e) => {
          searchValue = "";
          //   controlElement.innerText = value;
          setDropDownValue(value);
          dropdownOpened = false;
        }}
        on:keydown={async (e) => {
          if (e.key.length === 1) {
            //// character key
            searchValue += e.key;
            controlElement.innerText = searchValue;
            // hack to keep dropdown opened while typing
            dropdownOpened = false;
            await tick();
            dropdownOpened = true;
          } else {
            switch (e.key) {
              case "Enter":
                if (filteredAssets.length === 0) {
                  // hack to keep dropdown opened while typing
                  dropdownOpened = false;
                  await tick();
                  dropdownOpened = true;
                } else {
                  value = dropdown.getAttribute("current-value");
                  searchValue = "";
                  controlElement.innerText = value;
                  dropdownOpened = false;
                }
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

          //   filteredAssets = typedAssets.filter(filterAsset);
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

  vscode-dropdown.error {
    color: var(--vscode-errorForeground);
    animation: shake 0.82s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
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

  @keyframes shake {
    10%,
    90% {
      transform: translate3d(-1px, 0, 0);
    }

    20%,
    80% {
      transform: translate3d(2px, 0, 0);
    }

    30%,
    50%,
    70% {
      transform: translate3d(-4px, 0, 0);
    }

    40%,
    60% {
      transform: translate3d(4px, 0, 0);
    }
  }
</style>
