<script>
    import * as l10n from "@vscode/l10n";
    import { createEventDispatcher, onMount, tick } from "svelte";
    import { getContext } from "svelte";
    import Tab from "../components/Tab.svelte";
    const { tabInfo } = getContext("stores");

    export let value;
    // export let label;
    export let path;
    export let params;
    export let expanded = params.defExpanded;
    export let uiElements;
    export let indentLevel = 0;

    function addKey(key, data) {
        value[key] = JSON.parse(JSON.stringify(data.uiDescription.defValue));
        // uiElements[key].value = {...data.uiDescription.defValue};
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
            const { defExpanded, label, disableMargin, indentLevel = 0 } = groupData;
            const tabKey = [...path, groupKey].join(".");
            if (!(tabKey in $tabInfo)) $tabInfo[tabKey] = defExpanded;

            // console.log(tabKey, $tabInfo[tabKey]);

            uiElementsGroupData[groupKey] = {
                expanded: $tabInfo[tabKey],
                defExpanded,
                disableMargin,
                indentLevel,
                label,
                elements: {},
                compositionGroups: {},
            };
        });

        // console.log("tabinfo", $tabInfo, path);

        Object.entries(uiElements).forEach(([elName, el]) => {
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
                        composition: true,
                        // uiDescription: el.uiDescription,
                        value: {
                            [elName]: el,
                        },
                    };
                }

                uiElementsGroupData[group].elements[compGroup].value[elName] = el;
                // console.log("comp grou1p", uiElementsGroupData[group].elements[compGroup]);
            } else {
                uiElementsGroupData[group].elements[elName] = el;
            }
        });

        // remove empty groups
        for (let [groupKey, groupData] of Object.entries(uiElementsGroupData)) {
            if (Object.keys(groupData.elements).length === 0) {
                // console.log("removing ", groupKey, Object.keys(groupData.elements));
                delete uiElementsGroupData[groupKey];
            }
        }
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
    {#if expanded}
        {#each Object.entries(uiElementsGroupData) as [groupName, groupData], groupInd}
            {@const elemCount = Object.keys(groupData.elements).length}
            {@const elementsEntries = Object.entries(groupData.elements)}
            {@const tabPathKey = [...path, "_groups", groupName].join(".")}

            <!-- !removing empty array groups -->
            {#if groupData.label != null && elemCount !== 0 && !(elemCount === 1 && Array.isArray(elementsEntries[0][1].value) && elementsEntries[0][1].value.length === 0)}
                {#if !(groupInd === 0 && groupData.indentLevel === 0)}
                    <vscode-divider class="divider" role="separator" />
                {/if}
                <Tab
                    defExpanded={groupData.defExpanded}
                    label={l10n.t(groupData.label)}
                    {tabPathKey}
                    indentLevel={indentLevel + 1}
                >
                    {#each elementsEntries as [elName, elData]}
                        {#if elData.value === null && (elData.uiDescription.name === "object" || elData.uiDescription.name === "array")}
                            <span class="label"
                                ><span>{l10n.t(elData.uiDescription.label ?? elName)}</span></span
                            >
                            <span class="right-button-wrapper">
                                <vscode-button
                                    class="add-key-btn"
                                    on:click={() => {
                                        // console.log(data.uiDescription);
                                        addKey(elName, elData);
                                    }}
                                >
                                    <span slot="start" class="codicon codicon-add" />
                                    <span class="btn-text"
                                        >{l10n.t(
                                            `Add ${l10n
                                                .t(elData.uiDescription.label ?? elName)
                                                .toLowerCase()}`
                                        )}</span
                                    >
                                </vscode-button>
                            </span>
                        {:else}
                            <!-- {console.log("EL", elName, data)} -->
                            <!-- value[elName] ?? // we have a value in config -->
                            <!-- elData.value ?? // for composition -->
                            <svelte:component
                                this={elData.uiElement}
                                error={elData.error}
                                value={value?.[elName] ??
                                    // ?. is for deps of complex types,
                                    // they try to render with undefined
                                    (elData.uiDescription.name === "object" ||
                                        elData.uiDescription.defValue)}
                                label={elData.label ?? elData.uiDescription.label ?? elName}
                                path={[...path, elName]}
                                params={elData.uiDescription}
                                indentLevel={indentLevel + 1}
                                uiElements={elData.value}
                                on:changed
                            />
                        {/if}
                    {/each}
                </Tab>
            {/if}
        {/each}
    {/if}

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

    span.label {
        padding: var(--global-margin);
        padding-left: var(--global-body-padding-left);
        padding-right: var(--global-label-control-gap);

        height: var(--global-block-height);
        display: flex;
        justify-content: var(--label-justify);
        align-items: var(--label-align);
    }

    span.label > span {
        height: fit-content;

        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }
    .control-wrapper {
        position: relative;
        grid-column: 1/3;
    }

    /* .group-wrapper {
        display: grid;
        grid-template-columns:
            minmax(var(--global-grid-label-min-width), var(--global-grid-label-column-size))
            minmax(var(--global-value-min-width), var(--global-grid-value-column-size));
        column-gap: var(--global-grid-column-gap);
    } */

    .add-key-btn {
        margin: var(--global-margin);
        height: var(--global-block-height);
    }

    /* span.missing-key-label {
        justify-self: var(--label-justify);
        margin: var(--global-margin);
        height: var(--global-block-height);
        display: flex;
        justify-content: center;
    }

    span.missing-key-label > span {
        margin: var(--global-margin);
    } */

    .right-button-wrapper {
        position: relative;
        grid-column: 2/3;
        /* margin: var(--global-margin); */
        padding-right: var(--global-body-padding-right);
        padding-bottom: var(--global-margin);
        padding-top: var(--global-margin);
        padding-left: var(--global-margin);

        height: var(--global-block-height);
    }

    .add-key-btn {
        width: 100%;
        height: 100%;
        margin: unset;
    }
    vscode-button {
        height: var(--global-block-height-borded);
    }

    vscode-button::part(content) {
        justify-content: center;
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
        height: fit-content;
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
