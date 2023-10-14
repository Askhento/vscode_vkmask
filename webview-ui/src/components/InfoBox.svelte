<script lang="ts">
    let infoOpened = false;
    const warnings = ["wrong size", "not enogh text", "i dont know anything"];
</script>

<div class="info-btn">
    <span
        on:mouseenter={() => {
            infoOpened = true;
        }}
        on:mouseleave={() => {
            infoOpened = false;
        }}
        class="codicon codicon-info"
    />
    {#if infoOpened}
        <div class="info-box-wrapper">
            <div>Icon does not have some props:</div>
            <ul>
                {#each warnings as warning}
                    <li class="warning-text">
                        {warning}
                    </li>
                {/each}
            </ul>
        </div>
    {/if}
</div>

<style>
    .info-box-wrapper {
        padding: var(--global-margin);
        position: absolute;
        width: 200px;
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
        margin: var(--global-margin);
        margin-left: 0;
        padding: 0;
    }

    .info-btn > span {
        cursor: pointer;
        margin: var(--global-margin);
    }

    .info-btn > span:hover {
        color: var(--badge-background);
    }
</style>
