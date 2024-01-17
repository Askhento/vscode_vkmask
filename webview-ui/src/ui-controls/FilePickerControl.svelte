<script lang="ts">
    import * as l10n from "@vscode/l10n";

    import { createEventDispatcher } from "svelte";
    import { onMount, tick } from "svelte";
    import { logger } from "../logger";
    import { getFileUri } from "../utils/getFileUri";
    const print = logger("FilePickerControl.svelte");
    import { getContext } from "svelte";
    import { RequestCommand, RequestTarget, SelectionType } from "src/types";
    //@ts-expect-error

    const { assets, settings, messageHandler, selection } = getContext("stores");

    const whiteData = "R0lGODlhAQABAIAAAP7//wAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==";
    const missingTextureData =
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAYAAACpSkzOAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAKDSURBVHgB3VVdbtNAEJ5dr+PWkYhRfqAJglRKW27FGbhBuUGvhAQXaAWCtigpCkkpqHUeYlO762XHzc6ugxAvxA/9pJU9++14x/PL5vOrV0zBUQEqms1nsFgswGA4HML21jbJp+dnIKUEUACe8GB/NCIuTX/B5OKC5FbUgv7THWAAE2DsUIBSh1ovYqsDCqpgzrtSqlyWY5Vzak17xQ6ZUkccX2DDwB8RyyQB18Jms0nyXZ5DUlgrt4KAzPQ8DxKta9g8zyq6vu+XvIGYfLV+HfT70H/UInmsfZ6k9vDB3j4IfQECY/Xp7JS4MAxh9/kLkmMd67HzbQ41YXMXsTXx5OQjBaHAvCkKIjEObiLJQlpFxoBzaydmY+HoIudmpei02yR803UUO3W0q+sodOros47JnZRkxEsdM4MkTXVMJyRHUQQDXUd0MdSE2i5ib9+9pyh0211ohtZVs8tLyHR9mDg9Gwyc9C5gOptSCMPtEHqdLuliDV39/GFaBog8y+2tejX8BslKF6vLI0cXcQmZw+Ui17xvL8K93PK1uU4E2FZWQDfcZrck+76AQNo/zLIMpHdvG3aGIGiQWznjFV1ssEHD6rL57DvF6F/pjS1HrtJbCAEHoz3i/kjvVgsGO32SH2B6Hx9/UCYF8ekONq7bTNlUzNZ6/3LnHPv70MR9Ueb6Cjgmov84JjDmZDTUhPpidP5lTK5dLpfgjvbHOkV9pxaub67L1mPQ7XToHbvATRyTjF0CO7iBaOoeZRDrg+6cf9LrVepoOp3SmMBYuboJpBXdhjbS5bkeTjFsHhOuCvlap/SkUAVNTbOwqeK+WdyzHNd/5HKl1Y4ufuueU7EevW9+A/ImPneuprflAAAAAElFTkSuQmCC";

    export let label = "empty",
        value,
        params,
        path;

    // print("INIT", value, params);

    const dispatch = createEventDispatcher();
    $: {
        checkAssetExists();
        dispatch("changed", [
            {
                value,
                path,
                structural: true,
            },
        ]);
    }
    let extensions;
    let fileTypes;
    let filteredAssets; // subset of typed assets with search query applied
    let typedAssets; // subset of assets to specific type/extension
    let searchValue = "";
    let dropdownOpened = false;
    let dropdown;
    let controlElement;
    let inputElement;
    let useBuiltins;

    let waiting = false;
    let currentAsset;

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
        // print("typedassets", typedAssets);

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
        if (!controlElement) return;

        let innerText =
            newValue ?? `${l10n.t("locale.controls.filepicker.selectFilePlaceholder")}...`;
        if (!typedAssets.length)
            innerText = `${l10n.t("locale.controls.filepicker.noAssetsAvailable")}...`;
        controlElement.innerText = innerText;
    }

    function setDropDownValue(newValue) {
        // when dropdown opened which value currently highlighted
        if (!dropdown) return;
        dropdown.setAttribute(
            "current-value",
            isValueInAssets(newValue) ? newValue : typedAssets[0]
        );
    }

    function checkAssetExists() {
        if (!typedAssets) {
            currentAsset = null;
            return;
        }

        const assetIndex = typedAssets.findIndex((element) => {
            return element.path === value;
        });

        if (assetIndex < 0) {
            currentAsset = null;
            return;
        }

        currentAsset = typedAssets[assetIndex];

        // print("current asset", currentAsset);
    }

    async function uploadAsset() {
        waiting = true;
        // print("params file picker", params);
        const { payload } = await messageHandler.request({
            command: RequestCommand.getUploadedAsset,
            target: RequestTarget.extension,
            payload: {
                extensions: [params.extensions.map((ext) => `*.${ext}`)],
                to: params.directory,
            },
        });

        if (payload) {
            value = payload;
            // print("asset", value);
        }

        waiting = false;
    }

    function selectAsset() {
        if (!currentAsset.projectFile) return;

        const newSelection = {
            ...currentAsset,
            assetType: currentAsset.type,
            type: SelectionType.asset,
        };

        messageHandler.send({
            command: RequestCommand.updateSelection,
            origin: RequestTarget.control,
            target: RequestTarget.all,
            payload: newSelection,
        });
    }

    async function removeAsset() {
        waiting = true;

        // !!! will not remove for now !!!
        /// other effects could use the same asset
        // await messageHandler.request({
        //     command: RequestCommand.removeAsset,
        //     target: RequestTarget.extension,
        //     payload: [value],
        // });

        value = null;
        waiting = false;
    }

    onMount(async () => {
        checkAssetExists();
        await tick();

        setControlElementValue(value);
        setDropDownValue(value);
    });

    $: {
        checkAssetExists();
        $assets;
    }

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

