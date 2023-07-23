<script lang="ts">
    export let id, value, selected, onClickVisible, onClickDelete, onSelect;
    let { name } = value;
</script>

<vscode-option
    class="plugin-name"
    {selected}
    on:click={() => {
        selected = !selected;
        // if (selected)
        onSelect(id, selected);
    }}
    >{name ?? "unknown-plugin"}
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

    vscode-option.plugin-name:hover {
        background-color: var(--vscode-button-hoverBackground);
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
    .plugin-tag {
        color: var(--vscode-textCodeBlock-background);
        text-align: center;
        text-justify: center;
        justify-content: center;
        display: inline-block;
    }
    .plugin-btn {
        display: inline-block;
    }
</style>
