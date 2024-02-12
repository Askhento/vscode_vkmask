<script lang="ts">
    import * as l10n from "@vscode/l10n";

    export let value;

    // console.log("tableValue", value);
</script>

{#if value}
    <vscode-data-grid aria-label="Basic">
        {#each Object.entries(value) as [key, data]}
            {#if key !== "preview"}
                <vscode-data-grid-row row-type="header">
                    <vscode-data-grid-cell grid-column="1">{key}</vscode-data-grid-cell>
                    <vscode-data-grid-cell grid-column="2">{data}</vscode-data-grid-cell>
                </vscode-data-grid-row>
            {:else}
                <img src={"data:image/png;base64," + data} class="file-preview" />
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

    vscode-data-grid {
        padding-left: var(--global-body-padding-left);
        padding-right: var(--global-body-padding-right);
    }
</style>
