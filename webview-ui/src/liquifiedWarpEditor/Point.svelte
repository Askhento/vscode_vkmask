<script>
    import Handle from "./Handle.svelte";

    export let cx, cy, rx, ry, parentElem;

    let posMoving = false;
</script>

<!-- {@const cx = anchors[anchor][0] * width + offset[0]}
{@const cy = anchors[anchor][1] * height + offset[1]} -->

<g transform={`translate(${cx} ${cy})`}>
    <text x={20} y={0} class:hidden={false} class="coords">
        {Math.round(cx) + "px"}
    </text>
    <text x={0} y={20} class:hidden={false} class="coords">
        {Math.round(cy) + "px"}
    </text>

    <ellipse class="point" cx="0px" cy="0px" rx={rx + "px"} ry={ry + "px"}> </ellipse>
    <Handle cx={0} cy={0} bind:vx={cx} bind:vy={cy} absPos={true} {parentElem} />
    <Handle cx={rx} cy={0} bind:vx={rx} {parentElem} />
    <Handle cx={0} cy={ry} bind:vy={ry} {parentElem} />

    <!-- <Handle bind:vx={} bind:vy={}  /> -->
</g>

<style>
    .point {
        position: absolute;
        fill: rgba(127, 127, 127, 0.2);
        stroke: dodgerblue;
        stroke-width: 4px;
        stroke-dasharray: 10, 10;
        stroke-linejoin: round;
    }

    g {
        cursor: "move";
        pointer-events: none;
    }

    text.coords {
        width: 100px;
        height: 100px;
        z-index: 2;
        /* position: absolute; */
        /* top: 50%; */
        /* left: 50%; */
        fill: rgb(14, 201, 14);
        user-select: none;
        transition-duration: 0.5s;
    }

    .hidden {
        opacity: 0;
    }
</style>
