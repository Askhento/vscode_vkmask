<script lang="ts">
  import { vscode } from "./utils/vscode";
  import { effects, selection } from "./stores.js";

  //   ? do not send effects back on user input events
  // i use lock because i need to track changes made in inspector
  let updateLock = true;
  $: {
    if (updateLock) {
      updateLock = false;
      //   console.log("lock");
    } else {
      //   const newData = $effects.map((effect) => effect.data);
      // console.log(newData);
      // console.log($effects[0]?.data);
      //   if (newData.length) {
      //   console.log($effects);
      vscode.postMessage({
        type: "effectsUpdate",
        value: $effects,
      });
      //   }
    }
  }

  import { effectNames, effectDefaults, ZEffects } from "../../src/ztypes.js";
  import { flip } from "svelte/animate";

  let hovering: any = false;

  // console.log(effectNames);

  // Handle messages sent from the extension to the webview
  function handleMessage(event) {
    const message = event.data; // The json data that the extension sent
    console.log(message);
    switch (message.type) {
      case "updateEffects": {
        console.log("main.js : received updatingEffects");
        updateLock = true;
        $effects = message.effects;
        break;
      }
      case "deselect": {
        $selection = undefined;
        break;
      }
    }
  }

  const drop = (event, target) => {
    event.dataTransfer.dropEffect = "move";
    const start = parseInt(event.dataTransfer.getData("text/plain"));
    hovering = null;
    if (start === target) return;
    const newEffects = $effects;
    // console.log(start, target);

    if (start < target) {
      newEffects.splice(target + 1, 0, newEffects[start]);
      newEffects.splice(start, 1);
    } else {
      newEffects.splice(target, 0, newEffects[start]);
      newEffects.splice(start + 1, 1);
    }

    // // reset id's
    // newEffects.forEach((effect, i) => {
    //   effect.id = i;
    // });

    $effects = newEffects;
    // effects.set(newEffects);
    sendEffects();
  };

  const dragstart = (event, i) => {
    console.log("start drag");
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
      vscode.postMessage({ type: "effectDeselected", value: id });
    } else {
      $selection = {
        type: "effect",
        id: id,
      };
      vscode.postMessage({ type: "effectSelected", value: id });
    }
  }

  function onVisibleClick(id) {
    $effects[id].disabled = !$effects[id].disabled;
    $effects = $effects;
    // vscode.postMessage({
    //   type: "effectDisabled",
    //   value: {
    //     effectId: id,
    //     disabled: $effects[id].data.disabled,
    //   },
    // });
  }

  function onClickRemove(id) {
    $effects.splice(id, 1);
    $effects = $effects;
    console.log($effects);
    // vscode.postMessage({ type: "effectDelete", value: id });
  }

  function sendAddEffect(object) {
    $effects.unshift(object);
    $effects = $effects;
    // vscode.postMessage({ type: "effectAdd", value: object });
  }

  function sendEffects() {
    // vscode.postMessage({
    //   type: "updateEffects",
    //   value: $effects,
    // });
  }
</script>

<svelte:window on:message={handleMessage} />

<main>
  <div class="effect-add-wrapper">
    <!-- <vscode-button>
      Add Effect
      <span slot="start" class="codicon codicon-add" />
    </vscode-button> -->
    <vscode-dropdown
      on:change={(e) => {
        const effectName = e.target.value;
        if (effectName === "Add Effect") return;
        const newEffect = effectDefaults[effectName];
        sendAddEffect(newEffect);
        e.target.value = "Add Effect";
      }}
    >
      <vscode-option />
      {#each effectNames as effectName}
        <vscode-option>{effectName}</vscode-option>
      {/each}
    </vscode-dropdown>
  </div>
  <vscode-divider role="presentation" />

  <div class="effect-list-wrapper">
    {#if $effects}
      <ul class="effectsList">
        {#each $effects as effect, index (index)}
          <!-- <div class="effect-wrapper {effect.disabled ? 'disabled' : ''}"> -->
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
                on:click|stopPropagation={onClickRemove(effect.id)}
              >
                <span class="codicon codicon-trash" />
              </vscode-button>
            </span>
          </vscode-option>
          <!-- </div> -->
        {/each}
      </ul>
    {:else}
      <div>Parsing...</div>
    {/if}
  </div>
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

  .effect-btn {
    display: inline-block;
  }
</style>
