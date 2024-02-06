import ramdisk from "node-ramdisk";
import util from "util";
import path from "path";
import fs from "fs";

// seem like mount point always in tmp
const disk = ramdisk("vkmask_build_ramdisk");
const createDisk = util.promisify(disk.create);
const deleteDisk = util.promisify(disk.delete);

const ramdiskPath = "/tmp/vkmask_build_ramdisk";

// size in MB
async function startRamDisk(size = 100) {
    // while()
    try {
        if (!fs.existsSync(ramdiskPath)) return await createDisk(size);
    } catch (error) {
        console.log(error);
        return null;
    }
    return ramdiskPath;
}

async function unmount() {
    if (!fs.existsSync(ramdiskPath)) {
        console.log("ramdisk does not exist to unmount");
        return;
    }

    await deleteDisk(ramdiskPath);

    console.log("unmounted");
}

// unmount();

const testPath = path.join(ramdiskPath, "vkmask_ramdisk.txt");

// if(await startRamDisk() !==)
console.log(somePaht);
// fs.writeFileSync(testPath, "helloworld vkmask");
