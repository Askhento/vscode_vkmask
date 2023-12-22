<script>
    import { onMount } from "svelte";

    export let cx,
        cy,
        vx,
        vy,
        moving = false;
    let node;

    function handleMouseDown() {
        moving = true;
    }

    function handleMove(e) {
        if (moving) {
            vx += e.movementX;
            vy += e.movementY;
            // console.log(cx, cy);
        }
    }

    function handleMouseUp() {
        moving = false;
    }

    onMount(() => {
        node.addEventListener("mousedown", handleMouseDown);
        window.addEventListener("mousemove", handleMove);
        window.addEventListener("mouseup", handleMouseUp);
    });
</script>

<circle {cx} {cy} bind:this={node} r={5}> </circle>

<style>
    circle {
        fill: red;
        cursor: move;
        pointer-events: auto;
    }
</style>
