<script lang="ts">
    /*

    todo : need to add file picker
    todo : texture preview

    todo : find bug when use slider and sending update effects from maskConfig


  */
    // import "../common/global.css";

    import * as l10n from "@vscode/l10n";
    import ErrorMessage from "../components/ErrorMessage.svelte";
    import { setContext } from "svelte";
    import { writable } from "svelte/store";

    import { provideVSCodeDesignSystem, allComponents } from "@vscode/webview-ui-toolkit";

    import { MessageHandler } from "../common/MessageHandler";
    import type { MessageHandlerData } from "../common/MessageHandler";

    import {
        RequestTarget,
        RequestCommand,
        SelectionType,
        AppState,
        ViewIds,
    } from "../../../src/types";
    import type { Selection, AppError } from "../../../src/types";
    import { ErrorType } from "../../../src/types";

    // import { fromZodError } from "zod-validation-error";

    import { logger, logDump } from "../logger";
    const print = logger("Parameters.svelte");

    import ObjectControl from "../ui-controls/ObjectControl.svelte";
    import {
        EffectParserForUI,
        PluginParserForUI,
        AssetParserForUI,
    } from "../ui-controls/Controls.js";
    import { effectNames, pluginNames } from "../../../src/ztypes.js";
    import { onMount, tick } from "svelte";
    import { applyValueByPath2 } from "../utils/applyValueByPath";
    import TextControl from "../ui-controls/TextControl.svelte"; // asset name change
    import InfoTableControl from "../ui-controls/InfoTableControl.svelte";
    import { effect } from "zod";
    import Loading from "../components/Loading.svelte";

    provideVSCodeDesignSystem().register(allComponents);

    // ??? is there any way to get rid of this ?
    const effectNamesSet = new Set(effectNames);
    const pluginNamesSet = new Set(pluginNames);

    const origin = RequestTarget.parameters;
    let selection: Selection = { type: SelectionType.empty },
        effects = writable([]),
        plugins, // !!!!!
        tabInfo = writable({}),
        asset,
        uiElements,
        selectionName;

    let appState = AppState.loading,
        error: AppError | null;

    const assets = writable([]);
    const settings = writable([]);
    const allTags = writable(new Set([]));
    const selectionStack = writable([]);

    function addToUndo(newSelection: Selection) {
        print("add undo", newSelection);
        if (newSelection.type === SelectionType.empty || selection.type === SelectionType.empty) {
            $selectionStack = [];
            return;
        }
        $selectionStack.push(selection);
        $selectionStack = $selectionStack;
        print("sel stack", $selectionStack);
    }

    function removeUndo() {
        const prevSelection = $selectionStack.pop();
        if (!prevSelection) return;
        $selectionStack = $selectionStack;

        sendSelect(prevSelection);
        processSelection(prevSelection);
    }

    const messageHandler = new MessageHandler(handleMessageApp, origin);
    setContext("stores", {
        assets,
        settings,
        messageHandler,
        allTags,
        effects,
        selection,
        tabInfo,
    });

    function handleMessageApp(data: MessageHandlerData<any>) {
        print("recived ", data);
        const { payload, command } = data;
        switch (command) {
            case RequestCommand.updateSelection:
                addToUndo(payload); // old selection
                processSelection(payload);
                break;

            case RequestCommand.updateSettings:
                processSettings(payload);
                break;

            case RequestCommand.updateAppState:
                processAppState(payload);
                break;

            // !!!!! update plugins mask settings

            case RequestCommand.updatePlugins:
                processPlugins(payload);
                parseUI();
                break;

            case RequestCommand.updateEffects:
                processEffects(payload);
                parseUI();
                break;

            case RequestCommand.getLogs:
                returnLogs(data);
                break;

            case RequestCommand.updateAssets:
                processAssets(payload);
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
        error = payload.error; // will be undefined
        print("state", payload);
        if (appState === AppState.error) {
            onError(error);
        }
    }

    function returnLogs(data: MessageHandlerData<any>) {
        messageHandler.send({
            ...data,
            target: data.origin,
            payload: logDump,
        });
    }

    async function getSettings() {
        const { payload } = await messageHandler.request({
            target: RequestTarget.extension,
            command: RequestCommand.getSettings,
        });
        processSettings(payload);
    }

    function processSettings(newSettings) {
        print("new settings", newSettings);
        $settings = newSettings;
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

    async function getAssets() {
        const { payload } = await messageHandler.request({
            target: RequestTarget.extension,
            command: RequestCommand.getAssets,
        });

        processAssets(payload);
    }

    function processAssets(newAssets) {
        print("new assets count ", newAssets.length);
        $assets = newAssets;
    }

    // function sendAssets() {
    //     messageHandler.send({
    //         command: RequestCommand.updateAssets,
    //         target: RequestTarget.extension,
    //         payload: assets,
    //     });
    // }

    async function getPlugins() {
        const { payload } = await messageHandler.request({
            target: RequestTarget.extension,
            command: RequestCommand.getPlugins,
        });
        print("new plugins", payload);
        processPlugins(payload);
    }

    function processPlugins(payload) {
        plugins = payload;
    }

    function sendPlugins() {
        messageHandler.send({
            command: RequestCommand.updatePlugins,
            target: RequestTarget.extension,
            payload: plugins,
        });
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
    }

    function updateTags() {
        $allTags = new Set();
        $effects.forEach((effect) => {
            if ("tag" in effect) {
                effect.tag
                    .split(";")
                    .filter((tag) => tag.length)
                    .forEach((tag) => $allTags.add(tag));
            }
        });

        // print("updated tags: ", $allTags);
    }

    function sendEffects() {
        // print("sending effects");
        messageHandler.send({
            command: RequestCommand.updateEffects,
            target: RequestTarget.extension,
            payload: $effects,
        });
    }

    function selectedIsKnown() {
        switch (selection.type) {
            case SelectionType.effect:
                return effectNamesSet.has($effects?.[selection.id]?.name);

            case SelectionType.plugin:
                return pluginNamesSet.has(plugins?.[selection.id]?.name);

            case SelectionType.asset:
                return true;

            default:
                return false;
        }
    }

    async function readAsset() {
        const { payload } = await messageHandler.request({
            payload: selection,
            target: RequestTarget.extension,
            command: RequestCommand.readAsset,
        });

        // console.log("read asset", asset);
        asset = payload;
    }

    function writeAsset() {
        messageHandler.send({
            command: RequestCommand.writeAsset,
            target: RequestTarget.extension,
            payload: {
                path: selection.path,
                assetType: selection.assetType,
                data: asset,
            },
        });
    }

    function renameAsset(newName) {
        messageHandler.send({
            command: RequestCommand.renameAsset,
            target: RequestTarget.extension,
            payload: {
                path: selection.path,
                newName,
            },
        });
    }

    async function parseUI() {
        // !!!!!!!!
        error = null;

        if (!selectedIsKnown()) {
            uiElements = null; // will make a blink, but solves null null value for unnull uiElement
            return;
        }
        let parseResult;

        switch (selection.type) {
            case SelectionType.effect:
                print("will parse effect", $effects[selection.id]);

                parseResult = EffectParserForUI.safeParse($effects[selection.id]);
                selectionName = $effects[selection.id]?.name;
                break;
            case SelectionType.plugin:
                print("will parse plugin", plugins[selection.id]);
                parseResult = PluginParserForUI.safeParse(plugins[selection.id]);
                selectionName = plugins[selection.id]?.name;
                break;

            case SelectionType.asset:
                if (
                    selection.assetType === "xml_material" ||
                    selection.assetType === "json_material"
                ) {
                    print("will parse asset", asset);
                    parseResult = AssetParserForUI.safeParse(asset);
                } else {
                    appState = AppState.running;
                    return;
                }

                break;

            default:
                appState = AppState.running;
                print("parser unkonwn need to implement!");
                return;
        }

        if (parseResult.success) {
            // await getTabInfo(); // seems useless here

            uiElements = parseResult.data;
            print("parse result : ", parseResult);

            appState = AppState.running;
            if (selection.type === SelectionType.effect) updateTags();
        } else {
            // print(parseResult.error);
            onError(parseResult.error);
        }
    }

    async function getSelection() {
        const { payload } = await messageHandler.request({
            target: RequestTarget.extension,
            command: RequestCommand.getSelection,
        });

        processSelection(payload);
    }

    function sendSelect(newSelection) {
        messageHandler.send({
            command: RequestCommand.updateSelection,
            target: RequestTarget.all,
            payload: newSelection,
        });
    }

    async function processSelection(newSelection) {
        selectionName = null;
        selection = newSelection;
        appState = AppState.loading;
        // await getTabInfo();

        // print("new selection", selection);
        uiElements = null; // this prevents new effects be applied to old uiElements
        switch (newSelection.type) {
            case SelectionType.effect:
                await getEffects();
                break;

            case SelectionType.plugin:
                await getPlugins();
                break;

            case SelectionType.asset:
                await readAsset();
                break;

            default:
                appState = AppState.running;
                print("selection type not implemented " + selection.type);
                return;
        }

        await parseUI();
    }

    async function onChanged(event) {
        const changes = event.detail;
        // console.log("params onChange: ", changes);
        //
        let needRerender = false;
        let action = null; //!!!! only one action
        let tempEffects = $effects;
        let tempPlugins = plugins;
        let tempAsset = asset;

        changes.forEach(({ path, value, structural }) => {
            const [root, ...pathClone] = [...path];
            // console.log("params onchange root", root, pathClone, path);
            // !!!!!!!!!!! split
            if (root === "tabInfo") {
                // console.log("sending tabinfo");
                action = sendTabInfo;
                return;
            }
            switch (root) {
                case SelectionType.effect:
                    tempEffects = applyValueByPath2(tempEffects, pathClone, value);
                    needRerender = needRerender || structural;

                    print("updated effects", tempEffects);
                    action = sendEffects;
                    break;

                case SelectionType.plugin:
                    tempPlugins = applyValueByPath2(tempPlugins, pathClone, value);
                    needRerender = needRerender || structural;
                    print("updated plugins", plugins);
                    action = sendPlugins;
                    break;

                case SelectionType.asset:
                    tempAsset = applyValueByPath2(tempAsset, pathClone, value);
                    needRerender = needRerender || structural;
                    print("updated assets", asset);
                    action = writeAsset;
                    break;

                default:
                    print("selection type not implemented " + selection.type);
                    break;
            }
        });

        $effects = tempEffects;
        plugins = tempPlugins;
        asset = tempAsset;

        // //??? rerender parameters ???
        // // will need to rerender only if changed parameters structure
        // // !!!!!!!!!!!!!!!!!!!!!!!!
        if (needRerender) await parseUI();

        if (action) action();

        // rerenderParameters();
    }

    //   export let mountLock = true;
    //   let uiElements;
    //   let selectedId;

    //   print("INIT");
    //   // mountLock = true;

    //   $: print("ui elements", uiElements);
    //   onMount(async () => {
    //     // print("mounted");
    //     await tick();
    //     mountLock = false;
    //     // print("mount tick");
    //   });

    //   $: if ($selection) selectedId = $selection.id;
    //   else selectedId = undefined;

    //   $: print("selection changes : ", $selection);
    //   $: {
    //     print("parsing ui elements  changes : ", );
    //     if ($selection && $selection.type !== "unknownEffect") {
    //       const parseResult = EffectParserForUI.safeParse($effects[$selection.id]); // this seems to help !!!
    //       if (parseResult.success) {
    //         uiElements = parseResult.data;
    //       } else {
    //         // const prettyError = fromZodError(parseResult.error, { maxIssuesInMessage: 1 });

    //         onError(parseResult.error);
    //         // return {
    //         //     success: false,
    //         //     message: .message
    //         // }
    //       }
    //     }
    //   }

    //   const dispatch = createEventDispatcher();

    async function onError(zodError) {
        // print("raw errpr", zodError);
        const { name, _errors, ...formated } = zodError.format();
        // print("formated error", formated);

        // let errorPath = ;

        // !!!!  root now included in path
        let errorRootPath;
        switch (selection.type) {
            case SelectionType.effect:
                errorRootPath = "effects";
                break;
            case SelectionType.plugin:
                errorRootPath = "plugins";
                break;
        }

        let { path, message } = reduceError(formated, `/${errorRootPath}/${selection.id}`);

        print("error path, message", path, message, zodError.format());

        error = { type: ErrorType.configZod, value: { message, path } };
        appState = AppState.error;

        // await tick();
        // print("sending error");
        // dispatch("errorMessage", {
        //   message,
        //   path,
        // });
    }

    /**
     * Digs inside Zod error to extract valuable information
     * !!! should be a helper function
     * @param error
     * @param path
     */
    function reduceError(error, path) {
        // @ts-expect-error
        const { _errors, ...newError } = { ...error }; // remove _errors field
        if (Object.keys(newError).length === 0) {
            return { path, message: _errors[0] };
        }
        const key = Object.keys(newError)[0];
        return reduceError(newError[key], `${path}/${key}`);
    }

    async function rerenderParameters() {
        // !!! a hack
        print("should rerender!");
        const oldSelection = selection;
        selection = { type: SelectionType.empty };
        await tick();
        selection = oldSelection;
    }

    async function getLocatization() {
        const { payload } = await messageHandler.request({
            target: RequestTarget.extension,
            command: RequestCommand.getLocalization,
        });

        if (payload) {
            l10n.config({
                contents: payload,
            });
        }
    }

    async function init() {
        await getLocatization();

        await getAppState();

        if (appState === AppState.error) return;
        getSelection();
        getAssets();
        getSettings();
    }

    init();
</script>

<div class="shadow-top"></div>
<div class="parameters-wrapper">
    {#if $selectionStack.length !== 0 && false}
        <vscode-button
            on:click|stopPropagation={() => {
                removeUndo();
            }}
        >
            <span slot="start" class="codicon codicon-arrow-circle-left"></span>

            <span class="btn-text">Back</span>
        </vscode-button>
    {/if}
    {#if appState === AppState.running}
        <!-- <div class="header-wrapper">
            <h3>{l10n.t(selection.type).toUpperCase()}</h3>
            {#if selectionName}
                <h4>{selectionName}</h4>
            {/if}
        </div> -->
        <!-- {#key selection} -->
        <!-- label={uiElements.uiDescription.label ?? $effects[selection.id].name} -->
        {#key uiElements}
            {#if selection.type === SelectionType.effect}
                {#if $effects}
                    {#if uiElements}
                        <ObjectControl
                            expanded={true}
                            nesting={false}
                            value={$effects[selection.id]}
                            params={uiElements.uiDescription}
                            path={[SelectionType.effect, selection.id]}
                            uiElements={uiElements.value}
                            on:changed={onChanged}
                        />
                    {:else}
                        <div>{l10n.t("locale.parameters.unknownEffect")}</div>
                    {/if}
                {/if}
                <!-- {/key} -->
                <!-- label={uiElements.uiDescription.label ?? plugins[selection.id].name} -->
            {:else if selection.type === SelectionType.plugin}
                {#if plugins}
                    {#if uiElements}
                        <ObjectControl
                            expanded={true}
                            nesting={false}
                            value={plugins[selection.id]}
                            params={uiElements.uiDescription}
                            path={[SelectionType.plugin, selection.id]}
                            uiElements={uiElements.value}
                            on:changed={onChanged}
                        />
                    {:else}
                        <div>{l10n.t("locale.parameters.unknownPlugin")}</div>
                    {/if}
                {/if}
            {:else if selection.type === SelectionType.asset}
                <!-- {#key asset} -->
                {#if selection.assetType === "xml_material" || selection.assetType === "json_material"}
                    <div class="grid-container">
                        <TextControl
                            label="Name"
                            value={selection.baseName}
                            path={null}
                            on:changed={(e) => {
                                print("assetname", e.detail);
                                const newName = e.detail[0].value;
                                renameAsset(newName);
                            }}
                        />
                    </div>
                    <vscode-divider role="separator" />

                    <!-- label={selection.path} -->
                    {#if uiElements}
                        <ObjectControl
                            expanded={true}
                            nesting={false}
                            value={asset}
                            params={uiElements.uiDescription}
                            path={[SelectionType.asset]}
                            uiElements={uiElements.value}
                            on:changed={onChanged}
                        />
                    {:else}
                        <div>{l10n.t("locale.parameters.unknownAsset")}</div>
                    {/if}
                {:else}
                    <InfoTableControl value={asset} />
                {/if}
                <!-- {/key} -->
            {:else}
                <div class="empty-parameters">
                    {`${l10n.t("locale.parameters.nothingSelected")}..`}.
                </div>
                <!-- <pre>{JSON.stringify(selection, null, "\t")}</pre> -->
            {/if}
        {/key}
        <!-- {/key} -->
    {:else if appState === AppState.loading}
        <Loading />
    {:else if appState === AppState.error}
        <!-- {#key error} -->
        <!-- <div>should be error</div> -->
        <ErrorMessage error={error ?? {}} />
    {/if}
</div>

<style>
    div {
        background-color: transparent;
    }

    div.grid-container {
        display: grid;
        grid-template-columns:
            minmax(var(--global-grid-label-min-width), var(--global-grid-label-column-size))
            minmax(var(--global-value-min-width), var(--global-grid-value-column-size));
        column-gap: var(--global-grid-column-gap);
        row-gap: var(--global-grid-row-gap);
    }
    /* 
    .header-wrapper {
        display: flex;
        flex-direction: row;
    } */
    .parameters-wrapper {
        position: relative;
        /* var(--global-body-padding-left) */
        padding-left: 0;
    }

    /* :global(div) {
        color: aqua;
        background-color: var(--main-bg-color);
    } */
    vscode-divider {
        width: 200vw;
        margin-left: -50vw;
        /* calc(0px - var(--global-body-padding-left)); */
    }

    vscode-button {
        top: 0;
        z-index: 100;
        position: sticky;
        width: calc(100% - var(--global-body-padding-right));

        margin: var(--global-margin);
        /* margin-right: var(--global-body-padding-right); */
        left: var(--global-body-padding-left);
    }
    vscode-button::part(control) {
        width: calc(100% - var(--global-body-padding-right));
    }
    .empty-parameters {
        padding-left: var(--global-body-padding-left);
    }
</style>
