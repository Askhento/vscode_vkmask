import * as glob from "glob";
import * as fs from "fs";
import LineColumnFinder from "line-column";

export function renameSourceKeys(searchPaths, pattern, dryRun = false) {
    const localeKeys = {};

    const sourceMatches = glob.sync(searchPaths, { absolute: true });
    // console.log(sourceMatches);
    sourceMatches.forEach((sourcePath) => {
        const source = fs.readFileSync(sourcePath).toString();
        const lineColumn = new LineColumnFinder(source);

        const match = [...source.matchAll(pattern)];
        for (const m of match) {
            const capturedKey = m[1];
            const updatedKey = m[2];

            const { line, col } = lineColumn.fromIndex(m.index);
            const url = `vscode://file/${sourcePath}:${line}:${col}`;
            console.log(
                `key:${capturedKey} updated:${updatedKey} at line:${line}, col:${col} \n ${url}`
            );

            localeKeys[capturedKey] = {
                capturedKey,
                updatedKey,
            };
        }

        if (dryRun || match.length === 0) return;

        // console.log(sourcePath + "MATCH" + match.length);
        // console.log(match);
        console.log(source.replace(pattern, '"$2"'));
    });
    // console.log(localeKeys);
    return localeKeys;
}
// will search for

const sourcesRegex = /"(locale\..*?)\|(.*?)"/gm;
const sourceParsedKeys = renameSourceKeys(
    ["./src/**/**.{ts,js}", "./webview-ui/**/**.{ts,js,svelte}"],
    sourcesRegex,
    false
);
