<script lang="ts">
    import * as l10n from "@vscode/l10n";

    import { vscode } from "../utils/vscode";
    import { RequestTarget, RequestCommand, SelectionType } from "../../../src/types";
    import type { RecentProjectInfo } from "../../../src/RecentProjectInfo";
    import { logger } from "../logger";
    const print = logger("WelcomeScreen.svelte");
    import { getContext } from "svelte";
    //@ts-expect-error
    const { messageHandler } = getContext("stores");

    export let recentProjectInfo: RecentProjectInfo[] = [];

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

        return `${day} ${l10n.t(month)} ${year}`;
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

<!-- <p /> -->
<p>{l10n.t("Creat new or open existing project")}.</p>

<div class="welcome-wrapper">
    <vscode-button on:click={sendCreateNewProject}>
        <span class="button-text">{l10n.t("Create new project")}</span>
        <!-- <span slot="start" class="codicon codicon-add" /> -->
    </vscode-button>
    <vscode-button
        on:click={() => {
            sendOpenProject("");
        }}
    >
        <span class="button-text">{l10n.t("Open project")}</span>
        <!-- <span slot="start" class="codicon codicon-folder-opened" /> -->
    </vscode-button>
</div>

{#key recentProjectInfo}
    {#if recentProjectInfo.length}
        <p>{l10n.t("Recent")}:</p>
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
        width: fit-content;
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

    p {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    vscode-button {
        display: flex;
        justify-content: center;
        margin-top: 0.5rem;
        /* max-width: max-content; */
        /* width: fit-content; */
        width: 100%;
    }

    vscode-button::part(content) {
        min-width: 0;
    }

    vscode-button::part(control) {
        overflow: hidden;
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
