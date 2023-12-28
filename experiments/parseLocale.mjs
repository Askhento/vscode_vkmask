import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

// "cfg-locale": "node ./parseLocale.mjs",
// "src-locale": "npx @vscode/l10n-dev export --outDir ./l10n ./src ; node ./l10n/update-missing-locale.mjs",
// "update-locale": "npm run cfg-locale && npm run src-locale"

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const locales = fs.readdirSync(__dirname).filter((file) => file.startsWith("package.nls"));

const pathPackageJSON = path.join(__dirname, "package.json");
const packageJSON = fs.readFileSync(pathPackageJSON).toString();

const regex = /%.*%/gm;

// console.log(regex.match(packageJSON));

let m,
    keys = [];

do {
    m = regex.exec(packageJSON);
    if (m) {
        keys.push(m[0].slice(1, -1));
    }
} while (m !== null);

console.log("keys in package.json", keys);

const keysSet = new Set(keys);

locales.forEach((localeName) => {
    console.log(`\nReading ${localeName} ...`);
    const localePath = path.join(__dirname, localeName);
    const locale = JSON.parse(fs.readFileSync(localePath));
    // console.log(localeName);
    let needUpdate = false;

    Object.keys(locale).forEach((key) => {
        if (keysSet.has(key)) return;
        console.log(`\x1b[33m Unknown key in ${localeName}. \n\t${key} : ${locale[key]}\x1b[0m`);
    });

    keysSet.forEach((key) => {
        if (key in locale) return;
        needUpdate = true;
        console.log(`\tAdding ${key}`);
        locale[key] = "!!! TRANSLATION REQUIRED !!!";
    });

    if (needUpdate) {
        console.log(`Writing ${localeName}`);
        fs.writeFileSync(localePath, JSON.stringify(locale, null, "\t"));
    } else {
        console.log(`No update required for ${localeName}.`);
    }
});
