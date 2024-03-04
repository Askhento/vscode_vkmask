<script lang="ts">
    import * as l10n from "@vscode/l10n";

    import { createEventDispatcher } from "svelte";
    import InfoBox from "../components/InfoBox.svelte";

    export let label, value, path, params;
    let infoVisible = false;

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
    function onChange() {
        dispatch("changed", [
            {
                value,
                path,
                structural: false,
            },
        ]);
    }
</script>

<span
    class="label"
    title={l10n.t(label)}
    on:mouseleave={() => {
        infoVisible = false;
    }}
    on:mouseover={() => {
        infoVisible = true;
    }}><span>{l10n.t(label)}</span></span
>

<span
    class="control-wrapper"
    on:mouseleave={() => {
        infoVisible = false;
    }}
    on:mouseover={() => {
        infoVisible = true;
    }}
>
    <vscode-dropdown
        position="above"
        value={String(options.findIndex((op) => op === value))}
        on:change={(e) => {
            // console.log("optoins", e);
            value = options[parseInt(e.target.value)];
            onChange();
        }}
        on:keydown|capture={(e) => {
            if (e.key === "Escape" || e.key === "Meta") {
                e.stopPropagation();
                e.target.setAttribute(
                    "current-value",
                    String(options.findIndex((op) => op === value))
                );

                e.target.blur();

                return;
            }
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
    <InfoBox visible={infoVisible} info={params.info} />
</span>

<style>
    * {
        margin: var(--global-margin);
        padding: 0;
        box-sizing: border-box;
    }
    /* .option-control-wrapper {
		padding-right: var(--global-body-padding-right);

    position: relative;
    display: flex;
  } */

    /* select.options {
    display: inline;
    flex-grow: 1;
  } */
    .control-wrapper {
        padding-right: var(--global-body-padding-right);
        position: relative;
        display: flex;
        margin: unset;
    }
    vscode-dropdown {
        width: 100%;
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
        padding: var(--global-margin);
        padding-left: var(--global-body-padding-left);
        padding-right: var(--global-label-control-gap);
        margin: var(--global-margin) 0 var(--global-margin) 0;

        height: var(--global-block-height);
        display: flex;
        justify-content: var(--label-justify);
    }

    span.label > span {
        margin: 0;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }
</style>
