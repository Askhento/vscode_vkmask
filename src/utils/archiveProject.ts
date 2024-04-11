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
            l10n.t(`locale.commands.archiveProject.doneMessage`, zipFile)
        );

        print("Copied " + results.length + " files", zipFileUri);
    } catch (error) {
        print("Archive error ", error);
        vscode.window.showInformationMessage(
            l10n.t(`locale.commands.archiveProject.failMessage`, zipFileName)
        );
        return;
    }
}

function zip(inPath, outPath, cb) {
    if (!cb) cb = function () {};
    if (process.platform === "win32") {
        fs.stat(inPath, function (err, stats) {
            if (err) return cb(err);
            if (stats.isFile()) {
                copyToTemp();
            } else {
                doZip();
            }
        });
    } else {
        doZip();
    }

    // Windows zip command cannot zip files, only directories. So move the file into
    // a temporary directory before zipping.
    function copyToTemp() {
        fs.readFile(inPath, function (err, inFile) {
            if (err) return cb(err);
            const tmpPath = path.join(os.tmpdir(), "cross-zip-" + Date.now());
            fs.mkdir(tmpPath, function (err) {
                if (err) return cb(err);
                fs.writeFile(path.join(tmpPath, path.basename(inPath)), inFile, function (err) {
                    if (err) return cb(err);
                    inPath = tmpPath;
                    doZip();
                });
            });
        });
    }

    // Windows zip command does not overwrite existing files. So do it manually first.
    function doZip() {
        if (process.platform === "win32") {
            fs.rmdir(outPath, { recursive: true, maxRetries: 3 }, doZip2);
        } else {
            doZip2();
        }
    }

    function doZip2() {
        const opts = {
            cwd: path.dirname(inPath),
            maxBuffer: Infinity,
        };
        cp.execFile(getZipCommand(), getZipArgs(inPath, outPath), opts, function (err) {
            cb(err);
        });
    }
}

function zipSync(inPath, outPath) {
    if (process.platform === "win32") {
        if (fs.statSync(inPath).isFile()) {
            const inFile = fs.readFileSync(inPath);
            const tmpPath = path.join(os.tmpdir(), "cross-zip-" + Date.now());
            fs.mkdirSync(tmpPath);
            fs.writeFileSync(path.join(tmpPath, path.basename(inPath)), inFile);
            inPath = tmpPath;
        }

        if (fs.statSync(outPath, { throwIfNoEntry: false })?.isFile())
            fs.rmSync(outPath, { recursive: true, maxRetries: 3 });
    }
    const opts = {
        cwd: path.dirname(inPath),
        maxBuffer: Infinity,
    };
    cp.execFileSync(getZipCommand(), getZipArgs(inPath, outPath), opts);
}

function unzip(inPath, outPath, cb) {
    if (!cb) cb = function () {};
    const opts = {
        maxBuffer: Infinity,
    };
    cp.execFile(getUnzipCommand(), getUnzipArgs(inPath, outPath), opts, function (err) {
        cb(err);
    });
}

function unzipSync(inPath, outPath) {
    const opts = {
        maxBuffer: Infinity,
    };
    cp.execFileSync(getUnzipCommand(), getUnzipArgs(inPath, outPath), opts);
}

function getZipCommand() {
    if (process.platform === "win32") {
        return "powershell.exe";
    } else {
        return "zip";
    }
}

function getUnzipCommand() {
    if (process.platform === "win32") {
        return "powershell.exe";
    } else {
        return "unzip";
    }
}

function quotePath(pathToTransform) {
    return '"' + pathToTransform + '"';
}

function getZipArgs(inPath, outPath) {
    if (process.platform === "win32") {
        return [
            "-nologo",
            "-noprofile",
            "-command",
            '& { param([String]$myInPath, [String]$myOutPath); Add-Type -A "System.IO.Compression.FileSystem"; [IO.Compression.ZipFile]::CreateFromDirectory($myInPath, $myOutPath); exit !$? }',
            "-myInPath",
            quotePath(inPath),
            "-myOutPath",
            quotePath(outPath),
        ];
    } else {
        const fileName = path.basename(inPath);
        return ["-r", "-y", outPath, fileName];
    }
}

function getUnzipArgs(inPath, outPath) {
    if (process.platform === "win32") {
        return [
            "-nologo",
            "-noprofile",
            "-command",
            '& { param([String]$myInPath, [String]$myOutPath); Add-Type -A "System.IO.Compression.FileSystem"; [IO.Compression.ZipFile]::ExtractToDirectory($myInPath, $myOutPath); exit !$? }',
            "-myInPath",
            quotePath(inPath),
            "-myOutPath",
            quotePath(outPath),
        ];
    } else {
        return ["-o", inPath, "-d", outPath];
    }
}
