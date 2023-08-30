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

    function sendOpenProject(payload) {
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
        <span class="button-text">Create new project</span>
        <span slot="start" class="codicon codicon-add" />
    </vscode-button>
    <vscode-button
        on:click={() => {
            sendOpenProject("");
        }}
    >
        <span class="button-text">Open existing project</span>
        <span slot="start" class="codicon codicon-folder-opened" />
    </vscode-button>
</div>

{#key recentProjectInfo}
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
{/key}

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
        overflow: visible;
        text-overflow: ellipsis;
        white-space: nowrap;
        margin-right: 1rem;
    }

    .recent-path {
        /* width: 10rem; */
        /* max-width: 15rem; */
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        margin-right: 1rem;

        /* background-color: aquamarine; */
    }

    .recent-date {
        margin-left: auto;
        white-space: nowrap;
    }

    .welcome-wrapper {
        width: 100%;
        /* margin: unset; */
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
    }

    h4 {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    vscode-button {
        display: block;
        margin-top: 0.5rem;
        /* max-width: max-content; */
        /* width: fit-content; */
        width: 11rem;
    }

    .button-text {
        /* width: 100%; */
        /* min-width: 5rem; */
        width: fit-content;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        /* white-space: nowrap; */
    }
</style>
