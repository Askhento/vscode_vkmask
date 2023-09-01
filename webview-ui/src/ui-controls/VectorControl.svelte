<script>
    import { onMount } from "svelte";
    import { createEventDispatcher } from "svelte";

    export let label = "empty",
        value,
        path,
        params;

    // !!! just a hack
    onMount(() => {
        // console.log("mounted vector");
        if (value === undefined || value.length === 0) value = params.default;
    });

    const dispatch = createEventDispatcher();
    $: {
        dispatch("changed", {
            value: value.map(parseFloat), // !!!! hack
            path,
        });
    }

    // todo : add slider to move all values at the same time
</script>

{#if label && value}
    <span class="label">{label}</span>
    <div class="vector-control-wrapper">
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
            <input class="value" bind:value={value[index]} />
            <!-- {/each}
    {:else}
      {#each params.default as v, index}
        <input class="value" type="number" bind:value={params.default[index]} /> -->
        {/each}
    </div>
{/if}

<style>
    * {
        margin: var(--global-margin);
    }
    .vector-control-wrapper {
        display: flex;
        flex-direction: row;
        /* min-height: fit-content; */
        justify-content: start;
        flex-wrap: wrap;
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
        /* min-width: var(--input-min-width); */
        text-align: center;
        flex-grow: 1;
    }
    span.label {
        justify-self: var(--label-justify);
    }

    /* div {
        color: aqua;
        background-color: var(--main-bg-color);
    } */
</style>
