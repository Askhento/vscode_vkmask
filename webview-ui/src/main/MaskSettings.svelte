<script lang="ts">
    export let selected, onSelect;
</script>

<h3>Mask</h3>
<vscode-option
    class="plugin-name"
    {selected}
    on:click={() => {
        selected = !selected;
        // if (selected)
        onSelect(selected);
    }}
    >Settings
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
</style>
