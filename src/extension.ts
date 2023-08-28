// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below

import * as fs from "fs";
import * as vscode from "vscode";
import { EffectsViewProvider } from "./panels/EffectsViewProvider";
import { ProjectManagerViewProvider } from "./panels/ProjectManagerViewProvider";
import { PluginsViewProvider } from "./panels/PluginsViewProvider";
import { InspectorViewProvider } from "./panels/InspectorViewProvider";
import { AssetsManagerViewProvider } from "./panels/AssetsManagerViewProvider";
import { RecentProjects } from "./RecentProjectInfo";
// import type { RecentProjectInfo } from "./RecentProjectInfo"
import { MessageHandler, MessageHandlerData } from "./MessageHandler";

import { HotReload } from "./HotReload";
// const { exec } = require('node:child_process');
import * as path from "path";
import { logger } from "./Logger";
import type { LogEntry } from "./Logger";
const print = (...args: any) => logger.log(__filename, ...args);

import { assetWatcher } from "./AssetWatcher";
import { userSettings } from "./UserSettings";
import { jsonPrettyArray } from "./utils/jsonStringify";
import {
    RequestCommand,
    RequestTarget,
    Selection,
    SelectionType,
    ViewIds,
    AppState,
    ErrorType,
} from "./types";
import type { AppError } from "./types";
import { MaskConfig } from "./MaskConfig";
import { BaseWebviewProvider } from "./panels/BaseWebviewProvider";
import { delayPromise } from "./utils/delayPromise";
import { copyRecursiveSync } from "./utils/copyFilesRecursive";

