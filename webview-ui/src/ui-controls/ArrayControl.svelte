<script>
    import { logger } from "../logger";
    const print = logger("ArrayControl.svelte");

    export let expanded = false;

    export let value;
    export let label;
    export let uiElements;
    export let params;

    function toggle() {
        expanded = !expanded;
    }

    function addElement() {
        // print(params);
        const { defaultElement } = params;
        value.push(defaultElement);
        value = value;
    }

    function removeElement(index) {
        if (index === undefined) return;
        // value.pop();
        value.splice(index, 1);
        value = value;
    }
</script>

<div class="control-wrapper">
    <span class:expanded on:click={toggle}
        >{label}
        <i class="codicon codicon-triangle-{expanded ? 'down' : 'right'}" />
    </span>

    <div class="elements-wrapper">
        {#if expanded}
            {#if uiElements}
                {#each uiElements as data, index}
                    <!-- {@debug data, value} -->
                    <!-- <svelte:component
                    this={data.uiElement}
                    expanded={true}
                    bind:value={value[index]}
                    bind:label={index}
                    params={data.uiData}
                    uiElements={data.value}
                  /> -->

                    <svelte:component
                        this={data.uiElement}
                        expanded={true}
                        value={value[index]}
                        label={"index" + index}
                        params={data.uiData}
                        uiElements={data.value}
                    />
                    <vscode-button
                        class="remove-btn"
                        appearance="icon"
                        on:click={() => {
                            removeElement(index);
                        }}
                    >
                        <span slot="start" class="codicon codicon-remove" />
                    </vscode-button>
                {/each}
            {/if}
            <vscode-button appearance="icon" on:click={addElement}>
                <span slot="start" class="codicon codicon-add" />
            </vscode-button>
            <!-- {#if value.length}
        <vscode-button on:click={removeElement}>
          <span slot="start" class="codicon codicon-remove" />
        </vscode-button>
      {/if} -->
        {/if}
    </div>
</div>

<style>
    .elements-wrapper {
        padding: 0.2em 0 0 0.5em;
        margin: 0 0 0 0.5em;
    }

    .remove-btn {
        flex-grow: 1;
        display: inline-block;
    }

    /* span {
    padding: 0 0 0 1.5em;
    background: url(tutorial/icons/folder.svg) 0 0.1em no-repeat;
    background-size: 1em 1em;
    font-weight: bold;
    cursor: pointer;
    min-height: 1em;
    display: inline-block;
  }

  .expanded {
    background-image: url(tutorial/icons/folder-open.svg);
  } */
</style>
