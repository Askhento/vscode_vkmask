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
        infoErrorHeader = "locale.infobox.errorHeader",
        infoBody = "",
    } = info;

    let infoOpened = false;
    $: headerTranslated = translationExits(infoHeader);
    $: bodyTranslated = translationExits(infoBody);

    function translationExits(str) {
        return infoHeader.length > 0 && !l10n.t(str).startsWith(`locale.`);
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
        }, 0);
    }
</script>

{#if infoList && (visible || infoOpened || errors.length) && headerTranslated}
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
            <span class:error={errors.length} class="codicon codicon-info" />
        </vscode-button>
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
                {#if bodyTranslated}
                    <p>
                        {l10n.t(infoBody)}
                    </p>
                {/if}
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
                        <span class="info-header">{l10n.t(infoErrorHeader) + ":"}</span>
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
                        <span class="info-header"
                            >{l10n.t("locale.infobox.readmoreHeader") + ":"}</span
                        >
                    </div>
                    <ul>
                        <li>
                            <vscode-link href={clickLink}
                                >{l10n.t("locale.infobox.readmoreOpen")}
                            </vscode-link>
                        </li>
                    </ul>
                {/if}
            </div>
            <div class="info-hitbox"></div>
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
        min-height: var(--global-block-height);
        align-content: center;
        align-items: center;
    }

    .info-header {
        margin-left: var(--global-margin);
        text-wrap: wrap;
    }

    p {
        margin-left: var(--global-margin);
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

        padding: 0;
        display: flex;
        align-items: center;
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
