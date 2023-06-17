<script lang="ts">
  import { logger } from "./logger";
  const print = logger("Effects.svelte");

  import { vscode } from "./utils/vscode";
  import { effects, selection } from "./stores.js";

  //   ? do not send effects back on user input events, will cause loop
  // i use lock because i need to track changes made in inspector

  //   import { fromZodError } from "zod-validation-error";

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
    } else {
      $selection = {
        type: "effect",
        id: id,
      };
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
      } else if ($selection.id > id) {
        $selection.id--;
      }
    }
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
      // have to get computed value
      const btnColor = window
        .getComputedStyle(addEffectButtonElem, null)
        .getPropertyValue("background-color");
      // Get all color components (alpha may not be there if = 1):
      const parts = btnColor.match(/[\d.]+/g);
      //   console.log("parts", parts);
      // If alpha is not there, add it:
      if (parts.length === 4) {
        parts[3] = "1";
      }
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
      {#each effectNames as effectName}
        <vscode-option>{effectName}</vscode-option>
      {/each}
    </vscode-dropdown>
    <vscode-divider role="presentation" />
  </div>

  {#if $effects.length}
    {#key $selection}
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
              selected={$selection && $selection.type === "effect" && $selection.id === index}
              >{effect.name}
              <span class="effect-btn-wrapper">
                {#if effect.tag}
                  <span class="effect-tag">
                    {effect.tag
                      .split(";")
                      .filter((t) => t.length)
                      .join(" or ")}
                  </span>
                {/if}
                <vscode-button
                  class="effect-btn"
                  appearance="icon"
                  on:click|stopPropagation={onVisibleClick(index)}
                >
                  <span class="codicon {effect.disabled ? 'codicon-eye-closed' : 'codicon-eye'}" />
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
    {/key}
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
    background-color: var(--button-primary-hover-background);
  }

  .effect-add-wrapper {
    position: relative;

    height: 100%;
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
  .effect-btn-wrapper {
    position: absolute;
    right: 0px;
    top: 0px;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;
    row-gap: 5px;
    column-gap: 5px;
    justify-content: flex-end;
    /* align-content: center; */
    align-items: center; /* ailgned text !!! */
  }
  .effect-tag {
    color: var(--vscode-textCodeBlock-background);
    text-align: center;
    text-justify: center;
    justify-content: center;
    display: inline-block;
  }
  .effect-btn {
    display: inline-block;
  }
</style>
