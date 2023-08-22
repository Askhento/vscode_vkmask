<script lang="ts">
    import { setContext } from "svelte";
    import { writable } from "svelte/store";
    import { provideVSCodeDesignSystem, allComponents } from "@vscode/webview-ui-toolkit";
    import { MessageHandler } from "../common/MessageHandler";
    import type { MessageHandlerData } from "../common/MessageHandler";
    import WelcomeScreen from "./WelcomeScreen.svelte";
    import { RequestTarget, RequestCommand, SelectionType } from "../../../src/types";
    import { logger, logDump } from "../logger";
    const print = logger("AppProjectManager.svelte");

    const origin = RequestTarget.projectManager;

    import ObjectControl from "../ui-controls/ObjectControl.svelte";
    import { MaskSettingsParserForUI } from "../ui-controls/Controls.js";

    provideVSCodeDesignSystem().register(allComponents);

    let maskSettings, uiElements;
    const assets = writable([]);
    const settings = writable([]);

    const messageHandler = new MessageHandler(handleMessageApp, origin);

    setContext("stores", { assets, settings, messageHandler });

    function handleMessageApp(data: MessageHandlerData<any>) {
        print("recived ", data);
        const { payload, command } = data;
        switch (command) {
            case RequestCommand.getLogs:
                returnLogs(data);
                break;

            case RequestCommand.updateMaskSettings:
                processMaskSettings(payload);
                break;

            case RequestCommand.updateSettings:
                processSettings(payload);
                break;

            case RequestCommand.updateAssets:
                processAssets(payload);
                break;

            default:
                break;
        }
    }

    function processAssets(newAssets) {
        print("new assets", newAssets);
        $assets = newAssets;
    }

    async function getAssets() {
        const { payload } = await messageHandler.request({
            target: RequestTarget.extension,
            command: RequestCommand.getAssets,
        });

        processAssets(payload);
    }

    function processSettings(newSettings) {
        print("new settings", newSettings);
        $settings = newSettings;
    }

    async function getSettings() {
        const { payload } = await messageHandler.request({
            target: RequestTarget.extension,
            command: RequestCommand.getSettings,
        });
        processSettings(payload);
    }

    function processMaskSettings(payload) {
        maskSettings = payload;
        parseUI();
    }
    async function getMaskSettings() {
        const { payload } = await messageHandler.request({
            target: RequestTarget.extension,
            command: RequestCommand.getMaskSettings,
        });

        print("new mask settings", payload);
        processMaskSettings(payload);
    }

    function sendMaskSettings() {
        messageHandler.send({
            command: RequestCommand.updateMaskSettings,
            target: RequestTarget.extension,
            payload: maskSettings,
        });
    }

    function returnLogs(data: MessageHandlerData<any>) {
        messageHandler.send({
            ...data,
            target: data.origin,
            payload: logDump,
        });
    }

    async function onChanged(event) {
        console.log("onChange: ", event);
        const { path, value, structural } = event.detail;

        applyValueByPath(maskSettings, path, value);
        print("updated maskSettings", maskSettings);
        sendMaskSettings();

        if (structural) {
            maskSettings = maskSettings;
        }
        //!!! structural
    }

    function applyValueByPath(obj, path, value) {
        // parts = path.split(".");
        // console.log(obj, path, value);
        if (path.length === 0) {
            obj = value;
            return;
        }

        if (path.length === 1) {
            obj[path[0]] = value;
        } else {
            applyValueByPath(obj[path[0]], path.slice(1), value);
        }
    }

    function parseUI() {
        let parseResult = MaskSettingsParserForUI.safeParse(maskSettings);

        if (parseResult.success) {
            uiElements = parseResult.data;
        } else {
            print(parseResult.error);
            // onError(parseResult.error);
        }
    }

    async function init() {
        await getSettings();
        await getAssets(); // ???? add filter to the query

        await getMaskSettings();
    }

    init();
</script>

<!-- <pre> {JSON.stringify(maskSettings, null, "\t")}</pre> -->
{#if maskSettings}
    {#key maskSettings}
        {#if uiElements}
            <ObjectControl
                expanded={true}
                nesting={true}
                value={maskSettings}
                label={"MaskSettings"}
                path={[]}
                uiElements={uiElements.value}
                on:changed={onChanged}
            />
        {:else}
            <div>ui not parsed</div>
        {/if}
    {/key}
{:else}
    <WelcomeScreen />
{/if}

<style>
    div {
        background-color: transparent;
    }
</style>
