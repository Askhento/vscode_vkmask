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

import { jsonPrettyArray } from './utils/jsonStringify';
/*
    todo : angelscript intellisence
*/

export async function activate(context: vscode.ExtensionContext) {

    print("activating");

    vscode.workspace.onDidChangeConfiguration((e) => {
        print(e)
    })


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
        // !!!!!!!!!! any !!!!!!!!!!!!!
        const fullLogDump = [].concat(...dumps).sort((a: any, b: any) => a.timestamp - b.timestamp);

        const dumpPath = sidebar.maskConfig.currentConfigDir;
        if (dumpPath === undefined) {
            vscode.window.showErrorMessage("Seems like no folder opened to save logs.")
            return;
        }
        vscode.window.showInformationMessage('Dumping logs to ' + dumpPath);

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
            sidebar.sendEffects();
            assetWatcher.searchAssets();

        });
    }))

    // watch().on('change', (filename: string) => {

    // });


    // show sidebar 
    // await vscode.commands.executeCommand("workbench.view.extension.vkmask_primary_bar.resetViewContainerLocation")
    // await vscode.commands.executeCommand(`workbench.view.extension.vkmask_primary_bar`)
    // vscode.commands.executeCommand(`workbench.action.focusAuxiliaryBar`)
    // vkmask.sidepanel.focus
    // vscode.commands.executeCommand(`vkmask_primary_bar.focus`)
    await vscode.commands.executeCommand(`vkmask.sidepanel.focus`) // this works

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