<!-- {#key typedAssets} -->
{#if label !== undefined}
    {#key value}
        <span class="label" title={l10n.t(label)}><span>{l10n.t(label)}</span></span>

        <!-- <input class="value" type="text" bind:value /> -->
        <!-- add REd color if file not found in options -->
        <span class="control-wrapper">
            <div class="dropdown-wrapper">
                <!-- <span class="file-preview">
            </span> -->
                {#if params.typeName === "texture"}
                    {#if currentAsset && currentAsset.preview}
                        <a href={getFileUri(currentAsset.absPath)}>
                            <img
                                src={"data:image/png;base64," + currentAsset.preview}
                                class="file-preview"
                            />
                        </a>
                    {:else}
                        <img class="file-preview" src={missingTextureData} />
                    {/if}
                {/if}

                <vscode-dropdown
                    class:error={filteredAssets.length === 0}
                    position="above"
                    disabled={typedAssets.length === 0 || waiting}
                    class:missing-asset={value && currentAsset == null}
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
                        <vscode-option class:builtin={!asset.projectFile}>
                            {#if asset.absPath && asset.type === "image"}
                                <img
                                    src={"data:image/png;base64," + (asset.preview ?? whiteData)}
                                    class="option-file-preview"
                                />
                            {/if}
                            <span class="option-text">{asset.path}</span>
                        </vscode-option>
                    {/each}
                </vscode-dropdown>

                {#if waiting}
                    <vscode-progress-ring />
                {/if}
            </div>

            <vscode-button
                appearance={value == null ? "primary" : "secondary"}
                disabled={waiting}
                class="upload-button"
                on:click|stopPropagation={() => {
                    uploadAsset();
                }}
            >
                <span class="btn-text"
                    >{`${l10n.t("locale.controls.filepicker.buttonUpload.label")}`}</span
                >
            </vscode-button>

            {#if currentAsset && currentAsset.projectFile}
                <vscode-button
                    appearance={value != null ? "primary" : "secondary"}
                    disabled={waiting}
                    class="select-button"
                    on:click|stopPropagation={() => {
                        selectAsset();
                    }}
                >
                    <span class="btn-text"
                        >{`${l10n.t("locale.controls.filepicker.buttonSelect.label")}`}</span
                    >
                </vscode-button>
            {/if}

            <vscode-button
                disabled={value == null || waiting}
                appearance="secondary"
                class="remove-button"
                on:click|stopPropagation={() => {
                    removeAsset();
                }}
            >
                <span class="btn-text"
                    >{`${l10n.t("locale.controls.filepicker.buttonRemove.label")}`}</span
                >
            </vscode-button>
        </span>
    {/key}
{/if}

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

<!-- {/key} -->

<style>
    * {
        margin: var(--global-margin);
        /* padding: 0; */
        box-sizing: border-box;
    }

    span.label {
        padding-left: var(--global-body-padding-left);

        height: var(--global-block-height);
        display: flex;
        justify-content: var(--label-justify);
    }

    span.label > span {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }

    span.control-wrapper {
        margin: unset;
        /* position: relative; */
        display: flex;
        flex-direction: column;
    }

    div.dropdown-wrapper {
        margin: unset;
        display: flex;
        flex-direction: row;
        position: relative;
    }

    vscode-progress-ring {
        position: absolute;
        left: calc(100%);
        top: var(--global-margin);
        margin: unset;
        height: var(--global-block-height);
        width: var(--global-block-height);
    }

    vscode-option {
        margin: unset;
        /* display: flex;
        justify-items: center;
        align-items: center;
        align-content: center; */
        /* justify-content: center; */
        /* width: 100%; */
    }

    vscode-option::part(content) {
        display: flex;
        align-content: center;
    }

    img.option-file-preview {
        margin: unset;
        display: inline-block;
        height: var(--global-block-height);
        width: var(--global-block-height);
    }

    span.option-text {
        vertical-align: middle;
    }

    .file-preview {
        display: inline-block;
        height: var(--global-block-height);
        width: var(--global-block-height);
        border-radius: var(--global-image-radius);

        /* margin: unset; */
        /* flex-basis: var(--global-block-height); */
    }

    a {
        margin: unset;
        display: contents;
        height: var(--global-block-height);
        width: var(--global-block-height);
    }
    vscode-option.builtin {
        background-color: var(--vscode-inputValidation-warningBackground);
    }

    vscode-dropdown {
        /* margin: unset;
        position: relative; */
        /* width: 200px; */

        height: var(--global-block-height);
        /* width: 100%; */
        width: calc(var(--global-grid-value-column-size) - 2 * var(--global-margin));
        min-width: 0;
    }
    /* vscode-dropdown.error {
    color: var(--vscode-errorForeground);
    animation: shake 0.82s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
  } */

    vscode-dropdown::part(control) {
        border-radius: var(--global-border-raduis);
    }

    vscode-dropdown.missing-asset::part(control) {
        color: red;

        /* width: var(--global-grid-value-column-size); */
    }

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

    vscode-button::part(content) {
        min-width: 0;
    }

    vscode-button::part(control) {
        overflow: hidden;
    }

    .btn-text {
        margin: unset;
        padding: unset;
        /* display: inline-block; */
        width: 100%;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
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
