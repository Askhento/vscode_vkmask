<script lang="ts">
  export let label = "empty",
    value = 0,
    min = 0,
    max = 100;

  // $: console.log(value);
</script>

<div class="number-control-wrapper">
  {#if label}
    <span class="label">{label}</span>
    <span class="number">{value}</span>
    <input class="slider" type="range" bind:value {min} {max} />
  {/if}
</div>

<style>
  * {
    padding: 5px;
  }
  .number-control-wrapper {
    position: relative;
    display: flex;
    justify-content: start;
  }

  span.number {
    display: inline-block;
    flex: 1 0 0px;
  }
  span.label {
    display: inline-block;
    flex: 1 0 0px;
  }

  input.slider {
    display: inline-block;
    flex: 2 0 0px;
  }
</style>
