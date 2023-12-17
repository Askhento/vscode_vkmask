import * as path from "path";
import * as fs from "fs";
import * as vscode from "vscode";
import { logger } from "./Logger";
const print = (...args: any) => logger.log(__filename, ...args);

import { EventEmitter } from "events";
import { AssetsProcessor } from "./AssetsProcessor";
import { applyMixins } from "./utils/applyMixins";
import { Asset, AssetTypes } from "./types";

class AssetsWatcher extends EventEmitter {
    public assets: Array<Asset> = [];
    public builtInAssets: Array<Asset> = [];

    directory: string = "";
    extensionPath: string = "";
    private processor = new AssetsProcessor();

    async uploadAssets(extensions: string[], to: string[]) {
        // todo : decide what to do when name conflict

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
        let base = path.basename(file);

        let relative = to.at(-1).includes(".") ? path.join(...to) : path.join(...to, base); // file renaming
        const dest = path.join(this.directory, relative);

        // file already in the folder
        if (file === dest) return relative;

        // fs.copyFileSync(file, dest);
        // copyRecursiveSync(file, dest);
        fs.cpSync(file, dest, {}); // it works !!! even with missing destination
        return relative;
    }

    async copyAssets(from: string[], to: string[]) {
        const fullFrom = path.join(this.extensionPath, ...from);
        const fullTo = this.findNextIncrementName(path.join(this.directory, ...to));

        try {
            fs.cpSync(fullFrom, fullTo);
            return path.relative(this.directory, fullTo);
        } catch (error) {
            return "";
        }
    }
    async renameFile(relativePath: string, newName: string) {
        const { dir, name, ext } = path.parse(relativePath);

        const fullDir = path.join(this.directory, dir);
        const oldFullPath = path.join(this.directory, relativePath);
        const newFullPath = path.format({
            dir: fullDir,
            name: newName,
            ext,
        });

        const newRelPath = path.format({
            dir,
            name: newName,
            ext,
        });

        try {
            fs.renameSync(oldFullPath, newFullPath);
        } catch (error) {
            print("error renaming file ", relativePath, newName, error);
            return "";
        }

        return newRelPath;
    }

    async readAsset(assetRelativePath: string, assetType: string) {
        const fullPath = path.join(this.directory, assetRelativePath);
        const fileBuffer = fs.readFileSync(fullPath);

        return await this.processor.read(assetType, fileBuffer);
    }

    async writeAsset(assetRelativePath: string, data: any, assetType: string) {
        const processedStr = await this.processor.write(assetType, data);

        const fullPath = path.join(this.directory, assetRelativePath);

        try {
            fs.writeFileSync(fullPath, processedStr);
        } catch (error) {
            print("error writing file", assetRelativePath, error);
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

    findNextIncrementName(desiredPath: string, sep = "_", index = 1) {
        const { dir, name, ext } = path.parse(desiredPath);
        while (true) {
            const exist = fs.existsSync(desiredPath);
            if (!exist) return desiredPath;
            desiredPath = path.format({ dir, ext, name: `${name}${sep}${index}` });
            index++;
        }
    }

    getRelative(file: string) {
        return path.relative(this.directory, file);
    }

    async getBuiltinAssets() {
        const builtinPath = path.join(this.extensionPath, "res", "build-in-assets.json");
        const builtInRaw = fs.readFileSync(builtinPath, "utf8");
        const builtInJSON = JSON.parse(builtInRaw) as Array<Asset>;

        // for builtins will store absPath as relative to extension directory.
        this.builtInAssets = builtInJSON.map((asset) => {
            return { ...asset, absPath: path.join(this.extensionPath, asset.absPath) };
        });
        // print("builtins assets: ", this.builtInAssets);
        return this.builtInAssets;
    }

    async getAssets(builtins = false) {
        if (!this.assets.length) {
            await this.searchAssets();
        }
        return builtins ? [...(this.builtInAssets ?? []), ...this.assets] : this.assets;
    }

    async searchAssets() {
        print("Searching assets");

        const files = await vscode.workspace.findFiles("**");

        const newAssets = files.map(async (file) => {
            return await this.processor.fileToAsset(
                file.fsPath,
                this.getRelative(file.fsPath),
                true
            );
        });

        print(`new assets count :  ${newAssets.length}`);
        // print(`builtin assets count :  ${this.builtInAssets.length}`);

        this.assets = await Promise.all(newAssets);
        // this.assets = [...this.builtInAssets, ...newAssets];
    }

    attach(extensionPath: string) {
        this.extensionPath = extensionPath;

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
            const relativePath = this.getRelative(e.fsPath);
            print("created file ", relativePath);
            const index = this.assets.findIndex((asset) => asset.path === relativePath);
            if (index < 0) {
                this.assets.splice(
                    index,
                    0,
                    await this.processor.fileToAsset(e.fsPath, relativePath, true)
                );
                this.fireChangedEvent();
            }
        });

        watcher.onDidChange(async (e) => {
            const relativePath = this.getRelative(e.fsPath);
            if (path.basename(relativePath) === "mask.json") return;
            const index = this.assets.findIndex((asset) => asset.path === relativePath);
            if (index >= 0) {
                this.assets.splice(
                    index,
                    1,
                    await this.processor.fileToAsset(e.fsPath, relativePath, true)
                );
                this.fireChangedEvent();
            }
        });

        watcher.onDidDelete((e) => {
            const relativePath = this.getRelative(e.fsPath);
            print("deleted file ", relativePath);
            const index = this.assets.findIndex((asset) => asset.path === relativePath);
            if (index >= 0) {
                this.assets.splice(index, 1);
                this.fireChangedEvent();
            }
        });
    }

    fireChangedEvent() {
        this.emit("assetsChanged", { assets: this.assets });
    }
}

// class Assets {}
// interface Assets extends AssetsProcessor, AssetsWatcher {}

// applyMixins(Assets, [AssetsProcessor, AssetsWatcher]);

// Exports class singleton to prevent multiple
export const assetsWatcher = new AssetsWatcher();
