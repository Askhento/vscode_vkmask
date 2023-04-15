import { Disposable, Webview, window, Uri, ViewColumn, WebviewViewProvider, WebviewView } from "vscode";
import * as vscode from "vscode";
import { MaskConfig } from "../MaskConfig";
import { logger } from "../logger";
const print = logger(__filename);
import { assetWatcher } from "../AssetWatcher";
import { getUri } from "../utils/getUri";
import { getNonce } from "../utils/getNonce";
import { copyRecursiveSync } from "../utils/copyFilesRecursive"
import path from "path";

/**
 * This class manages the state and behavior of HelloWorld webview panels.
 *
 * It contains all the data and methods for:
 *
 * - Creating and rendering HelloWorld webview panels
 * - Properly cleaning up and disposing of webview resources when the panel is closed
 * - Setting the HTML (and by proxy CSS/JavaScript) content of the webview panel
 * - Setting message listeners so data can be passed between the webview and extension
 */
export class MainSidebarProvider implements WebviewViewProvider {

    public static readonly viewId = 'vkmask.sidepanel';
    public maskConfig = new MaskConfig();

    private _view?: WebviewView;

    constructor(
        private readonly _extensionUri: Uri,
    ) {
    }


    public resolveWebviewView(
        webviewView: WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {

        this._view = webviewView;
        webviewView.webview.options = {
            // Allow scripts in the webview
            enableScripts: true,

            // getUri(webviewView.webview, this._extensionUri, ["webview-ui", "public"])

            localResourceRoots: [
                this._extensionUri,
            ]
        };

        webviewView.webview.html = this._getWebviewContent(webviewView.webview, this._extensionUri);

        webviewView.webview.onDidReceiveMessage(async data => {
            switch (data.type) {
                case 'effectDelete':
                    {
                        const id = data.value;
                        print("received delete effect " + id);
                        this.maskConfig.removeFromConfig(id);
                        this.setupEditLock();
                        break;
                    }

                case 'effectSwap':
                    {
                        print("received swap effects");
                        const [idOld, idOther] = data.value;
                        this.maskConfig.swapEffects(idOld, idOther);
                        this.setupEditLock();
                        break;
                    }

                case 'effectAdd':
                    {
                        print("received add effect");
                        const newEffect = data.value;
                        this.maskConfig.addEffect(newEffect);

                        this.setupEditLock();
                        break;
                    }

                case 'effectDisabled':
                    {
                        print("received effect disabled");
                        const { effectId, disabled } = data.value;
                        this.maskConfig.addPropertyToEffect(effectId, { disabled: disabled });

                        this.setupEditLock();
                        break;
                    }


                case 'effectsUpdate':
                    {
                        print("received update effect");

                        this.setupEditLock();
                        this.maskConfig.updateEffects(data.value);


                        break;
                    }
                case 'effectSelected':
                    {
                        const id = data.value;
                        print("received selected id = " + id);
                        // ? check id ?
                        this.maskConfig.selectedEffectId = id;
                        this.maskConfig.showEffect(id);
                        this.setupSelectLock();
                        break;
                    }
                case 'effectDeselected':
                    {
                        print("received deselect effects");
                        this.maskConfig.clearSelection()
                        this.setupSelectLock();
                        break;
                    }

                case 'openProject':
                    {
                        print("received open project command")
                        this.openProject();
                        break;
                    }

                case "createNewProject":
                    {
                        print("received create new project")
                        this.createNewProject();
                        break;
                    }

            }
        });

        webviewView.onDidChangeVisibility(() => {
            const visible = this._view?.visible
            if (visible) {
                print("webview visible update effects");
                this.maskConfig.parseConfig();
                this.sendEffects();
                assetWatcher.searchAssets();

            }
        }, this);

        // !trying to fix not updating view
        // !document should be ready
        setTimeout(() => {
            this.maskConfig.onTextEdit = () => {
                // ! if error, then need to send error
                this.maskConfig.selectedEffectId = undefined;
                this.maskConfig.parseConfig();
                this.sendEffects();
            }

            this.maskConfig.onTextSelect = () => {
                // this.maskConfig.clearSelection();
                this.sendDeselect();
                // if (this.maskConfig.selectedEffectId !== undefined) {
                //     this.maskConfig.selectedEffectId = undefined;
                //     this.sendEffects();
                // }
            }

            assetWatcher.on("assetsChanged", (e) => {
                this.sendAssets(e);
            });
            assetWatcher.searchAssets();

            console.log("parsing main!");
            this.maskConfig.parseConfig();

            // on init need to show mask.json only!
            const tabsToClose = vscode.window.tabGroups.all.map(tg => tg.tabs).flat();
            // ? maybe close only files that are in old project, could be usefull for opened api reference 
            vscode.window.tabGroups.close(tabsToClose).then(() => {
                this.maskConfig.showConfig();
            })

            if (this.maskConfig.pathMaskJSON === undefined) {
                this.sendShowWelcome();
            } else {
                this.sendEffects();
            }

        }, 1000);


    }

    // this should be moved to extesnion.ts i guess
    private createNewProject() {
        // ! need to check if project already there !!!

        const options: vscode.SaveDialogOptions = {
            saveLabel: 'Create',
            title: "Create mew vkmask project"
        };

        vscode.window.showSaveDialog(options).then(async fileUri => {
            if (fileUri) {
                console.log("new project folder", fileUri.fsPath)
                const newProjectDir = fileUri;
                const sampleProjectDir = vscode.Uri.joinPath(this._extensionUri, "res", "empty-project");
                // console.log(sampleProjectDir)

                copyRecursiveSync(sampleProjectDir.fsPath, newProjectDir.fsPath);
                this.changeWorkspaceFolder(newProjectDir)
            }
        })
    }

    private openProject() {
        // ? need to check if new folder have mask.json
        const options: vscode.OpenDialogOptions = {
            canSelectMany: false,
            openLabel: 'Open',
            canSelectFiles: false,
            canSelectFolders: true,
            title: "Open existing vkmask project"
        };

        vscode.window.showOpenDialog(options).then(async fileUri => {
            if (fileUri && fileUri[0]) {
                print('Selected file: ' + fileUri[0].fsPath);
                this.changeWorkspaceFolder(fileUri[0])
            }
        });
    }

    private changeWorkspaceFolder(newFolderURI: Uri) {
        // will close all other workspace folders, but should anyways have only one at a time
        // ? maybe should call this on init so it is clean which folder I am working on 

        const numFoldersToClose = vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders.length : 0;
        const workspaceName = newFolderURI.fsPath.split(path.sep).pop();
        vscode.workspace.updateWorkspaceFolders(0, numFoldersToClose, { name: workspaceName, uri: newFolderURI });
    }

    private setupSelectLock() {
        this.maskConfig.selectionLockCallback = () => {
            // this.sendEffects();
            this.maskConfig.selectionLockCallback = undefined;
            //   this.maskConfig.saveConfig();
        }
    }

    private setupEditLock() {
        this.maskConfig.editLockCallback = () => {
            // this.maskConfig.parseConfig();
            // this.sendEffects();
            this.maskConfig.editLockCallback = undefined;
            // this.maskConfig.showEffect(this.maskConfig.selectedEffectId);
            // this.maskConfig.saveConfig(); // edits completed now need to save so HotReload does it's job
            this.maskConfig.selectionLockCallback = () => {
                // restore on the second event
                // ! first cb comes from removing whole json
                // ! second one from selection
                this.maskConfig.selectionLockCallback = undefined;

                // this.maskConfig.selectionLockCallback = () => {
                //     this.maskConfig.selectionLockCallback = undefined;

                // }
            }
        }
    }

    public sendEffects() {
        if (this._view) {
            print("sending effects to webview test");
            this._view.webview.postMessage({ type: 'updateEffects', effects: this.maskConfig.maskJSON?.effects });
        }
    }

    public sendShowWelcome() {
        if (this._view) {
            print("sending show welcome to webview");
            this._view.webview.postMessage({ type: 'showWelcome' });
        }
    }


    public sendDeselect() {
        if (this._view) {
            print("sending deselect to webview");
            this._view.webview.postMessage({ type: 'deselect' });
        }
    }



    public sendAssets(e: any) {
        print(e)
        if (this._view) {
            print("sending assets to webview");
            this._view.webview.postMessage({ type: 'assetsChanged', assets: e.assets });
        } else {
            print("send view is null ")
        }
    }

    /**
     * Cleans up and disposes of webview resources when the webview panel is closed.
     */
    public dispose() {
        // HelloWorldPanel.currentPanel = undefined;

        // // Dispose of the current webview panel
        // this._panel.dispose();

        // // Dispose of all disposables (i.e. commands) for the current webview panel
        // while (this._disposables.length) {
        //   const disposable = this._disposables.pop();
        //   if (disposable) {
        //     disposable.dispose();
        //   }
        // }
    }

    /**
     * Defines and returns the HTML that should be rendered within the webview panel.
     *
     * @remarks This is also the place where references to the Svelte webview build files
     * are created and inserted into the webview HTML.
     *
     * @param webview A reference to the extension webview
     * @param extensionUri The URI of the directory containing the extension
     * @returns A template string literal containing the HTML that should be
     * rendered within the webview panel
     */
    private _getWebviewContent(webview: Webview, extensionUri: Uri) {
        // The CSS file from the Svelte build output
        const stylesUri = getUri(webview, extensionUri, ["webview-ui", "public", "build", "bundle.css"]);
        // The JS file from the Svelte build output
        const scriptUri = getUri(webview, extensionUri, ["webview-ui", "public", "build", "bundle.js"]);
        const codiconsUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'webview-ui', 'node_modules', '@vscode/codicons', 'dist', 'codicon.css'));

