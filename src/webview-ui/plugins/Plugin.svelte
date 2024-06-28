<script lang="ts">
    import * as l10n from "@vscode/l10n";
    import { SelectionType } from "../../../src/types";
    import { getContext } from "svelte";
    //@ts-expect-error
    const { selection } = getContext("stores");
    export let id, value, onClickDelete, onSelect;
    let { name } = value;

    function checkSelected() {
        return $selection.id === id && $selection.type === SelectionType.plugin;
    }
</script>

<vscode-option
    class="plugin-name"
    selected={checkSelected()}
    on:click={() => {
        if (checkSelected()) {
            $selection = { type: SelectionType.empty };
        } else {
            $selection = { type: SelectionType.plugin, id };
        }
        onSelect();
    }}
    ><span class="plugin-name-text">{name ?? l10n.t("locale.plugins.unknownPlugin")}</span>
    <span class="plugin-btn-wrapper">
        <vscode-button
            class="plugin-btn"
            appearance="icon"
            on:click={() => {
                onClickDelete(id);
            }}
        >
            <span class="codicon codicon-trash" />
        </vscode-button>
    </span>
</vscode-option>

<style>
    * {
        box-sizing: border-box;
    }

    vscode-option.plugin-name {
        /* display: inline-block; */
        display: block;
        position: relative;

        width: 100%;
        height: 25px;
    }

    vscode-option.plugin-name:hover:not(.selected) {
        background-color: var(--vscode-list-hoverBackground);
        border-color: transparent;
    }

    .plugin-btn-wrapper {
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

    .plugin-name-text {
        display: inline-block;
        padding-left: var(--global-body-padding-left);
    }

    /* .plugin-tag {
        color: var(--vscode-textCodeBlock-background);
        text-align: center;
        text-justify: center;
        justify-content: center;
        display: inline-block;
    } */
    .plugin-btn {
        display: inline-block;
    }
</style>
