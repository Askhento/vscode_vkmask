<script context="module">
</script>

<script>
    import { createEventDispatcher, onMount } from "svelte";
    import { fly, slide } from "svelte/transition";

    export let expanded = false;
    export let nesting = true;
    export let value;
    export let label;
    export let path;
    export let uiElements;

    function toggle() {
        expanded = !expanded;
    }

    function addKey(key, data) {
        value[key] = data.uiDescription.defValue;
        uiElements[key].value = data.uiDescription.defValue;
        splitElements();
        console.log("ui data add key ", data);
        console.log("add key", value);
        onChanged();
    }
    const dispatch = createEventDispatcher();

    function onChanged() {
        dispatch("changed", {
            value,
            path,
            structural: true,
        });
    }

    let uiElementsVisible = {};
    let uiElementsHidden = {};

    onMount(() => {
        // if (!uiElements) return;
        splitElements();
    });

    function splitElements() {
        uiElementsHidden = {};
        uiElementsVisible = {};
        Object.entries(uiElements).forEach(([key, el]) => {
            //   console.log(key, el);
            if (el.value === null && !el.uiDescription.showAlways) {
                uiElementsHidden[key] = el;
            } else {
                uiElementsVisible[key] = el;
            }
        });
    }

    let addKeyButton, addKeyListOpened, addKeyHover;
</script>

<div class="control-wrapper" class:add-key-color={addKeyHover}>
    {#if nesting}
        <span class:expanded on:click={toggle}
            >{label}
            <i class="codicon codicon-triangle-{expanded ? 'down' : 'right'}" />
        </span>
    {/if}

    {#if expanded}
        <div class="elements-wrapper" style="padding-left: {nesting ? '0.2em' : '0'};">
            {#each Object.entries(uiElementsVisible) as [key, data]}
                <!-- <div transition:fly|local={{ duration: 1000, x: 200 }}> -->
                <!-- data.value is null when key is missing -->
                <svelte:component
                    this={data.uiElement}
                    expanded={true}
                    value={value[key] ?? data.uiDescription.defValue}
                    label={key}
                    path={[...path, key]}
                    params={data.uiDescription}
                    uiElements={data.value}
                    on:changed
                />
                <!-- </div> -->
            {/each}
        </div>

        {#if Object.keys(uiElementsHidden).length}
            <div class="add-key-wrapper">
                <vscode-button class="add-key-btn" bind:this={addKeyButton}>
                    <span slot="start" class="codicon codicon-add" />
                    add
                </vscode-button>
                <!-- svelte-ignore a11y-mouse-events-have-key-events -->
                <vscode-dropdown
                    position="above"
                    class="add-key-dropdown"
                    on:mouseover={() => {
                        addKeyHover = true;
                    }}
                    on:mouseleave={() => {
                        addKeyHover = false;
                    }}
                >
                    {#each Object.entries(uiElementsHidden) as [key, data]}
                        <vscode-option
                            on:click={() => {
                                addKey(key, data);
                            }}>{key}</vscode-option
                        >
                    {/each}
                </vscode-dropdown>
            </div>
        {/if}
    {/if}
</div>

<style>
    .control-wrapper {
        position: relative;
        transition: all 0.5s ease;
        border-radius: 0.5em;
        border: 2px solid transparent;
    }
    .elements-wrapper {
        padding: 0 0 0 0.5em;

        margin: 0 0 0 0.5em;
    }

    /* span {
    padding: 0 0 0 1.5em;
    background: url(tutorial/icons/folder.svg) 0 0.1em no-repeat;
    background-size: 1em 1em;
    font-weight: bold;
    cursor: pointer;
    min-height: 1em;
    display: inline-block;
  }


  .expanded {
    background-image: url(tutorial/icons/folder-open.svg);
  } */

    .add-key-wrapper {
        padding: 0.2em 0 0 0.5em;
        margin: 0 0 0 0.5em;
        position: relative;
        height: 100%;
    }
    .add-key-dropdown {
        width: 150px;
    }

    .add-key-dropdown::part(listbox) {
        z-index: 3;
    }
    .add-key-btn {
        /* background-color: rgb(from var(--button-primary-background) r g b / 50%); */
        pointer-events: none;
        width: 150px;
        position: absolute;
        z-index: 2;
    }

    .add-key-color {
        border-color: var(--vscode-focusBorder);
        background-color: var(--button-secondary-hover-background);
    }
</style>
