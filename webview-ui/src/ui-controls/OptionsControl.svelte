<script lang="ts">
  import { createEventDispatcher } from "svelte";

  export let label, value, path, params;
  let options = params.options;
  //   $: console.log(text);

  const dispatch = createEventDispatcher();
  $: {
    dispatch("changed", {
      value,
      path,
      structural: true,
    });
  }
</script>

<div class="option-control-wrapper">
  <span class="label">
    {label}
  </span>
  <!-- <select class="options" name="" id="" bind:value>
    {#each options as option, i}
      <option>{option}</option>
    {/each}
  </select> -->

  <vscode-dropdown
    position="above"
    {value}
    on:change={(e) => {
      value = e.target.value;
    }}
  >
    {#each options as option, i}
      <vscode-option>{option}</vscode-option>
    {/each}
  </vscode-dropdown>
</div>

<style>
  * {
    /* padding: 5px; */
    margin: 5px;
  }
  .option-control-wrapper {
    position: relative;
    display: flex;
  }

  /* select.options {
    display: inline;
    flex-grow: 1;
  } */
  span.label {
    flex-grow: 1;
  }
</style>
