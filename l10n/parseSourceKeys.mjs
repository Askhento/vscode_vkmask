import * as glob from "glob";
import * as fs from "fs";

export function parseSourceKeys(searchPaths, pattern) {
    const localeKeys = {};

    const sourceMatches = glob.sync(searchPaths, { absolute: true });
    // console.log(sourceMatches);
    sourceMatches.forEach((sourcePath) => {
        // console.log("src", sourcePath);
        const source = fs.readFileSync(sourcePath).toString();
        const match = [...source.matchAll(pattern)];
        for (const m of match) {
            const capturedKey = m[1];
            if (!(capturedKey in localeKeys)) {
                localeKeys[capturedKey] = `${capturedKey} NEED TRANSLATION`;
            }
            // else {
            //     console.log(
            //         `Duplicate key found : ${capturedKey}, \nin file ${sourcePath}, ${m.index}`
            //     );
            // }
        }
    });
    // console.log(localeKeys);
    return localeKeys;
}

parseSourceKeys(["./src/**/**.{ts,js}", "./webview-ui/**/**.{ts,js,svelte}"]);
