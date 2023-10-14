<script>
    import { dndzone } from "svelte-dnd-action";
    import { flip } from "svelte/animate";

    export let elements = [],
        elementComponent,
        onDrop,
        name = "List",
        dndProps = { dropFromOthersDisabled: true };

    export let flipDurationMs = 300;

    function handleConsider(e) {
        elements = e.detail.items;
    }
    function handleFinalize(e) {
        elements = e.detail.items;
        const dragId = e.detail.info.id;
        // console.log("fin", e);
        onDrop(elements, dragId);
    }

    // console.log("list INIT", elements);
    // use:dndzone={{ items: elements }}
    // on:consider={handleDndConsider}
    // on:finalize={handleDndFinalize}
</script>

<!-- <h3>{name}</h3> -->

<section
    use:dndzone={{ items: elements, flipDurationMs, ...dndProps }}
    on:consider={handleConsider}
    on:finalize={handleFinalize}
>
    {#each elements as element (element.id)}
        <div animate:flip={{ duration: flipDurationMs }}>
            <svelte:component this={elementComponent} {...element} />
        </div>
    {/each}
</section>

<style>
    * {
        box-sizing: border-box;
    }

    /* section {
        padding-left: var(--global-body-padding-left);
    } */

    /* section {
        padding-left: var(--global-body-padding);
    } */
</style>
