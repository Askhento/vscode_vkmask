<script lang="ts">
  //test
  import { effectDefaults } from "../../src/ztypes.js";
  import { effects } from "./stores.js";
  import { vscode } from "./utils/vscode";
  //
  import { uiControlsMap, uiControls } from "./ui-controls/Controls.js";
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
            options={Object.keys(
              effectDefaults[effect.data.name].type.shape[key].removeDefault()
                .Values || {}
            )}
            bind:value={effect.data[key]}
          />
        {/each}
      {/if}
    {/if}
  {/each}
</div>
