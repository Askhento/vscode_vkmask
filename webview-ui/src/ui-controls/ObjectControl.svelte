<script context="module">
  //   import {
  //     effectNames,
  //     effectDefaults,
  //     uiDescriptions,
  //   } from "../../../src/ztypes.js";

  //   import TextControl from "./TextControl.svelte";
  //   import NumberSliderControl from "./NumberSliderControl.svelte";
  //   import SwitchControl from "./SwitchControl.svelte";
  //   import FilePickerControl from "./FilePickerControl.svelte";
  //   import OptionsControl from "./OptionsControl.svelte";
  //   import ColorPickerControl from "./ColorPickerControl.svelte";

  //   const uiControlsMap = {
  //     [uiDescriptions.bool({}).name]: SwitchControl,
  //     [uiDescriptions.numberSlider({}).name]: NumberSliderControl,
  //     [uiDescriptions.filepath({}).name]: TextControl,
  //     [uiDescriptions.text({}).name]: TextControl,
  //     [uiDescriptions.enum({}).name]: OptionsControl,
  //     [uiDescriptions.color({}).name]: ColorPickerControl,
  //     [uiDescriptions.colorAlpha({}).name]: ColorPickerControl,
  //   };
</script>

<script>
  export let expanded = false;

  export let value;
  export let label;
  export let uiElements;

  function toggle() {
    expanded = !expanded;
  }
</script>

<span class:expanded on:click={toggle}>{label}</span>
{#if expanded}
  {#each Object.entries(uiElements) as [key, data]}
    <div>
      {#if data !== null}
        {#if data._type === "object"}
          <svelte:self
            expanded={true}
            bind:value={value[key]}
            bind:label={key}
            uiElements={uiElements[key].uiData}
          />
        {:else if data.uiData !== null}
          <svelte:component
            this={data.uiData.uiElement}
            bind:label={key}
            params={data.uiData.params || {}}
            bind:value={value[key]}
          />
        {/if}
      {/if}
    </div>
  {/each}
{/if}

<style>
  /* span {
    padding: 0 0 0 1.5em;
    background: url(tutorial/icons/folder.svg) 0 0.1em no-repeat;
    background-size: 1em 1em;
    font-weight: bold;
    cursor: pointer;
    min-height: 1em;
    display: inline-block;
  }

  .expanded {
    background-image: url(tutorial/icons/folder-open.svg);
  } */
</style>
