<script lang="ts">
    import * as l10n from "@vscode/l10n";

    export let value;

    console.log("tableValue", value);
</script>

{#if value}
    <vscode-data-grid aria-label="Basic">
        {#each Object.entries(value) as [key, data]}
            {#if key !== "preview"}
                <vscode-data-grid-row row-type="header">
                    <vscode-data-grid-cell grid-column="1">{key}</vscode-data-grid-cell>
                    <vscode-data-grid-cell grid-column="2">{data}</vscode-data-grid-cell>
                </vscode-data-grid-row>
            {/if}
        {/each}
    </vscode-data-grid>
{/if}

<style>
    * {
        margin: var(--global-margin);
        /* padding: 0; */
        box-sizing: border-box;
    }
</style>
