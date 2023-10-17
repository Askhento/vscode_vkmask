import {
    Disposable,
    Webview,
    window,
    Uri,
    ViewColumn,
    WebviewViewProvider,
    WebviewView,
} from "vscode";
import * as vscode from "vscode";
import { getUri } from "../utils/getUri";
import { getNonce } from "../utils/getNonce";

export class BaseWebviewProvider implements WebviewViewProvider {
    public _view?: WebviewView;
    public webview: Webview;
    public onResolveWebviewView: () => void | undefined;

    constructor(
        private readonly _extensionUri: Uri,
        private readonly _buildPath: string,
        public readonly viewId: string
    ) {}

    public resolveWebviewView(
        webviewView: WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ) {
        this._view = webviewView;
        this.webview = webviewView.webview;

        this.webview.options = {
            // Allow scripts in the webview
            enableScripts: true,
            enableCommandUris: true,

            localResourceRoots: [this._extensionUri],
        };

        this.webview.html = this._getWebviewContent();

        if (this.onResolveWebviewView) this.onResolveWebviewView();
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
}
