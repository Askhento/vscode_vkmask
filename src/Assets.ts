import * as path from "path";
import * as fs from "fs";
import * as vscode from "vscode";
import { EventEmitter } from "events";
import { logger } from "./Logger";
const print = (...args: any) => logger.log(__filename, ...args);
import { copyRecursiveSync } from "./utils/copyFilesRecursive";
import sharp from "sharp";

import { XMLParser } from "fast-xml-parser"; // https://github.com/NaturalIntelligence/fast-xml-parser/blob/c7b3cea4ead020c21d39e135a50348208829e971/docs/v4/2.XMLparseOptions.md

/*
    add exclude 
    add types of assets 50/50
    add builtin assets DONE
    add error type for files which is not possible to parse
*/

export interface Asset {
    baseName: string;
    absPath: string;
    path: string;
    type: string;
    projectFile?: boolean;
    preview?: string;
}

const PREWVIEW_SIZE = 128;

class AssetWatcher extends EventEmitter {
    public assets: Array<Asset> = [];
    public builtInAssets: Array<Asset> = [];
    private xmlParser = new XMLParser({
        ignoreDeclaration: true,
    });
    directory: string = "";
    extensionPath: string = "";

    public onAssetsChange: (() => void) | undefined;

    constructor() {
        super();
    }

    async searchBuiltinAssets(extensionUri: vscode.Uri) {
        const builtinPath = path.join(extensionUri.fsPath, "res", "build-in-assets.json");
        const builtInRaw = fs.readFileSync(builtinPath, "utf8");
        const builtInJSON = JSON.parse(builtInRaw) as Array<Asset>;

        // !!!add error check, file could be missing
        this.builtInAssets = builtInJSON;
        print("builtins assets: ", this.builtInAssets);
    }

    async searchAssets() {
        print("Searching assets");
        const files = await vscode.workspace.findFiles("**");

        const newAssets = files.map(async (file) => {
            return await this.fileToAsset(file.fsPath, true);
        });

        print(`new assets count :  ${newAssets.length}`);
        // print(`builtin assets count :  ${this.builtInAssets.length}`);

        this.assets = await Promise.all(newAssets);
        // this.assets = [...this.builtInAssets, ...newAssets];
    }

    async getAssets(builtins = false) {
        if (!this.assets.length) {
            await this.searchAssets();
        }
        return builtins ? [...(this.builtInAssets ?? []), ...this.assets] : this.assets;
    }

    readFileType(file: string) {
        let type = "unknown";
        // !!!! error handling
        const ext = path.extname(file);

        switch (ext) {
            case ".xml":
                try {
                    const rawXML = fs.readFileSync(file);
                    let xmlObject = this.xmlParser.parse(rawXML);
                    const xmlType = Object.keys(xmlObject)?.[0] ?? "error";
                    type = "xml_" + xmlType;
                } catch (e) {
                    type = "xml_error";
                }
                break;

            case ".json":
                try {
                    const rawJson = fs.readFileSync(file).toString();
                    const parsedJson = JSON.parse(rawJson);
                    const jsonType = parsedJson.techniques ? "material" : "error";
                    type = "json_" + jsonType;
                } catch (e) {
                    type = "json_error";
                }
                break;

            case ".png":
            case ".jpg":
                type = "image";
                break;

            case ".hlsl":
            case ".glsl":
                type = "shader";
                break;

            case ".as":
                type = "script";
                break;

            case ".mdl":
                type = "model3d";
                break;

            default:
                break;
        }

        return type;
    }

    async fileToAsset(file: string, projectFile: boolean = false): Promise<Asset> {
        const absPath = this.getAbsPath(file);
        const type = await this.readFileType(file);
        const preview = await this.getPreview(absPath, type);
        const baseName = path.basename(file);

        return {
            baseName,
            absPath,
            path: this.getRelative(file),
            type,
            preview,
            projectFile,
        };
    }

