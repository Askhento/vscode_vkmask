<script lang="ts">
    import { vscode } from "../utils/vscode";
    import { RequestTarget, RequestCommand, SelectionType } from "../../../src/types";

    //   import { logger } from "./logger";
    //   const print = logger("WelcomeScreen.svelte");
    import { getContext } from "svelte";
    //@ts-expect-error
    const { messageHandler } = getContext("stores");

    function sendOpenProject() {
        messageHandler.send({
            command: RequestCommand.openProject,
            target: RequestTarget.extension,
        });
    }

    function sendCreateNewProject() {
        messageHandler.send({
            command: RequestCommand.createProject,
            target: RequestTarget.extension,
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
