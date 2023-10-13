<script lang="ts">
    import * as l10n from "@vscode/l10n";
    import { setContext } from "svelte";
    import { writable } from "svelte/store";
    import { provideVSCodeDesignSystem, allComponents } from "@vscode/webview-ui-toolkit";
    import { MessageHandler } from "../common/MessageHandler";
    import type { MessageHandlerData } from "../common/MessageHandler";
    import WelcomeScreen from "./WelcomeScreen.svelte";
    import { RequestTarget, RequestCommand, SelectionType, AppState } from "../../../src/types";
    import { logger, logDump } from "../logger";
    const print = logger("AppProjectManager.svelte");

    const origin = RequestTarget.projectManager;

    import { applyValueByPath2 } from "../utils/applyValueByPath";
    import ObjectControl from "../ui-controls/ObjectControl.svelte";
    import { MaskSettingsParserForUI } from "../ui-controls/Controls.js";
    import type { RecentProjectInfo } from "src/RecentProjectInfo";

    provideVSCodeDesignSystem().register(allComponents);

    let maskSettings, uiElements;
    let appState = AppState.loading;

    const assets = writable([]);
    const settings = writable([]);
    let recentProjectInfo: RecentProjectInfo[] = [];

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

            case RequestCommand.updateAppState:
                processAppState(payload);
                break;

            case RequestCommand.getRecentProjectInfo:
                recentProjectInfo = payload;
                break;

            default:
                break;
        }
    }

    async function getAppState() {
        const { payload } = await messageHandler.request({
            target: RequestTarget.extension,
            command: RequestCommand.getAppState,
        });
        processAppState(payload);
    }

    function processAppState(payload) {
        appState = payload.state;
        // error = payload.error; // will be undefined
        print("state", payload);
        // if (appState === AppState.error) {
        //     onError(error);
        // }
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

        // print("val by path 2");
        // applyValueByPath(maskSettings, path, value);
        maskSettings = applyValueByPath2(maskSettings, path, value);
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

        const lastPath = path[0];

        if (path.length === 1) {
            // if (value == null) {
            //     // delete obj[lastPath];
            //     const { [lastPath]: removed, ...rest } = obj;
            //     obj = rest;
            // } else {
            // }
            obj[lastPath] = value;
        } else {
            applyValueByPath(obj[lastPath], path.slice(1), value);
        }
    }

    function parseUI() {
        let parseResult = MaskSettingsParserForUI.safeParse(maskSettings);

        if (parseResult.success) {
            uiElements = parseResult.data;
            print(parseResult);
        } else {
            print(parseResult.error);
            // onError(parseResult.error);
        }
    }

    async function getLocatization() {
        const { payload } = await messageHandler.request({
            target: RequestTarget.extension,
            command: RequestCommand.getLocalization,
        });

        if (payload) {
            // print("LOCALE", payload);
            l10n.config({
                contents: payload,
            });

            // setIsReady(true);
        }
    }

    async function init() {
        await getLocatization();

        await getAppState();

        await getSettings();
        await getAssets(); // ???? add filter to the query

        await getMaskSettings();
    }

    init();
</script>

<!-- <pre> {JSON.stringify(maskSettings, null, "\t")}</pre> -->
<div class="project-manager-wrapper">
    {#key appState}
        {#if appState === AppState.loading}
            <vscode-progress-ring />Loading...
        {:else if appState === AppState.running}
            {#if maskSettings}
                {#key maskSettings}
                    {#if uiElements}
                        <ObjectControl
                            expanded={true}
                            nesting={false}
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
            {/if}
        {:else if appState === AppState.welcome}
            {#key recentProjectInfo}
                <WelcomeScreen {recentProjectInfo} />
            {/key}
        {:else if appState === AppState.error}
            <div>some Error occured! (todo: handle this)</div>
        {/if}
    {/key}
</div>

<style>
    div {
        background-color: transparent;
    }

    .project-manager-wrapper {
        padding-left: var(--global-body-padding-left);
        padding-right: var(--global-body-padding-right);
    }
    /* 
    vscode-progress-ring {
    } */
</style>
