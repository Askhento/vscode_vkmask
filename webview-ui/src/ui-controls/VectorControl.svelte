<script lang="ts">
  export let label = "empty",
    value;
</script>

<div class="vector-control-wrapper">
  {#if label}
    <span class="label">{label}</span>
    {#each value as v, index}
      <input class="value" type="number" bind:value={value[index]} />
    {/each}
  {/if}
</div>

<style>
  * {
    margin: 5px;
  }
  .vector-control-wrapper {
    position: relative;
    display: flex;
  }

  input.value {
    flex-grow: 1;
    max-width: 40px;
  }
  span.label {
    flex-grow: 1;
  }
</style>
