// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below

import * as fs from "fs";
import * as vscode from "vscode";
import * as l10n from "@vscode/l10n";
import { EffectsViewProvider } from "./panels/EffectsViewProvider";
import { ProjectManagerViewProvider } from "./panels/ProjectManagerViewProvider";
import { PluginsViewProvider } from "./panels/PluginsViewProvider";
import { ParametersViewProvider } from "./panels/ParametersViewProvider";
import { AssetsManagerViewProvider } from "./panels/AssetsManagerViewProvider";
import { RecentProjects } from "./RecentProjectInfo";
// import type { RecentProjectInfo } from "./RecentProjectInfo"
import { messageHandler, MessageHandlerData } from "./MessageHandler";

import { HotReload } from "./HotReload";
// const { exec } = require('node:child_process');

import { posix as path } from "path";

import { logger } from "./Logger";
import type { LogEntry } from "./Logger";
const print = (...args: any) => logger.log(__filename, ...args);

import { assetsWatcher } from "./AssetsWatcher";
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
import { BaseWebviewPanel } from "./panels/BaseWebviewPanel";
import { delayPromise } from "./utils/delayPromise";
import { copyRecursiveSync } from "./utils/copyFilesRecursive";
import { TabInfo } from "./TabInfo";
import slash from "slash";

// import { selection } from "./global";

