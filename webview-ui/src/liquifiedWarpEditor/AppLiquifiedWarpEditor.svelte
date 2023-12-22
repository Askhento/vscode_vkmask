<script lang="ts">
    import * as l10n from "@vscode/l10n";
    import { setContext, tick } from "svelte";
    import { writable } from "svelte/store";
    import { provideVSCodeDesignSystem, allComponents } from "@vscode/webview-ui-toolkit";
    provideVSCodeDesignSystem().register(allComponents);

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
    const print = logger("AppLiquifiedWarpEditor.svelte");

    const origin = RequestTarget.liquifiedWarpEditor;
    const messageHandler = new MessageHandler(handleMessageApp, origin);
    let selection: Selection = { type: SelectionType.empty },
        effects = writable([]),
        someDataDeleteMe = {};

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

    init();

    // zoom : https://github.com/Becavalier/Zoomage.js/
</script>

<img
    src="https://file%2B.vscode-resource.vscode-cdn.net/Users/askhento/PROJECTOS/urhovk/vscode_vkmask/vkmask/res/liquifiedWarpFaceBackground.png"
/>
<pre>
    {JSON.stringify(selection, null, "\t")}
</pre>

<style>
    img {
        height: 100vh;
        position: fixed;
        top: 0;
        z-index: -1;
    }
</style>
