<script lang="ts">
  export let label = "empty",
    value;

  //   $: console.log(text);
</script>

<div class="text-control-wrapper">
  {#if label}
    <span class="label">{label}</span>
    <input class="value" type="text" bind:value />
  {/if}
</div>

<style>
  * {
    padding: 5px;
  }
  .text-control-wrapper {
    position: relative;
    display: flex;
  }

  input.value {
    flex-grow: 2;
  }
  span.label {
    flex-grow: 1;
  }
</style>
