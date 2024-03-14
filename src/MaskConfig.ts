import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

import * as jsonMap from "json-source-map";
import { jsonPrettyArray } from "./utils/jsonStringify";
import { ZBaseEffect, ZMaskConfig, ZMaskConfigPreprocess, ZEffects } from "./ztypes.js";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { delayPromise } from "./utils/delayPromise";
import { EventEmitter } from "events";

import { logger } from "./Logger";
import { SelectionType, ErrorType } from "./types";
import type { AppError, Selection } from "./types";

const print = (...args: unknown[]) => logger.log(__filename, ...args);

export class MaskConfig extends EventEmitter {
    public maskJSON: z.infer<typeof ZMaskConfig> | undefined;
    public maskPreprocessJSON: z.infer<typeof ZMaskConfigPreprocess> | undefined;

    private sourceMaskJSON: jsonMap.ParseResult | undefined;
    public maskLinePointers: jsonMap.Pointers = {};
    public rawMaskJSON: string | undefined;
    public pathMaskJSON: string | undefined;
    public currentConfigDir: string | undefined;
    public selectedEffectId: number | undefined;
    public configSelection: Selection = { type: SelectionType.empty };

    // these delegates are for user input reactions
    public onFileSave: () => void = () => {};

    constructor() {
        super();

        // todo : mask.json changed from outside ???

        vscode.workspace.onDidSaveTextDocument((document) => {
            if (!this.isSameDocument(document.uri, "mask.json")) return;

            this.clearSelection();
            if (!this.parseConfig()) return;

            this?.onFileSave();
        });
    }

    private isSameDocument(uri: vscode.Uri, baseName: string) {
        const fsPath = uri?.fsPath;

        if (vscode.workspace.workspaceFolders == null) return false;

        const dir = vscode.workspace.workspaceFolders?.[0].uri;
        return fsPath === vscode.Uri.joinPath(dir, baseName).fsPath;
    }

    public showEffect(id: number | undefined, editor?: vscode.TextEditor) {
        if (id == null) return null;

        if (!this.configIsActive()) return null;
        if (editor == null) editor = vscode.window.activeTextEditor;

        const key = "/effects/" + id;
        const pointer = this.maskLinePointers[key];

        return this.showConfigAtPointer(pointer, editor);
    }

    public showPlugin(id: number | undefined, editor?: vscode.TextEditor) {
        if (id == null) return null;

        if (!this.configIsActive()) return null;
        if (editor == null) editor = vscode.window.activeTextEditor;

        const key = "/plugins/" + id;
        const pointer = this.maskLinePointers[key];
        // print("showing plugin with key - " + key);

        return this.showConfigAtPointer(pointer, editor);
    }

    public async clearSelection(editor?: vscode.TextEditor) {
        globalThis.selection = { type: SelectionType.empty };

        if (!this.configIsActive()) return null;
        if (editor == null) editor = vscode.window.activeTextEditor;

        var position = editor.selection.start;
        editor.selection = new vscode.Selection(position, position);
        return editor;
    }

    public async showSelection(editor?: vscode.TextEditor) {
        if (globalThis.selection == null) return;

        switch (globalThis.selection.type) {
            case SelectionType.plugin:
                return await this.showPlugin(globalThis.selection.id, editor);
                break;

            case SelectionType.effect:
                return await this.showEffect(globalThis.selection.id, editor);
                break;
            default:
                print("showSelection : not implemented", globalThis.selection.type);
                break;
        }
    }

    private configIsActive() {
        if (!vscode.window.activeTextEditor) return false;
        const currentDoc = vscode.window.activeTextEditor.document;
        return currentDoc.uri.fsPath === this.pathMaskJSON;
    }

    public async showConfig(force = true) {
        // ? check if it is already shwoing

        // ? check if exist config ???

        // ? do need selection lock here ??
        // print("show config");

        // !!! edge case here need research
        if (this.pathMaskJSON === undefined) {
            print("showConfig : pathMaskJSON is null");
            return null;
        }

        if (this.configIsActive()) {
            return vscode.window.activeTextEditor;
        }

        if (!force) return null;

        const document = await vscode.workspace.openTextDocument(
            vscode.Uri.file(this.pathMaskJSON)
        );
        const editor = await vscode.window.showTextDocument(document, {
            preserveFocus: false,
            preview: false,
        });
        return editor;
    }

