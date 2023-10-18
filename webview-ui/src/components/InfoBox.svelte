<script lang="ts">
    import * as l10n from "@vscode/l10n";

    export let infoOpened = false,
        visible = false,
        error = true;

    const infoHeader = "Icon should meet these requirements :";
    const infoList = [
        "PNG format",
        "Should not contain transparent layer",
        "Should preview what masks look like",
        "Max size 60Kb",
    ];
    const errors = ["wrong size", "not enogh text", "i dont know anything"];
</script>

{#if visible || error}
    <div class="info-btn">
        <div class:error class="icon-wrapper">
            <span
                on:mouseenter={() => {
                    infoOpened = true;
                }}
                on:mouseleave={() => {
                    infoOpened = false;
                }}
                class="codicon codicon-info"
            />
        </div>
        {#if infoOpened}
            <div class="info-box-wrapper">
                <div>{l10n.t(infoHeader)}</div>
                <ul>
                    {#each infoList as info}
                        <li class="info-text">
                            {l10n.t(info)}
                        </li>
                    {/each}
                </ul>
                <ul>
                    {#each errors as error}
                        <li class="error">
                            {l10n.t(error)} (TODO)
                        </li>
                    {/each}
                </ul>
            </div>
        {/if}
    </div>
{/if}

<style>
    .info-box-wrapper {
        padding: var(--global-margin);
        position: absolute;
        width: var(--global-grid-value-column-size);
        height: fit-content;
        background-color: var(--dropdown-background);
        border: solid 1px var(--vscode-dropdown-border);
        border-radius: var(--global-image-radius);
        z-index: 1;
        right: 70%;
        top: 70%;
    }

    ul {
        margin: var(--global-margin);
        padding-left: calc(2 * var(--global-margin));
    }

    .info-btn {
        position: absolute;
        left: calc(100%);
        /* top: var(--global-margin); */
        height: var(--global-block-height);
        width: var(--global-block-height);
        margin: var(--global-margin);
        margin-left: 0;
        /* margin: 0; */
        padding: 0;
    }

    .icon-wrapper {
        display: flex;
        justify-content: center;
        align-content: center;
        flex-wrap: wrap;
        height: var(--global-block-height);
        width: var(--global-block-height);
    }

    .icon-wrapper > span {
        cursor: pointer;
        width: fit-content;
        height: fit-content;
        margin: 0;
    }

    .error {
        color: red;
        /* color: var(--vscode-inputValidation-errorBackground); */
    }

    /* .codicon-info:before {
        color: red;
        display: block;

        margin: var(--global-margin);

        height: var(--global-block-height);
        width: var(--global-block-height);
    } */

    .icon-wrapper > span:hover {
        color: var(--badge-background);
    }
</style>
