<script lang="ts">
  import { onMount } from "svelte";

  export let label = "empty",
    value,
    params;

  // !!! just a hack
  onMount(() => {
    console.log("vector", value);
    if (value === undefined || value.length === 0) value = params.default;
  });

  // todo : add slider to move all values at the same time
</script>

<div class="vector-control-wrapper">
  {#if label && value}
    <span class="label">{label}</span>
    {#each value as v, index}
      <!-- <vscode-text-area
        class="value"
        type="number"
        rows="1"
        cols="5"
        value={v}
        on:change={(e) => {
          //   console.log(e);
          v = parseFloat(e.target.value);
        }}
      /> -->
      <input class="value" type="number" bind:value={value[index]} />
      <!-- {/each}
    {:else}
      {#each params.default as v, index}
        <input class="value" type="number" bind:value={params.default[index]} /> -->
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
    color: var(--input-foreground);
    background: var(--input-background);
    border-radius: calc(var(--corner-radius) * 1px);
    border: calc(var(--border-width) * 1px) solid var(--dropdown-border);
    font-style: inherit;
    font-variant: inherit;
    font-weight: inherit;
    font-stretch: inherit;
    font-family: inherit;
    font-size: var(--type-ramp-base-font-size);
    line-height: var(--type-ramp-base-line-height);
    padding: calc(var(--design-unit) * 2px + 1px);
    width: 100%;
    /* min-width: var(--input-min-width); */
    flex-grow: 1;
    max-width: 50px;
    resize: none;
  }
  span.label {
    flex-grow: 1;
  }
</style>