    public async showConfigAtPointer(
        pointer: Record<jsonMap.PointerProp, jsonMap.Location>,
        editor?: vscode.TextEditor
    ) {
        if (pointer == null) {
            print("showconfig pointer is null!!");
            return;
        }

        // ? do need to open ??
        if (editor == null) editor = await this.showConfig();

        if (editor == null) {
            print("showConfigAtPointer : will not show editor null");
            return;
        }

        // print("showing config at - " + pointer.value.line + ", " + pointer.valueEnd.line);
        let pos = new vscode.Position(pointer.value.line, pointer.value.column);
        let posEnd = new vscode.Position(pointer.valueEnd.line, pointer.valueEnd.column);
        // here we set the cursor
        // !!! changed here
        editor.selection = new vscode.Selection(pos, posEnd);
        // here we set the focus of the opened editor
        editor.revealRange(new vscode.Range(pos, posEnd), vscode.TextEditorRevealType.InCenter);

        return editor;
    }

    public async showConfigAtLocation(
        locationStart: number,
        locationEnd: number,
        editor?: vscode.TextEditor
    ) {
        // ? do need to open ??
        if (editor === undefined) editor = await this.showConfig();

        if (editor == null) {
            print("showConfigAtLocation : will not show editor null");
            return;
        }

        const { line: lineStart, character: charStart } = editor.document.positionAt(locationStart);
        const { line: lineEnd, character: charEnd } = editor.document.positionAt(locationEnd);

        let posStart = new vscode.Position(lineStart, charStart);
        let posEnd = new vscode.Position(lineEnd, charEnd);

        // vscode.TextEditorCursorStyle.BlockOutline
        // editor.options.cursorStyle
        // here we set the cursor
        // !!! changed here
        editor.selection = new vscode.Selection(posStart, posEnd);
        editor.revealRange(
            new vscode.Range(posStart, posEnd),
            vscode.TextEditorRevealType.InCenter
        );
        // here we set the focus of the opened editor

        return editor;
    }

    public async addEffect(name: string) {
        if (!this.maskJSON) return null;

        const effectObjects = this.maskJSON.effects;

        const newEffect = {
            name,
        };

        if (
            globalThis.selection !== undefined &&
            globalThis.selection.type === SelectionType.effect
        ) {
            effectObjects.splice(globalThis.selection.id + 1, 0, newEffect);
            globalThis.selection = {
                type: SelectionType.effect,
                id: globalThis.selection.id + 1,
            };
        } else {
            effectObjects.push(newEffect);
            globalThis.selection = {
                type: SelectionType.effect,
                id: effectObjects.length - 1,
            };
        }

        await this.updateEffects(effectObjects);

        return effectObjects;
    }

    public async addPlugin(name: string) {
        if (!this.maskJSON) return;

        const pluginObjects = this.maskJSON.plugins;

        const newPlugin = {
            name,
        };

        if (
            globalThis.selection !== undefined &&
            globalThis.selection.type === SelectionType.plugin
        ) {
            pluginObjects.splice(globalThis.selection.id + 1, 0, newPlugin);
            globalThis.selection = {
                type: SelectionType.plugin,
                id: globalThis.selection.id + 1,
            };
        } else {
            pluginObjects.push(newPlugin);
            globalThis.selection = {
                type: SelectionType.plugin,
                id: pluginObjects.length - 1,
            };
        }

        await this.updatePlugins(pluginObjects);

        return pluginObjects;
    }

    public async updateEffects(effectsObject: object[]) {
        if (!this.maskJSON) return;

        const newEffect = effectsObject as z.infer<typeof ZBaseEffect>[];
        this.maskJSON.effects = newEffect;

        const editor = await this.writeConfig();
    }

    public async updatePlugins(pluginsObject: object[]) {
        if (!this.maskJSON) return;

        const newPlugin = pluginsObject; // as z.infer<typeof ZBasePlugin>[];
        this.maskJSON.plugins = newPlugin;

        const editor = await this.writeConfig();
    }

