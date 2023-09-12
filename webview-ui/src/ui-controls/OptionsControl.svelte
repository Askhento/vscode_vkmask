<script lang="ts">
    import { createEventDispatcher } from "svelte";

    export let label, value, path, params;
    let options = params.options;
    // $: console.log(
    //     "option contorl",
    //     value,
    //     options,
    //     options.findIndex((op) => op === value)
    // );

    const dispatch = createEventDispatcher();
    $: {
        dispatch("changed", {
            value,
            path,
            structural: true,
        });
    }
</script>

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
    value={String(options.findIndex((op) => op === value))}
    on:change={(e) => {
        console.log("optoins", e);
        value = options[parseInt(e.target.value)];
    }}
>
    {#each options as option, i}
        <vscode-option value={i}>{option}</vscode-option>
    {/each}
</vscode-dropdown>

<style>
    * {
        margin: var(--global-margin);
        padding: 0;
        box-sizing: border-box;
    }
    /* .option-control-wrapper {
    position: relative;
    display: flex;
  } */

    /* select.options {
    display: inline;
    flex-grow: 1;
  } */
    span.label {
        justify-self: var(--label-justify);
    }
</style>
