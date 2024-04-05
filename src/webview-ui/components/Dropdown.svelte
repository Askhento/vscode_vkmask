<script>
    import * as l10n from "@vscode/l10n";
    import { tick } from "svelte";

    let menuElem,
        menuButton,
        menuActive = false;

    export let options,
        name = "Menu",
        icon = "menu",
        extraStyle = "";

    function onClickAnywhere(e) {
        if (e.target !== menuButton) menuActive = false;
    }

    // !! this does not work due to blur event fire before
    // element choosen
    // on:blur={async () => {
    //     await tick();
    //     setTimeout(() => {
    //         menuActive = false;
    //     }, 0);
    // }}

    function toggleMenu() {
        menuActive = !menuActive;
    }
</script>

<svelte:body on:click={onClickAnywhere} />

{#if options}
    {#key options}
        <div class="dropdown" style={extraStyle}>
            <vscode-button class="menu-button" bind:this={menuButton} on:click={toggleMenu}>
                <span style="pointer-events: none;" slot="start" class="codicon codicon-{icon}" />
                <span style="pointer-events: none;" class="btn-text">{l10n.t(name)}</span>
            </vscode-button>
            <div class="dropdown-menu" class:active={menuActive} bind:this={menuElem}>
                {#each options as [action, label, icon]}
                    <vscode-button
                        appearance="secondary"
                        class="menu-item-button"
                        class:active={menuActive}
                        on:click={() => {
                            action();
                        }}
                    >
                        {label}
                        {#if icon}
                            <span slot="start" class="codicon codicon-{icon}" />
                        {/if}
                    </vscode-button>
                {/each}
            </div>
        </div>
    {/key}
{/if}

<style>
    * {
        /* margin: var(--global-margin); */
        padding: 0;
        /* padding: var(--global-margin); */
        /* margin: 0; */
        box-sizing: border-box;
    }
    .menu-button {
        /* min-width: 140px; */
        width: 100%;
        position: relative;
        right: 0;
        height: var(--global-block-height-borded);
    }
    .dropdown {
        position: relative;
        /* margin: 0.5rem; */
        /* display: inline-block; */
        /* align-self: end; */
    }

    .dropdown-menu {
        position: absolute;
        display: flex;
        flex-direction: column;
        z-index: 3;
        opacity: 0;
        pointer-events: none;
        transform: scaleY(0);
        /* transform: scaleX(50%); */
        transition: all 150ms ease-in-out;
        transform-origin: top;
        width: 100%;
        height: var(--global-block-height-borded);
    }

    .dropdown-menu.active {
        opacity: 1;
        pointer-events: auto;
        transform: scaleY(1);
    }

    .dropdown-menu > vscode-button {
        background-color: var(--background);
        width: 100%;
        /* text-align: start; */

        /* text-align: left; */

        /* align-items: start; */
        /* justify-items: start; */
        /* align-items: start; */
        /* transform: scaleX(0.5); */
        /* transition: all 500ms ease-in-out 500ms; */
        /* transform-origin: left; */
    }

    /* .dropdown-menu > vscode-button.active {
    transform: scaleX(1);
  } */

    .dropdown-menu > vscode-button:hover {
        background-color: var(--dropdown-background);
    }

    vscode-button {
        min-width: 0;
        height: var(--global-block-height-borded);
    }

    vscode-button::part(content) {
        min-width: 0;
    }

    vscode-button::part(control) {
        overflow: hidden;
    }

    vscode-button > .codicon {
        color: red;
        width: fit-content;
    }

    .btn-text {
        margin: unset;
        padding: unset;
        /* display: inline-block; */
        width: 100%;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        height: fit-content;
    }
</style>
