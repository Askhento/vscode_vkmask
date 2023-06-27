import { Disposable, Webview, window, Uri, ViewColumn, WebviewViewProvider, WebviewView } from "vscode";
import * as vscode from "vscode";
import { MaskConfig } from "../MaskConfig";
import { logger } from "../Logger";
const print = (...args: any[]) => logger.log(__filename, ...args);
import { assetWatcher } from "../AssetWatcher";
import { userSettings } from "../UserSettings";
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
    private logEvent: Disposable | undefined;
    private readyEvent: Disposable | undefined;

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

        // this.readyEvent = webviewView.webview.onDidReceiveMessage(
        //     (message) => {
        //         if (message.type === "webviewReady") {
        //             print("receivening webviewReady 2", message.type)
        //             this.init();
        //         }
        //         this.readyEvent?.dispose();
        //     }
        // )    




        webviewView.webview.onDidReceiveMessage(async data => {
            switch (data.type) {
                // case 'effectDelete':
                //     {
                //         const id = data.value;
                //         print("received delete effect " + id);
                //         this.maskConfig.removeFromConfig(id);
                //         this.setupEditLock();
                //         break;
                //     }

                // case 'effectSwap':
                //     {
                //         print("received swap effects");
                //         const [idOld, idOther] = data.value;
                //         this.maskConfig.swapEffects(idOld, idOther);
                //         this.setupEditLock();
                //         break;
                //     }

                // case 'effectAdd':
                //     {
                //         print("received add effect");
                //         const newEffect = data.value;
                //         this.maskConfig.addEffect(newEffect);

                //         this.setupEditLock();
                //         break;
                //     }

                // case 'effectDisabled':
                //     {
                //         print("received effect disabled");
                //         const { effectId, disabled } = data.value;
                //         this.maskConfig.addPropertyToEffect(effectId, { disabled: disabled });

                //         this.setupEditLock();
                //         break;
                //     }

                // case 'effectSelected':
                //     {
                //         const id = data.value;
                //         print("received selected id = " + id);
                //         // ? check id ?
                //         this.maskConfig.selectedEffectId = id;
                //         this.maskConfig.showEffect(id);
                //         break;
                //     }
                // case 'effectDeselected':
                //     {
                //         print("received deselect effects");
                //         this.maskConfig.clearSelection()
                //         break;
                //     }

                case 'effectsUpdate':
                    {
                        print("received update effect");
                        await this.maskConfig.updateEffects(data.value);

                        break;
                    }
                case 'selectionUpdate':
                    {
                        print("received selection update")
                        const newSelection = data.value;
                        if (newSelection === undefined) {
                            // this.maskConfig.selectedEffectId = undefined;
                            this.maskConfig.clearSelection();
                        } else {
                            // ?add type check 
                            const id = newSelection.id;
                            this.maskConfig.selectedEffectId = id;
                            this.maskConfig.showEffect(id);
                        }
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
                case "moveView":
                    {
                        print("received moveView");
                        vscode.commands.executeCommand('vkmask.sidepanel.focus').then(() => {
                            vscode.commands.executeCommand('workbench.action.moveFocusedView');
                        })
                        break;
                    }
                case "openExtensionSettings":
                    {
                        print("received openExtensionSettings");
                        vscode.commands.executeCommand( 'workbench.action.openSettings', 'vkmask' );

                        break;
                    }
                case "webviewReady":
                    {
                        print("received webviewReady");
                        this.init();
                        break;
                    }
                case "showError":
                    {
                        print("received showError", data.value);
                        const {path  : errorPath, location, token} = data.value;

                        if (errorPath !== undefined) {
                            const errorPointer = this.maskConfig.maskLinePointers[errorPath]
                            this.maskConfig.showConfigAtPointer(errorPointer);
                        } else if (location !== undefined && token !== undefined)
                        {
                            const locationStart = location;
                            const tokenLength = token.length;
                            const locationEnd = locationStart + tokenLength;
                            this.maskConfig.showConfigAtLocation(locationStart, locationEnd);
                        }
                        break;
                    }

                    
            }
        });

        webviewView.onDidChangeVisibility(() => {
            const visible = this._view?.visible
            //  ??? check if need to parse ??? to save resources and get less flicker
            if (visible) {
                print("webview visible update effects");
                this.updateAppState();
                assetWatcher.searchAssets();
                // const parseResult = this.maskConfig.parseConfig();
                // if (this.maskConfig.pathMaskJSON === undefined) {
                //     print("mask.json not found, show welcome")
                //     this.sendShowWelcome();
                // } else {
                //     print("Change visibility sending effects")
                //     assetWatcher.searchAssets();
                //     this.sendEffects();
                // }




            }
        }, this);

        // !   trying to fix not updating view
        // !   document should be ready

        // setTimeout(() => {
        // }, 1000);

        // this.init();




    }

    public updateAppState() {

        // ?? check if need and update
        // for example mask.json file didn't changed

        const parseResult = this.maskConfig.parseConfig()

        if (this.maskConfig.pathMaskJSON === undefined) {
            print("mask.json not found, show welcome")
            this.sendShowWelcome();
        } else {
            if (parseResult.success)
                this.sendEffects();
            else {
                this.sendError(parseResult.message)
            }
        }
    }


    private init() {
        print("INIT")
        // // when opening selection fires without doing anything
        // // this will not do any harm, just to keep clean the logs
        // this.maskConfig.setupSelectLock();

        this.maskConfig.onTextEdit = () => {
            print("on text edit call")
            // ! if error, then need to send error
            this.maskConfig.selectedEffectId = undefined;
            this.updateAppState();

        }

        this.maskConfig.onTextSelect = () => {
            // this.maskConfig.clearSelection();
            this.sendDeselect();
            // if (this.maskConfig.selectedEffectId !== undefined) {
            //     this.maskConfig.selectedEffectId = undefined;
            //     this.sendEffects();
            // }
        }

        this.maskConfig.onFileSave = () => {
            // !!! seems like also require lock 
            print("on file save call")
            this.maskConfig.selectedEffectId = undefined; // ???? maybe should keep ????
            this.updateAppState();
        }



        // userSettings.init(this._extensionUri) // will resolve in promise so not blocking



        // on init need to show mask.json only! so there is no misatakes working in a wrong file
        const tabsToClose = vscode.window.tabGroups.all.map(tg => tg.tabs).flat();
        // ? maybe close only files that are in old project, could be usefull for opened api reference 
        vscode.window.tabGroups.close(tabsToClose).then(() => {
            this.maskConfig.showConfig();
        })


        assetWatcher.removeAllListeners();
        assetWatcher.on("assetsChanged", (e) => {
            this.sendAssets(e);
        });
        assetWatcher.searchAssets();

        // !!! filter changed from other extensions
        userSettings.removeAllListeners();
        userSettings.on("configChanged", (data) => {
            this.sendUserSettings(data)
        })


        //?  there will be the case when user deletes mask.json and i should cover it also 
        this.updateAppState();
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
                print("new project folder", fileUri.fsPath)
                const newProjectDir = fileUri;
                const sampleProjectDir = vscode.Uri.joinPath(this._extensionUri, "res", "empty-project");
                // print(sampleProjectDir)

                copyRecursiveSync(sampleProjectDir.fsPath, newProjectDir.fsPath);
                this.openProjectFolder(newProjectDir)
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
                this.openProjectFolder(fileUri[0])
            }
        });
    }

    private async openProjectFolder(newFolderURI: Uri) {
        // will close all other workspace folders, but should anyways have only one at a time
        // ? maybe should call this on init so it is clean which folder I am working on 

        // const numFoldersToClose = vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders.length : 0;
        // const workspaceName = newFolderURI.fsPath.split(path.sep).pop();
        // vscode.workspace.updateWorkspaceFolders(0, numFoldersToClose, { name: workspaceName, uri: newFolderURI });

        await vscode.commands.executeCommand(`vscode.openFolder`, newFolderURI)
    }

    public sendEffects() {
        if (this._view) {
            if (this.maskConfig.maskJSON !== undefined) {
                print("sending effects to webview test");
                this._view.webview.postMessage({ type: 'updateEffects', effects: this.maskConfig.maskJSON?.effects });
            } else {
                print("Undefined is not good maskJSON!");
                print("TODO : SEND ERROR TO WEBVIEW, PARSE FALIURE")
            }
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
        if (this._view) {
            print("sending assets to webview");
            this._view.webview.postMessage({ type: 'assetsChanged', assets: e.assets });
        } else {
            print("send view is null ")
        }
    }

    public sendUserSettings(userSettings: any) {
        if (this._view) {
            print("sending userSettings to webview");
            this._view.webview.postMessage({ type: 'userSettings', userSettings });
        } else {
            print("send view is null ")
        }
    }

    public requestLogs() {
        if (this._view) {
            print("requesting logs");
            this._view.webview.postMessage({ type: 'requestLogs' });
            //!!! need to usubscribe !!!

            return new Promise(resolve => {

                this.logEvent = this._view?.webview.onDidReceiveMessage(
                    (message) => {
                        this.logEvent?.dispose();
                        print("receivening logs")
                        if (message.type === "returnLogs")
                            resolve(message);
                    }
                )

            })
        } else {
            print("view is null ")
            return Promise.resolve("view is null")
        }

    }

    public sendError(message: string) {
        if (this._view) {
            print("sending error");
            print("error itself", message)
            this._view.webview.postMessage({ type: 'error', error: message });
        } else {
            print("view is null ")
            return Promise.resolve("view is null")
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
        const stylesUri = getUri(webview, extensionUri, ["out", "panels", "webview-build", "bundle.css"]);
        // The JS file from the Svelte build output
        const scriptUri = getUri(webview, extensionUri, ["out", "panels", "webview-build", "bundle.js"]);
        const codiconsUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'node_modules', '@vscode/codicons', 'dist', 'codicon.css'));

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

}
