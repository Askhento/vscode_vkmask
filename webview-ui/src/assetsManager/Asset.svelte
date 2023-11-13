<script lang="ts">
    import { SelectionType } from "../../../src/types";
    import { getContext } from "svelte";
    //@ts-expect-error
    const { selection } = getContext("stores");
    export let value, onSelect, onDelete;
    let { baseName, path, type } = value;

    function checkSelected() {
        return $selection && $selection.path === path && $selection.type === SelectionType.asset;
    }

    let selected = checkSelected();
</script>

{#key selected}
    <vscode-option
        class="asset-name"
        {selected}
        on:click={() => {
            selected = checkSelected();
            if (selected) {
                $selection = { type: SelectionType.empty };
            } else {
                $selection = { type: SelectionType.asset, path, assetType: type };
            }

            onSelect();
        }}
        ><span class="asset-name-text">{baseName}</span>
        <span class="asset-btn-wrapper">
            <vscode-button
                class="asset-btn"
                appearance="icon"
                on:click={() => {
                    // onClickDelete(id);
                    onDelete();
                }}
            >
                <span class="codicon codicon-trash" />
            </vscode-button>
        </span>
    </vscode-option>
{/key}

<style>
    * {
        box-sizing: border-box;
    }

    vscode-option.asset-name {
        /* display: inline-block; */
        display: block;
        position: relative;

        width: 100%;
        height: 25px;
    }

    vscode-option.asset-name:hover:not(.selected) {
        background-color: var(--vscode-list-hoverBackground);
        border-color: transparent;
    }

    .asset-btn-wrapper {
        position: absolute;
        right: 0px;
        top: 0px;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: row;
        row-gap: 5px;
        column-gap: 5px;
        justify-content: flex-end;
        /* align-content: center; */
        align-items: center; /* ailgned text !!! */
    }

    vscode-option::part(content) {
        /* justify-content: center; */
        align-content: center;
        display: flex;
        flex-wrap: wrap;
        height: 100%;
    }

    .asset-name-text {
        display: inline-block;
        padding-left: var(--global-body-padding-left);
    }

    /* .asset-tag {
        color: var(--vscode-textCodeBlock-background);
        text-align: center;
        text-justify: center;
        justify-content: center;
        display: inline-block;
    } */
    .asset-btn {
        display: inline-block;
    }
</style>
