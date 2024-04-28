import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { csvToObject, getTranslations } from "./downloadLocaleCSV.mjs";
import { parseSourceKeys } from "./parseSourceKeys.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function updateBundle(refBundle, bundleName, config) {
    const lang = bundleName.split(".").at(-2);
    console.log(`\nReading ${bundleName} ... lang=${lang}`);
    const bundlePath = path.join(__dirname, bundleName);
    let bundle = JSON.parse(fs.readFileSync(bundlePath));
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

    if (config.sortKeys) {
        bundle = getSortedBundle(bundle);
    }

    if (needUpdate) {
        if (config.dryRun) return;
        console.log(`Writing ${bundleName}`);
        fs.writeFileSync(bundlePath, JSON.stringify(bundle, null, "\t"));
    } else {
        console.log(`No update required for ${bundleName}.`);
    }
}

function checkExistingTranslations(bundleName, translations, dryRun = false) {
    console.log(`Checking existing translations for ${bundleName}\n`);
    const lang = bundleName.split(".").at(-2);
    if (!(lang in translations)) {
        console.log(`Missing translation for bundle : ${bundleName}, lang=${ru}`);
    }

    const bundlePath = path.join(__dirname, bundleName);
    let bundle = JSON.parse(fs.readFileSync(bundlePath));
    let needUpdate = false;

    Object.keys(translations[lang]).forEach((key) => {
        if (!(key in bundle)) {
            console.log(
                `\x1b[33mUnknown translation key: \n${key} : ${translations[lang][key]}\x1b[0m`
            );
            return;
        }

        if (bundle[key] === translations[lang][key]) return; // skip same

        console.log(
            `\x1b[32m Found translation key: \n\t${key} : ${translations[lang][key]}\x1b[0m`
        );
        if (!dryRun) {
            bundle[key] = translations[lang][key];
            needUpdate = true;
        }
    });

    if (needUpdate) {
        if (dryRun) return;
        console.log(`Writing ${bundleName}`);
        fs.writeFileSync(bundlePath, JSON.stringify(bundle, null, "\t"));
    } else {
        console.log(`No update required for ${bundleName}.`);
    }
}

function getSortedBundle(bundle) {
    return Object.keys(bundle)
        .sort()
        .reduce((obj, key) => {
            obj[key] = bundle[key];
            return obj;
        }, {});
}

function processSourceBundles(translations, config = { dryRun: false, sortKeys: false }) {
    console.log("Porcessing source bundles\n");

    const mainBundlePath = path.join(__dirname, "bundle.l10n.json");
    let mainBundle = JSON.parse(fs.readFileSync(mainBundlePath).toString());

    console.log("Parsing sources in ./src ");
    const sourcesRegex = /"(locale\..*?)"/gm;
    const sourceParsedKeys = parseSourceKeys(["./src/**/*.{ts,js,svelte}"], sourcesRegex);
    let needWriteMain = false;
    Object.keys(sourceParsedKeys).forEach((key) => {
        if (key in mainBundle) return;
        console.log(`New key found : ${key}`);
        mainBundle[key] = sourceParsedKeys[key];
        needWriteMain = true;
    });

    if (config.sortKeys) {
        mainBundle = getSortedBundle(mainBundle);
    }

    if (needWriteMain) {
        console.log(`Writing : bundle.l10n.json`);
        fs.writeFileSync(mainBundlePath, JSON.stringify(mainBundle, null, "\t"));
    } else {
        console.log("No need to write bundle.l10n.json");
    }

    const bundles = fs
        .readdirSync(__dirname)
        .filter((file) => file.startsWith("bundle.l10n") && file !== "bundle.l10n.json");

    console.log("\nUpdating sources bundles");

    bundles.forEach((bundleName) => {
        // fill missing keys, notify unknown
        updateBundle(mainBundle, bundleName, config);
        // // check if we can find existing translations from csv file
        // checkExistingTranslations(bundleName, translations, config.dryRun);
    });
}

function processContributionBundles(translations, config = { sortKeys: true, dryRun: false }) {
    console.log("");
    console.log("Parsing package.json keys");

    const mainPackgeJSONBundlePath = path.join(__dirname, "..", "package.nls.json");
    const mainPackgeJSONBundle = JSON.parse(fs.readFileSync(mainPackgeJSONBundlePath).toString());

    const regexPackageJSON = /%(.+)%/gm;

    const parsedPackageKeys = parseSourceKeys(["./package.json"], regexPackageJSON);
    let needWriteMainPackageJSON = false;
    Object.keys(parsedPackageKeys).forEach((key) => {
        if (key in mainPackgeJSONBundle) return;
        console.log(`New key found : ${key}`);
        mainPackgeJSONBundle[key] = parsedPackageKeys[key];
        needWriteMainPackageJSON = true;
    });

    if (needWriteMainPackageJSON) {
        console.log(`Writing : package.nls.json`);
        fs.writeFileSync(
            mainPackgeJSONBundlePath,
            JSON.stringify(mainPackgeJSONBundle, null, "\t")
        );
    } else {
        console.log("No need to write package.nls.json");
    }

    const packageJSONBundles = fs
        .readdirSync(path.join(__dirname, ".."))
        .filter((file) => file.startsWith("package.nls") && file !== "package.nls.json");

    console.log("Updating package.json bundles");

    packageJSONBundles.forEach((bundleName) => {
        updateBundle(mainPackgeJSONBundle, path.join("..", bundleName), config);
        // checkExistingTranslations(bundleName, translations, dryRun);
    });
}

const csvURL =
    // "https://psv4.userapi.com/c237031/u102637718/docs/d52/b36c541f409c/Klyuchi.csv?extra=Nh_KsAQh7F56wfS3nuVmsADxmPVqbZu06Wb1JWULyY1Sp2BEUgwNzHVokfLOUWbuCma5Lck05CiESRiGMJBOEOlA8J1_dTEYKZBP0RL55IN1x9FI0Xi1GOr8veFT1tTH1CEtewgygxhryXYn7gqb606Fkg&dl=1";
    path.join(__dirname, "./translationKeys.csv");

const translations = {
    ru: await getTranslations(csvURL), // ! could be null
};

processSourceBundles(translations, { dryRun: false, sortKeys: true });

processContributionBundles(translations, { dryRun: false, sortKeys: true });
// console.log(translations);

// path.readdirSync()
