<script lang="ts">
    import * as l10n from "@vscode/l10n";
    import type { Asset } from "src/types";

    export let value: Asset;

    const allowedFields = new Set(["absPath", "width", "height", "webviewUri"]);

    // console.log("tableValue", encodeURIComponent(value.webviewUri));
</script>

{#if value}
    <vscode-data-grid aria-label="Basic">
        {#if "preview" in value}
            <img src={value.webviewUri} class="file-preview" />
        {/if}
        {#each Object.entries(value) as [key, data]}
            {#if allowedFields.has(key)}
                {#if key !== "webviewUri"}
                    <vscode-data-grid-row row-type="header">
                        <vscode-data-grid-cell grid-column="1">{key}</vscode-data-grid-cell>
                        <vscode-data-grid-cell grid-column="2">{data}</vscode-data-grid-cell>
                    </vscode-data-grid-row>
                {/if}
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
