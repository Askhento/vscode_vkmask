// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below

// test token mlpbxod2wevupb7krikebgclwiltpgj6h4ugr3zspnkzwj3xyqeq

import * as vscode from 'vscode';
// import { enableHotReload, hotRequire } from "@hediet/node-reload";
import { MaskConfig } from './mask_config';

if (process.env.NODE_ENV === "dev") {
    // only activate hot reload while developing the extension
    // enableHotReload({ entryModule: module });
}
// console.log(process.env.NODE_ENV);


// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "vkmask" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('vkmask.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World  Sk');
	});

	context.subscriptions.push(disposable);

	disposable = vscode.commands.registerCommand('vkmask.runTestMask', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Starting VK test mask');
	});
	context.subscriptions.push(disposable);
	

	// context.subscriptions.push(
	// 	// `hotRequire` returns a Disposable
	// 	// that disposes the last returned instance
	// 	// and makes it stop watching.
	// 	hotRequire<typeof import("./mask_config")>(module, "./mask_config", mc => {
	// 		// This callback is called immediately
	// 		// and whenever "./status"
	// 		// or one of its dependencies changes.
	// 		// We simply instantiate our extension again on every change.
	// 		// `dispose` is called on previously returned instances.

	// 		const maskConfig = new mc.MaskConfig();
	// 		// maskConfig.parseMaskJSON();


	// 		return maskConfig;
	// 	})
	// );

	const maskConfig = new MaskConfig();



}

// This method is called when your extension is deactivated
export function deactivate() {}
