"use strict";

import * as childProc from "child_process";
import util from "util";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log(__dirname);
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

const ramdiskPath = path.join(__dirname, "..", "out");
const disk = ramdisk("vkmask_build_ramdisk", ramdiskPath);
const createDisk = util.promisify(disk.create);
const deleteDisk = util.promisify(disk.delete);

console.log(await createDisk(100));

// // size in MB
// async function startRamDisk(size = 100) {
//     // while()
//     try {
//         if (!fs.existsSync(ramdiskPath)) return await createDisk(size);
//     } catch (error) {
//         console.log(error);
//         return null;
//     }
//     return ramdiskPath;
// }

// async function unmount() {
//     if (!fs.existsSync(ramdiskPath)) {
//         console.log("ramdisk does not exist to unmount");
//         return;
//     }

//     await deleteDisk(ramdiskPath);

//     console.log("unmounted");
// }

// // unmount();

// const testPath = path.join(ramdiskPath, "vkmask_ramdisk.txt");

// // if(await startRamDisk() !==)
// console.log(somePaht);
// // fs.writeFileSync(testPath, "helloworld vkmask");
