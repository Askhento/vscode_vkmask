// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below

import * as fs from 'fs';
import * as vscode from 'vscode';
import { MainSidebarProvider } from './panels/MainSidebar'
import { HotReload } from "./HotReload";
// const { exec } = require('node:child_process');
import * as path from "path"
import { watch } from "chokidar";
import { logDump, logger } from "./logger";
const print = logger(__filename);
import { assetWatcher } from './AssetWatcher';

import "./consoleDump"
import { jsonPrettyArray } from './utils/jsonStringify';
/*
    todo : angelscript intellisence
*/

export function activate(context: vscode.ExtensionContext) {

    print("activating");

    const createBuiltinAssets = false;
    if (createBuiltinAssets) {
        assetWatcher.on("assetsChanged", (e) => {
            // const dir = vscode.workspace.workspaceFolders[0].uri.fsPath;
            const dir = context.extensionUri.fsPath;

            const jsonDump = jsonPrettyArray(e, "\t");
            fs.writeFileSync(dir + "/res/build-in-assets.json", jsonDump, { encoding: 'utf-8' })
        });
    } else {
        assetWatcher.getBuiltinAssets(context.extensionUri)
    }

    const sidebar = new MainSidebarProvider(context.extensionUri);

    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(MainSidebarProvider.viewId, sidebar)
    );

    context.subscriptions.push(vscode.commands.registerCommand("vkmask.dumpLogs", async () => {

        const message: any = (await sidebar.requestLogs());
        // console.log(message)
        const webviewLogDump = message.value;
        // combining multiple dumps into one, based on timestamp
        const dumps = [logDump, webviewLogDump]
        const fullLogDump = [].concat(...dumps).sort((a, b) => a.timestamp - b.timestamp);

        const dumpPath = sidebar.maskConfig.currentConfigDir;
        if (dumpPath === undefined) {
            vscode.window.showErrorMessage("Seems like no folder opened to save logs.")
            return;
        }
        vscode.window.showInformationMessage('Dumping logs to ');

        const jsonDump = jsonPrettyArray(fullLogDump, "\t");
        const jsonDumpPath = path.join(dumpPath, "logDump.json");
        fs.writeFileSync(jsonDumpPath, jsonDump, { encoding: 'utf-8' })

        vscode.workspace.openTextDocument(jsonDumpPath).then(document => {
            return vscode.window.showTextDocument(document)
        })

    }))


    // "workbench.action.movePanelToSecondarySideBar",
    // workbench.action.openView

    // ! does this thing still required???
    const hotReloader = new HotReload(context.extensionUri);
    hotReloader.copyFilesToMask();




    // !!!! add check on dev disabled
    let watchLock = false;
    let watchTimeout: NodeJS.Timeout;
    watch(path.join(context.extensionPath, "webview-ui", "public", "build")).on('change', (filename: string) => {
        if (watchLock) {
            return;
        }

        print("\nThe file " + filename + " was modified!");

        if (watchTimeout) clearTimeout(watchTimeout)
        watchTimeout = setTimeout(() => {
            watchLock = false;
        }, 1000)
        watchLock = true;

        vscode.commands.executeCommand("workbench.action.webview.reloadWebviewAction").then(() => {
            sidebar.sendEffects();
            assetWatcher.searchAssets();

        });
    });


    // show sidebar 
    // vscode.commands.executeCommand(`workbench.view.extension.vkmask_primary_bar`)
    // vscode.commands.executeCommand(`workbench.action.focusAuxiliaryBar`)

    // await vscode.commands.executeCommand(`vkmask_primary_bar.focus`)
    // await vscode.commands.executeCommand(`vkmask.sidepanel.focus`)

    // vscode.commands.executeCommand('workbench.action.moveFocusedView');
    // vscode.commands.executeCommand('vkmask.sidepanel.focus').then(() => {

    // })

    // {
    //   "type": "webview",
    //   "contextualTitle": "vkmask inspector",
    //   "id": "vkmask.inspector",
    //   "name": "Inspector"
    // }

}

// This method is called when your extension is deactivated
export function deactivate() { }
