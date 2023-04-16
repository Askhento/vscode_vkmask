<script lang="ts">
  /*

    todo : need to add file picker
    todo : texture preview

    todo : find bug when use slider and sending update effects from maskConfig


  */
  import { effectDefaults } from "../../src/ztypes.js";
  import { effects, selection } from "./stores.js";
  import { vscode } from "./utils/vscode";

  import ObjectControl from "./ui-controls/ObjectControl.svelte";
  import { uiControls, EffectParserForUI } from "./ui-controls/Controls.js";

  let uiElements = EffectParserForUI.parse($effects);
  $: console.log("inspector tried!", uiElements);
</script>

<div class="inspector-wrapper">
  {#if $selection}
    <div class="inspector-name">Inspector Panel</div>
    {#if $selection.type === "effect"}
      <!-- <div>{console.log("controls from inspector")}</div>
      <div>
        {console.log($selection)}
      </div> -->
      <ObjectControl
        expanded={true}
        bind:value={$effects[$selection.id]}
        label={$effects[$selection.id].name}
        uiElements={uiElements.value[$selection.id].value}
      />
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
