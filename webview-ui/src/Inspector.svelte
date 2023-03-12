<script lang="ts">
  /*

    todo : need to add filepicker
    todo : texture preview

    todo : find bug when use slider and sending update effects from maskconfig


  */
  import { effectDefaults } from "../../src/ztypes.js";
  import { effects } from "./stores.js";
  import { vscode } from "./utils/vscode";
  //
  import { uiControls } from "./ui-controls/Controls.js";
</script>

<div class="inspector-wrapper">
  <div class="inspector-name">Inspector Panel</div>
  {#each $effects as effect, i}
    {#if effect.selected}
      <div>{effect.data.name}</div>
      {#if effect.data.name in uiControls}
        {#each Object.entries(uiControls[effect.data.name]) as [key, element]}
          <svelte:component
            this={element}
            bind:label={key}
            params={effectDefaults[effect.data.name].type.shape[
              key
            ].removeDefault().description || {}}
            bind:value={effect.data[key]}
          />
        {/each}
      {/if}
    {/if}
  {/each}
</div>
