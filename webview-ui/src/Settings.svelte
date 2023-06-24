<script>
  import Dropdown from "./components/Dropdown.svelte";
  import { vscode } from "./utils/vscode";

  const options = [
    [() => sendSettingAction("createNewProject"), "Create project", "add"],
    [() => sendSettingAction("openProject"), "Open project", "folder-opened"],
    [() => sendSettingAction("moveView"), "Move View", "move"],
    [() => sendSettingAction("openExtensionSettings"), "Open Settings", "gear"],
  ];
  function sendSettingAction(type) {
    vscode.postMessage({
      type,
    });
  }
</script>

<Dropdown {options} extraStyle="margin-left: auto;" />
