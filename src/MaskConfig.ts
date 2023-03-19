import * as vscode from "vscode";
import * as fs from 'fs';
import * as path from 'path';
import { MaskJSON, Effect } from "./types"
import * as t from "io-ts";
import * as jsonMap from "json-source-map";
import { jsonPrettyArray } from "./utils/jsonStringify";
import { report, reportOne } from "io-ts-human-reporter"

import { logger } from "./logger";
const print = logger(__filename);


export class MaskConfig {

    private saveDelayMS: number = 200;
    private saveDelayTimeout: NodeJS.Timeout | undefined;

    public maskJSON: t.TypeOf<typeof MaskJSON> | undefined;
    private sourceMaskJSON: jsonMap.ParseResult | undefined;
    public maskLinePointers: jsonMap.Pointers = {};
    public rawMaskJSON: string = "";
    private pathMaskJSON: string = "";
    public selectedEffectId: number | undefined;
    public editLockCallback: (() => void) | undefined;
    public selectionLockCallback: (() => void) | undefined;
    public onTextEdit: () => void = () => { };
    public onTextSelect: () => void = () => { };

    constructor() {
        vscode.window.showInformationMessage('Hello from vkmask!');

        // this.refreshEffects();

        vscode.workspace.onDidChangeTextDocument((event) => {

            if (this.isSameDocument(event.document, "mask.json")) {

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

            if (this.isSameDocument(editor.document, "mask.json")) {

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

    }


    private isSameDocument(document: vscode.TextDocument, baseName: string) {
        const activeUri = document.uri;
        const fsPath = activeUri?.fsPath;

        if (vscode.workspace.workspaceFolders === undefined) return false;

        const dir = vscode.workspace.workspaceFolders[0].uri;
        return fsPath === vscode.Uri.joinPath(dir, baseName).fsPath;
    }

    public showEffect(id: number | undefined) {
        if (id === undefined) return;
        const key = "/effects/" + id;
        const pointer = this.maskLinePointers[key]
        print("showing effect with key - " + key);

        return this.showConfigAt(pointer).then((val) => {
            return Promise.resolve(val)
        });
    }

    public clearSelection() {
        this.selectedEffectId = undefined;
        return vscode.workspace.openTextDocument(this.pathMaskJSON).then(document => {
            return vscode.window.showTextDocument(document)
        }).then((editor) => {
            var position = editor.selection.start;
            editor.selection = new vscode.Selection(position, position);
        });
    }

    // public saveConfig() {
    //     return vscode.workspace.openTextDocument(this.pathMaskJSON).then(document => {

    //         document.save().then(saved => {
    //             print("file saved : " + saved);
    //         })

    //     })
    // }

    public showConfigAt(pointer: Record<jsonMap.PointerProp, jsonMap.Location>) {

        return vscode.workspace.openTextDocument(this.pathMaskJSON).then(document => {
            // print(document.uri);
            // after opening the document, we set the cursor 
            // and here we make use of the line property which makes imo the code easier to read
            return vscode.window.showTextDocument(document)

        }).then((editor) => {
            print("showing config at - " + pointer.value.line + ", " + pointer.valueEnd.line);
            let pos = new vscode.Position(pointer.value.line, 0);
            let posEnd = new vscode.Position(pointer.valueEnd.line + 1, 0);
            // here we set the cursor
            // !!! changed here 
            editor.selection = new vscode.Selection(posEnd, pos);
            // here we set the focus of the opened editor
            editor.revealRange(new vscode.Range(posEnd, pos));


            // return Promise.resolve(editor);
        }).then(
            () => {
                return Promise.resolve("showed");
            },
            (err) => {
                print(err);
            });
    }



    public removeFromConfig(id: number) {
        return vscode.workspace.openTextDocument(this.pathMaskJSON).then(document => {
            // print(document.uri);
            // after opening the document, we set the cursor 
            // and here we make use of the line property which makes imo the code easier to read
            return vscode.window.showTextDocument(document)
        }).then((editor) => {

            this.maskJSON?.effects.splice(id, 1);

            // const newConfigString = this.prettyJson(this.maskJSON)
            const newConfigString = jsonPrettyArray(this.maskJSON)

            return editor.edit((builder) => {

                builder.delete(new vscode.Range(0, 0, editor.document.lineCount, 0))
                builder.insert(new vscode.Position(0, 0), newConfigString);


                if (this.selectedEffectId === undefined) {
                    print("removing from config, but selected is undefined!");
                    return;
                }

                if (id < this.selectedEffectId) {
                    this.selectedEffectId = Math.max(0, this.selectedEffectId - 1);
                    print("removing after selectedId " + this.selectedEffectId);

                    if (this.selectedEffectId !== undefined) {
                        this.parseConfig(); // need to refresh in order to have current pointers
                        this.showEffect(this.selectedEffectId);
                    }

                } else if (id === this.selectedEffectId) {
                    print("removing selected effect")
                    this.selectedEffectId = undefined;
                    // var postion = editor.selection.end; 
                    // editor.selection = new vscode.Selection(postion, postion);
                }

                print("selected after remove " + this.selectedEffectId);

            })

        });
    }

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
        // vscode.workspace.openTextDocument(this.pathMaskJSON).then(document => {
        //     return vscode.window.showTextDocument(document)
        // }).then((editor) => {
        //     if (!this.maskJSON) return;
        //     // this.maskJSON?.effects.splice(id , 1);
        //     // const effect = this.maskJSON.effects[idOld];
        //     // this.maskJSON.effects.splice(idOld, 1);
        //     const newEffects = this.maskJSON.effects;

        //     if (start < target) {
        //         newEffects.splice(target + 1, 0, newEffects[start]);
        //         newEffects.splice(start, 1);
        //     } else {
        //         newEffects.splice(target, 0, newEffects[start]);
        //         newEffects.splice(start + 1, 1);
        //     }

        //     this.maskJSON.effects = newEffects;

        //     // if (idOther == null) {
        //     //     this.maskJSON.effects.push(effect)
        //     //     if (idOld === this.selectedEffectId) this.selectedEffectId = this.maskJSON.effects.length - 1;
        //     // } else {
        //     //     idOther = idOld < idOther ? idOther - 1 : idOther;
        //     //     this.maskJSON.effects.splice(idOther, 0, effect);
        //     //     if (idOld === this.selectedEffectId) this.selectedEffectId = idOther;
        //     // }


        //     const newConfigString = jsonPrettyArray(this.maskJSON)

        //     editor.edit((builder) => {

        //         builder.delete(new vscode.Range(0, 0, editor.document.lineCount, 0))
        //         builder.insert(new vscode.Position(0, 0), newConfigString);

        //     })

        // })
    }

    public addPropertyToEffect(effectId: number, prop: object) {
        if (!this.maskJSON) return;

        //! need to check object

        this.maskJSON.effects[effectId] = { ...this.maskJSON.effects[effectId], ...prop }

        this.writeConfig();

        // vscode.workspace.openTextDocument(this.pathMaskJSON).then(document => {
        //     return vscode.window.showTextDocument(document)
        // }).then((editor) => {
        //     if (!this.maskJSON) return;


        //     this.maskJSON.effects[effectId] = { ...this.maskJSON.effects[effectId], ...prop }

        //     const newConfigString = jsonPrettyArray(this.maskJSON)

        //     editor.edit((builder) => {

        //         builder.delete(new vscode.Range(0, 0, editor.document.lineCount, 0))
        //         builder.insert(new vscode.Position(0, 0), newConfigString);

        //     })

        // })
    }

    public addEffect(effectObject: object) {

        if (!this.maskJSON) return;
        // this.maskJSON?.effects.splice(id , 1);
        // this.maskJSON.effects[idOld];

        const newEffect = effectObject as t.TypeOf<typeof Effect>
        this.maskJSON.effects.unshift(newEffect);

        if (this.selectedEffectId) this.selectedEffectId++; // add new always in front 

        this.writeConfig();
        // vscode.workspace.openTextDocument(this.pathMaskJSON).then(document => {
        //     return vscode.window.showTextDocument(document)
        // }).then((editor) => {
        //     if (!this.maskJSON) return;
        //     // this.maskJSON?.effects.splice(id , 1);
        //     // this.maskJSON.effects[idOld];

        //     const newEffect = effectObject as t.TypeOf<typeof Effect>
        //     this.maskJSON.effects.unshift(newEffect);

        //     if (this.selectedEffectId) this.selectedEffectId++; // add new always in front 

        //     const newConfigString = jsonPrettyArray(this.maskJSON)

        //     editor.edit((builder) => {

        //         builder.delete(new vscode.Range(0, 0, editor.document.lineCount, 0))
        //         builder.insert(new vscode.Position(0, 0), newConfigString);

        //     })

        // })
    }

    public updateEffects(effectsObject: object[]) {
        if (!this.maskJSON) return;

        const newEffect = effectsObject as t.TypeOf<typeof Effect>[];
        this.maskJSON.effects = newEffect;

        this.writeConfig();

    }

    public writeConfig() {
        if (this.saveDelayTimeout) clearTimeout(this.saveDelayTimeout)

        this.saveDelayTimeout = setTimeout(() => {
            const newConfigString = jsonPrettyArray(this.maskJSON);
            fs.writeFileSync(this.pathMaskJSON, newConfigString, { encoding: 'utf-8' })
            this.parseConfig();
        }, this.saveDelayMS);
    }

    // public updateEffects(effectsObject: object[]) {

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
    //         if (!this.maskJSON) return;
    //         // this.maskJSON?.effects.splice(id , 1);
    //         // this.maskJSON.effects[idOld];

    //         const newEffect = effectsObject as t.TypeOf<typeof Effect>[];
    //         this.maskJSON.effects = newEffect;

    //         const newConfigString = jsonPrettyArray(this.maskJSON)

    //         editor.edit((builder) => {

    //             builder.delete(new vscode.Range(0, 0, editor.document.lineCount, 0))
    //             builder.insert(new vscode.Position(0, 0), newConfigString);

    //         })

    //     })
    // }

    public parseConfig() {
        // ! need to check if mask.json opened in other tabs 

        if (!vscode.workspace.workspaceFolders) {
            print("No folder opened!");
            return false;
        }

        const dir = vscode.workspace.workspaceFolders[0].uri.fsPath;


        this.pathMaskJSON = path.join(dir, "mask.json");
        // print("mask.json path : " + this.pathMaskJSON);


        // const currentDocument = vscode.window.activeTextEditor?.document;
        // if (currentDocument?.uri.fsPath === this.pathMaskJSON) {
        //     this.rawMaskJSON = currentDocument.getText();
        // } else {
        // }   

        this.rawMaskJSON = fs.readFileSync(this.pathMaskJSON, 'utf8');


        try {
            this.sourceMaskJSON = jsonMap.parse(this.rawMaskJSON);

        } catch (error) {
            print("json parsing error");
            print(error)
            return false;
            // vscode.window.showErrorMessage(error);
            // print(error);
        }

        if (this.sourceMaskJSON === undefined) {
            vscode.window.showErrorMessage("mask json source is undefined")
            return false;
        }

        this.maskJSON = this.sourceMaskJSON.data as t.TypeOf<typeof MaskJSON>;

        const maskDecode = MaskJSON.decode(this.maskJSON);
        if (maskDecode._tag === "Left") {
            let errMsg = "mask.json require keys : \n"
            const errors = report(maskDecode, {
                messages: {
                    missing: (keys, path) => {
                        errMsg += (path.join('/') + "/" + keys + ", ");
                        return `YOINKS! You forgot to add "${keys.join(',')}" at "${path.join('/')}".`;
                    }
                }
            });

            errMsg = errMsg.slice(0, -2); // remove comma at the end

            print(errors)
            vscode.window.showErrorMessage(errMsg);
            return;
        }


        if (this.sourceMaskJSON?.pointers === undefined) {
            vscode.window.showErrorMessage("source map pointers is undefined")
            return false;
        }

        this.maskLinePointers = this.sourceMaskJSON?.pointers;

        return true;

    }


    // Values returned in the callback of `hotRequire` must
    // have a `dispose` function.
    dispose() { }
}