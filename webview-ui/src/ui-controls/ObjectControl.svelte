<script context="module">
</script>

<script>
    import * as l10n from "@vscode/l10n";

    import { createEventDispatcher, onMount } from "svelte";

    export let nesting = true;
    export let value;
    export let label;
    export let path;
    export let params;
    export let expanded = params.defExpanded;
    export let uiElements;
    export let initialLevel = false;

    if (params.group != null) nesting = false;

    // console.log("obj params", params);
    // console.log("exp", expanded);
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
        dispatch("changed", [
            {
                value,
                path,
                structural: true,
            },
        ]);
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
        // console.log("objectcontol rerender", uiElementsGroupData);
        // uiElementsGroupData = {
        //     main: {
        //         expanded: true,
        //         label: "Main",
        //         elements: {},
        //         compositionGroups: {},
        //     },
        // };
        if (params.groups == null) {
            console.log("ObjectControl : no groups in ui descriptions", params);
            return;
        }

        Object.entries(params.groups).forEach(([groupKey, groupData]) => {
            const { defExpanded, label, disableMargin } = groupData;
            uiElementsGroupData[groupKey] = {
                expanded: defExpanded,
                disableMargin,
                label,
                elements: {},
                compositionGroups: {},
            };
        });

        Object.entries(uiElements).forEach(([key, el]) => {
            const group = el.uiDescription.group;
            const compGroup = el.uiDescription.compositionGroup;
            if (group === undefined) {
                console.log("ObjectControl : element have undefined group! ", el);
                return;
            }
            if (!(group in uiElementsGroupData)) {
                console.log("ObjectControl : element no in groups! ", el);
                return;
            }

            if (compGroup != null) {
                // console.log(compGroup, el);
                if (!(compGroup in uiElementsGroupData[group].elements)) {
                    uiElementsGroupData[group].elements[compGroup] = {
                        uiElement: el.uiElement,
                        expanded: true,
                        label: el.uiDescription.label,
                        value: {
                            [key]: el,
                        },
                    };
                }
                uiElementsGroupData[group].elements[compGroup].value[key] = el;
            } else {
                uiElementsGroupData[group].elements[key] = el;
            }

            let elExpanded = el.uiDescription.groupExpanded ?? true;
            // if at least one el not expanded then whole grpuop also
            uiElementsGroupData[group].expanded = uiElementsGroupData[group].expanded && elExpanded;
        });
        // console.log("group data: ", uiElementsGroupData);
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
        <vscode-divider role="separator" />
        <span class="object-label" class:expanded on:click={toggle}>
            <i class="codicon codicon-chevron-{expanded ? 'down' : 'right'}" />
            <span>{l10n.t(label)}</span>
        </span>
    {/if}
    {#key uiElementsGroupData}
        {#if expanded}
            {#each Object.entries(uiElementsGroupData) as [groupName, groupData]}
                {#if groupData.label != null && Object.keys(groupData.elements).length !== 0}
                    <vscode-divider class="divider" role="separator" />
                    <div
                        class="group-label"
                        on:click={() => {
                            uiElementsGroupData[groupName].expanded =
                                !uiElementsGroupData[groupName].expanded;
                            // console.log(groupName, uiElementsGroupData[groupName].expanded);
                        }}
                    >
                        <i
                            class="codicon codicon-chevron-{groupData.expanded ? 'down' : 'right'}"
                        />

                        <span>{l10n.t(groupData.label)}</span>
                    </div>
                {/if}
                {#if uiElementsGroupData[groupName].expanded}
                    <div
                        class:main-group-bottom-margin={!groupData.disableMargin}
                        class="group-wrapper"
                    >
                        {#each Object.entries(groupData.elements) as [key, data]}
                            {#if data.value === null && (data.uiDescription.name === "object" || data.uiDescription.name === "array")}
                                <span class="missing-key-label"
                                    ><span>{l10n.t(data.uiDescription.label ?? key)}</span></span
                                >
                                <vscode-button
                                    class="add-key-btn"
                                    on:click={() => {
                                        // console.log(data.uiDescription);
                                        addKey(key, data);
                                    }}
                                >
                                    <span slot="start" class="codicon codicon-add" />
                                    <span class="btn-text"
                                        >{l10n.t(
                                            `Add ${(data.uiDescription.label ?? key).toLowerCase()}`
                                        )}</span
                                    >
                                </vscode-button>
                            {:else}
                                <svelte:component
                                    this={data.uiElement}
                                    error={data.error}
                                    value={value[key] ?? data.value}
                                    label={data.label ?? data.uiDescription.label ?? key}
                                    path={[...path, key]}
                                    params={data.uiDescription}
                                    uiElements={data.value}
                                    on:changed
                                />
                            {/if}
                        {/each}
                    </div>
                    <!-- group-wrapper -->
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
    * {
        margin: 0;

        padding: 0;
        box-sizing: border-box;
    }

    /* div.contents {
        display: contents;
        position: absolute;
        width: 100vw;
        height: 100%;
    }

    div.contents:hover > :global(*) {
        background: yellow;
    } */

    .control-wrapper {
        position: relative;
        /* transition: all 0.5s ease; */
        /* border-radius: 0.5em; */
        /* border: 2px solid transparent; */
        grid-column: 1/3;
    }
    .group-wrapper {
        /* padding: 0 0 0 0.5em; */
        /* margin: 0 0 0 0.5em; */
        display: grid;
        grid-template-columns:
            minmax(var(--global-grid-label-min-width), var(--global-grid-label-column-size))
            minmax(var(--global-value-min-width), var(--global-grid-value-column-size));
        column-gap: var(--global-grid-column-gap);
        row-gap: var(--global-grid-row-gap);
    }

    .main-group-bottom-margin {
        margin-bottom: var(--global-grid-row-gap);
    }

    .info-hit-box {
    }

    .object-label {
        cursor: pointer;
        color: var(--vscode-descriptionForeground);
        margin: var(--global-margin);
        margin-left: 0;
        display: flex;
    }

    .group-label > span,
    .object-label > span {
        /* color: red; */
        display: inline-block;
        margin-left: var(--global-margin);
    }

    .group-label {
        cursor: pointer;
        color: var(--vscode-descriptionForeground);
        margin: var(--global-margin);
        display: flex;
    }

    .add-key-btn {
        margin: var(--global-margin);
        height: var(--global-block-height);
    }

    span.missing-key-label {
        justify-self: var(--label-justify);
        margin: var(--global-margin);
        height: var(--global-block-height);
        display: flex;
        justify-content: center;
    }

    span.missing-key-label > span {
        margin: var(--global-margin);
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

    vscode-divider {
        width: 200vw;
        margin-left: -50vw;
        /* calc(0px - var(--global-body-padding-left)); */
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
*/

    /* .add-key-color {
        border-color: var(--vscode-focusBorder);
        background-color: var(--button-secondary-hover-background);
    } */
</style>