    public async updateMaskSettings(maskSettingsObject: object[]) {
        if (!this.maskJSON) return;

        const { effects, plugins } = this.maskJSON;

        this.maskJSON = { ...maskSettingsObject, effects, plugins };

        const editor = await this.writeConfig();
    }

    public async writeConfig(editor?: vscode.TextEditor) {
        const newConfigString = jsonPrettyArray(this.maskJSON);
        fs.writeFileSync(this.pathMaskJSON, newConfigString, { encoding: "utf-8" });

        // config need to be in sync, so parsing
        if (!this.parseConfig()) return;

        this.showSelection();
    }

    public checkConfigAtPath(dir: string) {
        const configPath = path.join(dir, "mask.json");
        return fs.existsSync(configPath);
    }

    /**
     *
     * @returns true if mask.json fould in current workspacefolder
     */

    public updateConfigPath(): boolean {
        // ? what if more that one folder opened ???
        this.currentConfigDir = undefined;
        if (!vscode.workspace.workspaceFolders) {
            // print("No folder opened! Which is not possible!");
            // ? do need separate error for this
            this.emitError({ type: ErrorType.configMissing });
            return false;
        }

        const dir = vscode.workspace.workspaceFolders?.[0].uri.fsPath;

        if (!this.checkConfigAtPath(dir)) {
            print("No mask.json at " + dir);
            this.emitError({ type: ErrorType.configMissing });
            return false;
        }

        this.currentConfigDir = dir;

        const configPath = path.join(this.currentConfigDir, "mask.json");

        this.pathMaskJSON = configPath;
        return true;
    }

    public parseConfig(): boolean {
        // ? maybe split to parse locations and actual object
        // print("parsing mask.json");
        this.maskJSON = null;

        if (!this.updateConfigPath()) return false;

        // // use unsaved version of config if possible
        // if (vscode.window.activeTextEditor) {
        //     const currentDoc = vscode.window.activeTextEditor.document;
        //     if (currentDoc.uri.fsPath === this.pathMaskJSON) {
        //         const editor = vscode.window.activeTextEditor;
        //         this.rawMaskJSON = editor.document.getText()
        //     } else {
        //     }
        // }
        this.rawMaskJSON = fs.readFileSync(this.pathMaskJSON, "utf8");

        try {
            this.sourceMaskJSON = jsonMap.parse(this.rawMaskJSON);
        } catch (error) {
            // ??? repair json
            // https://github.com/RyanMarcus/dirty-json
            // https://github.com/josdejong/jsonrepair

            print("json parsing error, source maps", error);
            print("raw mask.json ", this.rawMaskJSON);
            // this.emitError((error as Error).toString());
            this.emitError({ type: ErrorType.configSyntax, value: error });
            return false;
        }

        // if (this.sourceMaskJSON === undefined) {
        //     print("mask json source is undefined")
        //     return {
        //         success : false,
        //         message :
        //     }
        // }

        // this.maskJSON = this.sourceMaskJSON.data;
        // print(this.sourceMaskJSON.data);

        const preprocessResult: any = ZMaskConfigPreprocess.safeParse(this.sourceMaskJSON.data);

        if (!preprocessResult.success) {
            print("preprocess parse error ! ", preprocessResult);
            print("raw mask.json ", this.sourceMaskJSON.data);
            // print(this.maskJSON);

            this.emitError({ type: ErrorType.configZod, value: preprocessResult.error });

            return false;
        }

        this.maskJSON = preprocessResult.data as z.infer<typeof ZMaskConfig>;
        // // !!!!!!! any here
        // const parseResult: any = ZMaskConfig.safeParse(preprocessResult.data);

        // if (parseResult.success) {
        //     this.maskJSON = parseResult.data as z.infer<typeof ZMaskConfig>;
        // } else {
        //     print("parse error ! ", parseResult);
        //     // print("raw mask.json ", this.sourceMaskJSON.data);
        //     // print(this.maskJSON);
        //     this.emitError({ type: ErrorType.configZod, value: parseResult.error });
        //     return false;
        //     // return false;
        // }

        print("mask.json parsed", this.maskJSON);

        // if (this.sourceMaskJSON?.pointers === undefined) {
        //     print("could not parse mask.json sourcemap");
        //     this.emitError("could not parse mask.json sourcemap");
        //     return false;
        // }

        // !!!! seems to have missmatch on change
        this.maskLinePointers = this.sourceMaskJSON?.pointers;
        // print("jsonmap pointers : ", this.maskLinePointers);

        return true;
    }

