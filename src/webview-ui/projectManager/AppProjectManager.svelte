<script lang="ts">
    import * as l10n from "@vscode/l10n";
    import { setContext, tick } from "svelte";
    import { writable } from "svelte/store";
    import { provideVSCodeDesignSystem, allComponents } from "@vscode/webview-ui-toolkit";
    import { MessageHandler } from "../common/MessageHandler";
    import type { MessageHandlerData } from "../common/MessageHandler";
    import WelcomeScreen from "./WelcomeScreen.svelte";
    import {
        RequestTarget,
        RequestCommand,
        SelectionType,
        AppState,
        ErrorType,
    } from "../../../src/types";
    import { logger, logDump } from "../logger";
    const print = logger("AppProjectManager.svelte");
    //
    const origin = RequestTarget.projectManager;

    import { applyValueByPath2 } from "../utils/applyValueByPath";
    import ObjectControl from "../ui-controls/ObjectControl.svelte";
    import { MaskSettingsParserForUI } from "../ui-controls/Controls.js";
    import type { RecentProjectInfo } from "src/RecentProjectInfo";
    import Loading from "../components/Loading.svelte";
    import ShadowTop from "../components/ShadowTop.svelte";

    provideVSCodeDesignSystem().register(allComponents);

    let maskSettings, uiElements;
    let appState = AppState.loading;
    let error = null;

    const assets = writable([]);
    const settings = writable([]);
    const tabInfo = writable({});

    let recentProjectInfo: RecentProjectInfo[] = [];

    const messageHandler = new MessageHandler(handleMessageApp, origin);

    setContext("stores", { assets, settings, messageHandler, tabInfo, viewId: origin });

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
                print("RECEMT", recentProjectInfo);
                break;

            case RequestCommand.updateTabInfo:
                processTabInfo(payload);
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
        error = payload.error;
        // error = payload.error; // will be undefined
        print("state", payload);
        // if (appState === AppState.error) {
        //     onError(error);
        // }
    }

    function processAssets(newAssets) {
        print("new assets count ", newAssets.length);
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

    async function getTabInfo() {
        const { payload } = await messageHandler.request({
            target: RequestTarget.extension,
            command: RequestCommand.getTabInfo,
            payload: {
                viewId: origin,
            },
        });

        processTabInfo(payload);
    }

    function processTabInfo(newTabInfo) {
        print("new tabInfo ", newTabInfo);
        $tabInfo = newTabInfo;
    }

    function sendTabInfo() {
        messageHandler.send({
            command: RequestCommand.updateTabInfo,
            target: RequestTarget.extension,
            payload: {
                viewId: origin,
                value: $tabInfo,
            },
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
        // console.log("onChange: ", event);
        const changes = event.detail;
        let needRerender = false;

        let tempSettings = maskSettings;
        let action = null; // !!!! only one action
        changes.forEach(({ path, value, structural }) => {
            const root = path.shift();
            if (root === "tabInfo") {
                console.log("sending tabinfo");
                sendTabInfo();
                return;
            }

            tempSettings = applyValueByPath2(tempSettings, path, value);
            needRerender = needRerender || structural;
            maskSettings = tempSettings;
            action = sendMaskSettings;
        });

        if (action) action();

        if (!needRerender) return;
        print("new settings", tempSettings, changes);
        await parseUI();

        // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!1
        rerenderSettings();
    }

    // $: console.log("mask setting ", maskSettings);
    async function rerenderSettings() {
        // !!! a hack
        let oldSettings = maskSettings;
        maskSettings = null;
        await tick();
        maskSettings = oldSettings;
    }

    async function parseUI() {
        let parseResult = MaskSettingsParserForUI.safeParse(maskSettings);

        if (parseResult.success) {
            await getTabInfo();

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
        await getAppState();

        let promises = [getLocatization(), getSettings()];

        if (appState == AppState.running) promises = [...promises, getAssets(), getMaskSettings()];
        await Promise.all(promises);

        if (appState == AppState.welcome) recentProjectInfo = recentProjectInfo; // trigger reload
    }

    init();
</script>

<ShadowTop></ShadowTop>
<!-- <OverlayScrollbarsComponent options={{ scrollbars: { theme: "os-theme-light" } }}>
    <div>lololol</div>
</OverlayScrollbarsComponent> -->

<div class="project-manager-wrapper">
    {#key appState}
        {#if appState === AppState.loading}
            <Loading />
        {:else if appState === AppState.running}
            {#if maskSettings}
                {#key maskSettings}
                    {#if uiElements}
                        {#key uiElements}
                            <ObjectControl
                                expanded={true}
                                indentLevel={-1}
                                value={maskSettings}
                                params={uiElements.uiDescription}
                                path={["maskSettings"]}
                                uiElements={uiElements.value}
                                on:changed={onChanged}
                            />
                        {/key}
                    {:else}
                        <div>ui not parsed</div>
                    {/if}
                {/key}
            {/if}
        {:else if appState === AppState.welcome || error.type === ErrorType.configMissing}
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
        /* var(--global-body-padding-left) */
        padding-left: 0;
        /* padding-right: var(--global-body-padding-right); */
    }
    /* 
    vscode-progress-ring {
    } */
</style>
