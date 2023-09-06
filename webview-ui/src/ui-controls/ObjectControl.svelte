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
        // splitElements();
        // console.log("ui data add key ", data);
        // console.log("add key", value);
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
    let uiElementsGroupData = {};

    onMount(() => {
        // if (!uiElements) return;
        // splitElements();
        groupElements();
    });

    function groupElements() {
        console.log("objectcontol rerender", uiElementsGroupData);
        uiElementsGroupData = {};
        Object.entries(uiElements).forEach(([key, el]) => {
            const group = el.uiDescription.group;
            if (group === undefined) {
                console.log("ObjectControl : element have undefined group! ", el);
                return;
            }
            if (!(group in uiElementsGroupData)) {
                uiElementsGroupData[group] = { expanded: true, elements: {} };
            }

            uiElementsGroupData[group]["elements"][key] = el;
        });
    }
    // function splitElements() {
    //     uiElementsHidden = {};
    //     uiElementsVisible = {};
    //     // !!! sometimes it is null !!!
    //     Object.entries(uiElements).forEach(([key, el]) => {
    //         //   console.log(key, el);
    //         if (el.value === null && !el.uiDescription.showAlways) {
    //             uiElementsHidden[key] = el;
    //         } else {
    //             uiElementsVisible[key] = el;
    //         }
    //     });
    // }

    let addKeyButton, addKeyListOpened, addKeyHover;
</script>

<div class="control-wrapper" class:add-key-color={addKeyHover}>
    {#if nesting}
        <span class="object-label" class:expanded on:click={toggle}>
            <i class="codicon codicon-triangle-{expanded ? 'down' : 'right'}" />
            {label}
        </span>
    {/if}
    {#key uiElementsGroupData}
        {#if expanded}
            {#each Object.entries(uiElementsGroupData) as [groupName, groupData]}
                {#if groupName !== "main"}
                    <vscode-divider role="separator" />
                    <div
                        class="group-label"
                        on:click={() => {
                            uiElementsGroupData[groupName].expanded =
                                !uiElementsGroupData[groupName].expanded;
                            // console.log(groupName, uiElementsGroupData[groupName].expanded);
                        }}
                    >
                        <i
                            class="codicon codicon-triangle-{groupData.expanded ? 'down' : 'right'}"
                        />
                        {groupName}
                    </div>
                {/if}
                {#if uiElementsGroupData[groupName].expanded}
                    <div class="group-wrapper">
                        {#each Object.entries(groupData.elements) as [key, data]}
                            {#if data.value === null && (data.uiDescription.name === "object" || data.uiDescription.name === "array")}
                                <div>{data.uiDescription.label ?? key}</div>
                                <vscode-button
                                    class="add-key-btn"
                                    on:click={() => {
                                        // console.log(data.uiDescription);
                                        addKey(key, data);
                                    }}
                                >
                                    <span slot="start" class="codicon codicon-add" />
                                    add
                                </vscode-button>
                            {:else}
                                <svelte:component
                                    this={data.uiElement}
                                    expanded={true}
                                    value={value[key] ?? data.uiDescription.defValue}
                                    label={data.uiDescription.label ?? key}
                                    path={[...path, key]}
                                    params={data.uiDescription}
                                    uiElements={data.value}
                                    on:changed
                                />
                            {/if}
                        {/each}
                    </div>
                {/if}
            {/each}
        {/if}
    {/key}

    <!-- <div class="elements-wrapper" style="padding-left: {nesting ? '0.2em' : '0'};">
            {#each Object.entries(uiElementsVisible) as [key, data]}
                <svelte:component
                    this={data.uiElement}
                    expanded={true}
                    value={value[key] ?? data.uiDescription.defValue}
                    label={data.uiDescription.label ?? key}
                    path={[...path, key]}
                    params={data.uiDescription}
                    uiElements={data.value}
                    on:changed
                />
            {/each}
        </div> -->

    <!-- {#if Object.keys(uiElementsHidden).length}
            <div class="add-key-wrapper">
                <vscode-button class="add-key-btn" bind:this={addKeyButton}>
                    <span slot="start" class="codicon codicon-add" />
                    add
                </vscode-button>
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
        {/if} -->
    <!-- {/key} -->
</div>

<style>
    .control-wrapper {
        position: relative;
        transition: all 0.5s ease;
        border-radius: 0.5em;
        border: 2px solid transparent;
    }
    .group-wrapper {
        padding: 0 0 0 0.5em;
        margin: 0 0 0 0.5em;
        display: grid;
        grid-template-columns:
            var(--project-manager-grid-label-column-size)
            minmax(auto, var(--project-manager-grid-value-column-size));
        column-gap: var(--global-grid-column-gap);
        row-gap: var(--global-grid-row-gap);
    }

    .object-label {
        cursor: pointer;
    }
    .group-label {
        cursor: pointer;
    }

    /* .add-key-wrapper {
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
        pointer-events: none;
        width: 150px;
        position: absolute;
        z-index: 2;
    } */

    /* .add-key-color {
        border-color: var(--vscode-focusBorder);
        background-color: var(--button-secondary-hover-background);
    } */
</style>
