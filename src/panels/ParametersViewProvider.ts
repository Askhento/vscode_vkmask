import * as vscode from "vscode";
import { BaseWebviewProvider } from "./BaseWebviewProvider";
import { ViewIds } from "../types";

export class ParametersViewProvider extends BaseWebviewProvider {
    constructor(_extensionUri: vscode.Uri, _buildPath: string) {
        super(_extensionUri, _buildPath, ViewIds.parameters);
    }
}
