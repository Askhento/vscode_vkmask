import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

// console.log(translations.ru);

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const localeBundles = ["./l10n/bundle.l10n.ru.json", "./package.nls.ru.json"];

const localeObject = {};

localeBundles.forEach((bundleName) => {
    // const bundlePath = path.join(__dirname, bundleName);
    const bundle = JSON.parse(fs.readFileSync(bundleName));
    Object.keys(bundle).forEach((key) => {
        if (key in localeObject) {
            console.log(`Duplicate key ${key} in ${bundleName}`);
            return;
        }
        localeObject[key] = bundle[key];
    });
});

const sortedTranslations = Object.entries(localeObject).sort(([keya, vala], [keyb, valb]) => {
    return keya.localeCompare(keyb);
});

// console.log(sortedTranslations);

let result = "";

sortedTranslations.forEach(([key, value]) => {
    result += `${key};"${value}"\n`;
});

fs.writeFileSync("./l10n/generated.csv", result, { encoding: "utf8" });
