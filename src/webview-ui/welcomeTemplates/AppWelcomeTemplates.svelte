<script lang="ts">
    import * as l10n from "@vscode/l10n";
    import { provideVSCodeDesignSystem, allComponents } from "@vscode/webview-ui-toolkit";
    provideVSCodeDesignSystem().register(allComponents);

    import { MessageHandler } from "../common/MessageHandler";
    import type { MessageHandlerData } from "../common/MessageHandler";
    import { RequestTarget, RequestCommand, SelectionType, AppState, ErrorType } from "../../types";
    import type { Selection, AppError } from "src/types";

    import { logger, logDump } from "../logger";
    const print = logger("AppWelcomeTemplates.svelte");
    import { draggable } from "../actions/draggable";
    import Loading from "../components/Loading.svelte";

    import { templatesData } from "../../../res/templates.js";
    import TemplateCard from "./TemplateCard.svelte";
    import { writable } from "svelte/store";
    import { flip } from "svelte/animate";
    import { slide } from "svelte/transition";

    const origin = RequestTarget.welcomeTemplates;
    const messageHandler = new MessageHandler(handleMessageApp, origin);
    let appState = AppState.loading;
    let tabInfo = writable(templatesData.map((el) => false));

    async function handleMessageApp(data: MessageHandlerData<any>) {
        print("recived ", data);
        const { payload, command } = data;
        switch (command) {
            case RequestCommand.updateAppState:
                processAppState(payload);
                break;

            // case RequestCommand.getLogs:
            //     returnLogs(data);
            //     break;

            // case RequestCommand.updateTabInfo:
            //     processTabInfo(payload);
            //     break;

            default:
                break;
        }
    }

    function processAppState(payload) {
        appState = payload.state;
        print("state", payload);
    }
    async function getAppState() {
        const { payload } = await messageHandler.request({
            target: RequestTarget.extension,
            command: RequestCommand.getAppState,
        });
        processAppState(payload);
    }

    function sendCreateNewProject(url) {
        messageHandler.send({
            command: RequestCommand.createProject,
            target: RequestTarget.extension,
            payload: url,
        });
    }

    async function getLocatization() {
        const { payload } = await messageHandler.request({
            target: RequestTarget.extension,
            command: RequestCommand.getLocalization,
        });

        if (payload) {
            l10n.config({
                contents: payload,
            });
        }
    }

    async function init() {
        await getLocatization();

        await getAppState();
        // if (appState === AppState.error) return;
        // getSettings();
    }

    init();
</script>

<div class="main-container">
    <h1 class="top-header">l{l10n.t("locale.welcomeTemplates.topHeader")}</h1>
    {#if appState === AppState.loading}
        <Loading dark={true} scale={2} />
    {/if}
    {#each templatesData as { name, children }, i}
        <vscode-divider class="divider" role="separator" />
        <div
            class="category-header"
            on:click={() => {
                if ($tabInfo[i]) {
                    $tabInfo[i] = false;
                    return;
                }

                $tabInfo = $tabInfo.map((tab) => false);

                $tabInfo[i] = true;
            }}
        >
            <i class="codicon codicon-chevron-{$tabInfo[i] ? 'down' : 'right'}" />

            <h4 class="category">
                {name}
            </h4>
        </div>
        {#if $tabInfo[i]}
            <div class="card-container" transition:slide>
                {#each children as data}
                    <TemplateCard {data} onSelect={sendCreateNewProject} />
                {/each}
            </div>
        {/if}
    {/each}
</div>

<style>
    .main-container {
        height: 100vh;
        width: 100vw;
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: start;
        align-items: start;
        margin: var(--global-margin);
    }
    .category-header {
        width: 100%;
        display: flex;
        justify-content: start;
        align-items: center;
        cursor: pointer;
    }
    .card-container {
        display: flex;
        width: 100%;
        justify-content: start;
        flex-wrap: wrap;
    }
    i {
        height: fit-content;
    }
    .category {
        margin: var(--global-margin);
    }
</style>
