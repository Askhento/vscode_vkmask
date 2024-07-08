<script>
    import * as l10n from "@vscode/l10n";

    import { getContext, onMount, tick } from "svelte";

    import { get_current_component } from "svelte/internal";
    const component = get_current_component();
    import { applyDeps } from "../common/applyDeps";
    const stores = getContext("stores");
    // const { tabInfo } = stores;

    import { logger } from "../logger";
    const print = logger("ArrayControl.svelte");

    import { createEventDispatcher } from "svelte";
    import Tab from "../components/Tab.svelte";

    export let expanded = true;

    export let value;
    export let path;
    export let uiElements;
    export let params;
    export let disabled = false;
    export let indentLevel = 0;

    // if (!value) value = params

    /// print("params", params);
    function toggle() {
        expanded = !expanded;
    }

    const dispatch = createEventDispatcher();
    function onChanged() {
        // print("changed", path, value);
        dispatch("changed", [
            {
                value,
                path,
                structural: true,
            },
        ]);
    }

    function addElement() {
        // print(params);
        const { defaultElement } = params;

        if (defaultElement == null) {
            print("Null default element", params, path);
            return;
        }

        // need to clone, otherwise will have same instance of arr, obj
        value.push(JSON.parse(JSON.stringify(defaultElement)));
        // if (typeof yourVariable === 'object') {
        //     value.push({...defaultElement})
        // } else if(Array.isArray(yourVariable)) {

        // } else {
        //     value.push([...defaultElement]);
        // }

        value = value;
        onChanged();
    }

    function removeElement(index) {
        if (index === undefined) return;
        // value.pop();
        value.splice(index, 1);
        uiElements.splice(index, 1);

        value = value;
        onChanged();
    }

    onMount(async () => {
        // print("ui", uiElements);
        const { needUpdate } = await applyDeps(component, stores, params.dependencies);
        if (needUpdate) onChanged();
    });
</script>

<!-- {#if params.userResizable || uiElements.length > 0}
    {#if nesting}
        <span class="label" title={l10n.t(label)} class:expanded on:click={toggle}>
            <i class="codicon codicon-chevron-{expanded ? 'down' : 'right'}" />
            {l10n.t(label)}
        </span>
    {/if}
{/if} -->
<!-- <div class="elements-wrapper"> -->
{#if expanded}
    {#if uiElements}
        {#each uiElements as data, index}
            {@const elementName = l10n.t(params.elementName ?? "element") + " " + index}
            {@const tabPathKey = [...path, "_elements", index].join(".")}

            <Tab
                defExpanded={data.uiDescription.defExpanded}
                label={elementName}
                {tabPathKey}
                indentLevel={indentLevel + 1}
                isWrapped={uiElements.length > 1 || data.uiDescription.name === "object"}
            >
                {#if params.userResizable}
                    <span class="right-button-wrapper">
                        <!-- style="grid-row : {index + 1} / {index + 2}" -->

                        <vscode-button
                            class="remove-btn"
                            on:click={() => {
                                removeElement(index);
                            }}
                        >
                            <span class="btn-text"
                                >{`${l10n.t("locale.arrayControl.removeButtonHint")} ${l10n.t(params.elementName)}`}</span
                            >
                            <span slot="start" class="codicon codicon-close" />
                        </vscode-button>
                    </span>
                {/if}
                <svelte:component
                    this={data.uiElement}
                    expanded={true}
                    value={value[index]}
                    {disabled}
                    label={elementName}
                    path={[...path, index]}
                    params={data.uiDescription}
                    uiElements={data.value}
                    indentLevel={indentLevel + 1}
                    on:changed
                />
            </Tab>

            {#if index < uiElements.length - 1}
                <vscode-divider role="separator" />
            {/if}
        {/each}
    {/if}

    {#if params.userResizable}
        <span class="right-button-wrapper">
            <vscode-button class="add-btn" on:click={addElement}>
                <span slot="start" class="codicon codicon-add" />
                <span class="btn-text"
                    >{`${l10n.t("locale.arrayControl.addButtonHint")} ${l10n.t(params.elementName)}`}</span
                >
            </vscode-button>
        </span>
    {/if}
{/if}

<!-- </div> -->

<style>
    * {
        /* margin: var(--global-margin); */
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }
    /* .elements-wrapper {
        position: relative;
        grid-column: 1/3;
        display: grid;
        grid-template-columns:
            minmax(var(--global-grid-label-min-width), var(--global-grid-label-column-size))
            minmax(var(--global-value-min-width), var(--global-grid-value-column-size));
        column-gap: var(--global-grid-column-gap);
    } */

    .add-btn,
    .remove-btn {
        width: 100%;
        margin: unset;
    }

    .right-button-wrapper {
        position: relative;
        grid-column: 2/3;
        padding-left: var(--global-margin);
        padding-right: var(--global-body-padding-right);
        height: var(--global-block-height);
    }

    /* .remove-btn {

        position: absolute;
        height: var(--global-block-height);
        width: var(--global-block-height);
        text-align: center;
        grid-column: 3/4;
        margin: 0;
        padding: 0;
        margin-top: var(--global-margin);
    }  */

    /* span.label {
        padding-left: var(--global-body-padding-left);

        height: var(--global-block-height);
        display: flex;
        justify-content: var(--label-justify);
    }

    span.label > span {
        height: fit-content;

        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    } */

    vscode-divider {
        grid-column: 1/3;
    }

    vscode-divider {
        width: 200vw;
        margin-left: -50vw;
    }
</style>
