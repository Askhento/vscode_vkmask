<script>
    import * as l10n from "@vscode/l10n";

    import { logger } from "../logger";
    const print = logger("ArrayControl.svelte");

    import { createEventDispatcher } from "svelte";

    export let expanded = true;

    export let value;
    export let label;
    export let path;
    export let uiElements;
    export let params;

    let nesting = params.group == null;

    // if (!value) value = params

    print("params", params);
    function toggle() {
        expanded = !expanded;
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

    function addElement() {
        // print(params);
        const { defaultElement } = params;
        value.push(defaultElement);
        value = value;
        onChanged();
    }

    function removeElement(index) {
        if (index === undefined) return;
        // value.pop();
        value.splice(index, 1);
        value = value;
        onChanged();
    }
</script>

<!-- <vscode-divider role="separator" /> -->

{#if nesting}
    <span class="label" class:expanded on:click={toggle}>
        <i class="codicon codicon-chevron-{expanded ? 'down' : 'right'}" />
        {l10n.t(label)}
    </span>
{/if}

<div class="elements-wrapper">
    {#if expanded}
        {#if uiElements}
            {#each uiElements as data, index}
                <!-- {@debug data, value} -->
                <!-- <svelte:component
                    this={data.uiElement}
                    expanded={true}
                    bind:value={value[index]}
                    bind:label={index}
                    params={data.uiDescription}
                    uiElements={data.value}
                  /> -->

                <svelte:component
                    this={data.uiElement}
                    expanded={true}
                    value={value[index]}
                    label={l10n.t(params.elementName ?? "element") + " " + index}
                    path={[...path, index]}
                    params={data.uiDescription}
                    uiElements={data.value}
                    on:changed
                />
                <vscode-button
                    class="remove-btn"
                    style="grid-row : {index + 1} / {index + 2}"
                    appearance="icon"
                    on:click={() => {
                        removeElement(index);
                    }}
                >
                    <span class="codicon codicon-close" />
                </vscode-button>
            {/each}
        {/if}
        <vscode-button class="add-btn" on:click={addElement}>
            <span slot="start" class="codicon codicon-add" />
            <span class="btn-text">{l10n.t("Add " + params.elementName)}</span>
        </vscode-button>
        <!-- {#if value.length}
        <vscode-button on:click={removeElement}>
          <span slot="start" class="codicon codicon-remove" />
        </vscode-button>
      {/if} -->
    {/if}
</div>

<style>
    * {
        /* margin: var(--global-margin); */
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }
    .elements-wrapper {
        /* padding: 0.2em 0 0 0.5em; */
        /* margin: 0 0 0 0.5em; */
        position: relative;
        grid-column: 1/3;
        display: grid;
        grid-template-columns:
            minmax(var(--global-grid-label-min-width), var(--global-grid-label-column-size))
            minmax(var(--global-value-min-width), var(--global-grid-value-column-size));
        column-gap: var(--global-grid-column-gap);
        /* row-gap: var(--global-grid-row-gap); */
    }

    .add-btn {
        grid-column: 2/3;
        margin: var(--global-margin);
        height: var(--global-block-height);
    }

    .remove-btn {
        /* flex-grow: 1; */
        /* display: inline-block; */
        position: absolute;

        /* left: calc(100% + 0.25rem); */
        /* top: calc(); */
        /* height: 100%; */
        height: var(--global-block-height);
        width: var(--global-block-height);
        /* text-justify: ; */
        text-align: center;
        grid-column: 3/4;
        /* grid-row: 1/2; */
        margin: 0;
        padding: 0;
        margin-top: var(--global-margin);
    }

    .label {
        justify-self: var(--label-justify);
        color: var(--vscode-descriptionForeground);
        grid-column: 1/3;
        justify-self: self-start;
        cursor: pointer;
    }

    /* span.label {
        height: var(--global-block-height);
        display: flex;
        justify-content: var(--label-justify);
    }

    span.label > span {
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
</style>
