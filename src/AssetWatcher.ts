import * as path from "path";
import * as fs from "fs";
import * as vscode from "vscode";
import { EventEmitter } from "events";
import { logger } from "./Logger";
const print = (...args: any) => logger.log(__filename, ...args);

import { XMLParser } from "fast-xml-parser"; // https://github.com/NaturalIntelligence/fast-xml-parser/blob/c7b3cea4ead020c21d39e135a50348208829e971/docs/v4/2.XMLparseOptions.md

/*
    add exclude 
    add types of assets 50/50
    add builtin assets DONE
    add error type for files which is not possible to parse
*/

export interface Asset {
  path: string;
  type: string;
  projectFile?: boolean;
}

class AssetWatcher extends EventEmitter {
  public assets: Array<Asset> = [];
  public builtInAssets: Array<Asset> = [];
  private xmlParser = new XMLParser({
    ignoreDeclaration: true,
  });
  directory: string = "";
  public onAssetsChange: (() => void) | undefined;

  constructor() {
    super();

    if (vscode.workspace.workspaceFolders?.length) {
      this.directory = vscode.workspace.workspaceFolders?.[0]?.uri?.fsPath;
    }

    this.attach();
  }

  async searchBuiltinAssets(extensionUri: vscode.Uri) {
    const builtinPath = path.join(extensionUri.fsPath, "res", "build-in-assets.json");
    const builtInRaw = fs.readFileSync(builtinPath, "utf8");
    const builtInJSON = JSON.parse(builtInRaw) as { assets: Array<Asset> };

    // !!!add error check, file could be missing
    this.builtInAssets = builtInJSON.assets;
  }

  async searchAssets() {
    print("Searching assets");
    const files = await vscode.workspace.findFiles("**");

    const newAssets = files.map((file) => {
      return {
        ...this.fileToAsset(file.fsPath),
        projectFile: true,
      };
    });

    print(`new assets count :  ${newAssets.length}`);
    print(`builtin assets count :  ${this.builtInAssets.length}`);

    this.assets = [...this.builtInAssets, ...newAssets];
    // return this.assets;
    // this.fireChangedEvent()
  }

  async getAssets() {
    if (!this.assets.length) {
      await this.searchAssets();
    }
    return this.assets;
  }

  readFileType(file: string) {
    let type = "unknown";
    // !!!! error handling
    if (file.endsWith("xml")) {
      // print(file.fsPath)
      try {
        const rawXML = fs.readFileSync(file);
        let xmlObject = this.xmlParser.parse(rawXML);
        const xmlType = Object.keys(xmlObject)?.[0];
        type = "xml_" + xmlType;
      } catch (e) {
        type = "xml_error";
      }
    }
    return type;
  }

  fileToAsset(file: string): Asset {
    return {
      path: this.getRelative(file),
      type: this.readFileType(file),
    };
  }

  attach() {
    if (!this.directory) {
      print("dirrectory is undefined, unable to attach");
      return;
    }

    // ! test for multple files deleted
    // ! possibly add some debounce

    const watcher = vscode.workspace.createFileSystemWatcher(
      new vscode.RelativePattern(this.directory, "**")
    );

    watcher.onDidCreate((e) => {
      const fspath = this.getRelative(e.fsPath);
      print("created file ", fspath);
      const index = this.assets.findIndex((asset) => asset.path === fspath);
      if (index < 0) {
        this.assets.splice(index, 0, {
          path: fspath,
          type: this.readFileType(fspath),
        });
        this.fireChangedEvent();
      }
    });

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

  getRelative(file: string) {
    return path.relative(this.directory, file);
  }

  fireChangedEvent() {
    this.emit("assetsChanged", { assets: this.assets });
  }
}

// Exports class singleton to prevent multiple
export const assetWatcher = new AssetWatcher();
