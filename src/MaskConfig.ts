import * as vscode from "vscode";
import * as fs from 'fs';
import * as path from 'path';
import { MaskJSON, Effect } from "./types"
import * as t from "io-ts";
import * as jsonMap from "json-source-map";
import { jsonPrettyArray } from "./utils/jsonStringify";
import { report, reportOne } from "io-ts-human-reporter"
import { ZBaseEffect, ZMaskConfig } from "./ztypes.js"
import { z } from "zod";
import { fromZodError } from 'zod-validation-error';

import { logger } from "./logger";
const print = logger(__filename);


export class MaskConfig {

    // private saveDelayMS: number = 200;
    // private saveDelayTimeout: NodeJS.Timeout | undefined;
    // private saveDelayPromise: { promise: Promise<any>, cancel: Function } | undefined;


    public maskJSON: z.infer<typeof ZMaskConfig> | undefined;
    private sourceMaskJSON: jsonMap.ParseResult | undefined;
    public maskLinePointers: jsonMap.Pointers = {};
    public rawMaskJSON: string = "";
    public pathMaskJSON: string | undefined;
    public currentConfigDir: string | undefined;
    public selectedEffectId: number | undefined;
    // these  will try to deal with changes made programmatically
    public editLockCallback: (() => void) | undefined;
    public selectionLockCallback: (() => void) | undefined;
    public saveLockCallback: (() => void) | undefined;

    // these delegates are for user input reactions 
    public onTextEdit: () => void = () => { };
    public onTextSelect: () => void = () => { };
    public onFileSave: () => void = () => { };


    constructor() {

        // this.refreshEffects();

        vscode.workspace.onDidChangeTextDocument((event) => {

            if (this.isSameDocument(event.document.uri, "mask.json")) {

                if (event.contentChanges === undefined || event.contentChanges.length === 0) return;

                // const newChar = event.contentChanges[0].text;
                print("edit event mask.json \n");

                // print(typeof this.editLockCallback);
                if (this.editLockCallback) {
                    print("edit lock return");
                    this.editLockCallback();
                    return;
                }

                print("seems like undo or user typing in mask.json")

                this.onTextEdit();
            }

        })


        vscode.window.onDidChangeTextEditorSelection((event) => {

            const editor = event.textEditor;
            // print(event.selections.map(s => s.start))

            if (this.isSameDocument(editor.document.uri, "mask.json")) {

                print("selection event mask.json");
                if (this.selectionLockCallback !== undefined) {
                    // ! if selected element already selected, then nothing happens
                    print("selection lock return");
                    this.selectionLockCallback();
                    return;
                }

                print("change selection by user");

                this.onTextSelect();
            }
        })

        // !!!!! need a lock also !!!!
        vscode.workspace.onDidSaveTextDocument((document) => {
            print("saving event")
            if (this.saveLockCallback !== undefined) {
                print("save lock return");
                this.saveLockCallback();
                return;
            }
            if (this.isSameDocument(document.uri, "mask.json")) {
                print("hey I mask.json")
                this.onFileSave();
            }
        })

    }

