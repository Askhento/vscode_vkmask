<script lang="ts">
    /*

    todo : need to add file picker
    todo : texture preview

    todo : find bug when use slider and sending update effects from maskConfig


  */
    import ErrorMessage from "../components/ErrorMessage.svelte";
    import { setContext } from "svelte";
    import { writable } from "svelte/store";

    import { provideVSCodeDesignSystem, allComponents } from "@vscode/webview-ui-toolkit";

    import { MessageHandler } from "../common/MessageHandler";
    import type { MessageHandlerData } from "../common/MessageHandler";

    import { RequestTarget, RequestCommand, SelectionType, AppState } from "../../../src/types";
    import type { Selection, AppError } from "../../../src/types";
    import { ErrorType } from "../../../src/types";

    // import { fromZodError } from "zod-validation-error";

    import { logger, logDump } from "../logger";
    const print = logger("Inspector.svelte");

    import ObjectControl from "../ui-controls/ObjectControl.svelte";
    import {
        EffectParserForUI,
        MaskSettingsParserForUI,
        PluginParserForUI,
    } from "../ui-controls/Controls.js";
    import { effectNames, pluginNames } from "../../../src/ztypes.js";
    import { onMount, tick } from "svelte";

    provideVSCodeDesignSystem().register(allComponents);

    // ??? is there any way to get rid of this ?
    const effectNamesSet = new Set(effectNames);
    const pluginNamesSet = new Set(pluginNames);

    const origin = RequestTarget.inspector;
    let selection: Selection = { type: SelectionType.empty },
        effects,
        plugins,
        maskSettings,
        uiElements;

    let appState = AppState.running,
        error: AppError | null;

    const assets = writable([]);
    const settings = writable([]);

    const messageHandler = new MessageHandler(handleMessageApp, origin);
    setContext("stores", { assets, settings, messageHandler });

    function handleMessageApp(data: MessageHandlerData<any>) {
        print("recived ", data);
        const { payload, command } = data;
        switch (command) {
            case RequestCommand.updateSelection:
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

    async function getAssets() {
        const { payload } = await messageHandler.request({
            target: RequestTarget.extension,
            command: RequestCommand.getAssets,
        });

        print("new assets", payload);
        $assets = payload;
    }

    // function sendAssets() {
    //     messageHandler.send({
    //         command: RequestCommand.updateAssets,
    //         target: RequestTarget.extension,
    //         payload: assets,
    //     });
    // }

    async function getMaskSettings() {
        const { payload } = await messageHandler.request({
            target: RequestTarget.extension,
            command: RequestCommand.getMaskSettings,
        });

        print("new mask settings", payload);
        maskSettings = payload;
    }

    function sendMaskSettings() {
        messageHandler.send({
            command: RequestCommand.updateMaskSettings,
            target: RequestTarget.extension,
            payload: maskSettings,
        });
    }

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
        effects = payload;
    }

    function sendEffects() {
        messageHandler.send({
            command: RequestCommand.updateEffects,
            target: RequestTarget.extension,
            payload: effects,
        });
    }

    function selectedIsKnown() {
        switch (selection.type) {
            case SelectionType.effect:
                return effectNamesSet.has(effects[selection.id]?.name);

            case SelectionType.plugin:
                return pluginNamesSet.has(plugins[selection.id]?.name);

            case SelectionType.maskSettings:
                return true;

            default:
                return false;
        }
    }

    function parseUI() {
        error = null;
        appState = AppState.running;
        if (!selectedIsKnown()) {
            uiElements = null;
            return;
        }
        let parseResult;

        switch (selection.type) {
            case SelectionType.effect:
                print("will parse effect", effects[selection.id]);
                parseResult = EffectParserForUI.safeParse(effects[selection.id]);
                break;
            case SelectionType.plugin:
                print("will parse plugin", plugins[selection.id]);
                parseResult = PluginParserForUI.safeParse(plugins[selection.id]);
                break;
            case SelectionType.maskSettings:
                print("will parse mask settings", maskSettings);
                parseResult = MaskSettingsParserForUI.safeParse(maskSettings);
                break;

            default:
                print("parser unkonwn need to implement!");
                return;
        }

        if (parseResult.success) {
            uiElements = parseResult.data;
            print("parse result : ", parseResult);
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

    async function processSelection(newSelection) {
        selection = newSelection;
        print("new selection", selection);
        uiElements = null; // this prevents new effects be applied to old uiElements
        switch (selection.type) {
            case SelectionType.effect:
                await getEffects();
                break;

            case SelectionType.plugin:
                await getPlugins();
                break;

            default:
                print("selection type not implemented " + selection.type);
                return;
        }

        parseUI();
    }

    async function onChanged(event) {
        console.log("onChange: ", event);
        const { path, value, structural } = event.detail;

        switch (selection.type) {
            case SelectionType.effect:
                applyValueByPath(effects[selection.id], path, value);
                print("updated effects", effects[selection.id]);
                sendEffects();
                break;

            case SelectionType.plugin:
                applyValueByPath(plugins[selection.id], path, value);
                print("updated plugins", plugins[selection.id]);
                sendPlugins();
                break;

            case SelectionType.maskSettings:
                applyValueByPath(maskSettings, path, value);
                print("updated maskSettings", maskSettings);
                sendMaskSettings();
                break;

            default:
                print("selection type not implemented " + selection.type);
                break;
        }

        // // send to the app, store does not trigger for some reason
        // dispatch("changed");
        // //??? rerender inspector ???
        // // will need to rerender only if changed inspector structure
        // // !!!!!!!!!!!!!!!!!!!!!!!!
        if (!structural) return;
        parseUI();
        rerenderInspector();
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

    async function rerenderInspector() {
        // !!! a hack
        print("should rerender!");
        const oldSelection = selection;
        selection = { type: SelectionType.empty };
        await tick();
        selection = oldSelection;
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

    async function init() {
        await getAppState();

        if (appState === AppState.error) return;
        getSelection();
        getAssets();
        getSettings();
    }

    init();
</script>

<!-- <div class="inspector-wrapper">
  {#if selectedId !== undefined}
    <div class="inspector-name">Inspector Panel</div>
    {#if $selection.type === "effect"}

      <ObjectControl
        expanded={true}
        value={$effects[selectedId]}
        label={$effects[selectedId].name}
        path={[]}
        uiElements={uiElements.value}
        on:changed={onChanged}
      />
    {:else if $selection.type === "unknownEffect"}
      <div>unknownEffect</div>
    {/if}
  {:else}
    <div>some error</div>
  {/if}
</div> -->

{#if appState === AppState.running}
    <h3>{selection.type.toUpperCase()}</h3>
    {#key selection}
        {#if selection.type === SelectionType.effect}
            {#if effects}
                {#key effects}
                    {#if uiElements}
                        <ObjectControl
                            expanded={true}
                            value={effects[selection.id]}
                            label={effects[selection.id].name}
                            path={[]}
                            uiElements={uiElements.value}
                            on:changed={onChanged}
                        />
                    {:else}
                        <div>unknownEffect</div>
                    {/if}
                {/key}
            {/if}
        {:else if selection.type === SelectionType.plugin}
            {#if plugins}
                {#key plugins}
                    {#if uiElements}
                        <ObjectControl
                            expanded={true}
                            value={plugins[selection.id]}
                            label={plugins[selection.id].name}
                            path={[]}
                            uiElements={uiElements.value}
                            on:changed={onChanged}
                        />
                    {:else}
                        <div>unknownPlugin</div>
                    {/if}
                {/key}
            {/if}
        {:else if selection.type === SelectionType.asset}
            <div>asset type not implememted error</div>
            <!-- <pre> {JSON.stringify(maskSettings, null, "\t")}</pre> -->
        {:else}
            <div>select anything to see...</div>
            <!-- <pre>{JSON.stringify(selection, null, "\t")}</pre> -->
        {/if}
    {/key}
{:else if appState === AppState.error}
    {#key error}
        <div>should be erro</div>
        <ErrorMessage {error} />
    {/key}
{/if}

<style>
    div {
        background-color: transparent;
    }
</style>
