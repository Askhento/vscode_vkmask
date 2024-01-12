import * as fs from "fs";
import * as path from "path";
import * as glob from "glob";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const bundles = fs
    .readdirSync(__dirname)
    .filter((file) => file.startsWith("bundle.l10n") && file !== "bundle.l10n.json");

const mainBundlePath = path.join(__dirname, "bundle.l10n.json");
const mainBundle = JSON.parse(fs.readFileSync(mainBundlePath).toString());

const localeRegex = /"(locale\..*?)"/gm;

// path.readdirSync()

const localeKeys = {};

const sourceMatches = glob.sync(["./src/**/**.{ts,js}", "./webview-ui/**/**.{ts,js,svelte}"]);
sourceMatches.forEach((sourcePath) => {
    const source = fs.readFileSync(path.join(__dirname, "..", sourcePath)).toString();
    const match = [...source.matchAll(localeRegex)];
    for (const m of match) {
        const capturedKey = m[1];
        if (!(capturedKey in mainBundle)) {
            console.log(`Will add key ${capturedKey}`);
            mainBundle[capturedKey] = "!!! TRANSLATION REQUIRED !!!";
        }
    }
});

// console.log(mainBundle);
fs.writeFileSync(mainBundlePath, JSON.stringify(mainBundle, null, "\t"));

// bundles.forEach((bundleName) => {
//     console.log(`\nReading ${bundleName} ...`);
//     const bundlePath = path.join(__dirname, bundleName);
//     const bundle = JSON.parse(fs.readFileSync(bundlePath));
//     // console.log(bundleName);
//     let needUpdate = false;

//     Object.keys(bundle).forEach((key) => {
//         if (key in mainBundle) return;
//         console.log(`\x1b[33m Unknown key in ${bundlePath}. \n\t${key} : ${bundle[key]}\x1b[0m`);
//     });

//     Object.keys(mainBundle).forEach((key) => {
//         if (key in bundle) return;
//         needUpdate = true;
//         bundle[key] = "!!! TRANSLATION REQUIRED !!!";
//     });

//     if (needUpdate) {
//         console.log(`Writing ${bundleName}`);
//         fs.writeFileSync(bundlePath, JSON.stringify(bundle, null, "\t"));
//     } else {
//         console.log(`No update required for ${bundleName}.`);
//     }
// });
// console.log(mainBundle);
