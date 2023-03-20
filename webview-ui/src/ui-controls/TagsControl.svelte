<script lang="ts">
  export let label = "empty",
    value;

  $: tags = value.split(";");
  function joinTags() {
    value = tags.join(";");
    console.log("joined! " + value);
  }
</script>

<div class="text-control-wrapper">
  {#if label}
    <span class="label">{label}</span>
    {#each tags as tag, index}
      <input
        class="value"
        type="text"
        bind:value={tags[index]}
        on:change={joinTags}
      />
    {/each}
  {/if}
</div>

<style>
  * {
    margin: 5px;
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
