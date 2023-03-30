<script>
  import File from "./File.svelte";

  export let readonly = false;
  export let expanded = false;

  export let file;
  export let files;

  function toggle() {
    expanded = !expanded;
  }
</script>

{#if readonly}
  <!-- NOTE bindings must keep referencing the "entry" variable 
       (here: `file.`) to be tracked -->
  <span class:expanded on:click={toggle}>{file.name}</span>
{:else}
  <label>
    <span class:expanded on:click={toggle} />
    <input bind:value={file.name} />
  </label>
{/if}

{#if expanded}
  <ul>
    {#each files as file}
      <li>
        {#if file.type === "folder"}
          <!-- NOTE the intermediate variable created by the #each loop 
               (here: local `file` variable) preserves tracking, though -->
          <svelte:self bind:file bind:files={file.files} />
        {:else}
          <File bind:file />
        {/if}
      </li>
    {/each}
  </ul>
{/if}

<style>
  span {
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
  }

  ul {
    padding: 0.2em 0 0 0.5em;
    margin: 0 0 0 0.5em;
    list-style: none;
    border-left: 1px solid #eee;
  }

  li {
    padding: 0.2em 0;
  }
</style>
