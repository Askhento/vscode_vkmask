<script>
  export let expanded = false;

  export let value;
  export let label;
  export let uiElements;

  function toggle() {
    expanded = !expanded;
  }
</script>

<div class="control-wrapper">
  <span class:expanded on:click={toggle}
    >{label}
    <i class="codicon codicon-triangle-{expanded ? 'down' : 'right'}" />
  </span>
  <!-- <vscode-button on:click={sendCreateNewProject}>
      Create new project
      <span slot="start" class="codicon codicon-add" />
    </vscode-button> -->
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
          bind:value={value[index]}
          label={"index" + index}
          params={data.uiData}
          uiElements={data.value}
        />
      {/each}
    {/if}
  {/if}
</div>

<style>
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
