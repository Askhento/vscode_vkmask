<script context="module">
</script>

<script>
  import { createEventDispatcher } from "svelte";

  export let expanded = false;

  export let value;
  export let label;
  export let path;
  export let uiElements;

  function toggle() {
    expanded = !expanded;
  }

  function addKey(key, data) {
    value[key] = data.uiDescription.defValue;
    console.log("ui data add key ", data);
    console.log("add key", value);
    onChanged();
  }
  const dispatch = createEventDispatcher();

  function onChanged() {
    dispatch("changed", {
      value,
      path,
      structural: true,
    });
  }
  // $: console.log("Obj control", value);
</script>

<div class="constrol-wrapper">
  <span class:expanded on:click={toggle}
    >{label}
    <i class="codicon codicon-triangle-{expanded ? 'down' : 'right'}" />
  </span>
  <div class="elements-wrapper">
    {#if expanded}
      {#each Object.entries(uiElements) as [key, data]}
        <div>
          {#if data.value !== null}
            <svelte:component
              this={data.uiElement}
              expanded={true}
              value={value[key]}
              label={key}
              path={[...path, key]}
              params={data.uiDescription}
              uiElements={data.value}
              on:changed
            />
          {:else}
            <vscode-button
              class="remove-btn"
              appearance="icon"
              on:click={() => {
                addKey(key, data);
                // removeElement(index);
              }}
            >
              Add {key}<span slot="start" class="codicon codicon-add" />
            </vscode-button>
          {/if}
        </div>
      {/each}
    {/if}
  </div>
</div>

<style>
  .elements-wrapper {
    padding: 0.2em 0 0 0.5em;
    margin: 0 0 0 0.5em;
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
