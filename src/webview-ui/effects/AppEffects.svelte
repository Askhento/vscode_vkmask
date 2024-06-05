<script lang="ts">
    import ShadowTop from "../components/ShadowTop.svelte";

    import { setContext } from "svelte";
    import { writable } from "svelte/store";
    import { provideVSCodeDesignSystem, allComponents } from "@vscode/webview-ui-toolkit";
    import { MessageHandler } from "../common/MessageHandler";
    import type { MessageHandlerData } from "../common/MessageHandler";
    import List from "../components/DraggableList.svelte";
    import {
        RequestTarget,
        RequestCommand,
        SelectionType,
        ViewIds,
        AppState,
    } from "../../../src/types";
    import type { Selection } from "../../../src/types";
    import Effect from "./Effect.svelte";
    import { logger, logDump } from "../logger";
    // import AddEffect from "./AddEffect.svelte";
    import * as l10n from "@vscode/l10n";
    import Loading from "../components/Loading.svelte";
    const print = logger("AppEffects.svelte");
    const origin = RequestTarget.effects;
    provideVSCodeDesignSystem().register(allComponents);

    const selection = writable<Selection>({ type: SelectionType.empty });
    const effects = writable([]);
    const settings = writable([]);
    const tabInfo = writable({});
    let appState = AppState.loading;

    let experimentalFeatures = false;
    const experimentalEffects = new Set(["liquifiedwarp"]);
    const messageHandler = new MessageHandler(handleMessageApp, origin);

    setContext("stores", { selection, effects, messageHandler, settings });

    function handleMessageApp(data: MessageHandlerData<any>) {
        print("recived ", data);
        const { payload, command } = data;
        switch (command) {
            case RequestCommand.getLogs:
                returnLogs(data);
                break;

            case RequestCommand.updateEffects:
                processEffects(payload);
                break;

            case RequestCommand.updateSelection:
                processSelection(payload);
                break;

            case RequestCommand.updateSettings:
                processSettings(payload);
                break;

            case RequestCommand.updateTabInfo:
                processTabInfo(payload);
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
        experimentalFeatures = $settings["vkmask.experimentalFeatures"].value;
        // print("EXP", experimentalFeatures);
    }

    function returnLogs(data: MessageHandlerData<any>) {
        messageHandler.send({
            ...data,
            target: data.origin,
            payload: logDump,
        });
    }

    function processEffects(newEffects) {
        // print("new effects", newEffects);
        // newEffects = newEffects.filter(
        //     (effect) => experimentalFeatures || !experimentalEffects.has(effect.name)
        // );
        $effects = newEffects.map((e, id) => {
            // print("process effect ", id, selection.id === id);
            return {
                value: e,
                id,
                selected: $selection.id === id,
                onClickVisible: (id, disabled) => {
                    // print("disabled ", id, disabled);
                    $effects[id].value.disabled = disabled;
                    sendEffects();
                },
                onClickDelete: async (deleteId) => {
                    print("delte effect", deleteId);
                    await getTabInfo();
                    Object.keys($tabInfo).forEach((tabKey) => {
                        const [root, id, ...rest] = tabKey.split(".");
                        if (+id < deleteId) return;
                        if (+id === deleteId) {
                            delete $tabInfo[tabKey];
                            return;
                        }

                        const newTabKey = [root, +id - 1, ...rest].join(".");
                        $tabInfo[newTabKey] = $tabInfo[tabKey];
                        delete $tabInfo[tabKey];
                    });
                    sendTabInfo();

                    // print("ondelte", id);
                    $effects.splice(deleteId, 1);

                    processEffects($effects.map((e) => e.value));
                    sendEffects();

                    if ($selection.type === SelectionType.effect) {
                        if ($selection.id === deleteId) {
                            $selection = { type: SelectionType.empty };
                        } else if ($selection.id > deleteId) {
                            $selection.id--;
                        }
                        $selection = $selection;
                        print("delete send", $selection);
                        sendSelect();
                    }
                },
                onSelect: () => {
                    print("send on select", $selection);
                    sendSelect();
                },
            };
        });
        // print(effects);
    }

    async function getEffects() {
        const { payload } = await messageHandler.request({
            target: RequestTarget.extension,
            command: RequestCommand.getEffects,
        });

        processEffects(payload);
    }

    function sendEffects() {
        messageHandler.send({
            command: RequestCommand.updateEffects,
            target: RequestTarget.extension,
            payload: $effects.map((e) => e.value),
        });
    }

    function sendSelect() {
        messageHandler.send({
            command: RequestCommand.updateSelection,
            target: RequestTarget.all,
            payload: $selection,
        });
    }

    // function getSelection() {
    //     messageHandler
    //         .request({
    //             target: RequestTarget.extension,
    //             command: RequestCommand.getSelection,
    //         })
    //         .then(({ payload }) => {
    //             print("received selection");
    //             proccessSelection(payload);
    //             getEffects();
    //             // switch (selection.type) {
    //             //     case SelectionType.effect:
    //             //         break;
    //             //     case SelectionType.plugin:
    //             //         break;
    //             //     default:
    //             //         break;
    //             // }
    //         });
    // }

    async function getSelection() {
        const { payload } = await messageHandler.request({
            target: RequestTarget.extension,
            command: RequestCommand.getSelection,
        });

        processSelection(payload);
    }
    function processSelection(newSelection) {
        $selection = newSelection;
        // print("new selection", $selection);
    }

    async function getTabInfo() {
        const { payload } = await messageHandler.request({
            target: RequestTarget.extension,
            command: RequestCommand.getTabInfo,
            payload: {
                viewId: ViewIds.parameters,
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
                viewId: ViewIds.parameters,
                value: $tabInfo,
            },
        });
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
        await Promise.all([getLocatization(), getEffects(), getSelection(), getSettings()]);
        await getAppState();
    }

    // print("INIT");
    init();
</script>

<ShadowTop></ShadowTop>

{#if appState === AppState.running}
    {#key $selection}
        {#key $effects}
            {#if $effects.length}
                <List
                    elements={$effects}
                    elementComponent={Effect}
                    onDrop={async (newElements, dragId) => {
                        // !!! check type of selection
                        const newId = newElements.findIndex((e) => e.id === dragId);
                        const dragDir = Math.sign(newId - dragId);
                        const minEdge = Math.min(newId, dragId);
                        const maxEdge = Math.max(newId, dragId);

                        if (newId === dragId) return;

                        // print("newId", newId);
                        let selectionUpdated = false;
                        if ($selection.type === SelectionType.effect) {
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

                        // due to linear lookup
                        // it is hard to manipulate data in tabinfo

                        await getTabInfo(); // !!!!! add auto update by extension

                        // print("drag", dragId, newId);
                        const dragTabInfo = {};
                        print("tabInfo drag before", $tabInfo);

                        Object.keys($tabInfo).forEach((tabKey) => {
                            const [root, id, ...rest] = tabKey.split(".");

                            if (+id === dragId) {
                                const newTabKey = [root, newId, ...rest].join(".");
                                dragTabInfo[newTabKey] = $tabInfo[tabKey];
                                delete $tabInfo[tabKey];
                                return;
                            }

                            if (+id < minEdge || +id > maxEdge) return;

                            const newTabKey = [root, +id - dragDir, ...rest].join(".");
                            $tabInfo[newTabKey] = $tabInfo[tabKey];
                            delete $tabInfo[tabKey];
                        });

                        $tabInfo = { ...$tabInfo, ...dragTabInfo };
                        print("tabInfo drag after", $tabInfo);

                        sendTabInfo();

                        if (selectionUpdated) {
                            $selection = $selection;
                            sendSelect();
                        }
                        $effects = newElements.map((e, index) => ({ ...e, id: index }));
                        sendEffects();
                    }}
                />
            {:else}
                <div class="empty-effects">{l10n.t("locale.effects.emptyEffectsHint")}</div>
            {/if}
        {/key}
    {/key}
{:else}
    <Loading />
{/if}

<style>
    div.empty-effects {
        padding-left: var(--global-body-padding-left);
    }
</style>
