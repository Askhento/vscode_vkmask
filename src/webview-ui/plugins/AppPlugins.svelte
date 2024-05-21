<script lang="ts">
    import * as l10n from "@vscode/l10n";
    import { setContext } from "svelte";
    import { writable } from "svelte/store";
    import { provideVSCodeDesignSystem, allComponents } from "@vscode/webview-ui-toolkit";
    import { MessageHandler } from "../common/MessageHandler";
    import type { MessageHandlerData } from "../common/MessageHandler";
    import List from "../components/DraggableList.svelte";
    import { RequestTarget, RequestCommand, SelectionType, AppState } from "../../../src/types";
    import type { Selection } from "../../../src/types";
    import Plugin from "./Plugin.svelte";
    import AddPlugin from "./AddPlugin.svelte";
    import { logger, logDump } from "../logger";
    import Loading from "../components/Loading.svelte";
    const print = logger("AppPlugins.svelte");
    const origin = RequestTarget.plugins;

    provideVSCodeDesignSystem().register(allComponents);

    const selection = writable<Selection>({ type: SelectionType.empty });
    const messageHandler = new MessageHandler(handleMessageApp, origin);
    let plugins = writable([]);
    let appState = AppState.loading;

    // !!!! add tabInfo

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
                processSelection(payload);
                break;

            case RequestCommand.updateAppState:
                processAppState(payload);
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
                    // $plugins = $plugins;
                    processPlugins($plugins.map((p) => p.value));
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

    async function getPlugins() {
        const { payload } = await messageHandler.request({
            target: RequestTarget.extension,
            command: RequestCommand.getPlugins,
        });

        processPlugins(payload);
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

    async function getSelection() {
        const { payload } = await messageHandler.request({
            target: RequestTarget.extension,
            command: RequestCommand.getSelection,
        });

        processSelection(payload);
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
    function processSelection(newSelection) {
        $selection = newSelection;
        // print("new select/ion", $selection);
    }

    async function init() {
        await Promise.all([getLocatization(), getPlugins(), getSelection()]); //getSettings()
        await getAppState();
    }

    init();
</script>

<div class="shadow-top"></div>
{#if appState === AppState.running}
    {#key $selection}
        {#key $plugins}
            {#if $plugins.length}
                <List
                    elements={$plugins}
                    elementComponent={Plugin}
                    onDrop={(newElements, dragId) => {
                        const newId = newElements.findIndex((e) => e.id === dragId);
                        if (newId === dragId) return;

                        // print("newId", newId);
                        let selectionUpdated = false;
                        if ($selection.type === SelectionType.plugin) {
                            if (dragId === $selection.id) {
                                // print("selected drag");
                                $selection.id = newId;
                                selectionUpdated = true;
                            } else if (dragId > $selection.id && newId <= $selection.id) {
                                $selection.id++;
                                selectionUpdated = true;
                            } else if (dragId < $selection.id && newId >= $selection.id) {
                                $selection.id--;
                                selectionUpdated = true;
                            }
                        }
                        if (selectionUpdated) {
                            $selection = $selection;
                            sendSelect();
                        }
                        $plugins = newElements.map((e, index) => ({ ...e, id: index }));
                        sendPlugins();
                    }}
                />
            {:else}
                <div class="empty-plugins">{l10n.t("locale.plugins.emptyPluginsHint")}</div>
            {/if}
        {/key}
    {/key}
{:else}
    <Loading />
{/if}

<style>
    div.empty-plugins {
        padding-left: var(--global-body-padding-left);
    }
</style>
