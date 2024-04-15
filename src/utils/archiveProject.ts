import { posix as path } from "path";
import * as fs from "fs";
import os from "os";
import cp from "child_process";
import * as vscode from "vscode";
import copy from "recursive-copy";
import * as l10n from "@vscode/l10n";
import slash from "slash";

import { logger } from "./../Logger";
import { assetWhiteListExt } from "../assetWhitelist";
import { zipSync } from "./zip";
const print = (...args: any) => logger.log(__filename, ...args);

const patterns = assetWhiteListExt.map((e) => `**/*.${e}`);
export async function archiveProject() {
    if (!vscode.workspace.workspaceFolders?.length) {
        print("Unable to archive workspace empty");
        return;
    }
    //? could be null
    const directory = slash(vscode.workspace.workspaceFolders?.[0]?.uri?.fsPath);

    // todo cancellable notification
    // https://www.eliostruyf.com/creating-timer-dismissable-notifications-visual-studio-code-extension/
    // https://www.eliostruyf.com/cancel-progress-programmatically-visual-studio-code-extensions/

    const zipFileName = path.basename(directory);
    const tmpDir = slash(os.tmpdir());
    const tmpProjectClone = path.join(tmpDir, "vscode-vkmask", zipFileName); // ? add uuid
    const zipFile = path.join(directory, `${zipFileName}.zip`);
    const zipFileUri = vscode.Uri.file(zipFile);

    try {
        const results = await copy(directory, tmpProjectClone, {
            overwrite: true,
            dot: false,
            junk: false,
            filter: patterns,
        });

        // print(fs.statSync(tmpProjectClone).isFile());
        zipSync(tmpProjectClone, zipFile);

        vscode.commands.executeCommand("revealFileInOS", zipFileUri);

        vscode.window.showInformationMessage(
            l10n.t("locale.commands.archiveProject.doneMessage", zipFile)
        );

        print("Copied " + results.length + " files", zipFileUri);
    } catch (error) {
        print("Archive error ", error);
        vscode.window.showInformationMessage(
            l10n.t("locale.commands.archiveProject.failMessage", zipFileName)
        );
        return;
    }
}
