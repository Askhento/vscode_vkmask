import * as vscode from "vscode";
import * as fs from 'fs';
import * as path from 'path';
import * as rd from 'readline';
import { TreeView, TreeItem } from "./tree";
import { MaskJSON } from "./types"
import * as t from "io-ts";
import { PathReporter } from 'io-ts/lib/PathReporter'
import * as jsonMap from "json-source-map";


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
    public rawMaskJSON : string = "";
    private pathMaskJSON : string = "";
    private effectsTree : TreeView;
    private effectsLineNumber : number = 0;
    private maskLinePointers : jsonMap.Pointers = {};

    constructor() {
        vscode.window.setStatusBarMessage("wzp aaan");
        vscode.window.showInformationMessage('Hello!');


        this.parseMaskJSON();
        
        this.effectsTree = new TreeView((item : TreeItem) => this.onEffectClicked(item));
        // this.effectsTree = new tree_view((item : tree_item)=> {
        //     // console.log("yoyyo")
        //     // console.log(item)
        //     console.log(item.label)
        //     // const pointer = item.data;
        //     // if (item.data === undefined) return;

        //     console.log(item)

        //     // // return;

        // });
        
        this.refreshEffects();

        vscode.window.registerTreeDataProvider('effects_tree_view', this.effectsTree);


        // const item = vscode.window.createStatusBarItem();
        // item.text = "Hello World!";
        // item.color = "yellow";
        // item.show();

        // vscode.workspace.findFiles("*.*").then(files=>{
        //     // console.log(files);
        //     files.forEach(file=>{
        //         console.log(file.fsPath);
        //     })
        // })
    }

    public onEffectClicked(item : TreeItem) {
        console.log(item.id);
        // console.log(item)
        if (item.id === undefined) return;
        const key = "/effects/" + item.id;
        const pointer = this.maskLinePointers[key];
        console.log(pointer)

        vscode.workspace.openTextDocument(this.pathMaskJSON).then( document => {
            // console.log(document.uri);
            // after opening the document, we set the cursor 
            // and here we make use of the line property which makes imo the code easier to read
            vscode.window.showTextDocument(document).then( editor => {
                    let pos = new vscode.Position(pointer.value.line, 0);
                    let posEnd = new vscode.Position(pointer.valueEnd.line + 1, 0);
                    // here we set the cursor
                    editor.selection = new vscode.Selection(posEnd, pos);
                    // here we set the focus of the opened editor
                    editor.revealRange(new vscode.Range(posEnd, pos));
                }
            );
        });
        // first we open the document
    }

    public refreshEffects() {

        const maskDecode = MaskJSON.decode(this.maskJSON);
        if (maskDecode._tag === "Left")
        {
            console.log(PathReporter.report(maskDecode))
            return;
        } 

        const effects = maskDecode.right.effects;

        if (this.sourceMaskJSON?.pointers === undefined) return;
        
        this.maskLinePointers = this.sourceMaskJSON?.pointers;

        effects.forEach((effect, index) => {
            // console.log(effect.name)
            const pointer = this.maskLinePointers["/effects/" + index];
            // console.log(pointer)
            const newItem = new TreeItem(effect.name);
            newItem.id = index.toString();
            this.effectsTree.addItem(newItem);

        })
    }

    public parseMaskJSON() {
        if(!vscode.workspace.workspaceFolders) 
        {
            console.log("No folder opened!");
            return;
        }

        const dir = vscode.workspace.workspaceFolders[0].uri.fsPath;

        this.pathMaskJSON = path.join(dir, "mask.json");
        console.log("mask.json path : " + this.pathMaskJSON);

        this.rawMaskJSON = fs.readFileSync(this.pathMaskJSON, 'utf8');


        this.maskJSON = JSON.parse(this.rawMaskJSON);
        // console.log(this.maskJSON)

        const rawLines = this.rawMaskJSON.split("\n");

        const effectsRegExp = new RegExp("effects");

        this.effectsLineNumber = 0;
        rawLines.forEach((line, lineNumber) => {
            if(line.match(effectsRegExp)) {
                console.log("effects start " + lineNumber);
                this.effectsLineNumber = lineNumber;
            }
        });
        this.sourceMaskJSON = jsonMap.parse(this.rawMaskJSON);

        // this.sourceMaskJSON = jsonMap.stringify(this.maskJSON,, null, 2);
        // const jsonPointers = this.sourceMaskJSON.pointers;


        // console.log(jsonPointers)
        // for (const key in jsonPointers) {
        //     if (Object.prototype.hasOwnProperty.call(jsonPointers, key)) {
        //         const pointer = jsonPointers[key];
        //         console.log(key)
        //     }
        // }


    }




    // public refresh() {
    //     if (vscode.workspace.workspaceFolders) {
    //         this.m_data = [];
    //         this.read_directory(vscode.workspace.workspaceFolders[0].uri.fsPath);
    //         this.m_onDidChangeTreeData.fire(undefined);
    //     } 
    // }

    // Values returned in the callback of `hotRequire` must
    // have a `dispose` function.
    dispose() {}
}