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
    // private saveDelayMS: number = 200;
    // private saveDelayTimeout: NodeJS.Timeout | undefined;
    // private saveDelayPromise: { promise: Promise<any>, cancel: Function } | undefined;

    public maskJSON: z.infer<typeof ZMaskConfig> | undefined;
    public maskPreprocessJSON: z.infer<typeof ZMaskConfigPreprocess> | undefined;

    private sourceMaskJSON: jsonMap.ParseResult | undefined;
    public maskLinePointers: jsonMap.Pointers = {};
    public rawMaskJSON: string | undefined;
    public pathMaskJSON: string | undefined;
    public currentConfigDir: string | undefined;
    public selectedEffectId: number | undefined;
    public selection: Selection = { type: SelectionType.empty };

    private selectionDelay: { promise: Promise<any>; cancel: Function } | undefined;
    private editDelay: { promise: Promise<any>; cancel: Function } | undefined;

    // these  will try to deal with changes made programmatically
    public editLockCallback: (() => void) | undefined;
    public selectionLockCallback: (() => void) | undefined;
    public saveLockCallback: (() => void) | undefined;

    // these delegates are for user input reactions
    public onTextEdit: () => void = () => {};
    public onTextSelect: () => void = () => {};
    public onFileSave: () => void = () => {};

    public selectionDelayMS = 200;
    public editDelayMS = 500;

    constructor() {
        super();

        // this.refreshEffects();

        vscode.workspace.onDidChangeTextDocument((event) => {
            return; // !!!
            // if (this.isSameDocument(event.document.uri, "mask.json")) {

            //     if (event.contentChanges === undefined || event.contentChanges.length === 0) return;

            //     // const newChar = event.contentChanges[0].text;
            //     print("edit event mask.json \n");

            //     // print(typeof this.editLockCallback);
            //     if (this.editLockCallback) {
            //         print("edit lock return");
            //         this.editLockCallback();
            //         return;
            //     }

            //     print("seems like undo or user typing in mask.json")

            //     if (this.editDelay !== undefined) this.editDelay.cancel();
            //     this.editDelay = delayPromise(this.editDelayMS)
            //     this.editDelay.promise.then(() => {
            //         this.onTextEdit();
            //     })

            // }
        });

        vscode.window.onDidChangeTextEditorSelection((event) => {
            return; // !!!
            // const editor = event.textEditor;
            // // print(event.selections.map(s => s.start))

            // if (this.isSameDocument(editor.document.uri, "mask.json")) {

            //     print("selection event mask.json");
            //     if (this.selectionLockCallback !== undefined) {
            //         // ! if selected element already selected, then nothing happens
            //         print("selection lock return");
            //         this.selectionLockCallback();
            //         return;
            //     }

            //     print("change selection by user");

            //     if (this.selectionDelay !== undefined) this.selectionDelay.cancel();
            //     this.selectionDelay = delayPromise(this.selectionDelayMS)
            //     this.selectionDelay.promise.then(() => {
            //         this.onTextSelect();
            //     })
            // }
        });

        /**
         * on save used because I get undo stack for free.
         * ? lock used to prevent infinte loop on save
         */
        vscode.workspace.onDidSaveTextDocument((document) => {
            print("saving event");
            if (this.saveLockCallback !== undefined) {
                print("save lock return");
                this.saveLockCallback();
                return;
            }

            if (!this.parseConfig()) return;

            if (this.isSameDocument(document.uri, "mask.json")) {
                this.onFileSave();
            }
        });
    }

    // todo : add clear locks methods
    public setupSelectLock() {
        this.selectionLockCallback = () => {
            print("selection lock ");
            // this.sendEffects();
            this.selectionLockCallback = undefined;
            //   this.saveConfig();
        };
    }

    public setupEditLock() {
        this.editLockCallback = () => {
            print("edit lock ");
            // this.parseConfig();
            // this.sendEffects();
            this.editLockCallback = undefined;
            // this.showEffect(this.selectedEffectId);
            // this.saveConfig(); // edits completed now need to save so HotReload does it's job

            this.selectionLockCallback = () => {
                print("edit lock -> selection");

                // restore on the second event
                // ! first cb comes from removing whole json
                // ! second one from selection
                this.selectionLockCallback = undefined;

                // this.selectionLockCallback = () => {
                //     this.selectionLockCallback = undefined;

                // }
            };
        };
    }

    public setupSaveLock() {
        this.saveLockCallback = () => {
            print("save lock");
            this.saveLockCallback = undefined;
        };
    }
    private isSameDocument(uri: vscode.Uri, baseName: string) {
        // const activeUri = document.uri;
        const fsPath = uri?.fsPath;

        if (vscode.workspace.workspaceFolders === undefined) return false;

        const dir = vscode.workspace.workspaceFolders?.[0].uri;
        return fsPath === vscode.Uri.joinPath(dir, baseName).fsPath;
    }

    public showEffect(id: number | undefined, editor?: vscode.TextEditor) {
        if (id === undefined) return;
        const key = "/effects/" + id;
        const pointer = this.maskLinePointers[key];
        print("showing effect with key - " + key);

        return this.showConfigAtPointer(pointer, editor);
    }

    public showPlugin(id: number | undefined, editor?: vscode.TextEditor) {
        if (id === undefined) return;
        const key = "/plugins/" + id;
        const pointer = this.maskLinePointers[key];
        print("showing plugin with key - " + key);

        return this.showConfigAtPointer(pointer, editor);
    }

    public async clearSelection(editor?: vscode.TextEditor) {
        if (editor === undefined) editor = await this.showConfig();

        // !!!!!
        if (editor === undefined) return;

        this.setupSelectLock();
        print("clear selection");
        this.selection = { type: SelectionType.empty };
        var position = editor.selection.start;
        editor.selection = new vscode.Selection(position, position);
        return editor;
    }

    public async showConfig() {
        // ? check if it is already shwoing

        // ? check if exist config ???

        // ? do need selection lock here ??
        // print("show config");

        // !!! edge case here need research
        if (this.pathMaskJSON === undefined) {
            print("showConfig : pathMaskJSON is null");
            return;
        }

        if (vscode.window.activeTextEditor) {
            const currentDoc = vscode.window.activeTextEditor.document;
            // print("active document", currentDoc);
            if (currentDoc.uri.fsPath === this.pathMaskJSON) {
                // print("active is same");
                return vscode.window.activeTextEditor;
            }
        }

        const document = await vscode.workspace.openTextDocument(
            vscode.Uri.file(this.pathMaskJSON)
        );
        const editor = await vscode.window.showTextDocument(document, {
            preserveFocus: false,
            preview: false,
        });
        return editor;
    }
    public async saveConfig(editor?: vscode.TextEditor) {
        if (editor === undefined) editor = await this.showConfig();

        const saved = await editor.document.save();
        print("config saved : " + saved);

        return editor;
    }

    public async showConfigAtPointer(
        pointer: Record<jsonMap.PointerProp, jsonMap.Location>,
        editor?: vscode.TextEditor
    ) {
        if (editor === undefined) editor = await this.showConfig();

        this.setupSelectLock();

        if (pointer === undefined) {
            print("showconfig pointer is null!!");
            return;
        }
        print("showing config at - " + pointer.value.line + ", " + pointer.valueEnd.line);
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
        if (editor === undefined) editor = await this.showConfig();

        console.log("old selection", editor.selection);
        console.log("locationStart : ", locationStart);
        console.log("locationEnd : ", locationEnd);

        const { line: lineStart, character: charStart } = editor.document.positionAt(locationStart);
        const { line: lineEnd, character: charEnd } = editor.document.positionAt(locationEnd);

        let posStart = new vscode.Position(lineStart, charStart);
        let posEnd = new vscode.Position(lineEnd, charEnd);

        console.log("posStart : ", posStart);
        console.log("posEnd : ", posEnd);
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

    public async updateEffects(effectsObject: object[]) {
        if (!this.maskJSON) return;

        const newEffect = effectsObject as z.infer<typeof ZBaseEffect>[];
        this.maskJSON.effects = newEffect;

        const editor = await this.writeConfig();

        this.parseConfig();

        if (this.selection.type === SelectionType.effect)
            await this.showEffect(this.selection.id, editor);

        // if (this.saveDelayPromise !== undefined) this.saveDelayPromise.cancel();

        // this.saveDelayPromise = delay(this.saveDelayMS, "");
        // this.saveDelayPromise.promise.then(() => {
        // }).then(() => {
        // })
        //     .catch((err) => {
        //         print("some error writing config ", err)
        //     })

        // this.saveDelayTimeout = setTimeout(() => {
        //     this.writeConfig();
        // }, this.saveDelayMS);
    }

    public async updatePlugins(pluginsObject: object[]) {
        if (!this.maskJSON) return;

        const newPlugin = pluginsObject; // as z.infer<typeof ZBasePlugin>[];
        this.maskJSON.plugins = newPlugin;

        const editor = await this.writeConfig();

        this.parseConfig();

        if (this.selection.type !== SelectionType.empty)
            await this.showPlugin(this.selection.id, editor);
    }

    public async updateMaskSettings(maskSettingsObject: object[]) {
        if (!this.maskJSON) return;

        this.maskJSON = { ...this.maskJSON, ...maskSettingsObject };

        const editor = await this.writeConfig();

        this.parseConfig();

        if (this.selection.type === SelectionType.plugin)
            await this.showPlugin(this.selection.id, editor);
    }

    public async writeConfig(editor?: vscode.TextEditor) {
        this.setupEditLock();

        // return new Promise(() => {
        //     const newConfigString = jsonPrettyArray(this.maskJSON);
        //     fs.writeFileSync(this.pathMaskJSON, newConfigString, { encoding: 'utf-8' })
        //     // this.parseConfig();

        // })

        if (editor === undefined) editor = await this.showConfig();

        const newConfigString = jsonPrettyArray(this.maskJSON);
        // fs.writeFileSync(this.pathMaskJSON, newConfigString, { encoding: 'utf-8' })
        // this.parseConfig();

        await editor.edit(async (builder) => {
            if (editor === undefined) editor = await this.showConfig();

            builder.delete(new vscode.Range(0, 0, editor.document.lineCount, 0));
            builder.insert(new vscode.Position(0, 0), newConfigString);
        });

        this.setupSaveLock(); // everything fine don't fire event

        await this.saveConfig(editor);

        return editor;
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
        print("parsing mask.json");
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
            // print("parse error ! ", preprocessResult);
            // print("raw mask.json ", this.sourceMaskJSON.data);
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
}
