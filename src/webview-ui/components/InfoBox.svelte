<script>
    import * as l10n from "@vscode/l10n";
    import { clickOutside } from "../actions/clickOutside.js";

    export let visible,
        info = {};
    let {
        errors = [],
        clickLink = "",
        infoHeader = "",
        infoList = "",
        infoErrorHeader = "",
    } = info;

    let infoOpened = false;

    //  let infoOpened = false,
    //     visible = false,
    //     errors = [],
    //     clickLink = "#";

    // export let infoHeader = "";
    // export let infoList = [];

    function handleClickOutside() {
        setTimeout(() => {
            infoOpened = false;
        }, 0);
    }
</script>

{#if infoList && (visible || infoOpened || errors.length)}
    <div
        on:focusout={() => {
            console.log("outside", infoHeader);
        }}
        class="info-btn"
    >
        <div class:error={errors.length} class="icon-wrapper">
            <span
                on:click|stopPropagation={() => {
                    console.log("info list", infoList);
                    infoOpened = !infoOpened;
                }}
                class="codicon codicon-info"
                class:darker={infoOpened}
            />
            <!-- <a href={clickLink}>
            </a> -->
        </div>
        {#if infoOpened && (infoList.length || errors.length)}
            <div use:clickOutside on:click_outside={handleClickOutside} class="info-box-wrapper">
                <div class="info-header-wrapper">
                    <span class="codicon codicon-info"></span>
                    <span>
                        {#each l10n.t(infoHeader).split("\n") as header, i}
                            <div class="info-header">{header}</div>
                        {/each}
                    </span>
                </div>
                <ul>
                    {#each l10n.t(infoList).split("\n") as info}
                        <li class="info-text">
                            {info}
                        </li>
                    {/each}
                </ul>
                {#if errors.length}
                    <vscode-divider role="separator" />

                    <div class="info-header-wrapper">
                        <span class="codicon codicon-info error"></span>
                        <span class="info-header">{l10n.t(infoErrorHeader) + " :"}</span>
                    </div>
                    <ul>
                        {#each errors as error}
                            <li class="error">
                                {l10n.t(error)}
                            </li>
                        {/each}
                    </ul>
                {/if}
                {#if clickLink}
                    <vscode-divider role="separator" />
                    <div class="info-header-wrapper">
                        <span class="codicon codicon-globe"></span>
                        <vscode-link href={clickLink}
                            >{l10n.t("locale.infobox.readmore")}
                        </vscode-link>
                    </div>
                {/if}
            </div>
        {/if}
    </div>
{/if}

<!-- <div
    class="info-hit-box"
    on:mouseover={() => {
        // console.log("info over");
        visible = true;
    }}
    on:mouseleave={() => {
        visible = false;
    }}
></div> -->

<style>
    /* * {
        box-sizing: border-box;
    } */
    .info-box-wrapper {
        padding: var(--global-margin);
        position: absolute;
        /* width: var(--global-grid-value-column-size); */
        /* max-width: var(--global-grid-value-column-size); */
        /* min-width: max-content; */
        width: 80vw;
        max-width: 335px;

        height: fit-content;
        background-color: var(--dropdown-background);
        border: solid 1px var(--vscode-dropdown-border);
        border-radius: var(--global-border-raduis);
        right: 70%;
        top: 70%;
        z-index: 100;
    }

    .info-hit-box {
        background: red;
        opacity: 0.5;
        position: absolute;
        top: 0;
        right: 0;
        height: 100%;
        width: 100vw;
        pointer-events: all;
    }

    :global(.control-wrapper):has(> div.info-hit-box) {
        /* background: green; */
        /* pointer-events: none; */
    }

    .info-header-wrapper {
        display: flex;

        align-content: center;
    }

    .info-header {
        margin-left: var(--global-margin);
        text-wrap: wrap;
    }

    ul {
        margin: var(--global-margin);
        padding-left: calc(2 * var(--global-margin));
    }

    li {
        margin: var(--global-margin) var(--global-margin);
    }

    .info-btn {
        position: absolute;
        left: calc(100% - var(--global-block-height));
        /* top: var(--global-margin); */
        top: 0;
        height: var(--global-block-height);
        width: var(--global-block-height);
        margin: var(--global-margin);
        margin-right: 0;
        /* margin: 0; */
        padding: 0;
    }

    a:link {
        text-decoration: inherit;
        color: inherit;
        height: min-content;
        display: flex;
        justify-content: center;
        /* cursor: auto; */
    }

    a:visited {
        text-decoration: inherit;
        color: inherit;
        /* cursor: auto; */
    }

    .icon-wrapper {
        display: flex;
        justify-content: start;
        align-content: center;
        flex-wrap: wrap;
        height: var(--global-block-height);
        width: var(--global-block-height);
    }

    .icon-wrapper > span {
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

    vscode-divider {
        width: calc(100% + 2 * var(--global-margin));
        margin-left: calc(0px - var(--global-margin));
    }

    .icon-wrapper > span:hover {
        opacity: 0.5;
        /* color: var(--badge-background); */
    }

    .darker {
        opacity: 0.5;
    }

    vscode-link {
        align-items: center;
        justify-content: center;
        margin: unset;
        margin-left: var(--global-margin);
    }
</style>
