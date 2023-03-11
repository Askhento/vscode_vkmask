// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below


import * as vscode from 'vscode';
import { MainSidebarProvider } from './panels/MainSidebar'
import { HotReload } from "./HotReload";
// const { exec } = require('node:child_process');
import * as path from "path"
import { watch } from "chokidar";
import { logger } from "./logger";
const print = logger(__filename);


export function activate(context: vscode.ExtensionContext) {

	print("activating");

	let disposable = vscode.commands.registerCommand('vkmask.helloWorld', () => {

		vscode.window.showInformationMessage('Hello World!');
	});

	context.subscriptions.push(disposable);


	const sidebar = new MainSidebarProvider(context.extensionUri);

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(MainSidebarProvider.viewId, sidebar)
	);


	const hotReloader = new HotReload(context.extensionUri);
	hotReloader.copyFilesToMask();


	let watchLock = false;
	let watchTimeout: NodeJS.Timeout;
	watch(path.join(context.extensionPath, "webview-ui", "public", "build")).on('change', (filename: string) => {
		if (watchLock) {
			return;
		}
		print("\nThe file " + filename + " was modified!");

		if (watchTimeout) clearTimeout(watchTimeout)
		watchTimeout = setTimeout(() => {
			watchLock = false;
		}, 1000)
		watchLock = true;

		vscode.commands.executeCommand("workbench.action.webview.reloadWebviewAction").then(() => {
			sidebar.sendEffects();
		});
	});
}

// This method is called when your extension is deactivated
export function deactivate() { }
