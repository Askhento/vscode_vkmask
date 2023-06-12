import * as vscode from "vscode";
import * as fs from 'fs';
import * as path from 'path';

import { logger } from "./Logger";
const print = (...args: any) => logger.log(__filename, ...args);

export class HotReload {


    constructor(private readonly _extensionUri: vscode.Uri) {

    }

    copyFilesToMask() {
        if (!vscode.workspace.workspaceFolders) {
            print("No folder opened!");
            return false;
        }

        const maskDir = vscode.workspace.workspaceFolders[0].uri;

        const scriptsDest = vscode.Uri.joinPath(maskDir, 'ScriptEngine')

        const scriptsDir = vscode.Uri.joinPath(this._extensionUri, "res", "ScriptEngine");

        fs.mkdirSync(scriptsDest.fsPath, { recursive: true });

        fs.readdirSync(scriptsDir.fsPath).forEach((file: string) => {
            print(file);

            fs.copyFile(
                path.join(scriptsDir.fsPath, file),
                path.join(scriptsDest.fsPath, file),
                () => { print(`${file} is copied`) }
            )
        })
    }

    inject() {

        if (!vscode.workspace.workspaceFolders) {
            print("No folder opened!");
            return false;
        }
        const dir = vscode.workspace.workspaceFolders[0].uri.fsPath;


        const filePath = path.join(dir, "ScriptEngine", "Load.as");

        if (!fs.existsSync(filePath)) {
            // ? need to create here
            print("Load.as does not exist ");
            return;
        }


        const textLines = fs.readFileSync(filePath, 'utf8').split("\n");

        let functionLine = -1;
        const functionDeclaration = "void LoadMask(String filepath)"

        for (let i = 0; i < textLines.length; i++) {
            if (textLines[i].trim().startsWith(functionDeclaration)) {
                functionLine = i;
                break;
            }
        }

        if (functionLine < 0) {
            print("Func line not found in Load.as");
            return;
        }



        // const functionLine = textLines.indexOf("void LoadMask(String filepath)");
        print("function line = " + functionLine);

        // let insertIndex = textLines[functionLine].indexOf("//");
        // insertIndex = insertIndex < 0 ? textLines[functionLine].length - 1 : insertIndex;
        // if (insertIndex < 0) {
        //     textLines[functionLine].replace(/\/\/*/ig, "")
        // } else {

        // }    
        const testComment = " // wazzup new from script!";

        // matching comment line on function declaration 
        let newLine = textLines[functionLine].replace(/\/\/.*/, testComment);

        // print(newLine)

        if (newLine == textLines[functionLine]) {
            newLine = textLines[functionLine] + testComment;
            print(newLine)
        }

        // textLines[functionLine] = newLine; 

        const [openBracketLine, closeBracketLine] = this.getBlockBorders(textLines, functionLine);


        if (closeBracketLine < 0) {
            print("Function close bracket not found " + closeBracketLine)
            return;
        }

        print("found brackets open : " + openBracketLine + ", close : " + closeBracketLine);

        const indexLevelClone = textLines[closeBracketLine].replace(/}.*/, "");
        const injectLine = `\t${indexLevelClone}//injectStart\n\t${indexLevelClone}hotReloader.Attach();\n\t${indexLevelClone}//injectEnd`;

        textLines.splice(closeBracketLine, 0, injectLine);

        const newTextLines = textLines.join("\n")
        fs.writeFileSync(filePath, newTextLines, { encoding: "utf8" })

    }

    getBlockBorders(textLines: string[], functionLine: number): [number, number] {
        let openedBracketsCount = 0;
        let closeBracketLine = -1;
        let openBracketLine = -1;


        let foundClose = false;
        for (let index = functionLine; index < textLines.length && !foundClose; index++) {
            const line = textLines[index];
            for (const char of line) {
                if (char === "{") {
                    if (openedBracketsCount === 0) {
                        openBracketLine = index;
                    }
                    openedBracketsCount++;
                    // print("open " + index);
                }
                if (char === "}") {
                    // print("close " + index);
                    openedBracketsCount--;
                    if (openedBracketsCount === 0) {
                        closeBracketLine = index;
                        foundClose = true;
                    }
                }
            }

        }

        return [openBracketLine, closeBracketLine];
    }


}