export async function activate(context: vscode.ExtensionContext) {
    // const localizedString = vscode.l10n.t(
    //     "Your extension got activated with the {0} language!",
    //     vscode.env.language
    // );

    // vscode.window.showInformationMessage(localizedString);
    // selection = { type: SelectionType.empty };

    let l10nBundle: string | l10n.l10nJsonFormat;
    checkLocalizationBundle();
    globalThis.selection = { type: SelectionType.empty };

    let appState = AppState.loading,
        error = null;
    logger.setMode(context.extensionMode);

    assetsWatcher.attach(context.extensionPath);
    await assetsWatcher.getBuiltinAssets();

    const tabInfo = new TabInfo();

    const recentProjectInfo = new RecentProjects(context);

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
    let experimentalFeatures =
        context.extensionMode === vscode.ExtensionMode.Development ||
        userSettings.settings["vkmask.experimentalFeatures"].value;

    userSettings.on("configChanged:vkmask.experimentalFeatures", async (experimental) => {
        // print("settings changed", section);

        experimentalFeatures = experimental.value;
        const reloadActionLabel = l10n.t("locale.experimentalFeatures.buttonReload.label");
        const result = await vscode.window.showInformationMessage(
            l10n.t("locale.experimentalFeatures.infoMessage.header"),
            {
                modal: false,
            },
            reloadActionLabel
        );

        if (result === reloadActionLabel) {
            vscode.commands.executeCommand("workbench.action.reloadWindow");
        }
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

    webviewProviders.push(parameters);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(parameters.viewId, parameters)
    );

    const webviewPanels: Array<BaseWebviewPanel> = [];
    const liquifiedWarpEditorBuildPath = path.join(webviewsBuildPath, "liquifiedWarpEditor");
    const liquifiedWarpEditorPanel = new BaseWebviewPanel(
        context.extensionUri,
        liquifiedWarpEditorBuildPath,
        ViewIds.liquifiedWarpEditor
    );
    webviewPanels.push(liquifiedWarpEditorPanel);

    // liquifiedWarpEditorPanel.createOrShow();

    // webviewPanels.forEach((panel) => {
    //     // ? will cause an error for webview panel already disposed?
    //     context.subscriptions.push(
    //         messageHandler.bindViewMessageHandler(panel.webview, panel.viewId)
    //     );

    //     assetsWatcher.on("assetsChanged", async () => {
    //         const builtins = (await userSettings.getSettings()["vkmask.use-builtins"]
    //             .value) as boolean;

    //         messageHandler.send({
    //             command: RequestCommand.updateAssets,
    //             payload: await assetsWatcher.getAssets(true),
    //             target: panel.viewId,
    //         });
    //     });
    // });

    function checkLocalizationBundle() {
        l10nBundle = vscode.l10n.bundle;
        if (!vscode.l10n.uri) {
            // bundle = fs.readFileSync(vscode.l10n.uri?.fsPath, { encoding: "utf-8" });
            // default language
            l10nBundle = fs.readFileSync(
                path.join(context.extensionPath, "l10n", "bundle.l10n.json"),
                { encoding: "utf-8" }
            );
        }

        l10n.config({ contents: l10nBundle });
    }

    // ? eventually will make a class
    // ? multiple errors could occur
    // ? multiple time  like removed and added config
    async function onError(newError: AppError) {
        appState = AppState.error;

        await vscode.commands.executeCommand("setContext", "vkmask.appState", appState);

        error = newError.value;

        switch (newError.type) {
            case ErrorType.configMissing:
                onConfigMissing();
                break;

            case ErrorType.configZod:
                // now it is preprocess
                // onSendAppState();
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
    async function onSelection(newSelection: Selection) {
        const { type, id } = newSelection as Selection;

        // deal with config file
        switch (type) {
            case SelectionType.effect:
                globalThis.selection = newSelection;

                const isLiquify =
                    (await maskConfig.getEffects()).at(newSelection.id).name === "liquifiedwarp";
                if (isLiquify && experimentalFeatures) {
                    liquifiedWarpEditorPanel.createOrShow();
                } else {
                    maskConfig.showEffect(id);
                }
                break;

            case SelectionType.plugin:
                globalThis.selection = newSelection;
                maskConfig.showPlugin(id);
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

        // ? liquify
        if (type !== SelectionType.empty) {
            vscode.commands.executeCommand(parameters.viewId + ".focus");
        }
    }

    function onSendAppState(target = RequestTarget.all) {
        return messageHandler.send({
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

            assetsWatcher.on("assetsChanged", async () => {
                const builtins = (await userSettings.getSettings()["vkmask.use-builtins"]
                    .value) as boolean;

                messageHandler.send({
                    command: RequestCommand.updateAssets,
                    payload: await assetsWatcher.getAssets(true),
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
                messageHandler.send({
                    ...data,
                    payload: await assetsWatcher.getAssets(true),
                    target: origin,
                });
                break;

            case RequestCommand.readAsset:
                messageHandler.send({
                    ...data,
                    payload: await assetsWatcher.readAsset(payload.path, payload.assetType),
                    target: origin,
                });
                break;

            case RequestCommand.getSettings:
                messageHandler.send({
                    ...data,
                    payload: userSettings.getSettings(),
                    target: origin,
                });
                break;

            case RequestCommand.getMaskSettings:
                messageHandler.send({
                    ...data,
                    payload: await maskConfig.getMaskSettings(),
                    target: origin,
                });
                break;

            case RequestCommand.getEffects:
                messageHandler.send({
                    ...data,
                    payload: await maskConfig.getEffects(),
                    target: origin,
                });
                break;

            case RequestCommand.getPlugins:
                messageHandler.send({
                    ...data,
                    payload: await maskConfig.getPlugins(),
                    target: origin,
                });
                break;

            case RequestCommand.getSelection:
                messageHandler.send({
                    ...data,
                    payload: globalThis.selection,
                    target: origin,
                });
                break;

            case RequestCommand.getTabInfo:
                messageHandler.send({
                    ...data,
                    payload: tabInfo.get(payload.viewId),
                    target: origin,
                });
                break;

            case RequestCommand.getAppState:
                messageHandler.send({
                    ...data,
                    target: origin,
                    payload: {
                        state: appState,
                        error,
                    },
                });
                break;

            case RequestCommand.getExtensionURI: // !!!!!!!! alyarm !!!!!!
                messageHandler.send({
                    ...data,
                    target: origin,
                    payload: context.extensionPath,
                });
                break;

            case RequestCommand.getRecentProjectInfo:
                messageHandler.send({
                    ...data,
                    target: origin,
                    payload: await recentProjectInfo.getInfo(),
                });
                break;

            // more complex  stuff
            case RequestCommand.writeAsset:
                assetsWatcher.writeAsset(payload.path, payload.data, payload.assetType);
                break;

            case RequestCommand.renameAsset:
                const newPath = await assetsWatcher.renameFile(payload.path, payload.newName);
                // !! check error
                const newSelection = {
                    ...globalThis.selection,
                    path: newPath,
                    baseName: payload.newName,
                };
                onSelection(newSelection);
                sendSelection();
                break;

            case RequestCommand.updateTabInfo:
                tabInfo.set(payload.viewId, payload.value);
                print("new info ext", tabInfo.info);
                break;

            case RequestCommand.updateEffects:
                maskConfig.updateEffects(payload);
                sendEffects(
                    [
                        RequestTarget.parameters,
                        RequestTarget.effects,
                        RequestTarget.liquifiedWarpEditor,
                    ].filter((t) => t !== origin)
                ); // !!!!!!!!
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
                    payload: await assetsWatcher.uploadAssets(payload.extensions, payload.to),
                });
                break;
            case RequestCommand.getCreatedAssets:
                messageHandler.send({
                    ...data,
                    target: origin,
                    payload: await assetsWatcher.copyAssets(payload.from, payload.to),
                });
                break;

            case RequestCommand.removeAsset:
                messageHandler.send({
                    ...data,
                    target: origin,
                    payload: await assetsWatcher.removeAsset(payload),
                });
                break;

            case RequestCommand.getLocalization:
                // Check if a l10n path is configured, if not, we will use the default language
                // print("locale uri : ", vscode.l10n.uri?.fsPath, vscode.env.language);

                messageHandler.send({
                    ...data,
                    target: origin,
                    payload: l10nBundle,
                });

                break;

            default:
                break;
        }
    };

    maskConfig.onFileSave = async () => {
        // maskConfig.selection = {type : SelectionType.empty};
        // await maskConfig.clearSelection();
        print("on file save");
        await sendSelection();
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
        return messageHandler.send({
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

            //!!! need a slash
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
                "mask.json config": ["json"],
            },
            title: "Select mask.json file",
        };

        const oldState = appState;
        appState = AppState.loading;
        onSendAppState();

        vscode.window.showOpenDialog(options).then(async (fileUri) => {
            if (fileUri && fileUri[0]) {
                const maskJsonFile = slash(fileUri[0].fsPath);
                const folder = path.dirname(maskJsonFile);
                recentProjectInfo.addInfo(folder); // !!! maybe useless!!!!
                const folderUri = vscode.Uri.file(folder);
                print("Selected open folder: ", maskJsonFile, folder);
                appState = oldState;
                onSendAppState();
                // return;
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

    function onAddTabInfo(viewId: string, selectionType: string) {
        if (globalThis.selection == null || globalThis.selection.type !== selectionType) {
            return;
        }
        const info = tabInfo.get(viewId);
        const insertId = globalThis.selection.id + 1;
        Object.keys(info).forEach((tabKey) => {
            const [root, id, ...rest] = tabKey.split(".");
            if (+id < insertId) return;

            const newTabKey = [root, +id + 1, ...rest].join(".");
            info[newTabKey] = info[tabKey];
            delete info[tabKey]; // !!!! will require sorted keys
        });

        tabInfo.set(viewId, info);
        messageHandler.send({
            target: viewId,
            command: RequestCommand.updateTabInfo,
            payload: info,
        });
    }

    effectNames.forEach((name) => {
        context.subscriptions.push(
            vscode.commands.registerCommand(`vkmask.add_effect.${name}`, async () => {
                onAddTabInfo(parameters.viewId, SelectionType.effect);
                messageHandler.send({
                    target: effects.viewId,
                    command: RequestCommand.updateTabInfo,
                    payload: tabInfo.get(effects.viewId),
                });

                await maskConfig.addEffect(name);

                maskConfig.onFileSave();
                sendSelection();
            })
        );
    });

    pluginNames.forEach((name) => {
        context.subscriptions.push(
            vscode.commands.registerCommand(`vkmask.add_plugin.${name}`, async () => {
                // !!! plugins don't have tabs for now
                onAddTabInfo(parameters.viewId, SelectionType.plugin);
                messageHandler.send({
                    target: plugins.viewId,
                    command: RequestCommand.updateTabInfo,
                    payload: tabInfo.get(plugins.viewId),
                });
                await maskConfig.addPlugin(name);
                maskConfig.onFileSave();
                sendSelection();
            })
        );
    });

    const assetsDefaults = {
        material: {
            from: ["res", "defaultMaterial.json"],
            to: ["Materials", "defaultMaterial.json"],
            assetType: "json_material",
        },
    };

    Object.entries(assetsDefaults).forEach(([assetCategory, { from, to, assetType }]) => {
        context.subscriptions.push(
            vscode.commands.registerCommand(`vkmask.add_asset.${assetCategory}`, async () => {
                const relativePath = await assetsWatcher.copyAssets(from, to);
                globalThis.selection = {
                    type: SelectionType.asset,
                    assetType,
                    path: relativePath,
                    baseName: path.basename(relativePath), // !!! could be error
                };

                // print("asset selection", globalThis.selection);
                sendSelection();
            })
        );
    });

    context.subscriptions.push(
        vscode.commands.registerCommand("vkmask.dumpLogs", async () => {
            const dumpPath = maskConfig.currentConfigDir;
            const responses = (await Promise.all(
                webviewProviders.map((provider) => {
                    if (provider.disposed) return Promise.resolve([]);
                    print("will reqest " + provider.viewId);
                    return messageHandler.request({
                        target: provider.viewId,
                        command: RequestCommand.getLogs,
                    });
                })
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

    // context.subscriptions.push(
    //     vscode.commands.registerCommand("vkmask.jsEval", async () => {
    //         // ??? add parameters ???
    //         const code = await vscode.window.showInputBox({
    //             placeHolder: "Enter command",
    //             prompt: "Paste or type any js one liner",
    //             value: "",
    //         });

    //         if (code === "" || code === undefined) {
    //             vscode.window.showErrorMessage("Empty/Undefined input");
    //             return;
    //         }

    //         const result = eval(code);

    //         if (result) vscode.window.showInformationMessage(result);
    //         print(result);
    //     })
    // );

    //
    // // "workbench.action.movePanelToSecondarySideBar",
    // // workbench.action.openView

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
                // if (watchLock) {
                //     return;
                // }

                if (watchTimeout) clearTimeout(watchTimeout);
                watchTimeout = setTimeout(() => {
                    // watchLock = false;
                    vscode.commands.executeCommand("workbench.action.webview.reloadWebviewAction");
                    print("Reload due to file changed");
                }, 2000);
                // watchLock = true;
            })
        );

        vscode.commands.executeCommand("workbench.action.webview.openDeveloperTools");
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
        maskConfig.showConfig(true);

        //!!!
        // this will ensure all the componenets will show up no matter if they closed before.
        webviewProviders.forEach((provider) => {
            // keep theese collapsed
            // ?maybe only  for first  run?
            if (provider.viewId === ViewIds.assetsManager || provider.viewId === ViewIds.plugins) {
                // vscode.commands.executeCommand(provider.viewId + ".removeView");
                return;
            }

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
