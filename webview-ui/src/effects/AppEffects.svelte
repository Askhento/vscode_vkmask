<script lang="ts">
    import { setContext } from "svelte";
    import { writable } from "svelte/store";
    import { provideVSCodeDesignSystem, allComponents } from "@vscode/webview-ui-toolkit";
    import { MessageHandler } from "../common/MessageHandler";
    import type { MessageHandlerData } from "../common/MessageHandler";
    import List from "../components/DraggableList.svelte";
    import { RequestTarget, RequestCommand, SelectionType } from "../../../src/types";
    import type { Selection } from "../../../src/types";
    import Effect from "./Effect.svelte";
    import { logger, logDump } from "../logger";
    import AddEffect from "./AddEffect.svelte";
    import * as l10n from "@vscode/l10n";
    const print = logger("AppEffects.svelte");
    const origin = RequestTarget.effects;

    provideVSCodeDesignSystem().register(allComponents);

    const selection = writable<Selection>({ type: SelectionType.empty });
    const effects = writable([]);
    const messageHandler = new MessageHandler(handleMessageApp, origin);

    setContext("stores", { selection, effects, messageHandler });

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

    function processEffects(newEffects) {
        // print("new effects", newEffects);
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
                onClickDelete: (id) => {
                    // print("ondelte", id);
                    $effects.splice(id, 1);
                    processEffects($effects);
                    sendEffects();
                    if ($selection.type === SelectionType.effect) {
                        if ($selection.id === id) {
                            $selection = { type: SelectionType.empty };
                        } else if ($selection.id > id) {
                            $selection.id--;
                        }
                        $selection = $selection;
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
        // print("new selection", $selection);
    }

    async function init() {
        await getLocatization();
        await getEffects();
        await getSelection();
    }

    // print("INIT");
    init();
</script>

<!-- <AddEffect /> -->
{#key $selection}
    {#key $effects}
        {#if $effects.length}
            <List
                elements={$effects}
                elementComponent={Effect}
                name="Effects"
                onDrop={(newElements, dragId) => {
                    // !!! check type of selection
                    if (dragId === $selection.id) {
                        print("selected drag");
                    }
                    $effects = newElements.map((e, index) => ({ ...e, id: index }));
                    sendEffects();
                    console.log("drop", $effects);
                }}
            />
        {:else}
            <h4>{l10n.t("Create your first effect!")}</h4>
        {/if}
    {/key}
{/key}
