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
    import type { Selection, AppError } from "src/types";

    import { logger, logDump } from "../logger";
    import { draggable } from "../actions/draggable";
    import Loading from "../components/Loading.svelte";
    const print = logger("AppLiquifiedWarpEditor.svelte");

    const origin = RequestTarget.liquifiedWarpEditor;
    const messageHandler = new MessageHandler(handleMessageApp, origin);
    let selection: Selection = { type: SelectionType.empty },
        effects = writable([]),
        someDataDeleteMe = {},
        bgImageUri = "",
        points = [],
        appState = AppState.loading;

    async function handleMessageApp(data: MessageHandlerData<any>) {
        print("recived ", data);
        const { payload, command } = data;

        someDataDeleteMe = data;

        switch (command) {
            case RequestCommand.updateSelection:
                await processSelection(payload);
                updatePoints();
                break;

            case RequestCommand.updateEffects:
                await processEffects(payload);
                updatePoints();
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
        // points = $effects
    }

    function updatePoints() {
        if (
            selection &&
            selection.type === SelectionType.effect &&
            $effects[selection.id].name === "liquifiedwarp"
        ) {
            points = $effects[selection.id].points;
        } else {
            points = [];
        }
        console.log("liq point", points);
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
        appState = AppState.loading;
        const { payload } = await messageHandler.request({
            target: RequestTarget.extension,
            command: RequestCommand.getExtensionURI,
        });
        bgImageUri = `https://file%2B.vscode-resource.vscode-cdn.net${payload}/res/liquifiedWarpFaceBackground_v1.png`;

        await getSelection();
        await getEffects();
        updatePoints();

        appState = AppState.running;
    }

    // const points = [
    //     {
    //         type: "zoom",
    //         anchor: "right_eye",
    //         offset: [-4.5, 0.0],
    //         radius: [50.0, 50.0],
    //         angle: 0.0,
    //         scale: -100.0,
    //     },
    //     {
    //         type: "zoom",
    //         anchor: "left_eye",
    //         offset: [4.5, 0.0],
    //         radius: [50.0, 50.0],
    //         angle: 0.0,
    //         scale: -100.0,
    //     },
    //     {
    //         type: "shift",
    //         anchor: "mouth",
    //         offset: [0.0, 0.0],
    //         radius: [150.0, 150.0],
    //         angle: 90.0,
    //         scale: 10.0,
    //     },
    // ];

    async function onChanged(event) {
        console.log("onChange: ", event);
        const changes = event.detail;
    }

    init();

    let editorElement, width, height;

    // function onLoad() {
    //     width = editorElement.width;
    //     height = editorElement.height;
    // }

    // zoom : https://github.com/Becavalier/Zoomage.js/
</script>

<div class="main-container">
    {#if appState === AppState.loading}
        <Loading />
    {:else if points.length}
        <div
            class="editor-container"
            bind:clientHeight={height}
            bind:clientWidth={width}
            bind:this={editorElement}
        >
            <img src={bgImageUri} />

            {#if height && width}
                <svg>
                    {#await tick()}
                        <!-- promise is pending -->
                    {:then value}
                        <!-- promise was fulfilled -->
                        {#each points as value, i}
                            <!-- {@const cx = anchors[anchor][0] * width + offset[0]}
                        {@const cy = anchors[anchor][1] * height + offset[1]} -->

                            <Point
                                bind:value
                                {editorElement}
                                {width}
                                {height}
                                on:changed={onChanged}
                                path={[i]}
                            />
                        {/each}
                    {/await}
                </svg>
            {/if}
        </div>
    {:else}
        <div class="select-liquify-hint-wrapper">
            <h1>Please select liquifiedwarp effect.</h1>
        </div>
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
        pointer-events: none;
    }

    .editor-container {
        position: relative;
        height: 100%;
        width: fit-content;
        /* pointer-events: none; */
    }

    img {
        height: 100%;
        /* position: fixed; */
        top: 0;
        z-index: -1;
        pointer-events: all;

        user-select: none;
    }

    div.select-liquify-hint-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    svg {
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        position: absolute;
        cursor: "move";
    }
</style>
