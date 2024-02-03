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

let result = "";

Object.keys(localeObject).forEach((key) => {
    result += `${key};${localeObject[key]}\n`;
});

fs.writeFileSync("./l10n/generated.csv", result, { encoding: "utf8" });
