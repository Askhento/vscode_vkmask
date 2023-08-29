<script lang="ts">
    import { setContext } from "svelte";
    import { writable } from "svelte/store";
    import { provideVSCodeDesignSystem, allComponents } from "@vscode/webview-ui-toolkit";
    import { MessageHandler } from "../common/MessageHandler";
    import type { MessageHandlerData } from "../common/MessageHandler";
    import List from "../components/DraggableList.svelte";
    import { RequestTarget, RequestCommand, SelectionType } from "../../../src/types";
    import type { Selection } from "../../../src/types";
    import Plugin from "./Plugin.svelte";
    import AddPlugin from "./AddPlugin.svelte";
    import { logger, logDump } from "../logger";
    const print = logger("AppPlugins.svelte");
    const origin = RequestTarget.plugins;

    provideVSCodeDesignSystem().register(allComponents);

    const selection = writable<Selection>({ type: SelectionType.empty });
    const messageHandler = new MessageHandler(handleMessageApp, origin);
    let plugins = writable([]);

    setContext("stores", { selection, plugins, messageHandler });

    function handleMessageApp(data: MessageHandlerData<any>) {
        print("recived ", data);
        const { payload, command } = data;
        switch (command) {
            case RequestCommand.getLogs:
                returnLogs(data);
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

    function returnLogs(data: MessageHandlerData<any>) {
        messageHandler.send({
            ...data,
            target: data.origin,
            payload: logDump,
        });
    }

    function processPlugins(newPlugins) {
        $plugins = newPlugins.map((e, id) => {
            // print("process plugin ", id, selection.id === id);
            return {
                value: e,
                id,
                selected: $selection.id === id,
                onClickVisible: (id, disabled) => {
                    // print("disabled ", id, disabled);
                    $plugins[id].value.disabled = disabled;
                    sendPlugins();
                },
                onClickDelete: (id) => {
                    // print("ondelte", id);
                    $plugins.splice(id, 1);
                    $plugins = $plugins;
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
            payload: $plugins.map((e) => e.value),
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
                getPlugins();
            });
    }

    function proccessSelection(newSelection) {
        $selection = newSelection;
        print("new selection", $selection);
    }

    getSelection();
</script>

<!-- <AddPlugin /> -->
{#key $selection}
    {#key $plugins}
        {#if $plugins}
            <List
                elements={$plugins}
                elementComponent={Plugin}
                name="Plugins"
                onDrop={(newElements) => {
                    $plugins = newElements.map((e, index) => ({ ...e, id: index }));
                }}
            />
        {/if}
    {/key}
{/key}
