<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { onMount, tick } from "svelte";
    import { logger } from "../logger";
    const print = logger("FilePickerControl.svelte");
    import { getContext } from "svelte";
    //@ts-expect-error
    const { assets, settings } = getContext("stores");

    // import { settings } from "../stores.js";

    export let label = "empty",
        value = undefined,
        params,
        path;

    const dispatch = createEventDispatcher();
    $: {
        dispatch("changed", {
            value,
            path,
        });
    }
    let extensions;
    let fileTypes;
    let filteredAssets; // subset of typedassets with search query applied
    let typedAssets; // subset of assets to specific type/extension
    let searchValue = "";
    let dropdownOpened = false;
    let dropdown;
    let controlElement;
    let inputElement;
    let useBuiltins;

    let dropdwonFocusLock = false;

    $: {
        extensions = new Set(params.extensions);
        // print("new extensions", extensions);
        fileTypes = params.types ? new Set(params.types) : undefined;
        if ($settings) useBuiltins = $settings["vkmask.use-builtins"].value;
        // print("useBuiltins", useBuiltins);
        typedAssets = $assets
            .filter((asset) => {
                if (fileTypes !== undefined) {
                    return fileTypes.has(asset.type);
                } else {
                    const extension = asset.path.split(".").at(-1);
                    return extensions.has(extension);
                }
            })
            .filter((asset) => useBuiltins || asset.projectFile);

        filteredAssets = typedAssets
            .filter(filterAssetByQuery)
            .sort((e) => (e.projectFile ? -1 : 1)); // show builtin assets last

        setControlElementValue(value);
        setDropDownValue(value);
    }
    $: {
        searchValue = searchValue;

        filteredAssets = typedAssets
            .filter(filterAssetByQuery)
            .sort((e) => (e.projectFile ? -1 : 1)); // show builtin assets last
    }

    $: {
        if (dropdown) {
            controlElement = dropdown.shadowRoot.querySelector("div.control div");
        }
    }

    //   function selectElementContents(el) {
    //     var range = document.createRange();
    //     print(el.firstChild);
    //     range.selectNodeContents(el.firstChild);
    //     var sel = window.getSelection();
    //     sel.removeAllRanges();
    //     sel.addRange(range);
    //   }

    //   function getControlElementValue() {
    //     if (controlElement) {
    //       return controlElement.innerText;
    //     }
    //     return "";
    //   }
    function filterAssetByQuery(asset) {
        if (searchValue.length === 0) return true;
        return asset.path.toLowerCase().includes(searchValue.toLowerCase());
    }

    function isValueInAssets(newValue) {
        return typedAssets.find((asset) => asset.path === newValue);
    }
    function setControlElementValue(newValue) {
        // this is inner slot which stores value of whole element
        if (controlElement) controlElement.innerText = isValueInAssets(newValue) ? newValue : "-";
    }

    function setDropDownValue(newValue) {
        // when dropdown opened which value currently highlighted
        if (!dropdown) return;
        dropdown.setAttribute(
            "current-value",
            isValueInAssets(newValue) ? newValue : typedAssets[0]
        );
    }

    onMount(async () => {
        await tick();

        setControlElementValue(value);
        setDropDownValue(value);
    });

    // from dropdown

    // on:keydown={(e) => {
    // if (e.key === "Escape") {
    //   print("escape!");
    //   e.preventDefault();
    //   dropdown.value = value;
    //   return;
    // }
    // if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
    // setTimeout(function () {
    //   const option = dropdown.querySelector("vscode-option.selected");
    //   option.scrollIntoView({
    //     behavior: "smooth",
    //     block: "nearest",
    //   });
    //   // if (option.clientHeight < option.scrollHeight) option.focus();
    // }, 10);

    let inputTimer; // prevent closing dropdown
</script>

