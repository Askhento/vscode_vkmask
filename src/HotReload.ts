import * as vscode from "vscode";
import * as fs from 'fs';
import * as path from 'path';



export class HotReload {


    constructor(private readonly _extensionUri: vscode.Uri) {

    }

    copyFilesToMask() {
        if(!vscode.workspace.workspaceFolders) 
        {
            console.log("No folder opened!");
            return false;
        }

        const maskDir = vscode.workspace.workspaceFolders[0].uri;

        const scriptsDest = vscode.Uri.joinPath(maskDir, 'ScriptEngine')

        const scriptsDir = vscode.Uri.joinPath(this._extensionUri, "res", "angelscript");

        fs.mkdirSync(scriptsDest.fsPath, { recursive: true });

        fs.readdirSync(scriptsDir.fsPath).forEach((file : string)=>{
            console.log(file);

            fs.copyFile(
                path.join(scriptsDir.fsPath, file),
                path.join(scriptsDest.fsPath, file),
                ()=>{console.log(`${file} is copied`)}
            )
        })
    }

    inject() {

        if(!vscode.workspace.workspaceFolders) 
        {
            console.log("No folder opened!");
            return false;
        }
        const dir = vscode.workspace.workspaceFolders[0].uri.fsPath;


        const filePath = path.join(dir, "ScriptEngine", "Load.as");

        if (!fs.existsSync(filePath)) {
            // ? need to create here
            console.log("Load.as does not exist ");
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
            console.log("Func line not found in Load.as");
            return;
        }


        
        // const functionLine = textLines.indexOf("void LoadMask(String filepath)");
        console.log("function line = " + functionLine);

        // let insertIndex = textLines[functionLine].indexOf("//");
        // insertIndex = insertIndex < 0 ? textLines[functionLine].length - 1 : insertIndex;
        // if (insertIndex < 0) {
        //     textLines[functionLine].replace(/\/\/*/ig, "")
        // } else {

        // }    
        const testComment = " // wazzup new from script!";

        // matching comment line on function declaration 
        let newLine = textLines[functionLine].replace(/\/\/.*/, testComment);

        // console.log(newLine)

        if (newLine == textLines[functionLine]) {
            newLine = textLines[functionLine] + testComment;
            console.log(newLine)
        }

        // textLines[functionLine] = newLine; 
        
        const [openBracketLine, closeBracketLine] = this.getBlockBorders(textLines, functionLine);


        if (closeBracketLine < 0) {
            console.log("Function close bracket not found " + closeBracketLine)
            return;
        }

        console.log("found brackets open : " + openBracketLine + ", close : " + closeBracketLine);

        const indexLevelClone = textLines[closeBracketLine].replace(/}.*/, "");
        const injectLine = `\t${indexLevelClone}//injectStart\n\t${indexLevelClone}hotReloader.Attach();\n\t${indexLevelClone}//injectEnd`;

        textLines.splice(closeBracketLine, 0, injectLine);

        const newTextLines = textLines.join("\n")
        fs.writeFileSync(filePath, newTextLines, {encoding : "utf8"})

    }

    getBlockBorders(textLines : string[], functionLine : number) : [number, number] {
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
                    // console.log("open " + index);
                } 
                if (char === "}") {
                    // console.log("close " + index);
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