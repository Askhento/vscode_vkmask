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

    // on:change={(e) => {
    //         if (e.target) {
    //             value = e.target.value;
    //         }
    //     }}
</script>

{#if label}
    <span class="label"><span>{label}</span></span>
    <vscode-text-field
        class="value"
        type="text"
        {value}
        on:keydown={({ key, target }) => {
            // console.log(key);
            if (key === "Enter") {
                value = target.value;
                target.blur();
                sendValue();
            } else if (key === "Escape") {
                target.value = value;
                target.blur();
            }
        }}
    />
{/if}

<style>
    * {
        margin: var(--global-margin);
    }
    span.label {
        justify-self: var(--label-justify);
        height: var(--global-block-height);
        display: flex;
        justify-content: center;
    }

    vscode-text-field {
        /* margin: unset; */
        height: var(--global-block-height);
        text-align: center;
        /* width: 100%; */
    }
    /* input {
        color: var(--vscode-editor-foreground);
        background-color: var(--vscode-input-background);
        border-width: 0;
        height: calc(var(--input-height) * 1px);
    } */
</style>
