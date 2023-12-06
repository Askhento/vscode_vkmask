<script lang="ts">
    import * as l10n from "@vscode/l10n";

    import { createEventDispatcher } from "svelte";

    export let label, value, path, params;

    if (value == null) value = params.defValue;
    let options = params.options;
    // $: console.log(
    //     "option contorl",
    //     value,
    //     options,
    //     options.findIndex((op) => op === value),
    //     params
    // );

    const dispatch = createEventDispatcher();
    $: {
        dispatch("changed", [
            {
                value,
                path,
                structural: true,
            },
        ]);
    }
</script>

<span class="label" title={label}>
    <span>{l10n.t(label)}</span>
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
    {#each params.optionLabels ?? options as option, i}
        <vscode-option class="option" value={i}
            ><span class="option-text">
                {l10n.t(option)}
            </span></vscode-option
        >
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

    vscode-dropdown {
        height: var(--global-block-height);
        min-width: 0;
    }
    vscode-dropdown::part(control) {
        border-radius: var(--global-border-raduis);
    }

    .option {
        margin: 0;
        height: var(--global-block-height);
    }

    .option-text {
        height: fit-content;
        margin: 0;
        margin-left: var(--global-margin);
    }

    vscode-option::part(content) {
        /* color: red; */
        display: flex;
        /* flex-direction: column; */
        /* justify-content: center; */
        align-items: center;
        width: 100%;
    }

    span.label {
        height: var(--global-block-height);
        display: flex;
        justify-content: var(--label-justify);
    }

    span.label > span {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }
</style>
