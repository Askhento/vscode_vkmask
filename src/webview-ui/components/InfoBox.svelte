<script>
    import * as l10n from "@vscode/l10n";
    import { clickOutside } from "../actions/clickOutside.js";

    export let visible,
        info = {};
    let {
        errors = [],
        warnings = [],
        clickLink = "",
        infoHeader = "",
        infoList = "",
        infoErrorHeader = "locale.infobox.errorHeader",
        infoWarningHeader = "locale.infobox.warningHeader",

        infoBody = "",
    } = info;

    // console.log("info", info.errors);
    let infoOpened = false;
    $: headerTranslated = translationExits(infoHeader);
    $: bodyTranslated = translationExits(infoBody);
    $: listTranslated = translationExits(infoList);

    function translationExits(str) {
        return str.length > 0 && !l10n.t(str).startsWith(`locale.`);
    }
    // $: console.log(headerTranslated, infoHeader);
    //  let infoOpened = false,
    //     visible = false,
    //     errors = [],
    //     clickLink = "#";

    // export let infoHeader = "";
    // export let infoList = [];

    function handleClickOutside() {
        setTimeout(() => {
            infoOpened = false;
            visible = false;
        }, 0);
    }
</script>

<!-- {#key info.errors || info.warnings} -->
{#if (visible || infoOpened || info.errors?.length || info.warnings?.length) && headerTranslated}
    <div class="info-btn">
        <!-- <div class:error={errors.length} class="icon-wrapper">
            <span
                on:click|stopPropagation={() => {
                    // console.log("info list", infoList);
                    infoOpened = !infoOpened;
                }}
                class="codicon codicon-info"
                class:darker={infoOpened}
            />
        </div> -->
        <vscode-button
            appearance="icon"
            on:click|stopPropagation={() => {
                infoOpened = !infoOpened;
            }}
        >
            <span
                class:warning={info.warnings?.length}
                class:error={info.errors?.length}
                class="codicon codicon-info"
            />
        </vscode-button>
        {#if infoOpened}
            <div use:clickOutside on:click_outside={handleClickOutside} class="info-box-wrapper">
                {#if errors.length}
                    <div class="info-header-wrapper">
                        <span class="codicon codicon-info error"></span>
                        <span class="info-header">{l10n.t(infoErrorHeader) + ":"}</span>
                    </div>

                    <ul>
                        {#each errors as error}
                            <li class="error">
                                {l10n.t(...error)}
                            </li>
                        {/each}
                    </ul>
                    <vscode-divider role="separator" />
                {/if}
                {#if warnings.length}
                    <div class="info-header-wrapper">
                        <span class="codicon codicon-info warning"></span>
                        <span class="info-header">{l10n.t(infoWarningHeader) + ":"}</span>
                    </div>

                    <ul>
                        {#each warnings as error}
                            <li class="warning">
                                {l10n.t(...error)}
                            </li>
                        {/each}
                    </ul>
                    <vscode-divider role="separator" />
                {/if}
                <div class="info-header-wrapper">
                    <span class="codicon codicon-info"></span>
                    <span>
                        {#each l10n.t(infoHeader).split("\n") as header, i}
                            <div class="info-header">{header}</div>
                        {/each}
                    </span>
                </div>
                {#if bodyTranslated}
                    <p>
                        {l10n.t(infoBody)}
                    </p>
                {/if}
                {#if listTranslated}
                    <ul>
                        {#each l10n.t(infoList).split("\n") as info}
                            <li class="info-text">
                                {info}
                            </li>
                        {/each}
                    </ul>
                {/if}
                {#if clickLink}
                    <vscode-divider role="separator" />
                    <div class="info-header-wrapper">
                        <span class="codicon codicon-globe"></span>
                        <!-- <span class="info-header"
                            >{l10n.t("locale.infobox.readmoreHeader") + ":"}</span
                        > -->
                        <vscode-link href={clickLink}
                            >{l10n.t("locale.infobox.readmoreHeader")}
                        </vscode-link>
                    </div>
                {/if}
            </div>
            <div class="info-hitbox"></div>
        {/if}
    </div>
{/if}

<!-- {/key} -->

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
    * {
        box-sizing: border-box;
    }

    .info-hitbox {
        /* background: red;
        opacity: 0.5; */
        position: fixed;
        width: 100vw;
        height: 100vh;
        overflow: hidden;
        top: 0;
        left: 0;
        z-index: calc(var(--z-level-info) + 1);
        margin: unset;
        padding: unset;
    }
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
        z-index: calc(var(--z-level-info) + 2);
    }

    .info-header-wrapper {
        display: flex;
        /* min-height: var(--global-block-height); */
        /* height: var(--global-block-height); */
        height: fit-content;
        align-content: center;
        align-items: center;
    }

    .info-header {
        margin-left: var(--global-margin);
        text-wrap: wrap;
        height: fit-content;
    }

    .info-header-wrapper .codicon::before {
        font-size: 0.8rem;
        /* height: 5px; */
    }

    p {
        margin-left: calc(4 * var(--global-margin));
    }

    ul {
        margin: var(--global-margin);
        margin-left: calc(4 * var(--global-margin));
        padding-left: calc(2 * var(--global-margin));
    }

    li {
        margin: var(--global-margin) var(--global-margin);
    }

    .info-btn {
        position: absolute;
        left: calc(100% - var(--global-body-padding-right) - var(--global-margin));
        /* left: 100%; */
        top: 0;
        height: var(--global-block-height);
        width: var(--global-block-height);
        margin: var(--global-margin);
        margin-right: 0;
        margin-top: 0;
        margin-left: calc(var(--global-margin) * 1.5);

        padding: 0;
        display: flex;
        align-items: center;
    }

    .error {
        color: red;
        /* color: var(--vscode-inputValidation-errorBackground); */
    }

    .warning {
        color: var(--vscode-inputValidation-warningBorder);
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

    /* .darker {
        opacity: 0.5;
    } */

    vscode-link {
        align-items: center;
        justify-content: center;
        margin: unset;
        margin-left: var(--global-margin);
    }
</style>
