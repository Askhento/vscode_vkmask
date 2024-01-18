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
            console.log(`New key found : ${capturedKey}`);
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

function updateBundle(refBundle, bundleName, dryRun = false) {
    console.log(`\nReading ${bundleName} ...`);
    const bundlePath = path.join(__dirname, bundleName);
    const bundle = JSON.parse(fs.readFileSync(bundlePath));
    // console.log(bundleName);
    let needUpdate = false;

    Object.keys(bundle).forEach((key) => {
        if (key in refBundle) return;
        console.log(`\x1b[33m Unknown key in ${bundlePath}. \n\t${key} : ${bundle[key]}\x1b[0m`);
    });

    Object.keys(refBundle).forEach((key) => {
        if (key in bundle) return;
        needUpdate = true;
        bundle[key] = refBundle[key];
        console.log(`Will add key ${key} to ${bundleName}`);
    });

    // const oldBundleName = "old." + bundleName;
    // const oldBundlePath = path.join(__dirname, oldBundleName);
    // if (fs.existsSync(oldBundlePath)) {
    //     console.log(`Reading : ${oldBundleName}`);
    //     const oldBundle = JSON.parse(fs.readFileSync(oldBundlePath));

    //     Object.keys(bundle).forEach((key) => {
    //         if (!(bundle[key] in oldBundle)) return;
    //         console.log(
    //             `\x1b[32m Found old key in ${oldBundleName}. \n\t${key} : ${bundle[key]}\x1b[0m`
    //         );
    //         bundle[key] = oldBundle[bundle[key]];
    //         needUpdate = true;
    //     });
    // }

    if (needUpdate) {
        if (dryRun) return;
        console.log(`Writing ${bundleName}`);
        fs.writeFileSync(bundlePath, JSON.stringify(bundle, null, "\t"));
    } else {
        console.log(`No update required for ${bundleName}.`);
    }
}

bundles.forEach((bundleName) => {
    updateBundle(mainBundle, bundleName);
});

const mainPackgeJSONBundlePath = path.join(__dirname, "..", "package.nls.json");
const mainPackgeJSONBundle = JSON.parse(fs.readFileSync(mainPackgeJSONBundlePath).toString());

const packageJSON = fs.readFileSync(path.join(__dirname, "..", "package.json")).toString();
const regexPackageJSON = /%(.+)%/gm;

const match = [...packageJSON.matchAll(regexPackageJSON)];
for (const m of match) {
    const capturedKey = m[1];
    if (!(capturedKey in mainPackgeJSONBundle)) {
        console.log(`New key found : ${capturedKey}`);
        mainPackgeJSONBundle[capturedKey] = "!!!TRANSLATION_REQUIRED!!!";
    }
}

// console.log(mainBundle);
console.log(`Writing : package.nls.json`);
fs.writeFileSync(mainPackgeJSONBundlePath, JSON.stringify(mainPackgeJSONBundle, null, "\t"));

const packageJSONBundles = fs
    .readdirSync(path.join(__dirname, ".."))
    .filter((file) => file.startsWith("package.nls") && file !== "package.nls.json");

packageJSONBundles.forEach((bundleName) =>
    updateBundle(mainPackgeJSONBundle, path.join("..", bundleName), false)
);