        const nonce = getNonce();
        // <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource}; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">

        // <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource}; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
        // Tip: Install the es6-string-html VS Code extension to enable code highlighting below
        return /*html*/ `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <title>vkmask</title>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta http-equiv="Content-Security-Policy" content="default-src 'none'; font-src ${webview.cspSource} 'unsafe-inline'; img-src ${webview.cspSource}; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}' 'unsafe-inline';">

          <link rel="stylesheet" type="text/css" href="${stylesUri}">
          <link rel="stylesheet" type="text/css" href="${codiconsUri}">

          <script defer nonce="${nonce}" src="${scriptUri}"></script>

        </head>
        <body>
        </body>
      </html>
    `;
    }

    // /**
    //  * Sets up an event listener to listen for messages passed from the webview context and
    //  * executes code based on the message that is recieved.
    //  *
    //  * @param webview A reference to the extension webview
    //  * @param context A reference to the extension context
    //  */
    // private _setWebviewMessageListener(webview: Webview) {
    //   webview.onDidReceiveMessage(
    //     (message: any) => {
    //       const command = message.command;
    //       const text = message.text;

    //       switch (command) {
    //         case "hello":
    //           // Code that should run in response to the hello message command
    //           window.showInformationMessage(text);
    //           return;
    //         // Add more switch case statements here as more webview message commands
    //         // are created within the webview context (i.e. inside media/main.js)
    //       }
    //     },
    //     undefined,
    //     this._disposables
    //   );
    // }
}
