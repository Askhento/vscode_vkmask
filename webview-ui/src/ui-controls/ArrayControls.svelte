<script context="module">
  //   import {
  //     effectNames,
  //     effectDefaults,
  //     uiDescriptions,
  //   } from "../../../src/ztypes.js";

  import { uiControlsMap } from "./Controls.js";
</script>

<script>
  export let readonly = false;
  export let expanded = false;

  export let file;
  export let files;

  function toggle() {
    expanded = !expanded;
  }
</script>

{#if readonly}
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
          <svelte:self bind:file bind:files={file.files} />
        {:else}
          <!-- <File bind:file /> -->
        {/if}
      </li>
    {/each}
  </ul>
{/if}

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
