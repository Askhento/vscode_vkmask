import * as vscode from "vscode";
import { MaskConfig } from "./MaskConfig";
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

		webviewView.webview.onDidReceiveMessage(async data => {
			switch (data.type) {
				case 'effectDelete':
				{
					const id = data.value;
					console.log("sidebar : received delete effect " + id);
					this.maskConfig.removeFromConfig(id);
					this.setupEditLock();
					break;
				}

				case 'effectSwap':
				{
					console.log("sidebar : received swap effects");
					const [idOld, idOther] = data.value;
					this.maskConfig.swapEffects(idOld, idOther);
					this.setupEditLock();
					break;
				}

				case 'effectAdd':
				{
					console.log("sidebar : received add effect");
					const newEffect = data.value;
					this.maskConfig.addEffect(newEffect);

					this.setupEditLock();
					break;
				}

				case 'effectSelected':
				{
					const id = data.value;
					console.log("sidebar : received selected id = " + id);
					// ? check id ?
					this.maskConfig.selectedEffectId = id;
					this.maskConfig.showEffect(id);
					this.setupSelectLock();
					break;
				}
				case 'effectDeselected':
				{
					console.log("sidebar : received deselect effects");
					this.maskConfig.clearSelection()
					this.setupSelectLock();
					break;
				}
	


			}
		});

		webviewView.onDidChangeVisibility(()=>{
			const visible =  this._view?.visible
			if (visible)
			{
				console.log("sidebar : webview visible update effects");
				this.maskConfig.parseConfig();
				this.sendEffects();
			}
		}, this);
		
		// !triyng to fix not updating view
		// !document should be ready
		setTimeout(() => {
			this.maskConfig.onTextEdit = ()=>{
				this.maskConfig.selectedEffectId = undefined;
				this.maskConfig.parseConfig();
				this.sendEffects();
			}

			this.maskConfig.onTextSelect = ()=> {
				// this.maskConfig.clearSelection();
				if (this.maskConfig.selectedEffectId !== undefined) 
				{
					this.maskConfig.selectedEffectId = undefined;
					this.sendEffects();
				}
			}
			this.maskConfig.parseConfig();
			this.sendEffects();
		}, 1000);

	}

	private setupSelectLock() {
		this.maskConfig.selectionLockCallback = () => {
			this.sendEffects();
			this.maskConfig.selectionLockCallback = undefined;
		}
	}

	private setupEditLock() {
		this.maskConfig.editLockCallback = () => {
			this.maskConfig.parseConfig();
			this.sendEffects();
			this.maskConfig.editLockCallback = undefined;
			this.maskConfig.showEffect(this.maskConfig.selectedEffectId);
			this.maskConfig.selectionLockCallback = () => {
				// resore on the second event
				// ! first cb comes from removing whole json
				// ! second one from selection
				this.maskConfig.selectionLockCallback = () => {
					this.maskConfig.selectionLockCallback = undefined;
				}
			}
		}
	}

	public sendEffects() {
		const effects = this.maskConfig.maskJSON?.effects.map((effect, index) => {
			console.log("sidebar : send effect selected = " + (index === this.maskConfig.selectedEffectId))
			return {
				name : effect.name, 
				id : index, 
				selected : index === this.maskConfig.selectedEffectId
			}
		});
		
		if (effects === undefined) return;


		console.log("sidebar : sending effects to webview");
		if (this._view) {
			this._view.webview.postMessage({ type: 'updateEffects', effects : effects});
		}
	}

	public sendDeselect() {
		if (this._view) {
			this._view.webview.postMessage({ type: 'deselectEffects'});
		}
	}

	private _getHtmlForWebview(webview: vscode.Webview) {
		// Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
		const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js'));

		// Do the same for the stylesheet.
		const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'reset.css'));
		const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'vscode.css'));
		const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.css'));
		const styleFontAwesomeUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'fas.css'));

		// Use a nonce to only allow a specific script to be run.
		const nonce = getNonce();

		// <link href="${styleVSCodeUri}" rel="stylesheet">
		// <link href="${styleResetUri}" rel="stylesheet">

		return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<!--
					Use a content security policy to only allow loading styles from our extension directory,
					and only allow scripts that have a specific nonce.
					(See the 'webview-sample' extension sample for img-src content security policy examples)
				-->
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource}; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<link href="${styleMainUri}" rel="stylesheet">
				<title>Cat Colors</title>
			</head>
			<body> 
				<div class="wrapper">
					<div class="add-effect-wrapper">
						<div id="add-effect-input-wrapper" class="add-effect-input-wrapper">
							<input type="text" class="add-effect-input" required placeholder="Add effect">
					
						</div>
						
					</div>

					<ul class="effectsList">
					</ul>
				</div>
				<script type="module" nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
	}

	// <ul class="autocomplete-effects-list"> 
	// 	<li>
	// 		<button>patch</button>
	// 	</li>
	// 	<li>
	// 		<button>facemodel</button>
	// 	<li>
	// 		<button>model3d</button>
	// 	</li>
	// </ul>
}