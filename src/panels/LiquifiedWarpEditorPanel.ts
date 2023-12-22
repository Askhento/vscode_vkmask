import * as vscode from "vscode";
import { BaseWebviewPanel } from "./BaseWebviewPanel";
import { ViewIds } from "../types";

export class LiquifiedWarpEditorPanel extends BaseWebviewPanel {
    constructor(_extensionUri: vscode.Uri, _buildPath: string) {
        super(_extensionUri, _buildPath, ViewIds.liquifiedWarpEditor);
    }
}