export async function activate(context: vscode.ExtensionContext) {
    let appState = AppState.loading,
        error = null;

    const recentProjectInfo = new RecentProjects(context);

    logger.setMode(context.extensionMode);
    await userSettings.init(context.extensionUri);

    const messageHandler = new MessageHandler();
    const maskConfig = new MaskConfig();

    maskConfig.on("error", onError);
    // let selection: Selection = { type: SelectionType.empty };

    const webviewsBuildPath = path.join("out", "panels", "webview-build");
    const webviewProviders: Array<BaseWebviewProvider> = [];

    const effectsBuildPath = path.join(webviewsBuildPath, "effects");
    const effects = new EffectsViewProvider(context.extensionUri, effectsBuildPath);
    webviewProviders.push(effects);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider(effects.viewId, effects));

    const pluginsBuildPath = path.join(webviewsBuildPath, "plugins");
    const plugins = new PluginsViewProvider(context.extensionUri, pluginsBuildPath);
    webviewProviders.push(plugins);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider(plugins.viewId, plugins));

    const projectManagerBuildPath = path.join(webviewsBuildPath, "projectManager");
    const projectManager = new ProjectManagerViewProvider(
        context.extensionUri,
        projectManagerBuildPath
    );
    webviewProviders.push(projectManager);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(projectManager.viewId, projectManager)
    );

    const assetsManagerBuildPath = path.join(webviewsBuildPath, "assetsManager");
    const assetsManager = new AssetsManagerViewProvider(
        context.extensionUri,
        assetsManagerBuildPath
    );
    webviewProviders.push(assetsManager);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(assetsManager.viewId, assetsManager)
    );

    const inspectorBuildPath = path.join(webviewsBuildPath, "inspector");
    const inspector = new InspectorViewProvider(context.extensionUri, inspectorBuildPath);
    webviewProviders.push(inspector);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(inspector.viewId, inspector)
    );

    // ? eventually will make a class
    // ? multiple errors could occur
    // ? multiple time  like removed and added config
    async function onError(newError: AppError) {
        appState = AppState.error;

        await vscode.commands.executeCommand("setContext", "vkmask.appState", appState);

        error = newError;

        switch (newError.type) {
            case ErrorType.configMissing:
                onConfigMissing();
                break;

            default:
                break;
        }
    }

    async function onConfigMissing() {
        print("config missing error handling");

        // ! this works actually
        // await vscode.commands.executeCommand(
        //     `workbench.view.extension.vkmask_primary_bar.resetViewContainerLocation`
        // );
        // await vscode.commands.executeCommand(`vkmask.projectManager.resetViewLocation`);

        webviewProviders.forEach(async (provider) => {
            await vscode.commands.executeCommand(provider.viewId + ".focus");
            if (provider.viewId !== ViewIds.projectManager)
                await vscode.commands.executeCommand(provider.viewId + ".removeView");
        });
    }

    function showConfigError(error: AppError) {
        switch (error.type) {
            case ErrorType.configZod:
                const { path } = error.value;
                const pointer = maskConfig.maskLinePointers[path];
                print("error pointer", pointer, error);
                print(maskConfig.maskLinePointers);
                maskConfig.showConfigAtPointer(pointer);
                break;

            case ErrorType.configSyntax:
                break;

            default:
                break;
        }
    }

    // ! selection should go outside of maskConfig.
    function onSelection(selection: Selection) {
        const { type, id } = selection as Selection;

        // deal with config file
        switch (type) {
            case SelectionType.effect:
                maskConfig.selection = selection;
                maskConfig.showEffect(id);
                break;

            case SelectionType.plugin:
                maskConfig.selection = selection;
                maskConfig.showPlugin(id);
                break;

            case SelectionType.maskSettings:
                maskConfig.selection = selection;
                break;

            case SelectionType.empty:
                maskConfig.clearSelection();
                break;

            default:
                break;
        }
    }

    function onSendAppState(target = RequestTarget.all) {
        messageHandler.send({
            target,
            command: RequestCommand.updateAppState,
            payload: appState,
        });
    }

    /* 
    ┌─────────────────────────────────────────────────────────────────────────────┐
    │     communications                                                          │
    └─────────────────────────────────────────────────────────────────────────────┘
    */

    webviewProviders.forEach((provider) => {
        provider.onResolveWebviewView = () => {
            context.subscriptions.push(
                messageHandler.bindViewMessageHandler(provider.webview, provider.viewId)
            );

            assetWatcher.on("assetsChanged", async () => {
                messageHandler.send({
                    command: RequestCommand.updateAssets,
                    payload: await assetWatcher.getAssets(),
                    target: provider.viewId,
                });
            });
        };
    });

    messageHandler.onExtensionMessage = async (data) => {
        print("extension receives data", data);
        const { command, target, payload, requestId, origin } = data;

        // simple requests
        switch (command) {
            case RequestCommand.getAssets:
                // reply with assets
                messageHandler.send({
                    ...data,
                    payload: await assetWatcher.getAssets(),
                    target: origin,
                });
                break;

            case RequestCommand.getSettings:
                // reply with settings
                messageHandler.send({
                    ...data,
                    payload: userSettings.getSettings(),
                    target: origin,
                });
                break;

            case RequestCommand.getMaskSettings:
                // reply with settings
                messageHandler.send({
                    ...data,
                    payload: await maskConfig.getMaskSettings(),
                    target: origin,
                });
                break;

            case RequestCommand.getEffects:
                // reply with effects
                messageHandler.send({
                    ...data,
                    payload: await maskConfig.getEffects(),
                    target: origin,
                });
                break;

            case RequestCommand.getPlugins:
                // reply with effects
                messageHandler.send({
                    ...data,
                    payload: await maskConfig.getPlugins(),
                    target: origin,
                });
                break;

            case RequestCommand.getSelection:
                // reply with effects
                messageHandler.send({
                    ...data,
                    payload: maskConfig.selection,
                    target: origin,
                });
                break;

            case RequestCommand.getAppState:
                // reply with effects
                messageHandler.send({
                    ...data,
                    target: origin,
                    payload: {
                        state: appState,
                        error,
                    },
                });
                break;

            case RequestCommand.getRecentProjectInfo:
                // reply with effects
                messageHandler.send({
                    ...data,
                    target: origin,
                    payload: await recentProjectInfo.getInfo(),
                });
                break;

            default:
                break;
        }

        switch (command) {
            case RequestCommand.updateEffects:
                maskConfig.updateEffects(payload);
                break;
            case RequestCommand.updatePlugins:
                maskConfig.updatePlugins(payload);
                break;
            case RequestCommand.updateMaskSettings:
                maskConfig.updateMaskSettings(payload);
                break;

            case RequestCommand.updateSelection:
                // maskConfig.
                onSelection(payload);
                // inform inspector
                break;

            case RequestCommand.showError:
                showConfigError(payload);
                break;

            case RequestCommand.openProject:
                openProject();
                break;

            case RequestCommand.createProject:
                createProject();
                break;

            default:
                break;
        }
    };

    maskConfig.onFileSave = async () => {
        // maskConfig.selection = {type : SelectionType.empty};
        // await maskConfig.clearSelection();

        print("sending effects on file save");
        const effects = await maskConfig.getEffects();
        messageHandler.send({
            target: RequestTarget.effects,
            command: RequestCommand.updateEffects,
            payload: effects,
        });

        messageHandler.send({
            target: RequestTarget.inspector,
            command: RequestCommand.updateEffects,
            payload: effects,
        });

        print("sending plugins on file save");
        const plugins = await maskConfig.getPlugins();

        messageHandler.send({
            target: RequestTarget.plugins,
            command: RequestCommand.updatePlugins,
            payload: plugins,
        });

        messageHandler.send({
            target: RequestTarget.inspector,
            command: RequestCommand.updatePlugins,
            payload: plugins,
        });

        print("sending maskSettings");

        const maskSttings = await maskConfig.getMaskSettings();
        messageHandler.send({
            target: RequestTarget.projectManager,
            command: RequestCommand.updateMaskSettings,
            payload: maskSttings,
        });
    };

    function openProject() {
        // ? need to check if new folder have mask.json
        const options: vscode.OpenDialogOptions = {
            canSelectMany: false,
            openLabel: "Open",
            canSelectFiles: false,
            canSelectFolders: true,
            title: "Open existing vkmask project",
        };

        vscode.window.showOpenDialog(options).then(async (fileUri) => {
            if (fileUri && fileUri[0]) {
                print("Selected file: " + fileUri[0].fsPath);
                recentProjectInfo.addInfo(fileUri[0].fsPath);
                await vscode.commands.executeCommand(`vscode.openFolder`, fileUri[0]);
            }
        });
    }

    function createProject() {
        // ! need to check if project already there !!!

        const options: vscode.SaveDialogOptions = {
            saveLabel: "Create",
            title: "Create mew vkmask project",
        };

        vscode.window.showSaveDialog(options).then(async (fileUri) => {
            if (fileUri) {
                print("new project folder", fileUri.fsPath);
                const newProjectDir = fileUri;
                const sampleProjectDir = vscode.Uri.joinPath(
                    this._extensionUri,
                    "res",
                    "empty-project"
                );
                // print(sampleProjectDir)

                copyRecursiveSync(sampleProjectDir.fsPath, newProjectDir.fsPath);
                recentProjectInfo.addInfo(newProjectDir.fsPath);
                vscode.commands.executeCommand(`vscode.openFolder`, newProjectDir);
            }
        });
    }
    // function updateAppState() {
    //     const parseResult = maskConfig.parseConfig();

    //     if (maskConfig.pathMaskJSON === undefined) {
    //         print("mask.json not found, show welcome");
    //         sendShowWelcome();
    //     } else {
    //         if (parseResult.success) sendEffects();
    //         else {
    //             sendError(parseResult.message);
    //         }
    //     }
    // }

    // const createBuiltinAssets = false;
    // if (createBuiltinAssets) {
    //     assetWatcher.on("assetsChanged", (e) => {
    //         //todo : fetch buildins from github
    //         // const dir = vscode.workspace.workspaceFolders[0].uri.fsPath;
    //         const dir = context.extensionUri.fsPath;

    //         const jsonDump = jsonPrettyArray(e, "\t");
    //         fs.writeFileSync(dir + "/res/build-in-assets.json", jsonDump, { encoding: 'utf-8' })
    //     });
    // } else {
    //     assetWatcher.getBuiltinAssets(context.extensionUri)
    // }

    context.subscriptions.push(
        vscode.commands.registerCommand("vkmask.dumpLogs", async () => {
            const dumpPath = maskConfig.currentConfigDir;
            if (dumpPath === undefined) {
                vscode.window.showErrorMessage("Seems like no folder opened to save logs.");
                return;
            }

            const responses = (await Promise.all(
                Object.values(ViewIds).map((viewId) =>
                    messageHandler.request({
                        target: viewId,
                        command: RequestCommand.getLogs,
                    })
                )
            )) as MessageHandlerData<LogEntry[]>[];

            const webviewLogs = responses.map((resp) => resp.payload);
            logger.dumpLogs(webviewLogs, dumpPath);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("vkmask.openSettings", async () => {
            vscode.commands.executeCommand("workbench.action.openSettings", "vkmask");

            // vscode.commands.executeCommand("workbench.action.openSettingsJson", {
            //     revealSetting: { key: "editor.renderWhitespace" },
            // });
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("vkmask.execute_command_by_id", async () => {
            // ??? add parameters ???
            const commandID = await vscode.window.showInputBox({
                placeHolder: "Enter command",
                prompt: "Paste or type any command ID",
                value: "",
            });

            if (commandID === "" || commandID === undefined) {
                vscode.window.showErrorMessage("Empty/Undefined command");
                return;
            }

            const result = (await vscode.commands.executeCommand(commandID)) as string;

            if (result) vscode.window.showErrorMessage(result);
            print(result);
            // vscode.commands.executeCommand("workbench.action.openSettingsJson", {
            //     revealSetting: { key: "editor.renderWhitespace" },
            // });
        })
    );

    //
    // // "workbench.action.movePanelToSecondarySideBar",
    // // workbench.action.openView

    // // ! does this thing still required???
    // const hotReloader = new HotReload(context.extensionUri);
    // hotReloader.copyFilesToMask();

    if (context.extensionMode === vscode.ExtensionMode.Development) {
        let watchLock = false;
        let watchTimeout: NodeJS.Timeout;

        const webviewBuildDir = path.join(context.extensionPath, "out", "panels", "webview-build");
        const webviewWatcher = vscode.workspace.createFileSystemWatcher(
            new vscode.RelativePattern(webviewBuildDir, "**")
        );

        context.subscriptions.push(
            webviewWatcher.onDidChange((fileUri) => {
                if (watchLock) {
                    return;
                }

                print("\nThe file " + fileUri.fsPath + " was modified!");

                if (watchTimeout) clearTimeout(watchTimeout);
                watchTimeout = setTimeout(() => {
                    watchLock = false;
                }, 1000);
                watchLock = true;

                vscode.commands
                    .executeCommand("workbench.action.webview.reloadWebviewAction")
                    .then(() => {
                        // sidebar.updateAppState();
                        // assetWatcher.searchAssets();
                        // userSettings.emitChangeEvent();
                    });
            })
        );
    }

    /* 
    ┌─────────────────────────────────────────────────────────────────────────────┐
    │     extension lifecycle                                                     │
    └─────────────────────────────────────────────────────────────────────────────┘
    */
    context.subscriptions.push(
        vscode.commands.registerCommand("vkmask.resetSidebar", async () => {
            webviewProviders.forEach((provider) => {
                vscode.commands.executeCommand(provider.viewId + ".resetViewLocation");
            });
        })
    );
    // // show sidebar
    // // await vscode.commands.executeCommand("workbench.view.extension.vkmask_primary_bar.resetViewContainerLocation")
    // // await vscode.commands.executeCommand(`workbench.view.extension.vkmask_primary_bar`)
    // // vscode.commands.executeCommand(`workbench.action.focusAuxiliaryBar`)
    // // vscode.commands.executeCommand(`vkmask_primary_bar.focus`)
    // workbench.action.focusAuxiliaryBar

    // ! additional context keys
    // vkmask.projectManager.active
    // vkmask.projectManager.canMove
    // vkmask.projectManager.defaultViewLocation
    // vkmask.projectManager.visible
    // viewContainer.workbench.view.extension.vkmask_primary_bar.enabled

    // // !!! erorr handle !!!
    // ;

    // await delayPromise(3000).promise;

    // will ensure good initialize
    if (maskConfig.updateConfigPath()) {
        recentProjectInfo.addInfo(maskConfig.currentConfigDir);

        print("showing all webivews/config/closing tabs");
        // on init need to show mask.json only! so there is no misatakes working in a wrong file
        const tabsToClose = vscode.window.tabGroups.all.map((tg) => tg.tabs).flat();
        // ? maybe close only files that are in old project, could be usefull for opened api reference
        await vscode.window.tabGroups.close(tabsToClose);
        maskConfig.showConfig();

        // this will ensure all the componenets will show up no matter if they closed before.
        webviewProviders.forEach((provider) => {
            vscode.commands.executeCommand(provider.viewId + ".focus");
        });
        // await vscode.commands.executeCommand(`vkmask.inspector.focus`);
        // await vscode.commands.executeCommand(`vkmask.assets_manager.focus`);
        // await vscode.commands.executeCommand(`vkmask.assets_manager.removeView`);  // hides a view
        if (maskConfig.parseConfig()) {
            appState = AppState.running;
            onSendAppState();
        }
    } else {
        appState = AppState.welcome;
        onSendAppState();
        print("not able to find config");
    }
    // // vscode.commands.executeCommand('workbench.action.moveFocusedView');
    // // vscode.commands.executeCommand('vkmask.sidepanel.focus').then(() => {
}

// This method is called when your extension is deactivated
export function deactivate() {}
