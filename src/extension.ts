// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below


import * as vscode from 'vscode';
import { SidebarProvider } from "./SidebarProvider";
import { HotReload } from "./HotReload";
// const { exec } = require('node:child_process');
import { res } from "./ztypes";
import { logger } from "./logger";
const print = logger(__filename);

/*
	todo : logger separate
	todo : 

*/


export function activate(context: vscode.ExtensionContext) {

	print("activating");

	let disposable = vscode.commands.registerCommand('vkmask.helloWorld', () => {

		vscode.window.showInformationMessage('Hello World  Sk');
	});

	context.subscriptions.push(disposable);




	const sidebar = new SidebarProvider(context.extensionUri);

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(SidebarProvider.viewId, sidebar)
	);


	const hotReloader = new HotReload(context.extensionUri);
	// hotReloader.inject();
	hotReloader.copyFilesToMask();

}

// This method is called when your extension is deactivated
export function deactivate() { }
