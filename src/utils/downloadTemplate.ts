import { posix as path } from "path";
import * as fs from "fs";
import os from "os";
import slash from "slash";
import { downloadFile } from "./downloadFile";
import { unzipSync } from "./zip";

export async function downloadTemplate(targetDir, urlStr) {
    targetDir = slash(targetDir);

    const url = new URL(urlStr);
    const zipFileBase = path.basename(url.pathname);

    const tmpDir = slash(os.tmpdir());

    // console.log("down", zipFileBase, urlStr, targetDir);

    const tmpZipFile = await downloadFile(url, zipFileBase, tmpDir);

    if (tmpZipFile == null) {
        console.log("downloadTemplate: could not download zip", urlStr, url, tmpDir);
        return false;
    }

    try {
        unzipSync(tmpZipFile, targetDir);
    } catch (error) {
        console.log("downloadTemplate : could not unzip file", tmpZipFile, targetDir);
        return false;
    }

    return true;
}
