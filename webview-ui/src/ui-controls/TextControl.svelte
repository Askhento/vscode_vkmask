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

{#if label}
    <span class="label"><span>{label}</span></span>
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

<style>
    * {
        margin: 5px;
    }
    span.label {
        justify-self: var(--label-justify);
        height: var(--global-block-height);
        display: flex;
        justify-content: center;
    }

    input {
        color: var(--vscode-editor-foreground);
        background-color: var(--vscode-input-background);
        border-width: 0;
        height: calc(var(--input-height) * 1px);
    }
</style>
