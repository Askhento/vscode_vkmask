import * as vscode from "vscode";
import * as fs from 'fs';
import * as path from 'path';
import { MaskJSON, Effect } from "./types"
import * as t from "io-ts";
import * as jsonMap from "json-source-map";
import { jsonPrettyArray } from "./utils/jsonStringify";
import {report, reportOne} from "io-ts-human-reporter"

// import { res } from "./ztypes";
// console.log(res);

export class MaskConfig {

    public maskJSON : t.TypeOf<typeof MaskJSON> | undefined;
    private sourceMaskJSON : jsonMap.ParseResult | undefined;
    public maskLinePointers : jsonMap.Pointers = {};
    public rawMaskJSON : string = "";
    private pathMaskJSON : string = "";
    public selectedEffectId : number | undefined;
    public editLockCallback      : (() => void) | undefined;
    public selectionLockCallback : (() => void) | undefined;
    public onTextEdit   : () => void = ()=>{};
    public onTextSelect : () => void = ()=>{};

    constructor() {
        vscode.window.showInformationMessage('Hello from vkmask!');

        // this.refreshEffects();

        vscode.workspace.onDidChangeTextDocument((event)=>{

            if (this.isSameDocument(event.document, "mask.json")) {

                if (event.contentChanges === undefined || event.contentChanges.length === 0) return;

                // const newChar = event.contentChanges[0].text;
                console.log("MaskConfig : edit event mask.json \n");

                // console.log(typeof this.editLockCallback);
                if (this.editLockCallback) {
                    console.log("MaskConfig : edit lock return");
                    this.editLockCallback();
                    return;
                }
                
                console.log("MaskConfig : seems like undo or user typing in mask.json")
                
                this.onTextEdit();
            }

        })


        vscode.window.onDidChangeTextEditorSelection((event)=>{

        	const editor = event.textEditor;
            // console.log(event.selections.map(s => s.start))

        	if (this.isSameDocument(editor.document, "mask.json")) {
                
                console.log( "MaskConfig : selection event mask.json");

                if (this.selectionLockCallback !== undefined) {
                    console.log("MaskConfig : selection lock return");
                    this.selectionLockCallback();
                    return;
                }

                console.log("MaskConfig : change selection by user");

                this.onTextSelect();
        	}
        })

    }


    private isSameDocument(document : vscode.TextDocument, baseName : string) {
        const activeUri = document.uri;
        const fsPath = activeUri?.fsPath;

        if (vscode.workspace.workspaceFolders === undefined) return false;

        const dir = vscode.workspace.workspaceFolders[0].uri;
        return fsPath === vscode.Uri.joinPath(dir, baseName).fsPath;		
    }

    public showEffect(id : number | undefined) {
        if (id === undefined) return;
        const key = "/effects/" + id;
        const pointer = this.maskLinePointers[key]
        console.log("MaskConfig : showing effect with key - " + key);

        return this.showConfigAt(pointer).then((val)=>{
            return Promise.resolve(val)
        });
    }

    public clearSelection() {
        this.selectedEffectId = undefined;
        return vscode.workspace.openTextDocument(this.pathMaskJSON).then( document => {
            return vscode.window.showTextDocument(document)
        }).then((editor)=> {
            var postion = editor.selection.start; 
            editor.selection = new vscode.Selection(postion, postion);
        });
    }


    public showConfigAt(pointer : Record<jsonMap.PointerProp, jsonMap.Location>) {

        return vscode.workspace.openTextDocument(this.pathMaskJSON).then( document => {
            // console.log(document.uri);
            // after opening the document, we set the cursor 
            // and here we make use of the line property which makes imo the code easier to read
            return vscode.window.showTextDocument(document)
        }).then((editor)=> {
            console.log("MaskConfig : showing config at - " + pointer.value.line + ", " + pointer.valueEnd.line);
            let pos = new vscode.Position(pointer.value.line, 0);
            let posEnd = new vscode.Position(pointer.valueEnd.line + 1, 0);
            // here we set the cursor
            editor.selection = new vscode.Selection(posEnd, pos);
            // here we set the focus of the opened editor
            editor.revealRange(new vscode.Range(posEnd, pos));

    
            // return Promise.resolve(editor);
        }).then(
            ()=>{
                return Promise.resolve("showed");
            }, 
            (err)=>{
                console.log(err);
            });
    }



