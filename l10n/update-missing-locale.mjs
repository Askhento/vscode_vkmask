import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const bundles = fs
    .readdirSync(__dirname)
    .filter((file) => file.startsWith("bundle.l10n") && file !== "bundle.l10n.json");

const mainBundlePath = path.join(__dirname, "bundle.l10n.json");
const mainBundle = JSON.parse(fs.readFileSync(mainBundlePath).toString());

bundles.forEach((bundleName) => {
    console.log(`\nReading ${bundleName} ...`);
    const bundlePath = path.join(__dirname, bundleName);
    const bundle = JSON.parse(fs.readFileSync(bundlePath));
    // console.log(bundleName);
    let needUpdate = false;

    Object.keys(bundle).forEach((key) => {
        if (key in mainBundle) return;
        console.log(`\x1b[33m Unknown key in ${bundleName}. \n\t${key} : ${bundle[key]}\x1b[0m`);
    });

    Object.keys(mainBundle).forEach((key) => {
        if (key in bundle) return;
        needUpdate = true;
        bundle[key] = "!!! TRANSLATION REQUIRED !!!";
    });

    if (needUpdate) {
        console.log(`Writing ${bundleName}`);
        fs.writeFileSync(bundlePath, JSON.stringify(bundle, null, "\t"));
    } else {
        console.log(`No update required for ${bundleName}.`);
    }
});
// console.log(mainBundle);
