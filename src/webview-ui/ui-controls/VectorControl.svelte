<script>
    import * as l10n from "@vscode/l10n";
    import { reduceError } from "../common/errorParsing";
    import { createEventDispatcher, onMount, getContext } from "svelte";
    import { get_current_component } from "svelte/internal";
    const component = get_current_component();
    import { applyDeps } from "../common/controlDependencies";
    import InfoBox from "../components/InfoBox.svelte";
    const stores = getContext("stores");
    const { assets, settings, messageHandler, effects } = stores;

    export let label,
        value,
        path,
        params,
        error = null,
        runtimeInfo = {},
        disabled = false;

    let infoVisible = false;

    if (value == null || value.length === 0 || error) value = params.defValue;

    // title={params.valueLabels[index] +
    //                 " " +
    //                 ((index == reducedError?.path.at(-1) && reducedError?.message) || "")}
    //             class:error={index == reducedError?.path.at(-1)}
    // let reducedError = null;
    // if (error) {
    //     const { name, _errors, ...formated } = error.format();
    //     reducedError = reduceError(formated, []);
    //     console.log("vec reduced", reducedError);
    // }

    const dispatch = createEventDispatcher();
    function onChanged() {
        dispatch("changed", [
            {
                value, // !!!! hack
                path,
            },
        ]);
    }

    // export function test() {
    //     console.log("test vector control");
    // }

    onMount(() => {
        // component.test();
        applyDeps(component, stores, params.dependencies);
    });
    // todo : add slider to move all values at the same time

    // title={error != null ? error.format() : null}
</script>

{#if label && value}
    <!-- <span class="label"><span class="label-text">{l10n.t(label)}</span></span> -->
    <span
        class="labels-wrapper"
        on:mouseleave={() => {
            infoVisible = false;
        }}
        on:mouseover={() => {
            infoVisible = true;
        }}
    >
        {#each params.valueLabels as valueLabel, index}
            <span class="label" title={l10n.t(label)}>
                {#if index === 0}
                    <span class="label-text">{l10n.t(label)}</span>
                {/if}
                <span class="value-label-text">{valueLabel}</span>
            </span>
        {/each}
    </span>
    <span
        class="control-wrapper"
        on:mouseleave={() => {
            infoVisible = false;
        }}
        on:mouseover={() => {
            infoVisible = true;
        }}
    >
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
            <input
                class="value"
                value={v}
                {disabled}
                class:input-disabled={disabled}
                on:keydown={(e) => {
                    switch (e.key) {
                        case "Escape":
                            e.target.value = value[index];
                            e.target.blur();
                            break;
                        case "Enter":
                            e.target.blur();
                        default:
                            break;
                    }
                }}
                on:change={(e) => {
                    // console.log("vector", e);
                    const parsed = parseFloat(e.target.value);
                    // console.log("vector parsed ", parsed);
                    if (isNaN(parsed) || isNaN(e.target.value)) {
                        e.target.value = value[index];
                        return;
                    }
                    value[index] = parsed;
                    onChanged();
                }}
            />
            {#key runtimeInfo}
                <InfoBox bind:visible={infoVisible} info={{ ...params.info, ...runtimeInfo }} />
            {/key}
        {/each}
    </span>
{/if}

<style>
    * {
        margin: 0;

        padding: 0;
        box-sizing: border-box;
    }

    .labels-wrapper {
        display: flex;
        flex-direction: column;

        /* min-height: fit-content; */
        justify-content: space-around;
        /* flex-wrap: wrap; */
        margin: 0;
        min-width: var(--global-min-width);

        padding-right: var(--global-label-control-gap);
        padding-left: var(--global-body-padding-left);
        /* justify-content: var(--label-justify);
        align-items:  var(--label-align); */
    }

    span.label {
        /* padding-left: var(--global-body-padding-left); */

        margin: 0;
        height: var(--global-block-height);
        display: flex;
        justify-content: var(--label-justify);
        align-items: var(--label-align);
        width: 100%;
        /* min-width: var(--global-min-width); */
    }
    span.label-text {
        padding: var(--global-margin);
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }

    span.value-label-text {
        padding: var(--global-margin);
    }

    .control-wrapper {
        padding-right: var(--global-body-padding-right);
        padding-bottom: var(--global-margin);
        padding-top: var(--global-margin);
        padding-left: var(--global-margin);

        padding-left: var(--global-margin);
        position: relative;
        display: flex;
        row-gap: var(--global-margin);
        flex-direction: row;
        /* min-height: fit-content; */
        /* justify-content: start; */
        flex-wrap: wrap;
        margin: 0;
        min-width: var(--global-min-width);
    }

    input.value {
        box-sizing: content-box;
        color: var(--input-foreground);
        background: var(--input-background);
        border-radius: var(--global-border-raduis);
        border: calc(var(--border-width) * 1px) solid var(--dropdown-border);
        font-style: inherit;
        font-variant: inherit;
        font-weight: inherit;
        font-stretch: inherit;
        font-family: inherit;
        font-size: var(--type-ramp-base-font-size);
        line-height: var(--type-ramp-base-line-height);
        /* min-width: var(--input-min-width); */
        text-align: center;
        flex-grow: 1;
        height: var(--global-block-height-borded);
        min-width: var(--global-min-width);
    }

    input.input-disabled {
        opacity: var(--disabled-opacity);
        cursor: not-allowed;
    }

    /* input.error {
        color: red;
    } */
</style>
