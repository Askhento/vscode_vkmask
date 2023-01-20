// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below


import * as vscode from 'vscode';
import { SidebarProvider } from "./SidebarProvider";
const { exec } = require('node:child_process');


export function activate(context: vscode.ExtensionContext) {

	console.log("extension : activating");

	let disposable = vscode.commands.registerCommand('vkmask.helloWorld', () => {

		vscode.window.showInformationMessage('Hello World  Sk');
	});

	context.subscriptions.push(disposable);




	const sidebar = new SidebarProvider(context.extensionUri);

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(SidebarProvider.viewId, sidebar)
	);



}

// This method is called when your extension is deactivated
export function deactivate() {}
