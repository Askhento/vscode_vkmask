<script context="module">
</script>

<script>
  import { onMount } from "svelte";

  export let expanded = false;

  export let value;
  export let label;
  export let uiElements;

  function toggle() {
    expanded = !expanded;
  }
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
          {#if data !== null}
            <svelte:component
              this={data.uiElement}
              expanded={true}
              bind:value={value[key]}
              bind:label={key}
              params={data.uiData}
              uiElements={data.value}
            />
          {:else}
            <pre>Null data for {key}</pre>
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
