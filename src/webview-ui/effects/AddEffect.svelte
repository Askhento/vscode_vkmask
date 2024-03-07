<script>
    // import { effects, selection } from "../stores.js" ;
    import { getContext } from "svelte";
    //@ts-expect-error
    const { effects, selection, messageHandler } = getContext("stores");
    import { RequestTarget, RequestCommand, SelectionType } from "../../../src/types";

    import { effectNames, effectDefaults } from "../../../src/ztypes.js";
    import Dropdown from "../components/Dropdown.svelte";

    // open={addListOpened}

    function AddEffect(effectName) {
        const effectObjects = $effects.map((e) => e.value);

        const newEffect = {
            name: effectName,
        };

        let newSelection;
        if ($selection !== undefined && $selection.type === SelectionType.effect) {
            effectObjects.splice($selection.id + 1, 0, newEffect);
            newSelection = {
                type: SelectionType.effect,
                id: $selection.id + 1,
            };
        } else {
            effectObjects.push(newEffect);
            newSelection = {
                type: SelectionType.effect,
                id: effectObjects.length - 1,
            };
        }

        console.log("added effect", effectObjects);

        messageHandler.send({
            command: RequestCommand.updateEffects,
            target: RequestTarget.effects,
            payload: effectObjects,
        });

        messageHandler.send({
            command: RequestCommand.updateEffects,
            target: RequestTarget.extension,
            payload: effectObjects,
        });

        $selection = newSelection;

        console.log("new selection", $selection);

        messageHandler.send({
            command: RequestCommand.updateSelection,
            target: RequestTarget.all,
            payload: $selection,
        });
    }

    let options = effectNames.map((effectName) => [() => AddEffect(effectName), effectName]);
</script>

<Dropdown {options} name={"Add Effect"} icon="add" />
