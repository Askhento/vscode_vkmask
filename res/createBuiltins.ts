import * as path from "path";
import * as fs from "fs";
import { readdir, readFile } from "node:fs/promises";
import { AssetsProcessor } from "../src/AssetsProcessor";
import { jsonPrettyArray } from "../src/utils/jsonStringify";
// const __dirname = path.dirname(fileURLToPath(import.meta.url));

(async () => {
    const assetsPath = process.argv.at(-1);

    if (!fs.existsSync(assetsPath)) {
        console.log(`File not exists ${assetsPath}`);
        return;
    }

    const ignoreExt = new Set([".bin", ".dds", ""]);

    const processor = new AssetsProcessor();

    const assetsDirents = await readdir(assetsPath, {
        //@ts-expect-error
        recursive: true,
    });

    const assets = assetsDirents.filter(
        (file) => !file.startsWith(".") && !ignoreExt.has(path.extname(file))
    );

    const data = await Promise.all(
        assets.map(async (assetPath) => {
            const absAssetPath = path.join(assetsPath, assetPath);
            return await processor.fileToAsset(absAssetPath, assetPath, false);
        })
    );
    const jsonDump = JSON.stringify(data, null, "\t"); //jsonPrettyArray(data, "\t");

    fs.writeFileSync(path.join(__dirname, "build-in-assets.json"), jsonDump);
})();
