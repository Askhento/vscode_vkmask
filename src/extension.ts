// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below

// const l10n = await import("@vscode/l10n")
import * as fs from "fs";
import * as vscode from "vscode";
import * as l10n from "@vscode/l10n";
// const l10n = require("@vscode/l10n");
import { EffectsViewProvider } from "./panels/EffectsViewProvider";
import { ProjectManagerViewProvider } from "./panels/ProjectManagerViewProvider";
import { PluginsViewProvider } from "./panels/PluginsViewProvider";
import { ParametersViewProvider } from "./panels/ParametersViewProvider";
import { AssetsManagerViewProvider } from "./panels/AssetsManagerViewProvider";
import { RecentProjects } from "./RecentProjectInfo";
// import type { RecentProjectInfo } from "./RecentProjectInfo"
import { archiveProject } from "./utils/archiveProject";
import { messageHandler, MessageHandlerData } from "./MessageHandler";

// const { exec } = require('node:child_process');

import { posix as path } from "path";

import { logger } from "./Logger";
import type { LogEntry } from "./Logger";
const print = (...args: any) => logger.log(__filename, ...args);

import { assetsWatcher } from "./AssetsWatcher";
import { userSettings } from "./UserSettings";
import { testMask } from "./openTestMask";
import { jsonPrettyArray } from "./utils/jsonStringify";
import {
    RequestCommand,
    RequestTarget,
    Selection,
    SelectionType,
    ViewIds,
    AppContext,
    AppState,
    ErrorType,
    AppContext,
} from "./types";
import type { AppError } from "./types";
import { AppContextManager } from "./AppContextManager";
import { effectNames, pluginNames } from "./ztypes";
import { MaskConfig } from "./MaskConfig";
import { BaseWebviewProvider } from "./panels/BaseWebviewProvider";
import { BaseWebviewPanel } from "./panels/BaseWebviewPanel";
import { delayPromise } from "./utils/delayPromise";
import { copyRecursiveSync } from "./utils/copyFilesRecursive";
import { TabInfo } from "./TabInfo";
import slash from "slash";
import { downloadTemplate } from "./utils/downloadTemplate";

// import { selection } from "./global";

