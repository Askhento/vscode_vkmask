import * as vscode from "vscode";
import { BaseWebviewProvider } from "./BaseWebviewProvider";
import { ViewIds } from "../types";

export class PluginsViewProvider extends BaseWebviewProvider {
    constructor(_extensionUri: vscode.Uri, _buildPath: string) {
        super(_extensionUri, _buildPath, ViewIds.plugins);
    }
}
