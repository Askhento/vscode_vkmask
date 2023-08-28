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

    function sendOpenProject(payload = undefined) {
        messageHandler.send({
            command: RequestCommand.openProject,
            target: RequestTarget.extension,
            payload,
        });
    }

    function sendCreateNewProject() {
        messageHandler.send({
            command: RequestCommand.createProject,
            target: RequestTarget.extension,
        });
    }

    const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];
    function formatDate(date: Date) {
        const day = date.getDate();
        const month = monthNames[date.getMonth()];
        const year = date.getFullYear();

        return `${day} ${month} ${year}`;
    }

    // function getOpenFileLink(dir) {
    //     const folderUri = {
    //         scheme: "file",
    //         path: dir,
    //         authority: "",
    //     };
    //     const link = `command:vscode.open?${encodeURIComponent(JSON.stringify(folderUri))}`;
    //     // print(link);
    //     return link;
    // }
    getRecentProjectInfo();
</script>

<h4>No project opened yet.</h4>
<div class="welcome-wrapper">
    <vscode-button on:click={sendCreateNewProject}>
        Create new project
        <span slot="start" class="codicon codicon-add" />
    </vscode-button>
    <vscode-button on:click={sendOpenProject}>
        Open existing project
        <span slot="start" class="codicon codicon-folder-opened" />
    </vscode-button>
</div>

{#if recentProjectInfo.length}
    <h4>Recent projects:</h4>
    {#each recentProjectInfo as info}
        <div class="recent-projects-wrapper">
            <vscode-link
                on:click={() => {
                    sendOpenProject(info.path);
                }}>{info.name}</vscode-link
            >

            <span class="recent-path">{info.path}</span>
            <span class="recent-date">{formatDate(new Date(info.dateModified))}</span>
        </div>
    {/each}
{/if}

<style>
    * {
        box-sizing: border-box;
    }
    .recent-projects-wrapper {
        display: flex;
        justify-content: start;
        width: 100%;
    }

    vscode-link {
        width: 4rem;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        margin-right: 1rem;
    }

    .recent-path {
        /* width: 10rem; */
        max-width: 15rem;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        /* background-color: aquamarine; */
    }

    .recent-date {
        margin-left: auto;
        white-space: nowrap;
    }

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
