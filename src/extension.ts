// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below

import * as fs from "fs";
import * as vscode from "vscode";
import { EffectsViewProvider } from "./panels/EffectsViewProvider";
import { ProjectManagerViewProvider } from "./panels/ProjectManagerViewProvider";
import { PluginsViewProvider } from "./panels/PluginsViewProvider";
import { ParametersViewProvider } from "./panels/ParametersViewProvider";
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

import { Assets } from "./Assets";
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
import { effectNames, pluginNames } from "./ztypes";
import { MaskConfig } from "./MaskConfig";
import { BaseWebviewProvider } from "./panels/BaseWebviewProvider";
import { delayPromise } from "./utils/delayPromise";
import { copyRecursiveSync } from "./utils/copyFilesRecursive";

// import { selection } from "./global";

export async function activate(context: vscode.ExtensionContext) {
    // const localizedString = vscode.l10n.t(
    //     "Your extension got activated with the {0} language!",
    //     vscode.env.language
    // );

    // vscode.window.showInformationMessage(localizedString);
    // selection = { type: SelectionType.empty };
    globalThis.selection = { type: SelectionType.empty };

    let appState = AppState.loading,
        error = null;
    logger.setMode(context.extensionMode);

    Assets.attach(context);

    const createBuiltinAssets = false;
    // const testMaskResourceAbsDir = "/Applications/test.mask3_macos.app/Contents/Resources/asset";
    if (createBuiltinAssets) {
        print("writing down to build-in-assets.json");
        //todo : fetch buildins from github
        // const dir = vscode.workspace.workspaceFolders[0].uri.fsPath;
        const dir = context.extensionUri.fsPath;
        const assetsToSave = (await Assets.getAssets(false)).map((ass) => {
            ass.projectFile = false;
            return ass;
        });
        const jsonDump = jsonPrettyArray(assetsToSave, "\t");
        fs.writeFileSync(dir + "/res/build-in-assets.json", jsonDump, { encoding: "utf-8" });
    } else {
        await Assets.searchBuiltinAssets(context.extensionUri);
    }

    const recentProjectInfo = new RecentProjects(context);

    const messageHandler = new MessageHandler();
    const maskConfig = new MaskConfig();

    await userSettings.init(context.extensionUri);
    userSettings.on("configChanged", (currentConfig) => {
        print("new config", currentConfig);
        messageHandler.send({
            target: RequestTarget.all,
            command: RequestCommand.updateSettings,
            payload: currentConfig,
        });
    });

    maskConfig.on("error", onError);

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

    const parametersBuildPath = path.join(webviewsBuildPath, "parameters");
    const parameters = new ParametersViewProvider(context.extensionUri, parametersBuildPath);

    // setTimeout(() => {
    //     print(parameters._view);
    //     parameters._view.title = "test title";
    //     parameters._view.description = "wzp desdctiption";
    // }, 3000);

    webviewProviders.push(parameters);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(parameters.viewId, parameters)
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
    function onSelection(newSelection: Selection) {
        const { type, id } = newSelection as Selection;

        // deal with config file
        switch (type) {
            case SelectionType.effect:
                globalThis.selection = newSelection;
                maskConfig.showEffect(id);
                break;

            case SelectionType.plugin:
                globalThis.selection = newSelection;
                maskConfig.showPlugin(id);
                break;

            case SelectionType.maskSettings:
                globalThis.selection = newSelection;
                break;

            case SelectionType.asset:
                globalThis.selection = newSelection;
                break;

            case SelectionType.empty:
                maskConfig.clearSelection();
                break;

            default:
                break;
        }

        if (type !== SelectionType.empty) {
            vscode.commands.executeCommand(parameters.viewId + ".focus");
        }
    }

    function onSendAppState(target = RequestTarget.all) {
        messageHandler.send({
            target,
            command: RequestCommand.updateAppState,
            payload: {
                state: appState,
                error,
            },
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

            Assets.on("assetsChanged", async () => {
                const buildins = (await userSettings.getSettings()["vkmask.use-builtins"]
                    .value) as boolean;

                messageHandler.send({
                    command: RequestCommand.updateAssets,
                    payload: await Assets.getAssets(true),
                    target: provider.viewId,
                });
            });
        };
    });

    messageHandler.onExtensionMessage = async (data) => {
        print("extension receives data", data);
        const { command, target, payload, requestId, origin } = data;

        switch (command) {
            // simple requests
            case RequestCommand.getAssets:
                // reply with assets
                messageHandler.send({
                    ...data,
                    payload: await Assets.getAssets(true),
                    target: origin,
                });
                break;

            case RequestCommand.readAsset:
                // reply with assets
                messageHandler.send({
                    ...data,
                    payload: await Assets.readAsset(payload.path, payload.assetType),
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
                    payload: globalThis.selection,
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

            // more complex  stuff
            case RequestCommand.writeAsset:
                Assets.writeAsset(payload.path, payload.data, payload.assetType);
                break;

            case RequestCommand.renameAsset:
                const newPath = await Assets.renameFile(payload.path, payload.newName);
                // !! check error
                const newSelection = {
                    ...globalThis.selection,
                    path: newPath,
                    baseName: payload.newName,
                };
                onSelection(newSelection);
                sendSelection();
                break;

            case RequestCommand.updateEffects:
                maskConfig.updateEffects(payload);
                sendEffects(
                    [RequestTarget.parameters, RequestTarget.effects].filter((t) => t !== origin)
                );
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
                // inform parameters
                break;

            case RequestCommand.showError:
                showConfigError(payload);
                break;

            case RequestCommand.openProject:
                openProject(payload);
                break;

            case RequestCommand.createProject:
                createProject();
                break;

            case RequestCommand.getUploadedAsset:
                messageHandler.send({
                    ...data,
                    target: origin,
                    payload: await Assets.uploadAssets(payload.extensions, payload.to),
                });
                break;
            case RequestCommand.getCreatedAssets:
                messageHandler.send({
                    ...data,
                    target: origin,
                    payload: await Assets.copyAssets(payload.from, payload.to),
                });
                break;

            case RequestCommand.removeAsset:
                messageHandler.send({
                    ...data,
                    target: origin,
                    payload: await Assets.removeAsset(payload),
                });
                break;

            case RequestCommand.getLocalization:
                // Check if a l10n path is configured, if not, we will use the default language
                if (vscode.l10n.uri?.fsPath) {
                    const bundle = fs.readFileSync(vscode.l10n.uri?.fsPath, { encoding: "utf-8" });

                    messageHandler.send({
                        ...data,
                        target: origin,
                        payload: bundle,
                    });
                    // panel.webview.postMessage({
                    //     command,
                    //     requestId, // The requestId is used to identify the response
                    //     payload: fileContent,
                    // } as MessageHandlerData<string>);
                } else {
                    messageHandler.send({
                        ...data,
                        target: origin,
                        payload: "",
                    });

                    //     // No localization file means we should use the default language
                    //     panel.webview.postMessage({
                    //     command,
                    //     requestId, // The requestId is used to identify the response
                    //     payload: undefined,
                    //     } as MessageHandlerData<undefined>);
                }

                break;

            default:
                break;
        }
    };

    maskConfig.onFileSave = async () => {
        // maskConfig.selection = {type : SelectionType.empty};
        // await maskConfig.clearSelection();
        print("on file save");
        sendEffects([RequestTarget.effects, RequestTarget.parameters]);
        sendPlugins([RequestTarget.plugins, RequestTarget.parameters]);
        sendMaskSettings(RequestTarget.projectManager);
    };

    async function sendMaskSettings(target) {
        messageHandler.send({
            target,
            command: RequestCommand.updateMaskSettings,
            payload: await maskConfig.getMaskSettings(),
        });
    }

    async function sendPlugins(target) {
        messageHandler.send({
            target,
            command: RequestCommand.updatePlugins,
            payload: await maskConfig.getPlugins(),
        });
    }

    async function sendEffects(target) {
        messageHandler.send({
            target,
            command: RequestCommand.updateEffects,
            payload: await maskConfig.getEffects(),
        });
    }

    function sendSelection(target = RequestTarget.all) {
        messageHandler.send({
            command: RequestCommand.updateSelection,
            origin: RequestTarget.extension,
            payload: globalThis.selection,
            target,
        });
    }

    async function openProject(folder: string) {
        if (folder) {
            // notes : https://www.eliostruyf.com/opening-folders-visual-studio-code-extension/
            print("new folder", folder);
            const maskJsonFile = path.join(folder, "mask.json");
            if (!fs.existsSync(maskJsonFile)) {
                vscode.window.showErrorMessage(`Project does not seems to exist: \n${folder}`);
                messageHandler.send({
                    command: RequestCommand.getRecentProjectInfo,
                    origin: RequestTarget.extension,
                    target: RequestTarget.projectManager,
                    payload: await recentProjectInfo.getInfo(),
                });
            }
            const folderUri = vscode.Uri.parse(folder);
            vscode.commands.executeCommand(`vscode.openFolder`, folderUri);
            return;
        }
        // ? need to check if new folder have mask.json
        const options: vscode.OpenDialogOptions = {
            canSelectMany: false,
            openLabel: "Open",
            canSelectFiles: true,
            canSelectFolders: false,
            filters: {
                "mask.json config": ["mask.json"],
            },
            title: "Select mask.json file",
        };

        const oldState = appState;
        appState = AppState.loading;
        onSendAppState();

        vscode.window.showOpenDialog(options).then(async (fileUri) => {
            if (fileUri && fileUri[0]) {
                print("Selected open folder: " + fileUri[0].fsPath);
                const maskJsonFile = fileUri[0].fsPath;
                const folder = path.dirname(maskJsonFile);
                recentProjectInfo.addInfo(folder); // !!! maybe useless!!!!
                const folderUri = vscode.Uri.parse(folder);
                await vscode.commands.executeCommand(`vscode.openFolder`, folderUri);
            } else {
                appState = oldState;
                onSendAppState();
            }
        });
    }

    function createProject() {
        // ! need to check if project already there !!!

        const options: vscode.SaveDialogOptions = {
            saveLabel: "Create",
            title: "Create mew vkmask project",
        };

        const oldState = appState;
        appState = AppState.loading;
        onSendAppState();

        vscode.window.showSaveDialog(options).then(async (fileUri) => {
            if (fileUri) {
                print("new project folder", fileUri.fsPath);
                const newProjectDir = fileUri;
                const sampleProjectDir = vscode.Uri.joinPath(
                    context.extensionUri,
                    "res",
                    "empty-project"
                );
                // print(sampleProjectDir)

                copyRecursiveSync(sampleProjectDir.fsPath, newProjectDir.fsPath);
                recentProjectInfo.addInfo(newProjectDir.fsPath);
                vscode.commands.executeCommand(`vscode.openFolder`, newProjectDir);
            } else {
                appState = oldState;
                onSendAppState();
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

    effectNames.forEach((name) => {
        context.subscriptions.push(
            vscode.commands.registerCommand(`vkmask.add_effect.${name}`, async () => {
                await maskConfig.addEffect(name);
                maskConfig.onFileSave();
                sendSelection();
            })
        );
    });

    pluginNames.forEach((name) => {
        context.subscriptions.push(
            vscode.commands.registerCommand(`vkmask.add_plugin.${name}`, async () => {
                await maskConfig.addPlugin(name);
                maskConfig.onFileSave();
                sendSelection();
            })
        );
    });

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

            if (result) vscode.window.showInformationMessage(result);
            print(result);
            // vscode.commands.executeCommand("workbench.action.openSettingsJson", {
            //     revealSetting: { key: "editor.renderWhitespace" },
            // });
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("vkmask.jsEval", async () => {
            // ??? add parameters ???
            const code = await vscode.window.showInputBox({
                placeHolder: "Enter command",
                prompt: "Paste or type any js one liner",
                value: "",
            });

            if (code === "" || code === undefined) {
                vscode.window.showErrorMessage("Empty/Undefined input");
                return;
            }

            const result = eval(code);

            if (result) vscode.window.showInformationMessage(result);
            print(result);
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
                // print("\nThe file " + fileUri.fsPath + " was modified!");
                if (watchLock) {
                    return;
                }

                if (watchTimeout) clearTimeout(watchTimeout);
                watchTimeout = setTimeout(() => {
                    watchLock = false;
                    vscode.commands.executeCommand("workbench.action.webview.reloadWebviewAction");
                }, 1500);
                watchLock = true;

                // .then(() => {
                //     // sidebar.updateAppState();
                //     // assetWatcher.searchAssets();
                //     // userSettings.emitChangeEvent();
                // });
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
            // // !!! Hide unfinished views for now !
            // if (provider.viewId === ViewIds.assetsManager || provider.viewId === ViewIds.plugins) {
            //     vscode.commands.executeCommand(provider.viewId + ".removeView");
            //     return;
            // }

            vscode.commands.executeCommand(provider.viewId + ".focus");
        });
        // await vscode.commands.executeCommand(`vkmask.parameters.focus`);
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
