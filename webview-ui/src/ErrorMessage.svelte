<script lang="ts">
  export let message = "";

  function getErrorString() {
    return JSON.stringify(message, null, "  ");
  }
</script>

<div class="text-control-wrapper">
  <div>Error :</div>
  <pre class="error">{getErrorString()}</pre>
</div>

<style>
  * {
    margin: 5px;
  }
  .text-control-wrapper {
    width: 100%;
  }
  pre {
    white-space: pre-wrap; /* Since CSS 2.1 */
  }
</style>
