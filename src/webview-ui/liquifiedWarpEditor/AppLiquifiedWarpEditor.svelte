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
    import { applyValueByPath2 } from "../utils/applyValueByPath";
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

    function sendEffects() {
        messageHandler.send({
            command: RequestCommand.updateEffects,
            target: RequestTarget.extension,
            payload: $effects,
        });
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
            points = $effects[selection.id].points ?? [];
        } else {
            points = [];
        }
        // !!!!
        points = [...points];
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
        // await tick();
        appState = AppState.loading;
        const { payload } = await messageHandler.request({
            target: RequestTarget.extension,
            command: RequestCommand.getExtensionURI,
        });
        bgImageUri = `https://file%2B.vscode-resource.vscode-cdn.net/${payload}/res/liquifiedWarpFaceBackground_v1.png`;

        await getSelection();
        await getEffects();
        updatePoints();

        appState = AppState.running;
    }

    async function onChanged(event) {
        console.log("onChange: ", event);
        const changes = event.detail;

        let needRerender = false;

        let tempEffects = $effects;

        changes.forEach(({ path, value, structural }) => {
            const [root, ...pathClone] = [...path];

            print("changes liq", path, value);
            tempEffects = applyValueByPath2(tempEffects, pathClone, value);
            needRerender = needRerender || structural;
        });

        // console.log(tempEffects);

        sendEffects();
    }
    // style = "background-image: url('{bgImageUri}')";
    //

    let editorElement, imgWidth, imgHeight;

    // just some magic numbers!
    const targetWidth = 170,
        targetHeight = 220;
    const offsetHeight = -20;

    let containerWidth, containerHeight;
    $: ratio = imgWidth / imgHeight;
    $: width = Math.min(containerWidth, containerHeight * ratio);
    $: height = Math.min(containerHeight, containerWidth / ratio);
    $: rateX = targetWidth / width;
    $: rateY = targetHeight / height;

    init();

    // zoom : https://github.com/Becavalier/Zoomage.js/
</script>

<div class="main-container">
    <!-- {#key points} -->
    {#if appState === AppState.loading}
        <Loading />
    {:else if points.length > 0}
        <img src={bgImageUri} bind:naturalWidth={imgWidth} bind:naturalHeight={imgHeight} />
        <div
            class="editor-container"
            bind:clientHeight={containerHeight}
            bind:clientWidth={containerWidth}
        >
            {#if width && height && rateX && rateY}
                <svg
                    bind:this={editorElement}
                    style="width:{width}; height:{height};"
                    {width}
                    {height}
                    viewBox="{-0.5 * targetWidth} {-0.5 * targetHeight +
                        offsetHeight} {targetWidth} {targetHeight}"
                >
                    <g transform="scale (1, -1)">
                        {#if editorElement}
                            {#each points as value, i (value)}
                                <Point
                                    {value}
                                    {editorElement}
                                    rates={[rateX, rateY]}
                                    on:changed={onChanged}
                                    path={[SelectionType.effect, selection.id, "points", i]}
                                />
                            {/each}
                        {/if}
                    </g>
                </svg>
            {/if}
        </div>
    {:else}
        <div class="select-liquify-hint-wrapper">
            <h1>Please select liquifiedwarp effect.</h1>
        </div>
    {/if}
    <!-- {/key} -->
</div>

<style>
    .main-container {
        height: 100vh;
        width: 100vw;
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        pointer-events: none;
    }

    /* .editor-height-sizer {
        position: relative;
        width: 100%;
        background-color: rgba(47, 0, 255, 0.548);
        display: flex;
        justify-content: center;
        align-items: center;
    } */

    .editor-container {
        display: flex;
        justify-content: center;
        align-items: center;
        /* position: absolute; */
        width: 100%;
        height: 100%;
        /* aspect-ratio: 2; */

        /* object-fit: contain; */
        /* background-color: rgba(255, 0, 0, 0.467); */
        /* background-size: contain;
        background-position: center;
        background-repeat: no-repeat; */
        /* width: fit-content; */
        /* height: fit-content; */
        pointer-events: none;
    }

    img {
        /* height: 100%; */
        object-fit: contain;
        position: absolute;
        /* max-width: 100%; */
        /* max-height: 100%; */
        /* width: auto; */
        /* height: auto; */

        /* max-width: 100%; */
        /* max-height: 100%; */
        /* width: auto; */
        /* height: auto; */
        /* position: fixed; */
        /* top: 0; */

        /* z-index: -1; */
        pointer-events: none;

        user-select: none;
    }

    div.select-liquify-hint-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    svg {
        /* top: 0; */
        /* left: 0; */
        /* position: absolute; */
        width: 100%;
        height: 100%;
        cursor: "move";
        pointer-events: all;
    }
</style>
