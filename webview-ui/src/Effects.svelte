<script lang="ts">
  import { logger } from "./logger";
  const print = logger("Effects.svelte");

  import { vscode } from "./utils/vscode";
  import { effects, selection } from "./stores.js";

  //   ? do not send effects back on user input events, will cause loop
  // i use lock because i need to track changes made in inspector

  import { fromZodError } from "zod-validation-error";

  import { effectNames, effectDefaults, ZEffects } from "../../src/ztypes.js";
  import { flip } from "svelte/animate";
  import { onMount } from "svelte";

  let hovering: any = false;
  let addListOpened = false;
  //   let uiElements;

  const drop = (event, target) => {
    event.dataTransfer.dropEffect = "move";
    const start = parseInt(event.dataTransfer.getData("text/plain"));
    hovering = null;
    if (start === target) return;
    const newEffects = $effects;
    // print(start, target);

    if (start < target) {
      newEffects.splice(target + 1, 0, newEffects[start]);
      newEffects.splice(start, 1);
    } else {
      newEffects.splice(target, 0, newEffects[start]);
      newEffects.splice(start + 1, 1);
    }

    $effects = newEffects;
    $selection = {
      type: "effect",
      id: target,
    };
  };

  const dragstart = (event, i) => {
    print("start drag");
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.dropEffect = "move";
    const start = i;
    event.dataTransfer.setData("text/plain", start);
  };

  function checkSelected(id) {
    if ($selection === undefined) return false;
    return $selection.type === "effect" && $selection.id === id;
  }
  function toggleSelection(id) {
    if (checkSelected(id)) {
      $selection = undefined;
      //   print("sending deselect ", id);
      //   vscode.postMessage({ type: "effectDeselected", value: id });
    } else {
      $selection = {
        type: "effect",
        id: id,
      };
      //   print("sending select", id);
      //   vscode.postMessage({ type: "effectSelected", value: id });
    }
  }

  function onVisibleClick(id) {
    $effects[id].disabled = !$effects[id].disabled;
    $effects = $effects;
  }

  function onClickRemove(id) {
    print("remove", id);
    $effects.splice(id, 1);
    print("remove", $effects);
    $effects = $effects;

    if ($selection !== undefined && $selection.type === "effect") {
      if ($selection.id === id) {
        $selection = undefined;
        // print("sending deselect", id);
        // vscode.postMessage({ type: "effectDeselected", value: 0 });
      } else if ($selection.id > id) {
        // print("sending select", id);
        // vscode.postMessage({ type: "effectSelected", value: $selection.id });
        $selection.id--;
      }
    }
    // print($effects);
    // vscode.postMessage({ type: "effectDelete", value: id });
  }

  function AddEffect(object) {
    if ($selection !== undefined && $selection.type === "effect") {
      $effects.splice($selection.id + 1, 0, object);
      $effects = $effects;
      $selection = {
        type: "effect",
        id: $selection.id + 1,
      };
    } else {
      $effects.push(object);
      $effects = $effects;
      $selection = {
        type: "effect",
        id: $effects.length - 1,
      };
    }
  }

  let addEffectButtonElem;

  $: {
    // !!!! fix for add button showing behind dropdown
    if (addEffectButtonElem) {
      const btnColor = window
        .getComputedStyle(addEffectButtonElem, null)
        .getPropertyValue("background-color");
      // Get all color components (alpha may not be there if = 1):
      const parts = btnColor.match(/[\d.]+/g);
      console.log("parts", parts);
      // If alpha is not there, add it:
      if (parts.length === 4) {
        // parts.push("1");
        parts[3] = "1";
      }
      // Modify alpha:
      // Apply new value:
      addEffectButtonElem.style.backgroundColor = `rgba(${parts.join(",")})`;
    }
  }
</script>

<!-- <svelte:window on:message={handleMessage} /> -->

<main>
  <div class="effect-add-wrapper">
    <vscode-button
      class="add-effect-btn"
      bind:this={addEffectButtonElem}
      on:click={() => {
        // addListOpened = !addListOpened;
      }}
    >
      <span slot="start" class="codicon codicon-add" />
      Add Effect
    </vscode-button>
    <vscode-dropdown
      class="add-effect-dropdown"
      open={addListOpened}
      on:blur={() => {
        // addListOpened = false // edge case when hitting outside element
      }}
      on:change={(e) => {
        const effectName = e.target.value;
        print("new effect ", effectName);
        const newEffect = effectDefaults[effectName];
        print(newEffect);
        AddEffect(newEffect.data);
      }}
    >
      <vscode-option />
      {#each effectNames as effectName}
        <vscode-option>{effectName}</vscode-option>
      {/each}
    </vscode-dropdown>
    <vscode-divider role="presentation" />
  </div>
  {#if $effects.length}
    <div class="effect-list-wrapper">
      <ul class="effectsList">
        {#each $effects as effect, index (index)}
          <vscode-option
            animate:flip={{ duration: 200 }}
            draggable={true}
            class="effect-name"
            class:is-active={hovering === index}
            on:dragstart={(event) => dragstart(event, index)}
            on:drop|preventDefault={(event) => drop(event, index)}
            ondragover="return false"
            on:dragenter={() => (hovering = index)}
            on:dragover={(e) => {
              e.preventDefault();
            }}
            on:click|stopPropagation={toggleSelection(index)}
            selected={$selection &&
              $selection.type === "effect" &&
              $selection.id === index}
            >{effect.name}
            <span class="effect-btn-wrapper">
              <vscode-button
                class="effect-btn"
                appearance="icon"
                on:click|stopPropagation={onVisibleClick(index)}
              >
                <span
                  class="codicon {effect.disabled
                    ? 'codicon-eye-closed'
                    : 'codicon-eye'}"
                />
              </vscode-button>
              <vscode-button
                class="effect-btn"
                appearance="icon"
                on:click|stopPropagation={onClickRemove(index)}
              >
                <span class="codicon codicon-trash" />
              </vscode-button>
            </span>
          </vscode-option>
        {/each}
      </ul>
    </div>
  {:else}
    <!-- add copy debug info button -->
    <div>Create your first effect!</div>
    <!-- <vscode-progress-ring /> -->
  {/if}
</main>

<style>
  * {
    box-sizing: border-box;
  }

  ul {
    list-style: none;
    padding: unset;
    margin: unset;
  }

  /* .effect-name {
    display: block;
  } */

  /* .effect-wrapper.disabled {
    background-color: var(--vscode-disabledForeground);
  } */

  vscode-option.effect-name {
    /* display: inline-block; */
    display: block;
    position: relative;

    width: 100%;
    height: 25px;
  }

  vscode-option.effect-name.is-active {
    background-color: cornflowerblue;
  }

  .effect-btn-wrapper {
    position: absolute;
    right: 0px;
    top: 0px;
  }
  .effect-add-wrapper {
    position: relative;
  }
  .add-effect-dropdown {
    width: 120px;
  }
  .add-effect-btn {
    /* background-color: rgb(from var(--button-primary-background) r g b / 50%); */
    pointer-events: none;
    width: 120px;
    position: absolute;
    z-index: 2;
  }
  .effect-btn {
    display: inline-block;
  }
</style>
