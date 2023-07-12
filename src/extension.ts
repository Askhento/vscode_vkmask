// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below

import * as fs from 'fs';
import * as vscode from 'vscode';
import { MainViewProvider } from './panels/MainViewProvider'
import { InspectorViewProvider } from './panels/InspectorViewProvider'
import { AssetsManagerViewProvider } from './panels/AssetsManagerViewProvider'

import { MessageHandler } from "./MessageHandler"

import { HotReload } from "./HotReload";
// const { exec } = require('node:child_process');
import * as path from "path"
import { logger } from "./Logger";
const print = (...args: any) => logger.log(__filename, ...args);

import { assetWatcher } from './AssetWatcher';
import { userSettings } from "./UserSettings";
import { jsonPrettyArray } from './utils/jsonStringify';

/*
    todo : angelscript intellisence
*/

enum ViewIds {
    "vkmask.inspector",
    "vkmask.assets_manager"
}



export async function activate(context: vscode.ExtensionContext) {

    const messageHandler = new MessageHandler();

    const assetsManager = new AssetsManagerViewProvider(context.extensionUri);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(AssetsManagerViewProvider.viewId, assetsManager)
    );

    const inspector = new InspectorViewProvider(context.extensionUri);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(InspectorViewProvider.viewId, inspector)
    );


    assetsManager.onResolveWebviewView = () => {
        context.subscriptions.push(messageHandler.bindViewMessageHandler(assetsManager.webview, AssetsManagerViewProvider.viewId));
        // messageHandler.send(
        // {
        //     target : AssetsManagerViewProvider.viewId,
        //     payload : "send data from extension"
        // }
    // )
    }


    inspector.onResolveWebviewView = () => {
        context.subscriptions.push(messageHandler.bindViewMessageHandler(inspector.webview, InspectorViewProvider.viewId));
    //     messageHandler.send(
    //     InspectorViewProvider.viewId,
    //     "send data from extension"
    // )
    }

    // messageHandler.send(
    //     [InspectorViewProvider.viewId, AssetsManagerViewProvider.viewId],
    //     {
    //         message : "send : hello world from extensoin"
    //     }
    // )


    // await userSettings.init(context.extensionUri);
    // print("activating");


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


    // // "workbench.action.movePanelToSecondarySideBar",
    // // workbench.action.openView

    // // ! does this thing still required???
    // const hotReloader = new HotReload(context.extensionUri);
    // hotReloader.copyFilesToMask();




    // !!!! add check on dev disabled
    let watchLock = false;
    let watchTimeout: NodeJS.Timeout;

    const webviewBuildDir = path.join(context.extensionPath, "out", "panels", "webview-build");
    const webviewWatcher = vscode.workspace.createFileSystemWatcher(new vscode.RelativePattern(webviewBuildDir, '**'))

    context.subscriptions.push(webviewWatcher.onDidChange((fileUri) => {
        if (watchLock) {
            return;
        }

        print("\nThe file " + fileUri.fsPath + " was modified!");

        if (watchTimeout) clearTimeout(watchTimeout)
        watchTimeout = setTimeout(() => {
            watchLock = false;
        }, 1000)
        watchLock = true;

        vscode.commands.executeCommand("workbench.action.webview.reloadWebviewAction").then(() => {
            // sidebar.updateAppState();
            // assetWatcher.searchAssets();
            // userSettings.emitChangeEvent();
        });
    }))


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
export function deactivate() { }
