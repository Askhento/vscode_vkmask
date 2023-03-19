<script lang="ts">
  export let label = "empty",
    value = 0,
    params;

  let step = 0.01,
    sliderValue = value;
  // $: console.log(value);
  function onSliderUp() {
    value = sliderValue;
  }
  $: step = (params.max - params.min) / 20.0;
</script>

<div class="number-control-wrapper">
  {#if label}
    <span class="label">{label}</span>
    <span class="number">{sliderValue}</span>
    <input
      class="slider"
      type="range"
      bind:value={sliderValue}
      on:mouseup={onSliderUp}
      min={params.min || 0}
      max={params.max || 1}
      {step}
    />
  {/if}
</div>

<style>
  * {
    padding: 5px;
  }
  .number-control-wrapper {
    position: relative;
    display: flex;
    justify-content: start;
  }

  span.number {
    display: inline-block;
    flex: 1 0 0px;
  }
  span.label {
    display: inline-block;
    flex: 1 0 0px;
  }

  input.slider {
    display: inline-block;
    flex: 2 0 0px;
  }
</style>