    // todo : add clear locks methods 
    public setupSelectLock() {
        this.selectionLockCallback = () => {
            print("selection lock ")
            // this.sendEffects();
            this.selectionLockCallback = undefined;
            //   this.saveConfig();
        }
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
            }
        }
    }

    public setupSaveLock() {
        this.saveLockCallback = () => {
            print("save lock")
            this.saveLockCallback = undefined;
        }
    }
    private isSameDocument(uri: vscode.Uri, baseName: string) {
        // const activeUri = document.uri;
        const fsPath = uri?.fsPath;

        if (vscode.workspace.workspaceFolders === undefined) return false;

        const dir = vscode.workspace.workspaceFolders[0].uri;
        return fsPath === vscode.Uri.joinPath(dir, baseName).fsPath;
    }

    public showEffect(id: number | undefined, editor?: vscode.TextEditor) {
        if (id === undefined) return;
        const key = "/effects/" + id;
        const pointer = this.maskLinePointers[key]
        print("showing effect with key - " + key);

        return this.showConfigAt(pointer, editor)
    }

    public async clearSelection(editor?: vscode.TextEditor) {
        if (editor === undefined) editor = await this.showConfig();

        this.setupSelectLock();

        this.selectedEffectId = undefined;
        var position = editor.selection.start;
        editor.selection = new vscode.Selection(position, position);
        return editor;
    }


    public showConfig() {
        // ? check if it is already shwoing 

        // ? check if exist config ???


        // ? do need selection lock here ?? 
        //     vscode.workspace.openTextDocument(this.pathMaskJSON).then(document => {
        //         if (vscode.window.activeTextEditor) {
        //             const currentDoc = vscode.window.activeTextEditor.document;
        //             print(vscode.window.activeTextEditor)
        //             if (currentDoc === document) {
        //                 return vscode.window.activeTextEditor;
        //             }
        //         }
        //         return vscode.window.showTextDocument(document)
        //     }).then((editor) => {

        return vscode.workspace.openTextDocument(this.pathMaskJSON).then(document => {
            return vscode.window.showTextDocument(document)
        })

    }
    public async saveConfig(editor?: vscode.TextEditor) {
        if (editor === undefined) editor = await this.showConfig();

        const saved = await editor.document.save();
        print("config saved : " + saved);

        return editor;
    }

    public async showConfigAt(pointer: Record<jsonMap.PointerProp, jsonMap.Location>, editor?: vscode.TextEditor) {
        if (editor === undefined) editor = await this.showConfig();

        this.setupSelectLock();

        print("showing config at - " + pointer.value.line + ", " + pointer.valueEnd.line);
        let pos = new vscode.Position(pointer.value.line, 0);
        let posEnd = new vscode.Position(pointer.valueEnd.line + 1, 0);
        // here we set the cursor
        // !!! changed here 
        editor.selection = new vscode.Selection(posEnd, pos);
        // here we set the focus of the opened editor
        editor.revealRange(new vscode.Range(posEnd, pos));

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

    public swapEffects(start: number, target: number) {

        if (!this.maskJSON) return;

        const newEffects = this.maskJSON.effects;

        if (start < target) {
            newEffects.splice(target + 1, 0, newEffects[start]);
            newEffects.splice(start, 1);
        } else {
            newEffects.splice(target, 0, newEffects[start]);
            newEffects.splice(start + 1, 1);
        }

        this.maskJSON.effects = newEffects;

        this.writeConfig();

    }

    public addPropertyToEffect(effectId: number, prop: object) {
        if (!this.maskJSON) return;

        //! need to check object

        this.maskJSON.effects[effectId] = { ...this.maskJSON.effects[effectId], ...prop }

        this.writeConfig();


    }

    public addEffect(effectObject: object) {

        if (!this.maskJSON) return;
        // this.maskJSON?.effects.splice(id , 1);
        // this.maskJSON.effects[idOld];

        const newEffect = effectObject as t.TypeOf<typeof Effect>
        this.maskJSON.effects.unshift(newEffect);

        if (this.selectedEffectId) this.selectedEffectId++; // add new always in front 

        this.writeConfig();

    }

    public async updateEffects(effectsObject: object[]) {
        if (!this.maskJSON) return;


        const newEffect = effectsObject as z.infer<typeof ZBaseEffect>[];
        this.maskJSON.effects = newEffect;

        await this.writeConfig();
        this.parseConfig();

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

        await editor.edit((builder) => {

            builder.delete(new vscode.Range(0, 0, editor.document.lineCount, 0))
            builder.insert(new vscode.Position(0, 0), newConfigString);

        })

        this.setupSaveLock(); // everything fine don't fire event 

        await this.saveConfig(editor);

        this.parseConfig();

        // todo  select again without event firing

        await this.showEffect(this.selectedEffectId, editor)

        return editor;

    }



    public checkConfigAtPath(dir) {
        const configPath = path.join(dir, "mask.json");
        return fs.existsSync(configPath)
    }


    public searchConfigFile() {

        // ? what if more that one folder opened ???
        this.currentConfigDir = undefined;

        if (!vscode.workspace.workspaceFolders) {
            print("No folder opened!");

            return undefined;
        }

        const dir = vscode.workspace.workspaceFolders[0].uri.fsPath;

        if (!this.checkConfigAtPath(dir)) {
            print("No mask.json at " + dir)
            return undefined;
        }

        this.currentConfigDir = dir;

        return path.join(this.currentConfigDir, "mask.json");
    }

    public parseConfig() {

        // ? maybe split to parse locations and actual object
        print("parsing mask.json")
        this.maskJSON = undefined;

        this.pathMaskJSON = this.searchConfigFile();

        if (this.pathMaskJSON === undefined) return false;


        this.rawMaskJSON = fs.readFileSync(this.pathMaskJSON, 'utf8');


        try {
            this.sourceMaskJSON = jsonMap.parse(this.rawMaskJSON);

        } catch (error) {
            print("json parsing error, source maps", error);
            print("raw mask.json ", this.sourceMaskJSON.data)
            return false;
        }

        if (this.sourceMaskJSON === undefined) {
            print("mask json source is undefined")
            return false;
        }

        // this.maskJSON = this.sourceMaskJSON.data;
        // print(this.sourceMaskJSON.data);
        const parseResult = ZMaskConfig.safeParse(this.sourceMaskJSON.data);

        if (parseResult.success) {
            this.maskJSON = parseResult.data as z.infer<typeof ZMaskConfig>;
        } else {
            print("parse error ! ", (parseResult));
            print("raw mask.json ", this.sourceMaskJSON.data)
            print(this.maskJSON)
            return false;
        }


        print("mask.json parsed", this.maskJSON)

        // const maskDecode = MaskJSON.decode(this.maskJSON);
        // if (maskDecode._tag === "Left") {
        //     let errMsg = "mask.json require keys : \n"
        //     const errors = report(maskDecode, {
        //         messages: {
        //             missing: (keys, path) => {
        //                 errMsg += (path.join('/') + "/" + keys + ", ");
        //                 return `YOINKS! You forgot to add "${keys.join(',')}" at "${path.join('/')}".`;
        //             }
        //         }
        //     });

        //     errMsg = errMsg.slice(0, -2); // remove comma at the end

        //     print(errors)
        //     vscode.window.showErrorMessage(errMsg);
        //     return;
        // }


        if (this.sourceMaskJSON?.pointers === undefined) {
            print("source map pointers is undefined")
            return false;
        }

        this.maskLinePointers = this.sourceMaskJSON?.pointers;

        return true;

    }


    // Values returned in the callback of `hotRequire` must
    // have a `dispose` function.
    dispose() { }
}