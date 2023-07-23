<script lang="ts">
    /*

    todo : need to add file picker
    todo : texture preview

    todo : find bug when use slider and sending update effects from maskConfig


  */
    import { provideVSCodeDesignSystem, allComponents } from "@vscode/webview-ui-toolkit";

    import { MessageHandler } from "../common/MessageHandler";
    import type { MessageHandlerData } from "../common/MessageHandler";

    import { RequestTarget, RequestCommand, SelectionType } from "../../../src/types";
    import type { Selection } from "../../../src/types";

    import { fromZodError } from "zod-validation-error";

    import { logger } from "../logger";
    const print = logger("Inspector.svelte");
    import { createEventDispatcher } from "svelte";
    //   import { effects, selection } from "./stores.js";

    import ObjectControl from "../ui-controls/ObjectControl.svelte";
    import { EffectParserForUI, PluginParserForUI } from "../ui-controls/Controls.js";
    import { effectNames, pluginNames } from "../../../src/ztypes.js";
    import { onMount, tick } from "svelte";

    provideVSCodeDesignSystem().register(allComponents);

    const effectNamesSet = new Set(effectNames);
    const pluginNamesSet = new Set(pluginNames);

    const origin = RequestTarget.inspector;
    let selection: Selection = { type: SelectionType.empty },
        effects,
        plugins,
        uiElements;

    const messageHandler = new MessageHandler(handleMessageApp, origin);

    function handleMessageApp(data: MessageHandlerData<any>) {
        print("recived ", data);
        const { payload, command } = data;
        switch (command) {
            case RequestCommand.updateSelection:
                processSelection(payload);
                break;

            default:
                break;
        }
    }

    function getPlugins() {
        messageHandler
            .request({
                target: RequestTarget.extension,
                command: RequestCommand.getPlugins,
            })
            .then(({ payload }) => {
                processPlugins(payload);
            });
    }

    function sendPlugins() {
        messageHandler.send({
            command: RequestCommand.updatePlugins,
            target: RequestTarget.extension,
            payload: plugins,
        });
    }

    function processPlugins(newPlugins) {
        print("new plugins", newPlugins);
        plugins = newPlugins;
        parseUI();
    }

    function getEffects() {
        messageHandler
            .request({
                target: RequestTarget.extension,
                command: RequestCommand.getEffects,
            })
            .then(({ payload }) => {
                processEffects(payload);
            });
    }

    function sendEffects() {
        messageHandler.send({
            command: RequestCommand.updateEffects,
            target: RequestTarget.extension,
            payload: effects,
        });
    }

    function processEffects(newEffects) {
        effects = newEffects;
        parseUI();
    }

    function selectedIsKnown() {
        switch (selection.type) {
            case SelectionType.effect:
                return effectNamesSet.has(effects[selection.id].name);

            case SelectionType.plugin:
                return pluginNamesSet.has(plugins[selection.id].name);

            default:
                return false;
        }
    }

    function parseUI() {
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

            default:
                print("parser unkonwn need to implement!");
                return;
        }

        if (parseResult.success) {
            uiElements = parseResult.data;
        } else {
            print(parseResult.error);

            // onError(parseResult.error);
        }
    }

    function getSelection() {
        messageHandler
            .request({
                target: RequestTarget.extension,
                command: RequestCommand.getSelection,
            })
            .then(({ payload }) => {
                processSelection(payload);
            });
    }

    function processSelection(newSelection) {
        selection = newSelection;
        print("new selection", selection);
        uiElements = null; // this prevents new effects be applied to old uiElements
        switch (selection.type) {
            case SelectionType.effect:
                getEffects();
                break;

            case SelectionType.plugin:
                getPlugins();
                break;

            default:
                print("selection type not implemented " + selection.type);
                break;
        }
    }

    getSelection();

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

    //   async function onError(error) {
    //     const { name, _errors, ...formated } = error.format();
    //     print("formated error", formated);

    //     // let errorPath = ;

    //     let { path, message } = reduceError(formated, `/effects/${$selection.id}`);

    //     print("path, message", path, message);
    //     await tick();
    //     print("sending error");
    //     dispatch("errorMessage", {
    //       message,
    //       path,
    //     });
    //   }

    //   /**
    //    * Digs inside Zod error to extract valuable information
    //    * !!! should be a helper function
    //    * @param error
    //    * @param path
    //    */
    //   function reduceError(error, path) {
    //     const { _errors, ...newError } = { ...error };
    //     if (Object.keys(newError).length === 0) {
    //       return { path, message: _errors[0] };
    //     }
    //     const key = Object.keys(newError)[0];
    //     return reduceError(newError[key], `${path}/${key}`);
    //   }

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

<h3>Inspector</h3>
{#key selection}
    {#if selection.type === SelectionType.effect}
        {#if effects}
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
        {/if}
    {:else if selection.type === SelectionType.plugin}
        {#if plugins}
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
        {/if}
    {:else}
        <div>select anything to see...</div>
        <!-- <pre>{JSON.stringify(selection, null, "\t")}</pre> -->
    {/if}
{/key}

<style>
    div {
        background-color: transparent;
    }
</style>