    async getEffects() {
        if (!this.maskJSON) return null;
        return this.maskJSON.effects;
    }

    async getPlugins() {
        if (!this.maskJSON) return null;
        return this.maskJSON.plugins;
    }

    async getMaskSettings() {
        if (!this.maskJSON) return null;

        const { effects, plugins, ...maskSettings } = this.maskJSON;
        return maskSettings;
    }

    emitError(error: AppError) {
        this.emit("error", error);
    }

    // Values returned in the callback of `hotRequire` must
    // have a `dispose` function.
    dispose() {}

    // // these  will try to deal with changes made programmatically
    // public saveLockCallback: (() => void) | undefined;
    // public async saveConfig(document?: vscode.TextDocument) {
    //     if (document == null) {
    //         print("saveConfig : null document");
    //         return false;
    //     }

    //     return await document.save();
    // }

    // // todo : add clear locks methods
    // public setupSelectLock() {
    //     this.selectionLockCallback = () => {
    //         // print("selection lock ");
    //         // this.sendEffects();
    //         this.selectionLockCallback = undefined;
    //         //   this.saveConfig();
    //     };
    // }

    // public setSelection(pointer: Record<jsonMap.PointerProp, jsonMap.Location>) {

    // }

    // public removeFromConfig(id: number) {

    //     return this.showConfig().then((editor) => {

    //         this.maskJSON?.effects.splice(id, 1);

    //         // const newConfigString = this.prettyJson(this.maskJSON)
    //         const newConfigString = jsonPrettyArray(this.maskJSON)

    //         return editor.edit((builder) => {

    //             builder.delete(new vscode.Range(0, 0, editor.document.lineCount, 0))
    //             builder.insert(new vscode.Position(0, 0), newConfigString);

    //             if (this.selectedEffectId === undefined) {
    //                 print("removing from config, but selected is undefined!");
    //                 return;
    //             }

    //             if (id < this.selectedEffectId) {
    //                 this.selectedEffectId = Math.max(0, this.selectedEffectId - 1);
    //                 print("removing after selectedId " + this.selectedEffectId);

    //                 if (this.selectedEffectId !== undefined) {
    //                     this.parseConfig(); // need to refresh in order to have current pointers
    //                     this.showEffect(this.selectedEffectId);
    //                 }

    //             } else if (id === this.selectedEffectId) {
    //                 print("removing selected effect")
    //                 this.selectedEffectId = undefined;
    //                 // var postion = editor.selection.end;
    //                 // editor.selection = new vscode.Selection(postion, postion);
    //             }

    //             print("selected after remove " + this.selectedEffectId);

    //         })

    //     });
    // }

    // public swapEffects(start: number, target: number) {
    //     if (!this.maskJSON) return;

    //     const newEffects = this.maskJSON.effects;

    //     if (start < target) {
    //         newEffects.splice(target + 1, 0, newEffects[start]);
    //         newEffects.splice(start, 1);
    //     } else {
    //         newEffects.splice(target, 0, newEffects[start]);
    //         newEffects.splice(start + 1, 1);
    //     }

    //     this.maskJSON.effects = newEffects;

    //     this.writeConfig();
    // }

    // public addPropertyToEffect(effectId: number, prop: object) {
    //     if (!this.maskJSON) return;

    //     //! need to check object

    //     this.maskJSON.effects[effectId] = { ...this.maskJSON.effects[effectId], ...prop };

    //     this.writeConfig();
    // }

    // public addEffect(effectObject: object) {
    //     if (!this.maskJSON) return;
    //     // this.maskJSON?.effects.splice(id , 1);
    //     // this.maskJSON.effects[idOld];

    //     const newEffect = effectObject as z.infer<typeof ZBaseEffect>;
    //     this.maskJSON.effects.unshift(newEffect);

    //     if (this.selectedEffectId) this.selectedEffectId++; // add new always in front

    //     this.writeConfig();
    // }
}
