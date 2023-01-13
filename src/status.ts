// https://www.codingwiththomas.com/blog/typescript-vs-code-api-lets-create-a-tree-view-part-2

import * as vscode from "vscode";
export class MyExtension {
    constructor() {
        vscode.window.setStatusBarMessage("wzp aaan");
        // return
        // const item = vscode.window.createStatusBarItem();
        // item.text = "Hello World!";
        // item.color = "yellow";
        // item.show();


        vscode.window.showInformationMessage('Hello!');

        vscode.workspace.findFiles("*.*").then(files=>{
            // console.log(files);
            files.forEach(file=>{
                console.log(file.fsPath);
            })
        })
    }

    // Values returned in the callback of `hotRequire` must
    // have a `dispose` function.
    dispose() {}
}