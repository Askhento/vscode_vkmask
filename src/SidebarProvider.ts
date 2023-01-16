import * as vscode from "vscode";
import { MaskConfig } from "./mask_config";
import { getNonce } from "./utils/getNonce";
import * as path from 'path';


export class SidebarProvider implements vscode.WebviewViewProvider {

	public static readonly viewId = 'vkmask.sidepanel';
	public maskConfig = new MaskConfig();
	private maskConfigTimeout : NodeJS.Timeout | undefined;

	private _view?: vscode.WebviewView;

	constructor(
		private readonly _extensionUri: vscode.Uri,
	) { 
    }

	public resolveWebviewView(
		webviewView: vscode.WebviewView,
		context: vscode.WebviewViewResolveContext,
		_token: vscode.CancellationToken,
	) {
		this._view = webviewView;
		webviewView.webview.options = {
			// Allow scripts in the webview
			enableScripts: true,

			localResourceRoots: [
				this._extensionUri
			]
		};

		webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

		webviewView.webview.onDidReceiveMessage(data => {
			switch (data.type) {
				case 'effect-clicked':
					{
						console.log(data.value);
						const id = data.value.id;
						const key = "/effects/" + id;

						const pointer = this.maskConfig.maskLinePointers[key]
						// this.maskConfig.showConfigAt(pointer)
						
						this.maskConfig.removeFromConfig(id);

						// vscode.window.activeTextEditor?.insertSnippet(new vscode.SnippetString(`#${data.value}`));
						break;
					}
			}
		});



		vscode.workspace.onDidChangeTextDocument((e)=>{

			const activeUri = e.document.uri;
			const fsPath = activeUri?.fsPath;
			console.log(fsPath)

			if (vscode.workspace.workspaceFolders === undefined) return;

			const dir = vscode.workspace.workspaceFolders[0].uri;

			if (fsPath === vscode.Uri.joinPath(dir, "mask.json").fsPath )
			{
				if (e.contentChanges === undefined || e.contentChanges.length === 0) return;

				const newChar = e.contentChanges[0].text;
				console.log("updated mask.json \n");

				this.maskConfig.refreshEffects();
				this.updateEffects();
			}

		})

		// triyng to fix not updating view
		setTimeout(() => {
			this.updateEffects();
			
		}, 500);

	}



	public addColor() {
		if (this._view) {
			this._view.show?.(true); // `show` is not implemented in 1.49 but is for 1.50 insiders
			this._view.webview.postMessage({ type: 'addColor' });
		}
	}

	public clearColors() {
		if (this._view) {
			this._view.webview.postMessage({ type: 'clearColors' });
		}
	}

	public updateEffects() {
		const effects = this.maskConfig.maskJSON?.effects.map((effect, index) => {
			return {name : effect.name, id : index}
		});
		
		if (effects === undefined) return;


		console.log("sidebar : sending effects");
		if (this._view) {
			this._view.webview.postMessage({ type: 'updateEffects', effects : effects});
		}
	}


	private _getHtmlForWebview(webview: vscode.Webview) {
		// Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
		const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js'));

		// Do the same for the stylesheet.
		const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'reset.css'));
		const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'vscode.css'));
		const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.css'));

		// Use a nonce to only allow a specific script to be run.
		const nonce = getNonce();

		return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<!--
					Use a content security policy to only allow loading styles from our extension directory,
					and only allow scripts that have a specific nonce.
					(See the 'webview-sample' extension sample for img-src content security policy examples)
				-->
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<link href="${styleResetUri}" rel="stylesheet">
				<link href="${styleVSCodeUri}" rel="stylesheet">
				<link href="${styleMainUri}" rel="stylesheet">
				<title>Cat Colors</title>
			</head>
			<body>
				<ul class="color-list">
				</ul>
				<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
	}
}