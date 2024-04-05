<script context="module">
    // dump from test.mask
    const anchors = {
        right_eye: [-32.3849, 38.1106],
        left_eye: [31.41, 38.6469],
        mouth: [-0.104397, -31.5326],
        middle_eyes: [0.0654058, 43.2928],
        forehead: [-0.775316, 91.3772],
        nose: [2.58272, 4.62893],
        right_cheek: [-56.506, -12.9426],
        left_cheek: [60.1739, -14.9985],
        lower_lip: [0.983203, -34.583],
        upper_lip: [2.43791, -27.9545],
        face: [0, 0],
    };

    const anchorKeys = Object.keys(anchors);
</script>

<script>
    import { flip } from "svelte/animate";

    import Handle from "./Handle.svelte";
    import { createEventDispatcher } from "svelte";

    export let value, editorElement, rates, path;

    let { offset, anchor, radius, angle, type } = value;

    // console.log("point", value, anchors);
    // let anchorPos = anchors[anchor];

    $: anchorPos = anchors[anchor];

    $: ax = anchorPos[0]; // * width;
    $: ay = anchorPos[1]; // * height;
    $: [ox, oy] = offset;
    $: rx = Math.abs(radius[0]);
    $: ry = Math.abs(radius[1]);
    let posMoving = false;

    const dispatch = createEventDispatcher();
    export function onChanged() {
        dispatch("changed", [
            {
                value,
                path,
            },
        ]);
    }
</script>

<!-- {@const cx = anchors[anchor][0] * width + offset[0]}
{@const cy = anchors[anchor][1] * height + offset[1]} -->

<!-- <foreignObject x={ax + 50} y={ay} width="100px" height="500px">
    <div class="controls-wrapper">
        <vscode-dropdown
            position="above"
            value={String(anchorKeys.findIndex((op) => op === anchor))}
            on:change={(e) => {
                // console.log("optoins", e);
                anchor = anchorKeys[parseInt(e.target.value)];
                value.anchor = anchor;

                onChanged();
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
</foreignObject> -->
<circle cx={ax} cy={ay} r="2px"> </circle>
<g transform={`translate(${ax} ${ay})`}>
    <line x1={0} y1={0} x2={ox} y2={oy} stroke-dasharray="2 1" stroke-width="1px" stroke="black"
    ></line>
    <Handle
        cx={0}
        cy={0}
        bind:vx={ox}
        bind:vy={oy}
        parentElem={editorElement}
        {rates}
        on:changed
        path={[...path, "offset"]}
    />
    <text x={5} y={0} font-size="7" font-weight="800" class="coords" transform="scale (1, -1)">
        {anchor}
    </text>
    <g transform={`translate(${ox} ${oy})`}>
        <ellipse class="point" cx="0px" cy="0px" rx={rx + "px"} ry={ry + "px"}> </ellipse>
        <text
            x={-5}
            y={-5}
            font-size="5"
            font-weight="800"
            class="coords"
            transform="scale (1, -1)"
        >
            [{Math.round(ox)},{Math.round(oy)}]
        </text>

        <text
            x={-5}
            y={+5}
            font-size="5"
            font-weight="800"
            class="coords"
            transform="scale (1, -1)"
        >
            {type}
        </text>
        <Handle
            cx={0}
            cy={0}
            bind:vx={rx}
            parentElem={editorElement}
            rates={[rates[0], 0]}
            postprocess={Math.abs}
            on:changed
            path={[...path, "radius", 0]}
        />
        <Handle
            cx={0}
            cy={0}
            bind:vy={ry}
            parentElem={editorElement}
            rates={[0, rates[1]]}
            postprocess={Math.abs}
            on:changed
            path={[...path, "radius", 1]}
        />
    </g>
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
        stroke-width: 2px;
        stroke-dasharray: 10, 10;
        stroke-linejoin: round;
    }

    g {
        cursor: "move";
        pointer-events: none;
    }

    text {
        width: 40px;
        height: 40px;
        z-index: 2;
        /* position: absolute; */
        /* top: 50%; */
        /* left: 50%; */
        font-weight: 800;
        fill: white;
        stroke: black;
        stroke-width: 0.5px;

        stroke-linecap: butt;
        stroke-linejoin: miter;
        stroke-opacity: 1;
        user-select: none;
        transition-duration: 0.5s;
    }

    .hidden {
        opacity: 0;
    }
</style>