    public removeFromConfig(id : number) {
        return vscode.workspace.openTextDocument(this.pathMaskJSON).then( document => {
            // console.log(document.uri);
            // after opening the document, we set the cursor 
            // and here we make use of the line property which makes imo the code easier to read
            return vscode.window.showTextDocument(document)
        }).then((editor)=> {
            
            this.maskJSON?.effects.splice(id , 1);

            // const newConfigString = this.prettyJson(this.maskJSON)
            const newConfigString = jsonPrettyArray(this.maskJSON)
            
            return editor.edit((builder) => {
                
                builder.delete(new vscode.Range(0, 0, editor.document.lineCount , 0) )
                builder.insert(new vscode.Position(0,0), newConfigString);


                if (this.selectedEffectId === undefined) {
                    console.log("MaskConfig : removing from config, but selected is undefined!");
                    return;
                }

                if (id < this.selectedEffectId) {
                    this.selectedEffectId = Math.max(0, this.selectedEffectId - 1);
                    console.log("MaskConfig : removing after selectedId " + this.selectedEffectId);

                    if (this.selectedEffectId !== undefined) {
                        this.parseConfig(); // need to refresh in order to have current pointers
                        this.showEffect(this.selectedEffectId);
                    }

                } else if (id === this.selectedEffectId) {
                    console.log("MaskConfig : removing selected effect")
                    this.selectedEffectId = undefined;
                    // var postion = editor.selection.end; 
                    // editor.selection = new vscode.Selection(postion, postion);
                } 

                console.log("MaskConfig : selected after remove " + this.selectedEffectId);

            })

            // this.refreshEffects();
        });
    }

    public swapEffects(idOld : number, idOther : number) {
        vscode.workspace.openTextDocument(this.pathMaskJSON).then( document => {
            return vscode.window.showTextDocument(document)
        }).then((editor)=> {
            if (!this.maskJSON) return;
            // this.maskJSON?.effects.splice(id , 1);
            const effect = this.maskJSON.effects[idOld];
            this.maskJSON.effects.splice(idOld, 1);
            
            if (idOther == null) {
                this.maskJSON.effects.push(effect)
                if (idOld === this.selectedEffectId) this.selectedEffectId = this.maskJSON.effects.length - 1;
            } else {
                idOther = idOld < idOther ? idOther - 1 : idOther;
                this.maskJSON.effects.splice(idOther, 0, effect);
                if (idOld === this.selectedEffectId) this.selectedEffectId = idOther;
            }

            const newConfigString = jsonPrettyArray(this.maskJSON)

            editor.edit((builder) => {

                builder.delete(new vscode.Range(0, 0, editor.document.lineCount , 0) )
                builder.insert(new vscode.Position(0, 0), newConfigString);

            })

        })
    }

    public addEffect(effectObject : object) {
        vscode.workspace.openTextDocument(this.pathMaskJSON).then( document => {
            return vscode.window.showTextDocument(document)
        }).then((editor)=> {
            if (!this.maskJSON) return;
            // this.maskJSON?.effects.splice(id , 1);
            // this.maskJSON.effects[idOld];

            const newEffect = effectObject as t.TypeOf<typeof Effect>
            this.maskJSON.effects.unshift(newEffect);

            if (this.selectedEffectId) this.selectedEffectId++; // add new always in front 

            const newConfigString = jsonPrettyArray(this.maskJSON)

            editor.edit((builder) => {

                builder.delete(new vscode.Range(0, 0, editor.document.lineCount , 0) )
                builder.insert(new vscode.Position(0, 0), newConfigString);

            })

        })
    }

    public parseConfig() {
        // ! need to check if mask.json opened in other tabs 

        if(!vscode.workspace.workspaceFolders) 
        {
            console.log("No folder opened!");
            return false;
        }

        const dir = vscode.workspace.workspaceFolders[0].uri.fsPath;


        this.pathMaskJSON = path.join(dir, "mask.json");
        // console.log("mask.json path : " + this.pathMaskJSON);


        const currentDocument = vscode.window.activeTextEditor?.document;
        if (currentDocument?.uri.fsPath === this.pathMaskJSON) 
        {
            this.rawMaskJSON = currentDocument.getText();
        } else {
            this.rawMaskJSON = fs.readFileSync(this.pathMaskJSON, 'utf8');
        }

        try {
            this.sourceMaskJSON = jsonMap.parse(this.rawMaskJSON);
            
        } catch (error) {
            console.log("MaskConfig : json parsing error");
            console.log(error)
            return false;
            // vscode.window.showErrorMessage(error);
            // console.log(error);
        }

        if (this.sourceMaskJSON === undefined) {
            vscode.window.showErrorMessage("mask json source is undefined")
            return false;
        }

        this.maskJSON = this.sourceMaskJSON.data as t.TypeOf<typeof MaskJSON>;

        const maskDecode = MaskJSON.decode(this.maskJSON);
        if (maskDecode._tag === "Left")
        {
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

            console.log(errors)
            vscode.window.showErrorMessage(errMsg);
            return;
        } 


        if (this.sourceMaskJSON?.pointers === undefined) 
        {
            vscode.window.showErrorMessage("source map pointers is undefined")
            return false;
        }

        this.maskLinePointers = this.sourceMaskJSON?.pointers;

        return true;

    }


    // Values returned in the callback of `hotRequire` must
    // have a `dispose` function.
    dispose() {}
}