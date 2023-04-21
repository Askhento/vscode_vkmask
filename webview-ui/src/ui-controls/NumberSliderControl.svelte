<script lang="ts">
  export let label = "empty",
    value,
    params;

  let step = 0.01,
    sliderValue = value;
  //   $: console.log("from slider", params);
  function onSliderUp() {
    value = sliderValue;
  }

  function onEdit(target) {
    const newValue = target.innerText;
    target.blur();

    if (isNaN(newValue)) {
      value = sliderValue;
      return;
    }
    value = parseFloat(newValue);
    sliderValue = value;
  }
  // !!! check if min max exist
  $: step = (params.max - params.min) / 20.0;
</script>

<div class="number-control-wrapper">
  {#if label}
    <span class="label">{label}</span>
    <span class="control-wrapper">
      <span
        class="number"
        contenteditable
        on:keydown={(e) => {
          if (e.key === "Enter") {
            onEdit(e.target);
          }
        }}>{value}</span
      >
      <input
        class="slider"
        type="range"
        bind:value={sliderValue}
        on:mouseup={onSliderUp}
        min={params.min || 0}
        max={params.max || 1}
        {step}
      />
    </span>
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

  .control-wrapper {
    display: inline-block;
    /* flex-grow: 1; */
    /* width: 50%; */
    flex: 1;
  }
  span.number {
    display: block;
    /* margin-left: auto; */
    max-height: 1em;
    text-align: end;
  }
  span.label {
    display: inline-block;
    flex: 1;
  }

  input.slider {
    display: block;
    margin-left: auto;

    /* flex: 2 0 0px; */
  }

  input[type="range"] {
    -webkit-appearance: none;
    appearance: none;
    background: transparent;
    cursor: pointer;
    /* width: 100%; */
    width: 150px;
  }
  /***** Track Styles *****/
  /***** Chrome, Safari, Opera, and Edge Chromium *****/
  input[type="range"]::-webkit-slider-runnable-track {
    /* background: #053a5f; */
    height: 6px;
    border-radius: 3px;
    /* color: var(--input-foreground); */
    background: var(--input-background);
  }

  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none; /* Override default look */
    appearance: none;
    margin-top: -7px; /* Centers thumb on the track */
    background-color: var(--input-foreground);
    /* border-color: wheat; */
    /* border: 1px solid var(--button-icon-background); */

    height: 20px;
    width: 20px;
    border-radius: 10px;
  }
  input[type="range"]:focus {
    outline: none;
  }
  /***** Chrome, Safari, Opera, and Edge Chromium *****/
  input[type="range"]:focus::-webkit-slider-thumb {
    border: 1px solid var(--focus-border);
    outline: 2px solid var(--focus-border);
    outline-offset: 0.125rem;
  }
</style>
