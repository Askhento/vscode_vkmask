import * as fs from "fs";
import * as path from "path";
import * as glob from "glob";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const localeRegex = /"(locale\..*?)"/gm;

// path.readdirSync()

const mainBundlePath = path.join(__dirname, "bundle.l10n.json");
const mainBundle = JSON.parse(fs.readFileSync(mainBundlePath).toString());

// const localeKeys = {};

const sourceMatches = glob.sync(["./src/**/**.{ts,js}", "./webview-ui/**/**.{ts,js,svelte}"]);
sourceMatches.forEach((sourcePath) => {
    const source = fs.readFileSync(path.join(__dirname, "..", sourcePath)).toString();
    const match = [...source.matchAll(localeRegex)];
    for (const m of match) {
        const capturedKey = m[1];
        if (!(capturedKey in mainBundle)) {
            console.log(`Will found : ${capturedKey}`);
            mainBundle[capturedKey] = "!!!TRANSLATION_REQUIRED!!!";
        }
    }
});

// console.log(mainBundle);
console.log(`Writing : bundle.l10n.json`);
fs.writeFileSync(mainBundlePath, JSON.stringify(mainBundle, null, "\t"));

const bundles = fs
    .readdirSync(__dirname)
    .filter((file) => file.startsWith("bundle.l10n") && file !== "bundle.l10n.json");

bundles.forEach((bundleName) => {
    console.log(`\nReading ${bundleName} ...`);
    const bundlePath = path.join(__dirname, bundleName);
    const bundle = JSON.parse(fs.readFileSync(bundlePath));
    // console.log(bundleName);
    let needUpdate = false;

    Object.keys(bundle).forEach((key) => {
        if (key in mainBundle) return;
        console.log(`\x1b[33m Unknown key in ${bundlePath}. \n\t${key} : ${bundle[key]}\x1b[0m`);
    });

    Object.keys(mainBundle).forEach((key) => {
        if (key in bundle) return;
        needUpdate = true;
        bundle[key] = mainBundle[key];
    });

    const oldBundleName = "old." + bundleName;
    const oldBundlePath = path.join(__dirname, oldBundleName);
    if (fs.existsSync(oldBundlePath)) {
        console.log(`Reading : ${oldBundleName}`);
        const oldBundle = JSON.parse(fs.readFileSync(oldBundlePath));

        Object.keys(bundle).forEach((key) => {
            if (!(bundle[key] in oldBundle)) return;
            bundle[key] = oldBundle[bundle[key]];
            console.log(
                `\x1b[32m Found key in ${oldBundleName}. \n\t${key} : ${bundle[key]}\x1b[0m`
            );
            needUpdate = true;
        });
    }

    if (needUpdate) {
        console.log(`Writing ${bundleName}`);
        fs.writeFileSync(bundlePath, JSON.stringify(bundle, null, "\t"));
    } else {
        console.log(`No update required for ${bundleName}.`);
    }
});
