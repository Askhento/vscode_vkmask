<script context="module">
    let movingElem = null;
</script>

<script>
    import { onMount } from "svelte";
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();
    function onChanged() {
        // dispatch("changed", [
        //     {
        //         value,
        //         path,
        //     },
        // ]);
    }

    export let cx,
        cy,
        vx,
        vy,
        parentElem,
        path,
        absPos = false;
    let node;

    function handleMouseDown(e) {
        console.log(e);
        movingElem = node;

        node.setAttribute("r", "10");
        // movingElem = true;
    }

    // notes
    // if movement started everyone else should wait

    function handleMove(e) {
        if (movingElem != node) return;
        // console.log("move", e);

        // console.log("lol");

        if (absPos) {
            vx = e.offsetX;
            vy = e.offsetY;
        } else {
            vx += e.movementX;
            vy += e.movementY;
            // console.log(cx, cy);
        }
    }

    function handleMouseUp() {
        // console.log("up");
        movingElem = null;

        onChanged();
        node.setAttribute("r", "5");
    }

    onMount(() => {
        // console.log("parent", parentElem);
        console.log("handle inti");

        node.addEventListener("mousedown", handleMouseDown);

        parentElem.addEventListener("mousemove", handleMove);
        window.addEventListener("mouseup", handleMouseUp);
    });
</script>

<circle {vx} {vy} bind:this={node} r="5"> </circle>

<style>
    circle {
        fill: red;
        cursor: move;
        /* pointer-events: all; */
        pointer-events: auto;
    }
</style>
