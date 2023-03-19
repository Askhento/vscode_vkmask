<script lang="ts">
  /*

    todo : need to add file picker
    todo : texture preview

    todo : find bug when use slider and sending update effects from maskConfig


  */
  import { effectDefaults } from "../../src/ztypes.js";
  import { effects, selection } from "./stores.js";
  import { vscode } from "./utils/vscode";
  //
  import { uiControls } from "./ui-controls/Controls.js";
</script>

<div class="inspector-wrapper">
  <div class="inspector-name">Inspector Panel</div>
  {#if $selection}
    {#if $selection.type === "effect"}
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
      {/if}
    {/if}
  {/if}
</div>
