// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below

import * as fs from "fs";
import * as vscode from "vscode";
import { MainViewProvider } from "./panels/MainViewProvider";
import { InspectorViewProvider } from "./panels/InspectorViewProvider";
import { AssetsManagerViewProvider } from "./panels/AssetsManagerViewProvider";

import { MessageHandler } from "./MessageHandler";

import { HotReload } from "./HotReload";
// const { exec } = require('node:child_process');
import * as path from "path";
import { logger } from "./Logger";
const print = (...args: any) => logger.log(__filename, ...args);

import { assetWatcher } from "./AssetWatcher";
import { userSettings } from "./UserSettings";
import { jsonPrettyArray } from "./utils/jsonStringify";
import { RequestCommand, RequestTarget, Selection, SelectionType } from "./types";
import { MaskConfig } from "./MaskConfig";
import { BaseWebviewProvider } from "./panels/BaseWebviewProvider";

/*
    todo : angelscript intellisence
*/

export async function activate(context: vscode.ExtensionContext) {
    logger.setMode(context.extensionMode);
    await userSettings.init(context.extensionUri);

    const messageHandler = new MessageHandler();
    const maskConfig = new MaskConfig();

    const webviewsBuildPath = path.join("out", "panels", "webview-build");
    const webviewProviders: Array<BaseWebviewProvider> = [];

    const mainBuildPath = path.join(webviewsBuildPath, "main");
    const main = new MainViewProvider(context.extensionUri, mainBuildPath);
    webviewProviders.push(main);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider(main.viewId, main));

    const assetsManagerBuildPath = path.join(webviewsBuildPath, "assets_manager");
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

    // assetsManager.onResolveWebviewView = () => {
    //     context.subscriptions.push(
    //         messageHandler.bindViewMessageHandler(assetsManager.webview, assetsManager.viewId)
    //     );

    //     assetWatcher.on("assetsChanged", async () => {
    //         messageHandler.send({
    //             command: RequestCommand.updateAssets,
    //             payload: await assetWatcher.getAssets(),
    //             target: RequestTarget.assetsManager,
    //         });
    //     });
    // };

    // inspector.onResolveWebviewView = () => {
    //     context.subscriptions.push(
    //         messageHandler.bindViewMessageHandler(inspector.webview, inspector.viewId)
    //     );
    //     assetWatcher.on("assetsChanged", async () => {
    //         messageHandler.send({
    //             command: RequestCommand.updateAssets,
    //             payload: await assetWatcher.getAssets(),
    //             target: RequestTarget.inspector,
    //         });
    //     });
    // };

    function onSelection(selection: Selection) {
        const { type, id } = selection as Selection;

        switch (type) {
            case SelectionType.effect:
                maskConfig.selectedEffectId = id;
                maskConfig.showEffect(id);
                break;

            case SelectionType.empty:
                maskConfig.selectedEffectId = null;
                maskConfig.clearSelection();
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

            case RequestCommand.getEffects:
                // reply with effects
                messageHandler.send({
                    ...data,
                    payload: await maskConfig.getEffects(),
                    target: origin,
                });
                break;
            default:
                break;
        }

        switch (command) {
            case RequestCommand.updateEffects:
                maskConfig.updateEffects(payload);
                break;

            case RequestCommand.updateSelection:
                // maskConfig.
                onSelection(payload);

                break;

            default:
                break;
        }
    };

    maskConfig.onFileSave = async () => {
        print("sending effects on file save");
        const effects = await maskConfig.getEffects();
        messageHandler.send({
            target: RequestTarget.main,
            command: RequestCommand.updateEffects,
            payload: effects,
        });
    };

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

    // const sidebar = new MainViewProvider(context.extensionUri);

    // context.subscriptions.push(
    //     vscode.window.registerWebviewViewProvider(MainViewProvider.viewId, sidebar)
    // );

    // context.subscriptions.push(vscode.commands.registerCommand("vkmask.dumpLogs", async () => {

    //     const message: any = (await sidebar.requestLogs());
    //     // console.log("message", message)
    //     const webviewLogDump = message.value;

    //     const dumpPath = sidebar.maskConfig.currentConfigDir;
    //     if (dumpPath === undefined) {
    //         vscode.window.showErrorMessage("Seems like no folder opened to save logs.")
    //         return;
    //     }

    //     logger.dumpLogs(webviewLogDump, dumpPath)

    // }))

    context.subscriptions.push(
        vscode.commands.registerCommand("vkmask.resetSidebar", async () => {
            webviewProviders.forEach((provider) => {
                vscode.commands.executeCommand(provider.viewId + ".resetViewLocation");
            });
        })
    );
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

    // // show sidebar
    // // await vscode.commands.executeCommand("workbench.view.extension.vkmask_primary_bar.resetViewContainerLocation")
    // // await vscode.commands.executeCommand(`workbench.view.extension.vkmask_primary_bar`)
    // // vscode.commands.executeCommand(`workbench.action.focusAuxiliaryBar`)
    // // vkmask.sidepanel.focus
    // // vscode.commands.executeCommand(`vkmask_primary_bar.focus`)
    // await vscode.commands.executeCommand(`vkmask.sidepanel.focus`) // this works

    // // vscode.commands.executeCommand('workbench.action.moveFocusedView');
    // // vscode.commands.executeCommand('vkmask.sidepanel.focus').then(() => {

    // // })

    // // {
    // //   "type": "webview",
    // //   "contextualTitle": "vkmask inspector",
    // //   "id": "vkmask.inspector",
    // //   "name": "Inspector"
    // // }
}

// This method is called when your extension is deactivated
export function deactivate() {}
