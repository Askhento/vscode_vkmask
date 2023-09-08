<script>
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

    function toggleMenu() {
        menuActive = !menuActive;
    }
</script>

<svelte:body on:click={onClickAnywhere} />

{#if options}
    {#key options}
        <div class="dropdown" style={extraStyle}>
            <vscode-button
                class="menu-button"
                bind:this={menuButton}
                on:blur={() => {
                    //   menuActive = false;
                }}
                on:click={toggleMenu}
            >
                <span style="pointer-events: none;" slot="start" class="codicon codicon-{icon}" />
                {name}
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
    .menu-button {
        /* min-width: 140px; */
        width: 100%;
        height: 2rem;
        position: relative;
        right: 0;
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
</style>
