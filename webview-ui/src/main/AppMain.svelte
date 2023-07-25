<script lang="ts">
    import { setContext } from "svelte";
    import { provideVSCodeDesignSystem, allComponents } from "@vscode/webview-ui-toolkit";
    import { MessageHandler } from "../common/MessageHandler";
    import type { MessageHandlerData } from "../common/MessageHandler";
    import List from "../components/DraggableList.svelte";
    import { RequestTarget, RequestCommand, SelectionType } from "../../../src/types";
    // import type { Selection } from "../../../src/types";
    import Effect from "./Effect.svelte";
    import Plugin from "./Plugin.svelte";
    import MaskSettings from "./MaskSettings.svelte";
    import { selection } from "./stores";
    import { logger } from "../logger";
    const print = logger("AppMain.svelte");

    provideVSCodeDesignSystem().register(allComponents);

    const origin = RequestTarget.main;
    let effects, plugins;

    const messageHandler = new MessageHandler(handleMessageApp, origin);

    function handleMessageApp(data: MessageHandlerData<any>) {
        print("recived ", data);
        const { payload, command } = data;
        switch (command) {
            case RequestCommand.updateEffects:
                processEffects(payload);
                break;

            case RequestCommand.updatePlugins:
                processPlugins(payload);
                break;

            case RequestCommand.updateSelection:
                proccessSelection(payload);
                break;

            default:
                break;
        }
    }

    function processEffects(newEffects) {
        effects = newEffects.map((e, id) => {
            // print("process effect ", id, selection.id === id);
            return {
                value: e,
                id,
                selected: $selection.id === id,
                onClickVisible: (id, disabled) => {
                    // print("disabled ", id, disabled);
                    effects[id].value.disabled = disabled;
                    sendEffects();
                },
                onClickDelete: (id) => {
                    print("ondelte", id);
                    effects.splice(id, 1);
                    effects = effects;
                    sendEffects();
                    if ($selection.type === SelectionType.effect) {
                        if ($selection.id === id) {
                            $selection = { type: SelectionType.empty };
                        } else if ($selection.id > id) {
                            $selection.id--;
                        }
                        sendSelect();
                    }
                },
                onSelect: () => {
                    sendSelect();
                },
            };
        });
        // print(effects);
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
            payload: effects.map((e) => e.value),
        });
    }

    function processPlugins(newPlugins) {
        plugins = newPlugins.map((e, id) => {
            // print("process plugin ", id, selection.id === id);
            return {
                value: e,
                id,
                selected: $selection.id === id,
                onClickVisible: (id, disabled) => {
                    // print("disabled ", id, disabled);
                    plugins[id].value.disabled = disabled;
                    sendPlugins();
                },
                onClickDelete: (id) => {
                    print("ondelte", id);
                    plugins.splice(id, 1);
                    plugins = plugins;
                    sendPlugins();
                    if ($selection.type === SelectionType.plugin) {
                        if ($selection.id === id) {
                            $selection = { type: SelectionType.empty };
                        } else if ($selection.id > id) {
                            $selection.id--;
                        }
                        sendSelect();
                    }
                },
                onSelect: () => {
                    sendSelect();
                },
            };
        });
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
            payload: plugins.map((e) => e.value),
        });
    }

    function sendSelect() {
        messageHandler.send({
            command: RequestCommand.updateSelection,
            target: RequestTarget.all,
            payload: $selection,
        });
    }

    function getSelection() {
        messageHandler
            .request({
                target: RequestTarget.extension,
                command: RequestCommand.getSelection,
            })
            .then(({ payload }) => {
                proccessSelection(payload);
                getEffects();
                getPlugins();
                // switch (selection.type) {
                //     case SelectionType.effect:
                //         break;
                //     case SelectionType.plugin:
                //         break;
                //     default:
                //         break;
                // }
            });
    }

    function proccessSelection(newSelection) {
        $selection = newSelection;
        print("new selection", $selection);
    }

    getSelection();
</script>

{#key $selection}
    <MaskSettings
        selected={$selection.type === SelectionType.maskSettings}
        onSelect={(selected) => {
            if (selected) {
                $selection = { type: SelectionType.maskSettings };
            } else {
                $selection = { type: SelectionType.empty };
            }
            sendSelect();
        }}
    />
    {#key effects}
        {#if effects}
            <List
                elements={effects}
                elementComponent={Effect}
                name="Effects"
                onDrop={(newElements, dragId) => {
                    // !!! check type of selection
                    if (dragId === $selection.id) {
                        print("selected drag");
                    }
                    effects = newElements.map((e, index) => ({ ...e, id: index }));
                    sendEffects();
                    console.log("drop", effects);
                }}
            />
        {/if}
    {/key}

    {#key plugins}
        {#if plugins}
            <List
                elements={plugins}
                elementComponent={Plugin}
                name="Plugins"
                onDrop={(newElements) => {
                    plugins = newElements.map((e, index) => ({ ...e, id: index }));
                }}
            />
        {/if}
    {/key}
{/key}

<style>
    div {
        background-color: transparent;
    }
</style>
