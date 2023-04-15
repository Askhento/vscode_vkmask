<script lang="ts">
  import { vscode } from "./utils/vscode";

  function sendOpenProject() {
    vscode.postMessage({
      type: "openProject",
    });
  }

  function sendCreateNewProject() {
    vscode.postMessage({
      type: "createNewProject",
    });
  }
</script>

<div class="welcome-wrapper">
  <div>Welcome!</div>
  <vscode-button on:click={sendCreateNewProject}>
    Create new project
    <span slot="start" class="codicon codicon-add" />
  </vscode-button>
  <vscode-button on:click={sendOpenProject}>
    Open existing project
    <span slot="start" class="codicon codicon-folder-opened" />
  </vscode-button>
</div>

<style>
  .welcome-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
  }
  vscode-button {
    display: block;
    margin: 5px;
    width: 190px;
  }
</style>
