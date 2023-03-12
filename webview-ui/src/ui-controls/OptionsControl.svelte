<script lang="ts">
  export let label, value, params;
  let options = params.options;
  //   $: console.log(text);
</script>

<div class="option-control-wrapper">
  <span class="label">
    {label}
  </span>
  <select class="options" name="" id="" bind:value>
    {#each options as option, i}
      <option>{option}</option>
    {/each}
  </select>
  <!-- {#if label}
    <span>{label}</span><input type="text" bind:value={text} />
  {/if} -->
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

  select.options {
    display: inline;
    flex-grow: 1;
  }
  span.label {
    flex-grow: 1;
  }
</style>