export async function activate(context: vscode.ExtensionContext) {
    logger.setMode(context.extensionMode);
    const thisExtension = vscode.extensions.getExtension(context.extension.id);

    let l10nBundle: string | l10n.l10nJsonFormat;

    globalThis.selection = { type: SelectionType.empty }; // ? do need this

    const appContextManager = new AppContextManager(context, onSendAppContext); // ? inital state
    appContextManager.set({
        state: AppState.welcome,
    });

    // ! decide use Contructor or Singletone
    // ! decide use events or callback funcitons

    const tabInfo = new TabInfo();

    const recentProjectInfo = new RecentProjects(context);

    const maskConfig = new MaskConfig();

    userSettings.init(context.extensionUri);

    let experimentalFeatures =
        context.extensionMode === vscode.ExtensionMode.Development ||
        userSettings.settings["vk-mask-editor.experimentalFeatures"].value;

    updateLocalizationBundle();
    setupUserSettingsHooks(); // ? split

    maskConfig.on("error", onError);
    maskConfig.onFileSave = onMaskConfgiSave;

    // sidebar weviews

    const webviewsBuildPath = path.join("out", "webview-ui");
    const webviewProviders: Array<BaseWebviewProvider> = [];

    const effects = setupWebViewProvider("effects", EffectsViewProvider);
    const plugins = setupWebViewProvider("plugins", PluginsViewProvider);
    const projectManager = setupWebViewProvider("projectManager", ProjectManagerViewProvider);
    const assetsManager = setupWebViewProvider("assetsManager", AssetsManagerViewProvider);
    const parameters = setupWebViewProvider("parameters", ParametersViewProvider);

    // panels

    const webviewPanels: Array<BaseWebviewPanel> = [];

    const liquifiedWarpEditorPanel = setupWebViewPanel(
        "liquifiedWarpEditor",
        ViewIds.liquifiedWarpEditor,
        l10n.t("locale.panels.liquifiedWarpEditor.title")
    );
    const welcomeTemplatesPanel = setupWebViewPanel(
        "welcomeTemplates",
        ViewIds.welcomeTemplates,
        l10n.t("locale.panels.welcomeTemplates.title")
    );

    setupWebviewProviderMessaging();
    setupExtensionMessaging();

    setupAddEffectActions();
    setupAddPluginActions();
    setupAddAssetActions();
    setupLogDumpAction();
    setupOpenSettingsActions();
    setupArchiveProjectAction();
    setupOpenTestMaskActions();
    setupRunCommandByIdAction();
    setupResetViewsAction();

    runInitialDataProcess(); // !what a mess

    showPreReleaseInfo();
    setupDevHotReaload();

    // some funcs !

    function showPreReleaseInfo() {
        const [major, minor, patch] = thisExtension.packageJSON.version.split(".");
        if (minor % 2 !== 0) vscode.window.showInformationMessage("Running pre-release");
    }

    function setupUserSettingsHooks() {
        userSettings.on("configChanged", (currentConfig) => {
            // print("new config", currentConfig);
            messageHandler.send({
                target: RequestTarget.all,
                command: RequestCommand.updateSettings,
                payload: currentConfig,
            });
        });

        testMask.updateExecutionPath(
            slash(userSettings.settings["vk-mask-editor.testMaskPath"].value)
        );
        userSettings.on("configChanged:vk-mask-editor.testMaskPath", (testMaskPath) => {
            // print("path updated", testMaskPath.value);
            if (testMask.updateExecutionPath(testMaskPath.value)) return;
            vscode.window.showErrorMessage("locale.errorMessage.wrongTestMask");
        });

        userSettings.on(
            "configChanged:vk-mask-editor.experimentalFeatures",
            async (experimental) => {
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
            }
        );
    }

    function setupWebViewProvider<T extends BaseWebviewProvider>(
        name: string,
        provider: new (...args) => T
    ) {
        const buildPath = path.join(webviewsBuildPath, name);
        const viewProvider = new provider(context.extensionUri, buildPath);

        webviewProviders.push(viewProvider);
        context.subscriptions.push(
            vscode.window.registerWebviewViewProvider(viewProvider.viewId, viewProvider)
        );
        return viewProvider;
    }

    function setupWebViewPanel(name: string, viewId: string, title: string) {
        const panelBuildPath = path.join(webviewsBuildPath, name);
        const panel = new BaseWebviewPanel(context.extensionUri, panelBuildPath, viewId, title);
        webviewPanels.push(panel);
        return panel;
    }

    // webviewPanels.forEach((panel) => {
    //     // ? will cause an error for webview panel already disposed?
    //     context.subscriptions.push(
    //         messageHandler.bindViewMessageHandler(panel.webview, panel.viewId)
    //     );

    //     assetsWatcher.on("assetsChanged", async () => {
    //         const builtins = (await userSettings.getSettings()["vk-mask-editor.use-builtins"]
    //             .value) as boolean;

    //         messageHandler.send({
    //             command: RequestCommand.updateAssets,
    //             payload: await assetsWatcher.getAssets(true),
    //             target: panel.viewId,
    //         });
    //     });
    // });

    function updateLocalizationBundle(config = { forceUpdate: false }) {
        // l10nBundle = vscode.l10n.bundle;
        const bundlePath = vscode.l10n.uri
            ? vscode.l10n.uri.fsPath
            : path.join(context.extensionPath, "l10n", "bundle.l10n.json");

        // if (!vscode.l10n.uri) {
        //     // bundle = fs.readFileSync(vscode.l10n.uri?.fsPath, { encoding: "utf-8" });
        //     // default language
        // }

        l10nBundle = fs.readFileSync(bundlePath, { encoding: "utf-8" });
        l10n.config({ contents: l10nBundle });
    }

    // ? eventually will make a class
    // ? multiple errors could occur
    // ? multiple time  like removed and added config
    async function onError(newError: AppError) {
        print("!!!ERRROR", newError);
        switch (newError.type) {
            case ErrorType.configMissing:
                appContextManager.set({
                    state: AppState.welcome,
                    error: newError.value,
                });
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
        //     `workbench.view.extension.vk-mask-editor_primary_bar.resetViewContainerLocation`
        // );
        // await vscode.commands.executeCommand(`vk-mask-editor.projectManager.resetViewLocation`);

        // webviewProviders.forEach(async (provider) => {
        //     await vscode.commands.executeCommand(provider.viewId + ".focus");
        //     if (provider.viewId !== ViewIds.projectManager)
        //         await vscode.commands.executeCommand(provider.viewId + ".removeView");
        // });

        // ? add settings   #feat
        welcomeTemplatesPanel.createOrShow();
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

    /*
    ┌─────────────────────────────────────────────────────────────────────────────┐
    │     communications                                                          │
    └─────────────────────────────────────────────────────────────────────────────┘
    */

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

    function onSendAppContext(target = RequestTarget.all) {
        return messageHandler.send({
            target,
            command: RequestCommand.updateAppContext,
            payload: appContextManager.get(),
        });
    }

    function setupWebviewProviderMessaging() {
        webviewProviders.forEach((provider) => {
            provider.onResolveWebviewView = () => {
                context.subscriptions.push(
                    messageHandler.bindViewMessageHandler(provider.webview, provider.viewId)
                );

                assetsWatcher.on("assetsChanged", async () => {
                    const builtins = (await userSettings.getSettings()[
                        "vk-mask-editor.use-builtins"
                    ].value) as boolean;

                    messageHandler.send({
                        command: RequestCommand.updateAssets,
                        payload: await assetsWatcher.getAssets(true),
                        target: provider.viewId,
                    });
                });
            };
        });
    }

    function setupExtensionMessaging() {
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
                        payload: await assetsWatcher.getAsset(payload.path, payload.assetType),
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

                case RequestCommand.getAppContext:
                    messageHandler.send({
                        ...data,
                        target: origin,
                        payload: appContextManager.get(),
                    });
                    break;

                case RequestCommand.getExtensionURI:
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
                    createProject(payload);
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
    }

    async function onMaskConfgiSave() {
        // maskConfig.selection = {type : SelectionType.empty};
        // await maskConfig.clearSelection();
        print("on file save");
        await sendSelection();
        sendEffects([RequestTarget.effects, RequestTarget.parameters]);
        sendPlugins([RequestTarget.plugins, RequestTarget.parameters]);
        sendMaskSettings(RequestTarget.projectManager);
    }

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
            folder = slash(folder);
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
            const folderUri = vscode.Uri.file(folder);
            vscode.commands.executeCommand(`vscode.openFolder`, folderUri);
            return;
        }

        // ? need to check if new folder have mask.json
        const options: vscode.OpenDialogOptions = {
            canSelectMany: false,
            openLabel: l10n.t("locale.commands.openProject.openButton.label"),
            canSelectFiles: true,
            canSelectFolders: false,
            filters: {
                [l10n.t("locale.commands.openProject.filterMaskJson")]: ["json"],
            },
            title: l10n.t("locale.commands.openProject.title"),
        };

        const oldContext = appContextManager.get();

        vscode.window.showOpenDialog(options).then(async (fileUri) => {
            if (fileUri && fileUri[0]) {
                const maskJsonFile = slash(fileUri[0].fsPath);
                const folder = path.dirname(maskJsonFile);
                recentProjectInfo.addInfo(folder); // !!! maybe useless!!!!
                const folderUri = vscode.Uri.file(folder);
                print("Selected open folder: ", maskJsonFile, folder);
                appContextManager.set(oldContext);
                // return;
                await vscode.commands.executeCommand(`vscode.openFolder`, folderUri);
            } else {
                appContextManager.set(oldContext);
            }
        });
    }

    async function createProject(templateName = "Empty") {
        // ! need to check if project already there !!!
        const options: vscode.SaveDialogOptions = {
            saveLabel: l10n.t("locale.commands.createProject.buttonLabel"),
            title: l10n.t("locale.commands.createProject.title"),
        };
        const oldContext = appContextManager.get();

        const newProjectUri = await vscode.window.showSaveDialog(options);

        if (!newProjectUri) {
            // on cancel
            appContextManager.set(oldContext);

            return;
        }

        const sampleProjectDir = vscode.Uri.joinPath(
            context.extensionUri,
            "res",
            "templates",
            templateName
        );

        copyRecursiveSync(sampleProjectDir.fsPath, newProjectUri.fsPath);

        // else {
        //     // ! could be network error
        //     try {
        //         vscode.window.showInformationMessage(
        //             l10n.t("locale.infoMessage.downloadStarted", newProjectUri.fsPath)
        //         );
        //         await downloadTemplate(newProjectUri.fsPath, templateName);
        //     } catch (error) {
        //         vscode.window.showErrorMessage(
        //             l10n.t("locale.errorMessage.cannotDownloadTemplate")
        //         );

        //         return;
        //     }
        // }

        recentProjectInfo.addInfo(newProjectUri.fsPath);
        vscode.commands.executeCommand(`vscode.openFolder`, newProjectUri);
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
        // todo : move to class ?
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

    /*
    ┌─────────────────────────────────────────────────────────────────────────────┐
    │     extension lifecycle                                                     │
    └─────────────────────────────────────────────────────────────────────────────┘
    */
    function setupAddEffectActions() {
        effectNames.forEach((name) => {
            context.subscriptions.push(
                vscode.commands.registerCommand(`vk-mask-editor.add_effect.${name}`, async () => {
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
    }

    function setupAddPluginActions() {
        pluginNames.forEach((name) => {
            context.subscriptions.push(
                vscode.commands.registerCommand(`vk-mask-editor.add_plugin.${name}`, async () => {
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
    }

    function setupAddAssetActions() {
        const assetsDefaults = {
            material: {
                from: ["res", "defaultMaterial.json"],
                to: ["Materials", "defaultMaterial.json"],
                assetType: "json_material",
            },
        };

        Object.entries(assetsDefaults).forEach(([assetCategory, { from, to, assetType }]) => {
            context.subscriptions.push(
                vscode.commands.registerCommand(
                    `vk-mask-editor.add_asset.${assetCategory}`,
                    async () => {
                        const relativePath = await assetsWatcher.copyAssets(from, to);
                        globalThis.selection = {
                            type: SelectionType.asset,
                            assetType,
                            path: relativePath,
                            baseName: path.basename(relativePath), // !!! could be error
                        };

                        // print("asset selection", globalThis.selection);
                        sendSelection();
                    }
                )
            );
        });
    }

    function setupLogDumpAction() {
        context.subscriptions.push(
            vscode.commands.registerCommand("vk-mask-editor.dumpLogs", async () => {
                const dumpPath = maskConfig.currentConfigDir;
                // todo add timeout in case view not initialized
                const responses = (await Promise.all(
                    webviewProviders.map((provider) => {
                        if (provider.disposed) return Promise.resolve([]);
                        // print("will reqest " + provider.viewId);
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
    }

    function setupOpenSettingsActions() {
        context.subscriptions.push(
            vscode.commands.registerCommand("vk-mask-editor.openSettings", async () => {
                vscode.commands.executeCommand("workbench.action.openSettings", "vk-mask-editor");

                // vscode.commands.executeCommand("workbench.action.openSettingsJson", {
                //     revealSetting: { key: "editor.renderWhitespace" },
                // });
            })
        );
    }

    function setupArchiveProjectAction() {
        // todo hide when project missing
        context.subscriptions.push(
            vscode.commands.registerCommand("vk-mask-editor.archiveProject", async () => {
                vscode.window.showInformationMessage(
                    l10n.t("locale.commands.archiveProject.startHint")
                );

                const archivePath = (await userSettings.getSettings()["vk-mask-editor.archivePath"]
                    .value) as string;
                await archiveProject(archivePath);
            })
        );
    }

    function setupOpenTestMaskActions() {
        context.subscriptions.push(
            vscode.commands.registerCommand("vk-mask-editor.testMaskOpen", async () => {
                const { state, error } = appContextManager.get();

                if (state === AppState.error && error.type === ErrorType.configMissing) {
                    vscode.window.showErrorMessage("locale.commands.testMaskOpen.configMissing");
                    return;
                }
                print("opening test mask!");
                testMask.open(maskConfig.pathMaskJSON);
            })
        );
    }

    function setupRunCommandByIdAction() {
        context.subscriptions.push(
            vscode.commands.registerCommand("vk-mask-editor.execute_command_by_id", async () => {
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
    }

    function setupDevHotReaload() {
        if (context.extensionMode === vscode.ExtensionMode.Development) {
            let watchLock = false;
            let watchTimeout: NodeJS.Timeout;

            // const webviewBuildDir = path.join(context.extensionPath, "out", "webview-ui");
            const webviewWatcher = vscode.workspace.createFileSystemWatcher(
                // "{,}"
                new vscode.RelativePattern(context.extensionPath, "{out/**,l10n/bundle.l10n*}")
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
                        updateLocalizationBundle({ forceUpdate: true });
                        vscode.commands.executeCommand(
                            "workbench.action.webview.reloadWebviewAction"
                        );
                        print("Reload due to file changed");
                    }, 500);
                    // watchLock = true;
                })
            );

            vscode.commands.executeCommand("workbench.action.webview.openDeveloperTools");
        }
    }

    function setupResetViewsAction() {
        context.subscriptions.push(
            vscode.commands.registerCommand("vk-mask-editor.resetSidebar", async () => {
                webviewProviders.forEach((provider) => {
                    vscode.commands.executeCommand(provider.viewId + ".resetViewLocation");
                });
            })
        );
    }
    // // show sidebar
    // // await vscode.commands.executeCommand("workbench.view.extension.vk-mask-editor_primary_bar.resetViewContainerLocation")
    // // await vscode.commands.executeCommand(`workbench.view.extension.vk-mask-editor_primary_bar`)
    // // vscode.commands.executeCommand(`workbench.action.focusAuxiliaryBar`)
    // // vscode.commands.executeCommand(`vk-mask-editor_primary_bar.focus`)
    // workbench.action.focusAuxiliaryBar

    // ! additional context keys
    // vk-mask-editor.projectManager.active
    // vk-mask-editor.projectManager.canMove
    // vk-mask-editor.projectManager.defaultViewLocation
    // vk-mask-editor.projectManager.visible
    // viewContainer.workbench.view.extension.vk-mask-editor_primary_bar.enabled

    // // !!! erorr handle !!!
    // ;

    // will ensure good initialize
    function runInitialDataProcess() {
        if (maskConfig.updateConfigPath()) {
            recentProjectInfo.addInfo(maskConfig.currentConfigDir);

            assetsWatcher.attach(context.extensionPath);
            await assetsWatcher.getBuiltinAssets();

            // print("showing all webivews/config/closing tabs");
            // // on init need to show mask.json only! so there is no misatakes working in a wrong file
            // const tabsToClose = vscode.window.tabGroups.all.map((tg) => tg.tabs).flat();
            // // ? maybe close only files that are in old project, could be usefull for opened api reference
            // await vscode.window.tabGroups.close(tabsToClose);
            maskConfig.showConfig(true);

            if (maskConfig.parseConfig()) {
                appContextManager.set({ state: AppState.running });
                const effects = await maskConfig.getEffects();
                if (effects.length) {
                    onSelection({ type: SelectionType.effect, id: 0 });
                }
            }
            // this will ensure all the componenets will show up no matter if they closed before.
            webviewProviders.forEach((provider) => {
                // keep theese collapsed
                // ?maybe only  for first  run?
                if (
                    provider.viewId === ViewIds.assetsManager ||
                    provider.viewId === ViewIds.plugins
                ) {
                    // vscode.commands.executeCommand(provider.viewId + ".removeView");
                    return;
                }

                vscode.commands.executeCommand(provider.viewId + ".focus");
            });
        } else {
            appContextManager.set({ state: AppState.welcome });
        }
    }
    // // vscode.commands.executeCommand('workbench.action.moveFocusedView');
    // // vscode.commands.executeCommand('vk-mask-editor.sidepanel.focus').then(() => {
}

// This method is called when your extension is deactivated
export function deactivate() {}
