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
    // private effectsTree : TreeView;

    constructor() {
        vscode.window.setStatusBarMessage("wzp aaan");
        vscode.window.showInformationMessage('Hello!');

        this.refreshEffects();
    }


    public showConfigAt(pointer : Record<jsonMap.PointerProp, jsonMap.Location>) {

        vscode.workspace.openTextDocument(this.pathMaskJSON).then( document => {
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
        }).then(()=>{}, (err)=>{
            console.log(err);
        });
    }

    // todo 
    private showConfig() {

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
            
            editor.edit((builder) => {
                
                builder.delete(new vscode.Range(0, 0, editor.document.lineCount , 0) )
                builder.insert(new vscode.Position(0,0), newConfigString);

                var postion = editor.selection.end; 
                editor.selection = new vscode.Selection(postion, postion);
            })

            
            // this.refreshEffects();
        });



    }

    public refreshEffects() {
        // ! need to check if mask.json opened in other tabs 

        if(!vscode.workspace.workspaceFolders) 
        {
            console.log("No folder opened!");
            return;
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

        this.sourceMaskJSON = jsonMap.parse(this.rawMaskJSON);

        if (this.sourceMaskJSON === undefined) {
            vscode.window.showErrorMessage("mask json source is undefined")
            return;
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
                        return 'lol';
                        // `YOINKS! You forgot to add "${keys.join(',')}" at "${path.join('/')}".`,
                    }
                    }
                });

            errMsg = errMsg.slice(0, -2);

            console.log(errors)
            vscode.window.showErrorMessage(errMsg);
            return;
        } 


        if (this.sourceMaskJSON?.pointers === undefined) 
        {
            vscode.window.showErrorMessage("source map pointers is undefined")
            return;
        }

        this.maskLinePointers = this.sourceMaskJSON?.pointers;

    }


    // Values returned in the callback of `hotRequire` must
    // have a `dispose` function.
    dispose() {}
}