
import * as path from "path"
import * as vscode from 'vscode';
import { logger } from "./logger";
import { EventEmitter } from "events";
const print = logger(__filename);

/*
    add exclude 
    add types of assets


*/

class AssetWatcher extends EventEmitter {

    public assets: Array<Record<string, string>> = [];
    directory: string = "";
    public onAssetsChange: (() => void) | undefined;

    constructor() {
        super();

        if (vscode.workspace.workspaceFolders) {
            this.directory = vscode.workspace.workspaceFolders[0].uri.fsPath
        }

        this.attach();
    }

    async searchAssets() {
        await vscode.workspace.findFiles("**").then((res) => {
            this.assets = res.map(obj => ({
                path: this.getRelative(obj.fsPath),
                type: "empty_just_testing"
            }))

            print(this.assets);

            this.fireChangedEvent()

        })
    }

    attach() {
        if (!this.directory) return;


        const watcher = vscode.workspace.createFileSystemWatcher(new vscode.RelativePattern(this.directory, '**'))

        watcher.onDidCreate((e) => {
            const fspath = path.relative(this.directory, e.fsPath)
            console.log(fspath)
            const index = this.assets.findIndex(asset => asset.path === fspath);
            if (index < 0) {
                this.assets.splice(index, 0, { path: fspath, type: "empty" });
                this.fireChangedEvent()
            }
        })

        watcher.onDidDelete((e) => {
            const fspath = path.relative(this.directory, e.fsPath)
            console.log(fspath)
            const index = this.assets.findIndex(asset => asset.path === fspath);
            if (index >= 0) {
                this.assets.splice(index, 1);
                this.fireChangedEvent()
            }
        })
    }

    getRelative(fspath: string) {
        return path.relative(this.directory, fspath)
    }

    fireChangedEvent() {
        this.emit('assetsChanged', { assets: this.assets })
    }


}

// Exports class singleton to prevent multiple invocations of acquireVsCodeApi.
export const assetWatcher = new AssetWatcher();
