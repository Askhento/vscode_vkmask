
import * as path from "path"
import * as fs from 'fs';
import * as vscode from 'vscode';
import { EventEmitter } from "events";
import { logger } from "./Logger";
const print = (...args: any) => logger.log(__filename, ...args);

import { XMLParser } from "fast-xml-parser" // https://github.com/NaturalIntelligence/fast-xml-parser/blob/c7b3cea4ead020c21d39e135a50348208829e971/docs/v4/2.XMLparseOptions.md


/*
    add exclude 
    add types of assets
    add builtin assets

*/

class AssetWatcher extends EventEmitter {

    public assets: Array<Record<string, string | boolean>> = [];
    public builtInAssets: Array<Record<string, string | boolean>> = [];
    private xmlParser = new XMLParser({
        ignoreDeclaration: true
    });
    directory: string = "";
    public onAssetsChange: (() => void) | undefined;

    constructor() {
        super();

        if (vscode.workspace.workspaceFolders?.length) {
            this.directory = vscode.workspace.workspaceFolders?.[0]?.uri?.fsPath
        }

        this.attach();
    }

    getBuiltinAssets(extensionUri: vscode.Uri) {
        const builtinPath = path.join(extensionUri.fsPath, "res", "build-in-assets.json")
        const builtInRaw = fs.readFileSync(builtinPath, 'utf8');
        const builtInJSON = JSON.parse(builtInRaw);

        // ? add error check ? ?
        this.builtInAssets = builtInJSON.assets

    }


    async searchAssets() {
        print("Searching assets")
        await vscode.workspace.findFiles("**").then(files => {
            const newAssets = files.map(file => {
                // ? add check if file already exists
                let assetType = "unknown"

                if (file.fsPath.endsWith("xml")) {
                    // print(file.fsPath)
                    const rawXML = fs.readFileSync(file.fsPath)
                    let xmlObject = this.xmlParser.parse(rawXML);
                    const xmlType = Object.keys(xmlObject)?.[0]
                    assetType = "xml_" + xmlType;
                }
                return {
                    path: this.getRelative(file.fsPath),
                    type: assetType,
                    projectFile: true
                }
            }
            )

            print(newAssets)

            this.assets = [...this.builtInAssets, ...newAssets]

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

// Exports class singleton to prevent multiple 
export const assetWatcher = new AssetWatcher();