    attach(context: vscode.ExtensionContext) {
        this.extensionPath = context.extensionPath;

        if (vscode.workspace.workspaceFolders?.length) {
            this.directory = vscode.workspace.workspaceFolders?.[0]?.uri?.fsPath;
        }

        if (!this.directory) {
            print("dirrectory is undefined, unable to attach");
            return;
        }

        // ! test for multple files deleted
        // ! possibly add some debounce

        const watcher = vscode.workspace.createFileSystemWatcher(
            new vscode.RelativePattern(this.directory, "**")
        );

        watcher.onDidCreate(async (e) => {
            const fspath = this.getRelative(e.fsPath);
            print("created file ", fspath);
            const index = this.assets.findIndex((asset) => asset.path === fspath);
            if (index < 0) {
                this.assets.splice(index, 0, await this.fileToAsset(e.fsPath, true));
                this.fireChangedEvent();
            }

            // {
            //         absPath: this.getAbsPath(e.fsPath),
            //         path: fspath,
            //         type: this.readFileType(fspath),
            //     }
        });

        // watcher.onDidChange

        watcher.onDidDelete((e) => {
            const fspath = this.getRelative(e.fsPath);
            print("deleted file ", fspath);
            const index = this.assets.findIndex((asset) => asset.path === fspath);
            if (index >= 0) {
                this.assets.splice(index, 1);
                this.fireChangedEvent();
            }
        });
    }

    async getPreview(absPath: string, type: string) {
        if (type === "image") {
            const options = {
                width: PREWVIEW_SIZE,
                height: PREWVIEW_SIZE,
                responseType: "base64",
                jpegOptions: { force: true, quality: 80 },
            };

            const imageBuffer = fs.readFileSync(absPath);

            try {
                const thumbnailBuffer = await sharp(imageBuffer)
                    .resize({
                        fit: "contain",
                        width: PREWVIEW_SIZE,
                        height: PREWVIEW_SIZE,
                        // withoutEnlargement: true,
                    })
                    .jpeg({ force: true, quality: 80 })
                    .toBuffer();

                const thumbnail = thumbnailBuffer.toString("base64");
                // print(thumbnail);
                return thumbnail;
            } catch (err) {
                print(err);
            }
        }

        return "";
    }

    async uploadAssets(extensions: string[], to: string[]) {
        const filters: any = Object.fromEntries(extensions.map((ext) => [ext, ext]));

        const options: vscode.OpenDialogOptions = {
            canSelectMany: false,
            openLabel: "Open",
            canSelectFiles: true,
            canSelectFolders: false,
            filters,
            title: "Select assets",
        };

        const fileUri = await vscode.window.showOpenDialog(options);

        if (!fileUri || !fileUri[0]) {
            return "";
        }

        const file = fileUri[0].fsPath;
        const base = path.basename(file);
        const relative = path.join(...to, base);
        const dest = path.join(this.directory, relative);

        // fs.copyFileSync(file, dest);
        // copyRecursiveSync(file, dest);
        fs.cpSync(file, dest, {}); // it works !!! even with missing destination
        return relative;
    }

    async copyAssets(from: string[], to: string[]) {
        const fullFrom = path.join(this.extensionPath, ...from);
        const fullTo = path.join(this.directory, ...to);

        try {
            fs.cpSync(fullFrom, fullTo);
            return path.join(...to);
        } catch (error) {
            return "";
        }
    }

    async removeAsset(asset: string[]) {
        const fullPath = path.join(this.directory, ...asset);

        try {
            fs.unlinkSync(fullPath);
            return fullPath;
        } catch (error) {
            return "";
        }
    }

    getAbsPath(file: string) {
        return path.resolve(file);
    }

    getRelative(file: string) {
        return path.relative(this.directory, file);
    }

    fireChangedEvent() {
        this.emit("assetsChanged", { assets: this.assets });
    }
}

// Exports class singleton to prevent multiple
export const Assets = new AssetWatcher();
