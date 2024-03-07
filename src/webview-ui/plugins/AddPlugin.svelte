<script>
    import { getContext } from "svelte";
    //@ts-expect-error
    const { plugins, selection, messageHandler } = getContext("stores");

    import { effectNames, effectDefaults } from "../../../src/ztypes.js";
    import Dropdown from "../components/Dropdown.svelte";
    import { RequestTarget, RequestCommand, SelectionType } from "../../../src/types";

    // open={addListOpened}

    function AddPlugin(pluginName) {
        const newPlugin = {
            name: pluginName,
        };

        const pluginObjects = $plugins.map((p) => p.value);

        if ($selection !== undefined && $selection.type === SelectionType.plugin) {
            pluginObjects.splice($selection.id + 1, 0, newPlugin);
            $selection = {
                type: SelectionType.plugin,
                id: $selection.id + 1,
            };
        } else {
            pluginObjects.push(newPlugin);
            $selection = {
                type: SelectionType.plugin,
                id: pluginObjects.length - 1,
            };
        }

        messageHandler.send({
            command: RequestCommand.updatePlugins,
            target: RequestTarget.plugins,
            payload: pluginObjects,
        });

        messageHandler.send({
            command: RequestCommand.updatePlugins,
            target: RequestTarget.extension,
            payload: pluginObjects,
        });

        console.log("new selection", $selection);

        messageHandler.send({
            command: RequestCommand.updateSelection,
            target: RequestTarget.all,
            payload: $selection,
        });
    }

    const pluginNames = ["mirror", "perspective"];
    let options = pluginNames.map((pluginName) => [() => AddPlugin(pluginName), pluginName]);
    //
</script>

<Dropdown {options} name={"Add Plugin"} icon="add" />
