<script lang="ts">
  import {
    provideVSCodeDesignSystem,
    vsCodeButton,
    allComponents,
  } from "@vscode/webview-ui-toolkit";
  import Effects from "./Effects.svelte";
  import Inspector from "./Inspector.svelte";
  import { vscode } from "./utils/vscode";

  provideVSCodeDesignSystem().register(allComponents);
</script>

<Effects />
<vscode-divider role="presentation" />

<Inspector />

<style>
  /* .done {
    opacity: 0.4;
  } */
</style>
