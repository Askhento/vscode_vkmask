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
        "locale.months.january",
        "locale.months.february",
        "locale.months.march",
        "locale.months.april",
        "locale.months.may",
        "locale.months.june",
        "locale.months.july",
        "locale.months.august",
        "locale.months.september",
        "locale.months.october",
        "locale.months.november",
        "locale.months.december",
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

<div class="welcome-wrapper">
    <p>{l10n.t("locale.welcomeScreen.newProjectHint")}.</p>
    <vscode-button on:click={sendCreateNewProject}>
        <span class="button-text">{l10n.t("locale.welcomeScreen.buttonCreate.label")}</span>
        <!-- <span slot="start" class="codicon codicon-add" /> -->
    </vscode-button>
    <vscode-button
        on:click={() => {
            sendOpenProject("");
        }}
    >
        <span class="button-text">{l10n.t("locale.welcomeScreen.buttonOpen.label")}</span>
        <!-- <span slot="start" class="codicon codicon-folder-opened" /> -->
    </vscode-button>

    {#key recentProjectInfo}
        {#if recentProjectInfo.length}
            <p>{l10n.t("locale.welcomeScreen.recentHeader")}:</p>
            {#each recentProjectInfo as info}
                <div class="recent-projects-wrapper" title={info.path}>
                    <vscode-link
                        on:click={() => {
                            sendOpenProject(info.path);
                        }}><div class="recent-link">{info.name}</div></vscode-link
                    >

                    <span class="recent-path">{info.path}</span>
                    <span class="recent-date">{formatDate(new Date(info.dateModified))}</span>
                </div>
            {/each}
        {/if}
    {/key}
</div>

<style>
    * {
        box-sizing: border-box;
    }

    .welcome-wrapper {
        width: 100%;
        /* margin: unset; */
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        padding-left: var(--global-body-padding-left);
    }
    .recent-projects-wrapper {
        display: flex;
        justify-content: start;
        width: 100%;
    }

    vscode-link {
        width: fit-content;

        margin-right: 0.5rem;
    }

    vscode-link::part(content) {
        width: 100%;
        display: inline-block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .recent-link {
        /* width: 5rem; */
        overflow: visible;
        text-overflow: ellipsis;
        white-space: nowrap;
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
        /* overflow: hidden; */
        /* text-overflow: ellipsis; */
    }

    p {
        width: 100%;
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
