<script lang="ts">
    import { onMount, tick } from "svelte";
    import { slide } from "svelte/transition";
    import { logger } from "../logger";
    const print = logger("FilePickerControl.svelte");

    import { assets, userSettings } from "../stores.js";

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
    let useBuiltins;

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
        if ($userSettings) useBuiltins = $userSettings["vkmask.use-builtins"].value;
        print("useBuiltins", useBuiltins);

        filteredAssets = typedAssets
            .filter(filterAssetByQuery)
            .filter((asset) => useBuiltins || asset.projectFile)
            .sort((e) => (e.projectFile ? -1 : 1)); // show builtin assets last

        // setControlElementValue(value);
    }

    $: {
        if (dropdown) {
            controlElement = dropdown.shadowRoot.querySelector("div.control div");
            controlElement.setAttribute("contenteditable", true);
            //   controlElement
            //     .querySelector("slot")
            //     .setAttribute("contenteditable", true);

            controlElement.oninput = (e) => {
                e.preventDefault();
                // searchValue = controlElement.innerText;
                // controlElement.innerHTML = `<slot name="selected-value">${searchValue}</slot>`;
                // controlElement.focus();
                print(e);
            };
            dropdown.onclick = (e) => {
                print("click dropdown");
            };
            controlElement.onkeydown = (e) => {
                print(e);
                // print(window.getSelection().getRangeAt(0).commonAncestorContainer);
                if (
                    e.key === "Backspace" &&
                    (window.getSelection().toString().trim() === controlElement.innerText ||
                        e.metaKey ||
                        e.ctrlKey)
                ) {
                    e.preventDefault();
                    controlElement.innerText = "";
                    //   window.getSelection().getRangeAt(0).deleteContents();
                    return;
                }
                // print(window.getSelection().toString(), controlElement.innerText);
                print(e.key);
            };
            controlElement.onclick = (e) => {
                e.stopPropagation();
                e.preventDefault();

                // window.getSelection().selectAllChildren(controlElement);
                // print(window.getSelection().removeAllRanges());

                // var range = document.createRange();
                // range.selectNodeContents(controlElement.querySelector("slot"));
                // window.getSelection().removeAllRanges();
                // window.getSelection().addRange(range);

                // range.deleteContents(); // yay that works !
                // window.getSelection().modify("move", "forward", "character");
                // window.getSelection().modify("move", "left", "word");
                // window.getSelection().modify("extend", "left", "word");

                // window.getSelection().modify("extend", "right", "word");
                // window.getSelection().modify("extend", "right", "word");
                print("selection", window.getSelection().toString());
                // selectElementContents(controlElement);
                // window.getSelection().selectAllChildren(e.target.firstChild);
                // print(controlElement.assignedNodes());
                // print(controlElement.querySelector("slot").select());
                print("click control");
            };
        }
    }

    function selectElementContents(el) {
        var range = document.createRange();
        print(el.firstChild);
        range.selectNodeContents(el.firstChild);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    }

    function getControlElementValue() {
        if (controlElement) {
            return controlElement.innerText;
        }
        return "";
    }
    function filterAssetByQuery(asset) {
        if (searchValue.length === 0) return true;
        return asset.path.toLowerCase().includes(searchValue.toLowerCase());
    }

    function isValueInAssets(newValue) {
        return filteredAssets.find((asset) => asset.path === newValue);
    }
    function setControlElementValue(newValue) {
        // this is inner slot which stores value of whole element
        if (controlElement) controlElement.innerText = isValueInAssets(newValue) ? newValue : "-";
    }

    function setDropDownValue(newValue) {
        // when dropdown opened which value currently highlighted
        if (dropdown) dropdown.setAttribute("current-value", newValue);
    }

    onMount(async () => {
        await tick();

        // setControlElementValue(value);
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

    //   on:blur={(e) => {
    //     searchValue = "";
    //     //   controlElement.innerText = value;
    //     setControlElementValue(value);
    //     dropdownOpened = false;
    //   }}
    //   on:keydown={async (e) => {
    //     if (e.key.length === 1) {
    //       //// character key
    //       searchValue += e.key;
    //       controlElement.innerText = searchValue;
    //       // hack to keep dropdown opened while typing
    //       dropdownOpened = false;
    //       await tick();
    //       dropdownOpened = true;
    //     } else {
    //       switch (e.key) {
    //         case "Enter":
    //           if (filteredAssets.length === 0) {
    //             // hack to keep dropdown opened while typing
    //             dropdownOpened = false;
    //             await tick();
    //             dropdownOpened = true;
    //           } else {
    //             value = dropdown.getAttribute("current-value");
    //             searchValue = "";
    //             controlElement.innerText = value;
    //             dropdownOpened = false;
    //           }
    //           break;
    //         case "Escape":
    //           e.target.blur();
    //           break;
    //         case "Backspace":
    //           if (searchValue.length > 0) {
    //             searchValue = searchValue.slice(0, -1);
    //             controlElement.innerText = searchValue;
    //           }
    //           break;
    //       }
    //     }

    //     //   filteredAssets = typedAssets.filter(filterAsset);
    //   }}
    //   on:change={(e) => {
    //     value = e.target.value;
    //     controlElement.innerText = value;
    //     searchValue = "";
    //   }}
</script>

<div class="control-wrapper">
    {#if label !== undefined}
        <span class="label">{label}</span>

        <!-- <input class="value" type="text" bind:value /> -->
        <!-- add REd color if file not found in options -->
        <span class="dropdown-wrapper">
            <vscode-text-field>
                {"some text"}
            </vscode-text-field>
            <vscode-dropdown
                class:error={filteredAssets.length === 0}
                position="above"
                open={dropdownOpened}
                bind:this={dropdown}
            >
                {#each filteredAssets as asset, i}
                    <vscode-option class:builtin={!asset.projectFile}>{asset.path}</vscode-option>
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

    vscode-option.builtin {
        background-color: var(--vscode-inputValidation-warningBackground);
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
        padding-left: var(--global-body-padding-left);

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