{#if label !== undefined}
    <span class="label"><span>{label}</span></span>

    <!-- <input class="value" type="text" bind:value /> -->
    <!-- add REd color if file not found in options -->
    <vscode-dropdown
        class:error={filteredAssets.length === 0}
        position="above"
        bind:this={dropdown}
        on:focusout|capture={(e) => {
            // print("focus out");
            //   e.preventDefault();
            e.stopPropagation(); // this is to be able to print while dropdown opened
            inputTimer = setTimeout(() => {
                if (!dropdown) return;
                const event = new KeyboardEvent("keydown", {
                    key: "Escape",
                });
                dropdown.dispatchEvent(event);
            }, 150);
        }}
        on:click|preventDefault={(e) => {
            // print("dropdown click");
            //   setTimeout(function () {
            //     inputElement.focus();
            //   }, 1000);
        }}
        on:change={(e) => {
            //   value = e.target.value;
            //   print("drop change", e.target.value);
            // print("change dropdonw");
            value = dropdown.value;
            searchValue = "";
            inputElement.value = "";
        }}
        on:keydown={(e) => {
            if (e.key === "Escape") {
                // print("escape!");
                e.preventDefault();
                dropdown.value = value;
                return;
            }
            if (e.key.length === 1) {
                inputElement.focus(); // on time !

                setTimeout(() => {
                    if (inputTimer) clearTimeout(inputTimer);
                }, 0);
            }
            //   if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
            //   setTimeout(function () {
            //     const option = dropdown.querySelector("vscode-option.selected");
            //     option.scrollIntoView({
            //       behavior: "smooth",
            //       block: "nearest",
            //     });
            //   }, 10);
        }}
    >
        <vscode-text-field
            class:error={filteredAssets.length === 0}
            bind:this={inputElement}
            on:click|stopPropagation|capture={(e) => {
                if (inputTimer) clearTimeout(inputTimer);
                // print("click text filed inside ");
                // keeps dropdown opened
            }}
            on:input={(e) => {
                // print("oninput", e);
                searchValue = e.target.value;
                // print(searchValue);
            }}
        />
        {#each filteredAssets as asset, i}
            <vscode-option class:builtin={!asset.projectFile}>{asset.path}</vscode-option>
        {/each}
    </vscode-dropdown>
    <!-- svelte-ignore missing-declaration -->
    <!-- <vscode-text-field
        class:error={filteredAssets.length === 0}
        bind:this={inputElement}
        {value}
        on:click={async (e) => {
          if (dropdownOpened) return;

          e.target.select();
          dropdwonFocusLock = true;
          dropdown.value = value;
          dropdownOpened = false;
          dropdown.click();
          await tick();
          dropdownOpened = true;
          setTimeout(function () {
            e.target.focus(); // wtf why this is working
            dropdwonFocusLock = false;
          }, 0);
        }}
        on:blur={(e) => {
          //   searchValue = "";
          print("blur");

          //   setControlElementValue(value);
          if (!dropdwonFocusLock) {
            dropdownOpened = false;
            dropdown.removeAttribute("open");
            // dropdown.removeClassName("open")
          }
          inputElement.value = value;
          searchValue = "";
          //   dropdownOpened = false;
        }}
        on:input={(e) => {
          //   print("oninput", e);
          searchValue = inputElement.value;
          print(searchValue);
        }}
        on:keydown={async (e) => {
          if (e.key.length === 1) return;
          print(e.key);
          const controlKeys = e.ctrlKey || e.metaKey;
          switch (e.key) {
            case "ArrowUp":
            case "ArrowDown":
              // passing arrow to dropdown

              const event = new KeyboardEvent("keydown", { key: e.key });
              dropdown.dispatchEvent(event);
              e.preventDefault();
              break;
            case "Enter":
              if (filteredAssets.length === 0) {
                // dropdownOpened = false;
                // await tick();
                // dropdownOpened = true;
              } else {
                value = dropdown.getAttribute("current-value");
                // controlElement.innerText = value;

                e.target.blur();
              }
              break;
            case "Escape":
              e.target.blur();
              break;
            case "Backspace":
              if (searchValue.length > 0) {
                searchValue = searchValue.slice(0, -1);
                //   controlElement.innerText = searchValue;
              }
              break;
          }
        }}
      /> -->
{/if}

<style>
    * {
        margin: var(--global-margin);

        /* padding: 0; */
        box-sizing: border-box;
    }

    /* .control-wrapper {
        position: relative;
        display: flex;
    } */

    /* select.options {
    flex-grow: 1;
  } */
    /* .dropdown-wrapper {
        
    } */

    vscode-option {
        margin: unset;
    }

    vscode-option.builtin {
        background-color: var(--vscode-inputValidation-warningBackground);
    }

    vscode-dropdown {
        /* margin: unset;
        position: relative; */
        /* width: 200px; */
        height: var(--global-block-height);
    }
    /* vscode-dropdown.error {
    color: var(--vscode-errorForeground);
    animation: shake 0.82s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
  } */

    vscode-text-field {
        /* position: absolute; */
        /* display: flex; */
        /* flex: 0 0 auto; */
        /* z-index: 10; */
        margin: unset;
        /* width: 200px; */
    }

    vscode-text-field.error::part(control) {
        /* border: calc(var(--border-width) * 1px) solid var(--vscode-errorForeground); */
        background: var(--vscode-inputValidation-errorBackground);
    }

    vscode-text-field.error {
        animation: shake 0.82s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
    }

    /* 

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
        justify-self: var(--label-justify);
        height: var(--global-block-height);
        display: flex;
        justify-content: center;
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
