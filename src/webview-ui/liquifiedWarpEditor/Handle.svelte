<script context="module">
    let movingElem = null;
</script>

<script>
    import { onMount } from "svelte";
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();
    function onChanged() {
        let value;
        if (vx == null) {
            value = vy - cy;
        } else if (vy == null) {
            value = vx - cx;
        } else {
            value = [vx - cx, vy - cy];
        }

        dispatch("changed", [
            {
                value,
                path,
            },
        ]);
    }

    export let cx = 0,
        cy = 0,
        vx,
        vy,
        speed,
        parentElem,
        path,
        handleSizes = [2, 4],
        postprocess = (v) => v,
        rates;
    let node;
    const [handleSmall, handleBig] = handleSizes.map((v) => v.toString());
    // console.log(handleBig, cx, cy);

    $: [rateX, rateY] = rates;

    function handleMouseDown(e) {
        console.log(e);
        movingElem = node;

        node.setAttribute("r", handleBig);
        // movingElem = true;
    }

    // notes
    // if movement started everyone else should wait

    function handleMove(e) {
        if (movingElem != node) return;
        // console.log("move", e);

        // console.log("lol");

        // if (absPos) {
        //     vx = e.offsetX;
        //     vy = e.offsetY;
        // } else

        if (vx != null) vx = postprocess(vx + e.movementX * rateX);
        if (vy != null) vy = postprocess(vy - e.movementY * rateY);
    }

    function handleMouseUp() {
        if (movingElem != node) return;

        // console.log("up");
        movingElem = null;

        onChanged();
        node.setAttribute("r", handleSmall);
    }

    onMount(() => {
        // console.log("parent", parentElem);
        console.log("handle inti");

        node.addEventListener("mousedown", handleMouseDown);

        parentElem.addEventListener("mousemove", handleMove);
        window.addEventListener("mouseup", handleMouseUp);
    });
</script>

<circle cx={cx + (vx ?? 0)} cy={cy + (vy ?? 0)} bind:this={node} r={handleSmall}> </circle>

<style>
    circle {
        fill: red;
        cursor: move;
        /* pointer-events: all; */
        pointer-events: auto;
    }
</style>
