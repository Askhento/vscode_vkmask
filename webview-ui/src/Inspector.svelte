<script lang="ts">
  /*

    todo : need to add file picker
    todo : texture preview

    todo : find bug when use slider and sending update effects from maskConfig


  */
  import { logger } from "./logger";
  const print = logger("Inspector.svelte");

  import { effectDefaults } from "../../src/ztypes.js";
  import { effects, selection } from "./stores.js";
  import { vscode } from "./utils/vscode";

  import ObjectControl from "./ui-controls/ObjectControl.svelte";
  import { uiControls, EffectParserForUI } from "./ui-controls/Controls.js";
  import { onMount } from "svelte";
  import NumberSliderControl from "./ui-controls/NumberSliderControl.svelte";

  let uiElements; //= EffectParserForUI.parse($effects);
  //   $: uiElements = EffectParserForUI.parse($effects);

  let selectedId;

  $: print("ui elements", uiElements);
  onMount(() => {
    // for some reason this does not fire
  });

  $: if ($selection) selectedId = $selection.id;
  else selectedId = undefined;

  $: print("selection changes : ", $selection);
  $: {
    print("effects changes : ", $effects);
    uiElements = EffectParserForUI.parse($effects); // this seems to help !!!
  }
</script>

<div class="inspector-wrapper">
  {#if selectedId !== undefined}
    <div class="inspector-name">Inspector Panel</div>
    {#if $selection.type === "effect"}
      <!-- <div>{print("controls from inspector")}</div>
      <div>
        {print($selection)}
      </div> -->
      <ObjectControl
        expanded={true}
        bind:value={$effects[selectedId]}
        label={$effects[selectedId].name}
        uiElements={uiElements.value[selectedId].value}
      />
      <!-- <NumberSliderControl
        bind:value={$effects[selectedId].mix}
        label={"TEST"}
        params={uiElements.value[selectedId].value.mix.uiData}
      /> -->
      <!-- uiElements={uiControls[$effects[$selection.id].name].uiData} -->
    {/if}
  {/if}
</div>

<!-- 
<div>{$effects[$selection.id].name}</div>
{#if $effects[$selection.id].name in uiControls}
  {#each Object.entries(uiControls[$effects[$selection.id].name]) as [key, element]}
    <svelte:component
      this={element}
      bind:label={key}
      params={effectDefaults[$effects[$selection.id].name].type.shape[
        key
      ].removeDefault().description || {}}
      bind:value={$effects[$selection.id][key]}
    />
  {/each}
{/if} -->
