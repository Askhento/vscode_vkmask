<script context="module">
    const anchors = {
        right_eye: [0.67946824, 0.42857143],
        left_eye: [0.32939439, 0.42857143],
        mouth: [1 / 2, 0.74264706],
    };

    const anchorKeys = Object.keys(anchors);
</script>

<script>
    import { flip } from "svelte/animate";

    import Handle from "./Handle.svelte";

    export let value, editorElement, width, height, path;

    let { offset, anchor, radius } = value;

    // let anchorPos = anchors[anchor];

    $: anchorPos = anchors[anchor];

    $: ax = anchorPos[0] * width;
    $: ay = anchorPos[1] * height;
    $: [rx, ry] = radius;

    let posMoving = false;
</script>

<!-- {@const cx = anchors[anchor][0] * width + offset[0]}
{@const cy = anchors[anchor][1] * height + offset[1]} -->

<foreignObject x={ax + 50} y={ay} width="100px" height="100px">
    <div class="controls-wrapper">
        <vscode-dropdown
            position="above"
            value={String(anchorKeys.findIndex((op) => op === anchor))}
            on:change={(e) => {
                console.log("optoins", e);
                anchor = anchorKeys[parseInt(e.target.value)];
                value.anchor = anchor;
            }}
        >
            {#each anchorKeys as option, i}
                <vscode-option class="option" value={i}
                    ><span class="option-text">
                        {option}
                    </span></vscode-option
                >
            {/each}
        </vscode-dropdown>
    </div>
</foreignObject>
<g transform={`translate(${ax} ${ay})`}>
    <text x={20} y={0} class:hidden={false} class="coords">
        {Math.round(ax) + "px"}
    </text>
    <text x={0} y={20} class:hidden={false} class="coords">
        {Math.round(ay) + "px"}
    </text>

    <ellipse class="point" cx="0px" cy="0px" rx={rx + "px"} ry={ry + "px"}> </ellipse>
    <circle {ax} {ay} r="5"> </circle>

    <!-- <Handle
        cx={0}
        cy={0}
        bind:vx={cx}
        bind:vy={cy}
        absPos={true}
        {parentElem}
        on:changed
        path={[...path, "offset"]}
    />
    <Handle cx={rx} cy={0} bind:vx={rx} {parentElem} on:changed path={[...path, "radius", 0]} />
    <Handle cx={0} cy={ry} bind:vy={ry} {parentElem} on:changed path={[...path, "radius", 1]} /> -->

    <!-- <Handle bind:vx={} bind:vy={}  /> -->
</g>

<style>
    div.controls-wrapper {
        z-index: 20;
        pointer-events: all;
        /* position: absolute; */
    }

    circle {
        fill: red;
        cursor: move;
        /* pointer-events: all; */
        pointer-events: auto;
    }

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
