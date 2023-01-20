import * as vscode from "vscode";
import * as fs from 'fs';
import * as path from 'path';
import { MaskJSON } from "./types"
import * as t from "io-ts";
import * as jsonMap from "json-source-map";
import { jsonPrettyArray } from "./utils/jsonStringify";
import {report, reportOne} from "io-ts-human-reporter"

// class MaskTreeItem extends tree_item{
//     public pointer : Record<jsonMap.PointerProp, jsonMap.Location>;

//     public constructor(label: string, pointer: Record<jsonMap.PointerProp, jsonMap.Location>) {
//         super(label)
//         this.pointer = pointer;
//         // console.log(this.pointer)
//         this.pointer = pointer;
//     }

// }

// class MaskTreeView extends tree_view {
//     public constructor((...args: tree_item[]) => any) {

//     }
// }


export class MaskConfig {

    public maskJSON : t.TypeOf<typeof MaskJSON> | undefined;
    private sourceMaskJSON : jsonMap.ParseResult | undefined;
    public maskLinePointers : jsonMap.Pointers = {};
    public rawMaskJSON : string = "";
    private pathMaskJSON : string = "";
    public selectedEffectId : number | undefined;
    public onConfigUpdate : () => void = ()=>{};
    public deleteFromUILock : boolean = false;

    constructor() {
        vscode.window.showInformationMessage('Hello!');

        // this.refreshEffects();

        vscode.workspace.onDidChangeTextDocument((event)=>{

            if (this.isSameDocument(event.document, "mask.json")) {

                if (event.contentChanges === undefined || event.contentChanges.length === 0) return;

                const newChar = event.contentChanges[0].text;
                console.log("MaskConfig : updated mask.json \n");

                if (this.deleteFromUILock) {
                    this.deleteFromUILock = false;
                    console.log("MaskConfig : undo lock");
                } else {
                    console.log("MaskConfig : seems like undo or user typing in mask.json")
                    this.selectedEffectId = undefined;
                }

                this.refreshEffects();

                if (this.selectedEffectId !== undefined)
                    this.showEffect(this.selectedEffectId);

                if (this.onConfigUpdate === undefined) return;
                
                this.onConfigUpdate();
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

    public showEffect(id : number) {
        const key = "/effects/" + id;
        const pointer = this.maskLinePointers[key]
        console.log("MaskConfig : select effect " + key);

        return this.showConfigAt(pointer).then((val)=>{
            return Promise.resolve(val)
        });
    }

    public showConfigAt(pointer : Record<jsonMap.PointerProp, jsonMap.Location>) {

        return vscode.workspace.openTextDocument(this.pathMaskJSON).then( document => {
            // console.log(document.uri);
            // after opening the document, we set the cursor 
            // and here we make use of the line property which makes imo the code easier to read
            return vscode.window.showTextDocument(document)
        }).then((editor)=> {
            console.log("showing config at ");
            console.log(pointer)
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
        vscode.workspace.openTextDocument(this.pathMaskJSON).then( document => {
            // console.log(document.uri);
            // after opening the document, we set the cursor 
            // and here we make use of the line property which makes imo the code easier to read
            return vscode.window.showTextDocument(document)
        }).then((editor)=> {
            
            this.maskJSON?.effects.splice(id , 1);

            // const newConfigString = this.prettyJson(this.maskJSON)
            const newConfigString = jsonPrettyArray(this.maskJSON)
            
            this.deleteFromUILock = true;
            console.log("MaskConfig : setting lock");

            editor.edit((builder) => {
                
                builder.delete(new vscode.Range(0, 0, editor.document.lineCount , 0) )
                builder.insert(new vscode.Position(0,0), newConfigString);


                if (this.selectedEffectId === undefined) {
                    console.log("MaskConfig : removing from config, but selected is undefined!");
                    return;
                }

                if (id < this.selectedEffectId) {
                    this.selectedEffectId = Math.max(0, this.selectedEffectId - 1);
                    console.log("MaskConfig : removing after selected " + this.selectedEffectId);
                } else if (id === this.selectedEffectId) {
                    console.log("MaskConfig : removing selected effect")
                    this.selectedEffectId = undefined;
                    // var postion = editor.selection.end; 
                    // editor.selection = new vscode.Selection(postion, postion);
                } 

                console.log("MaskConfig : selected after remove " + this.selectedEffectId);

                

            })

            return Promise.resolve(id);
            
            // this.refreshEffects();
        });



    }

    public refreshEffects() {
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