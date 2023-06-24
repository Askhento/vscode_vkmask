<script>
  import { effects, selection } from "./stores.js";

  import { effectNames, effectDefaults } from "../../src/ztypes.js";
  import Dropdown from "./components/Dropdown.svelte";
  // open={addListOpened}

  //   function AddEffect(effectName) {
  //     const newEffect = {
  //       name: effectName,
  //     };

  //     if ($selection !== undefined && $selection.type === "effect") {
  //       $effects.splice($selection.id + 1, 0, newEffect);
  //       $effects = $effects;
  //       $selection = {
  //         type: "effect",
  //         id: $selection.id + 1,
  //       };
  //     } else {
  //       $effects.push(newEffect);
  //       $effects = $effects;
  //       $selection = {
  //         type: "effect",
  //         id: $effects.length - 1,
  //       };
  //     }
  //   }

  function AddPlugin(pluginName) {
    console.log(pluginName);
  }
  const pluginNames = ["mirror", "perspective", "blah blah"];
  let options = pluginNames.map((pluginName) => [() => AddPlugin(pluginName), pluginName]);
  //
</script>

<Dropdown {options} name={"Add Plugin (todo)"} icon="add" />
