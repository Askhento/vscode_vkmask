<script lang="ts">
    import { createEventDispatcher } from "svelte";

    export let label = "empty",
        value,
        path;

    let displayValue = value;
    //   $: console.log(text);
    console.log("text contorl value : ", value);

    const dispatch = createEventDispatcher();

    function sendValue() {
        console.log("should send value");
        dispatch("changed", {
            value,
            path,
        });
    }
</script>

<div class="text-control-wrapper">
    {#if label}
        <span class="label">{label}</span>
        <input
            class="value"
            type="text"
            bind:value
            on:keydown={({ key, target }) => {
                // console.log(key);
                if (key === "Enter") {
                    displayValue = value;
                    //@ts-expect-error
                    target.blur();
                    sendValue();
                } else if (key === "Escape") {
                    value = displayValue;
                    //@ts-expect-error
                    target.blur();
                }
            }}
        />
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
