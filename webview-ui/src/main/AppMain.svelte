<script lang="ts">
    import { provideVSCodeDesignSystem, allComponents } from "@vscode/webview-ui-toolkit";
    import { MessageHandler } from "../common/MessageHandler";
    import type { MessageHandlerData } from "../common/MessageHandler";
    import List from "../components/DraggableList.svelte";
    import { RequestTarget, RequestCommand, SelectionType } from "../../../src/types";
    import type { Selection } from "../../../src/types";
    import { logger } from "../logger";
    import Effect from "./Effect.svelte";
    import Plugin from "./Plugin.svelte";
    const print = logger("AppMain.svelte");

    provideVSCodeDesignSystem().register(allComponents);

    const origin = RequestTarget.main;
    let effects,
        selection: Selection = { type: SelectionType.empty };
    let plugins = [
        {
            id: 0,
            value: { name: "mirror" },
        },
        {
            id: 1,
            value: { name: "perspective" },
        },
    ];

    const messageHandler = new MessageHandler(handleMessageApp, origin);

    function handleMessageApp(data: MessageHandlerData<any>) {
        print("recived ", data);
        const { payload, command } = data;
        switch (command) {
            case RequestCommand.updateEffects:
                processEffects(payload);
                break;

            default:
                break;
        }
    }

    messageHandler
        .request({
            target: RequestTarget.extension,
            command: RequestCommand.getEffects,
        })
        .then(({ payload }) => {
            processEffects(payload);
        });

    function processEffects(newEffects) {
        effects = newEffects.map((e, id) => {
            return {
                value: e,
                id,
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
                    if (selection.type === SelectionType.effect) {
                        if (selection.id === id) {
                            selection = { type: SelectionType.empty };
                        } else if (selection.id > id) {
                            selection.id--;
                        }
                        sendSelect();
                    }
                },
                onSelect: (id, selected) => {
                    print(id, selected);
                    for (let i = 0; i < effects.length; i++) {
                        effects[i].selected = id === i && selected;
                    }
                    selection = { type: selected ? SelectionType.effect : SelectionType.empty, id };
                    sendSelect();
                },
            };
        });
        print(effects);
    }

    function sendEffects() {
        messageHandler.send({
            command: RequestCommand.updateEffects,
            target: RequestTarget.extension,
            payload: effects.map((e) => e.value),
        });
    }

    function sendSelect() {
        messageHandler.send({
            command: RequestCommand.updateSelection,
            target: RequestTarget.extension,
            payload: selection,
        });
    }
</script>

{#key effects}
    {#if effects}
        <List
            elements={effects}
            elementComponent={Effect}
            name="Effects"
            onDrop={(newElements, dragId) => {
                // !!! check type of selection
                if (dragId === selection.id) {
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
                // sendEffects();
                // console.log("drop", effects);
            }}
        />
    {/if}
{/key}

<style>
    div {
        background-color: transparent;
    }
</style>
