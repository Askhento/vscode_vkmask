<script>
  import { effects, selection } from "./stores.js";

  import { effectNames, effectDefaults } from "../../src/ztypes.js";
  import Dropdown from "./components/Dropdown.svelte";
  // open={addListOpened}

  function AddEffect(effectName) {
    const newEffect = {
      name: effectName,
    };

    if ($selection !== undefined && $selection.type === "effect") {
      $effects.splice($selection.id + 1, 0, newEffect);
      $effects = $effects;
      $selection = {
        type: "effect",
        id: $selection.id + 1,
      };
    } else {
      $effects.push(newEffect);
      $effects = $effects;
      $selection = {
        type: "effect",
        id: $effects.length - 1,
      };
    }
  }

  let options = effectNames.map((effectName) => [() => AddEffect(effectName), effectName]);
  //
</script>

<Dropdown {options} name={"Add Effect"} icon="add" />
