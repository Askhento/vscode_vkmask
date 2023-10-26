<script>
    import * as l10n from "@vscode/l10n";

    export let visible,
        info = {};
    let { errors = [], clickLink = "#", infoHeader = "", infoList = [] } = info;

    let infoOpened = false;

    //  let infoOpened = false,
    //     visible = false,
    //     errors = [],
    //     clickLink = "#";

    // export let infoHeader = "";
    // export let infoList = [];
</script>

{#if visible || errors.length}
    <div class="info-btn">
        <div class:error={errors.length} class="icon-wrapper">
            <a href={clickLink}>
                <span
                    on:mouseenter={() => {
                        infoOpened = true;
                    }}
                    on:mouseleave={() => {
                        infoOpened = false;
                    }}
                    class="codicon codicon-info"
                />
            </a>
        </div>
        {#if infoOpened && (infoList.length || errors.length)}
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

    a:link {
        text-decoration: inherit;
        color: inherit;
        /* cursor: auto; */
    }

    a:visited {
        text-decoration: inherit;
        color: inherit;
        /* cursor: auto; */
    }

    .icon-wrapper {
        display: flex;
        justify-content: center;
        align-content: center;
        flex-wrap: wrap;
        height: var(--global-block-height);
        width: var(--global-block-height);
    }

    .icon-wrapper > a > span {
        /* cursor: pointer; */
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

    .icon-wrapper > a > span:hover {
        color: var(--badge-background);
    }
</style>
