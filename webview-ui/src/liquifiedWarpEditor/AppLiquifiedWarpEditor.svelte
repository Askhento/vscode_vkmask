<script lang="ts">
    import * as l10n from "@vscode/l10n";
    import { onMount, setContext, tick } from "svelte";
    import { writable } from "svelte/store";
    import { provideVSCodeDesignSystem, allComponents } from "@vscode/webview-ui-toolkit";
    provideVSCodeDesignSystem().register(allComponents);
    import Point from "./Point.svelte";

    import { MessageHandler } from "../common/MessageHandler";
    import type { MessageHandlerData } from "../common/MessageHandler";
    import {
        RequestTarget,
        RequestCommand,
        SelectionType,
        AppState,
        ErrorType,
    } from "../../../src/types";
    import type { Selection, AppError } from "../../../src/types";

    import { logger, logDump } from "../logger";
    import { draggable } from "../actions/draggable";
    const print = logger("AppLiquifiedWarpEditor.svelte");

    const origin = RequestTarget.liquifiedWarpEditor;
    const messageHandler = new MessageHandler(handleMessageApp, origin);
    let selection: Selection = { type: SelectionType.empty },
        effects = writable([]),
        someDataDeleteMe = {},
        bgImageUri = "";

    function handleMessageApp(data: MessageHandlerData<any>) {
        print("recived ", data);
        const { payload, command } = data;

        someDataDeleteMe = data;

        switch (command) {
            case RequestCommand.updateSelection:
                processSelection(payload);
                break;

            case RequestCommand.updateEffects:
                processEffects(payload);
                break;

            // case RequestCommand.showLiquifiedWarpEditor:
            //     init();
            //     break;

            default:
                break;
        }
    }

    async function getEffects() {
        const { payload } = await messageHandler.request({
            target: RequestTarget.extension,
            command: RequestCommand.getEffects,
        });
        processEffects(payload);
    }

    function processEffects(payload) {
        $effects = payload;
        someDataDeleteMe = payload;
    }

    async function getSelection() {
        const { payload } = await messageHandler.request({
            target: RequestTarget.extension,
            command: RequestCommand.getSelection,
        });

        processSelection(payload);
    }

    async function processSelection(newSelection) {
        selection = newSelection;
    }

    async function init() {
        const { payload } = await messageHandler.request({
            target: RequestTarget.extension,
            command: "GetExtensionURI",
        });
        bgImageUri = `https://file%2B.vscode-resource.vscode-cdn.net${payload}/res/liquifiedWarpFaceBackground_v1.png`;

        await getSelection();
        await getEffects();
    }

    const points = [
        {
            type: "zoom",
            anchor: "right_eye",
            offset: [-4.5, 0.0],
            radius: [50.0, 50.0],
            angle: 0.0,
            scale: -100.0,
        },
        {
            type: "zoom",
            anchor: "left_eye",
            offset: [4.5, 0.0],
            radius: [50.0, 50.0],
            angle: 0.0,
            scale: -100.0,
        },
        {
            type: "shift",
            anchor: "mouth",
            offset: [0.0, 0.0],
            radius: [150.0, 150.0],
            angle: 90.0,
            scale: 10.0,
        },
    ];

    const anchors = {
        right_eye: [0.67946824, 0.42857143],
        left_eye: [0.32939439, 0.42857143],
        mouth: [1 / 2, 0.74264706],
    };

    init();

    let imgElem, width, height;

    // function onLoad() {
    //     width = imgElem.width;
    //     height = imgElem.height;
    // }

    $: console.log(width, height);

    $: console.log(imgElem);

    // zoom : https://github.com/Becavalier/Zoomage.js/
</script>

<div class="main-container" bind:clientHeight={height} bind:clientWidth={width}>
    <img src={bgImageUri} />

    {#if height && width}
        <svg {height} {width}>
            {#each points as { offset, radius, anchor }}
                {@const cx = anchors[anchor][0] * width + offset[0]}
                {@const cy = anchors[anchor][1] * height + offset[1]}

                <Point {cx} {cy} rx={radius[0]} ry={radius[1]} />
            {/each}
        </svg>
    {/if}
</div>

<!-- <pre>
    {JSON.stringify(selection, null, "\t")}
</pre> -->

<style>
    .main-container {
        height: 100vh;
        width: 100vw;
        display: flex;
        justify-content: center;
    }

    img {
        height: 100%;
        /* position: fixed; */
        top: 0;
        z-index: -1;
    }

    svg {
        position: fixed;
        cursor: "move";
    }
</style>
