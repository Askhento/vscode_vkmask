<script lang="ts">
    import { vscode } from "../utils/vscode";
    import { RequestTarget, RequestCommand, SelectionType } from "../../../src/types";
    import type { RecentProjectInfo } from "../../../src/RecentProjectInfo";
    import { logger } from "../logger";
    const print = logger("WelcomeScreen.svelte");
    import { getContext } from "svelte";
    //@ts-expect-error
    const { messageHandler } = getContext("stores");

    let recentProjectInfo: RecentProjectInfo[] = [];

    async function getRecentProjectInfo() {
        const { payload } = await messageHandler.request({
            command: RequestCommand.getRecentProjectInfo,
            target: RequestTarget.extension,
        });

        // print(resp);
        recentProjectInfo = payload;
    }

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

    getRecentProjectInfo();
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

{#if recentProjectInfo}
    {#each recentProjectInfo as info}
        <div>
            <span>{info.name}</span>
            <span>{info.path}</span>
            <span>{new Date(info.dateModified)}</span>
        </div>
    {/each}
{/if}

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
