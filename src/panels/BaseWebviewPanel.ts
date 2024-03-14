import * as vscode from "vscode";
import { getUri } from "../utils/getUri";
import { getNonce } from "../utils/getNonce";
import { messageHandler } from "../MessageHandler";

export class BaseWebviewPanel {
    /**
     * Track the currently panel. Only allow a single panel to exist at a time.
     */
    public currentPanel: vscode.WebviewPanel | undefined;
    private _disposables: vscode.Disposable[] = [];
    public webview: vscode.Webview | undefined;

    constructor(
        private readonly _extensionUri: vscode.Uri,
        private readonly _buildPath: string,
        public readonly viewId: string
    ) {}

    public createOrShow() {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : vscode.ViewColumn.One;

        // If we already have a panel, show it.
        if (this.currentPanel) {
            console.log("base panel just reveal!");
            this.currentPanel.reveal(column);
            return;
        }

        console.log("base panel Will create new!");

        // Otherwise, create a new panel.
        this.currentPanel = vscode.window.createWebviewPanel(this.viewId, this.viewId, column, {
            // Allow scripts in the webview
            enableScripts: true,
            enableCommandUris: true,
            localResourceRoots: [this._extensionUri],
            retainContextWhenHidden: true,
        });

        this.webview = this.currentPanel.webview;

        // Listen for when the panel is disposed
        // This happens when the user closes the panel or when the panel is closed programmatically
        this.currentPanel.onDidDispose(() => this.dispose(), null, this._disposables);

        // Update the content based on view changes
        this.currentPanel.onDidChangeViewState(
            (e) => {
                if (this.currentPanel.visible) {
                    this._update();
                }
            },
            null,
            this._disposables
        );

        // Set the webview's initial html content
        this._update();

        this._disposables.push(messageHandler.bindViewMessageHandler(this.webview, this.viewId));
        // // Handle messages from the webview
        // this.webview.onDidReceiveMessage(
        //     (message) => {
        //         switch (message.command) {
        //             case "alert":
        //                 vscode.window.showErrorMessage(message.text);
        //                 return;
        //         }
        //     },
        //     null,
        //     this._disposables
        // );
    }

    private _update() {
        this.webview.html = this._getWebviewContent();
    }

    /**
     * Defines and returns the HTML that should be rendered within the webview panel.
     *
     * @remarks This is also the place where references to the Svelte webview build files
     * are created and inserted into the webview HTML.
     * @returns A template string literal containing the HTML that should be
     * rendered within the webview panel
     */
    private _getWebviewContent() {
        // The CSS file from the Svelte build output
        const stylesUri = getUri(this.webview, this._extensionUri, [this._buildPath, "bundle.css"]);
        const globalVarsUri = getUri(this.webview, this._extensionUri, [
            this._buildPath,
            "..",
            "global.css",
        ]);

        // The JS file from the Svelte build output
        const scriptUri = getUri(this.webview, this._extensionUri, [this._buildPath, "bundle.js"]);

        // console.log("base panel scriptUri", scriptUri);
        const codiconsUri = this.webview.asWebviewUri(
            vscode.Uri.joinPath(
                this._extensionUri,
                "node_modules",
                "@vscode/codicons",
                "dist",
                "codicon.css"
            )
        );

        const nonce = getNonce();
        // Tip: Install the es6-string-html VS Code extension to enable code highlighting below
        return /*html*/ `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <title>vkmask</title>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta http-equiv="Content-Security-Policy" content="default-src 'none'; font-src ${this.webview.cspSource} 'unsafe-inline'; img-src ${this.webview.cspSource} data:; style-src ${this.webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}' 'unsafe-inline';">

            <link rel="stylesheet" type="text/css" href="${globalVarsUri}">

          <link rel="stylesheet" type="text/css" href="${stylesUri}">
          <link rel="stylesheet" type="text/css" href="${codiconsUri}">

          <script defer nonce="${nonce}" src="${scriptUri}"></script>

        </head>
        <body>
        </body>
      </html>
    `;
    }

    public dispose() {
        console.log("BASE panel disposed!");
        // Clean up our resources
        this.currentPanel.dispose();

        this.currentPanel = null;

        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }
}
