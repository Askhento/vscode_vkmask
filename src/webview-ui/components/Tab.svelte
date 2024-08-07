<script lang="ts">
    import { createEventDispatcher, getContext, tick } from "svelte";
    import type { DataStores } from "../types";
    import { RequestCommand, RequestTarget } from "src/types";

    const stores = getContext("stores");
    const { tabInfo, messageHandler, viewId } = stores as DataStores;
    const dispatch = createEventDispatcher();

    export let defExpanded = false,
        tabPathKey = "",
        label,
        display = true,
        disableMargin = false,
        indentLevel = 0,
        isWrapped = true;

    let expanded = $tabInfo?.[tabPathKey] ?? defExpanded ?? false;
    let tabWrapperElement = null,
        labelElement = null;

    async function scrollGroupToView(elem, pos = "start") {
        await tick();
        // if (!tabWrapperElement) return;

        elem?.scrollIntoView({
            behavior: "smooth",
            block: pos,
            inline: "nearest",
        });
    }

    function sendTabInfo() {
        messageHandler.send({
            command: RequestCommand.updateTabInfo,
            target: RequestTarget.extension,
            payload: {
                viewId,
                value: $tabInfo,
            },
        });
    }
</script>

{#if isWrapped}
    <div class="tab-wrapper" class:no-display={!display} bind:this={tabWrapperElement}>
        <!-- {#if !(groupInd === 0 && groupData.indentLevel === 0)} -->
        <vscode-divider class="divider" role="separator" />
        <!-- {/if} -->
        <div
            class="group-label"
            bind:this={labelElement}
            style:padding-left={`calc(var(--global-body-padding-left) * ${indentLevel})`}
            on:click={() => {
                expanded = !expanded;
                $tabInfo[tabPathKey] = expanded;

                scrollGroupToView(labelElement, "center");
                sendTabInfo();
            }}
        >
            <i class="codicon codicon-chevron-{expanded ? 'down' : 'right'}" />

            <span>{label}</span>
        </div>

        <div
            style:display={expanded ? "grid" : "none"}
            class:main-group-bottom-margin={!disableMargin}
            class="group-wrapper"
        >
            <slot></slot>
        </div>
    </div>
{:else}
    <div class="group-wrapper">
        <slot></slot>
    </div>
{/if}

<style>
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    .tab-wrapper {
        grid-column: 1/3;
    }

    .group-wrapper {
        display: grid;
        grid-column: 1/3;

        grid-template-columns:
            minmax(var(--global-grid-label-min-width), var(--global-grid-label-column-size))
            minmax(var(--global-value-min-width), var(--global-grid-value-column-size));
        column-gap: var(--global-grid-column-gap);
    }

    .main-group-bottom-margin {
        margin-bottom: var(--global-grid-row-gap);
    }

    .group-label > span {
        display: inline-block;
        /* margin-left: var(--global-margin); */
    }
    .group-label > span::first-letter {
        text-transform: capitalize;
    }

    .group-label {
        cursor: pointer;
        color: var(--vscode-descriptionForeground);
        margin: var(--global-margin) 0;
        display: flex;
        align-items: center;
        grid-column: 1/3;
    }

    .group-label > i {
        margin: 0 2px;
    }

    .no-display {
        display: none;
    }
</style>
