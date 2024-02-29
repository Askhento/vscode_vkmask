"use strict";

import * as childProc from "child_process";
import util from "util";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// todo : check if other ramdisk created ???;
// todo : found a way to unmount, timing

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function ramdisk(volumeName, mountPoint) {
    if (mountPoint == null) mountPoint = path.join("/", "tmp", volumeName);
    var os = process.platform;
    var script = path.join(__dirname, `${os}.sh`);

    var createDisk = function createDisk(size, cb) {
        const command = `${script} 1 ${size} ${volumeName} ${mountPoint}`;
        // console.log(`command : ${command}`);
        prc(command, cb);
    };

    var deleteDisk = function deleteDisk(mount, cb) {
        const command = `${script} 2 ${mount}`;
        prc(command, cb);
    };

    function prc(file, cb) {
        var dataB = new Buffer(0);
        var errorB = new Buffer(0);

        var cmd = exec(file);

        cmd.stdout.on("data", stdout);
        cmd.stderr.on("data", stderr);
        cmd.on("close", close);

        function stdout(data) {
            dataB = Buffer.concat([dataB, data]);
        }

        function stderr(data) {
            errorB = Buffer.concat([errorB, data]);
        }

        function close(code) {
            if (cb) {
                if (code !== 0) {
                    var error = new Error(errorB.toString().replace(/\n/, ""));
                    cb(error);
                } else {
                    var res = dataB.length ? dataB.toString() : "ok";
                    cb(null, res);
                }
            }
        }
    }

    return {
        create: createDisk,
        delete: deleteDisk,
    };
}

function exec(command) {
    return childProc.spawn("/bin/sh", ["-c", command]);
}

const supportedPlatforms = ["darwin"];

const ramdiskPath = path.join(__dirname, "..", "out");
const disk = ramdisk("vkmask_build_ramdisk", ramdiskPath);
const createDisk = util.promisify(disk.create);
const deleteDisk = util.promisify(disk.delete);

export async function startRamDisk(size = 100) {
    if (supportedPlatforms.findIndex((os) => os === process.platform) < 0) {
        console.log(`Radmisk not supported for ${process.platform}`);
        return;
    }
    if (!checkMounted()) {
        await createDisk(size);
        return;
    }
    console.log("ramdisk is running at", ramdiskPath);
}

export async function unmount() {
    if (!checkMounted()) {
        console.log("ramdisk does not exist to unmount");
        return;
    }

    await deleteDisk(ramdiskPath);

    console.log("unmounted");
}

function checkMounted() {
    const command = `mount | grep "on ${ramdiskPath}"`;
    const child = childProc.spawnSync("/bin/sh", ["-c", command], {
        encoding: "utf8",
    });
    // console.log("stdout: ", child.stdout);

    return !!child.stdout;
}

// createDisk(100);

// unmount();
