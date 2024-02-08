// const csvURL =
// "https://vk.com/doc102637718_672372615?hash=2wp74eSghPNeuZGbPksirGwN5tpJqWKZrqFq7DYbV9X&dl=ogj7s8eWVAejSk6aGkw70f2mo4V2tW3a4RsVYgVzHFs&t2fs=ce3f666264e360c68c_3&t2fs=ce3f666264e360c68c_6";
// ? url will change
// ! add split
import util from "util";
import * as fs from "fs";

const regexFileURL = /https\:\/\/psv4\.userapi\.com\/.*/gm;

export async function getTranslations(csvURL) {
    let csv = null;
    if (!csvURL.startsWith("https")) {
        try {
            csv = (await util.promisify(fs.readFile)(csvURL)).toString();
        } catch (error) {
            console.log("translation missing");
            return null;
        }
    } else {
        const resp = await fetch(csvURL);
        if (!resp.ok) {
            console.log("translation server status", resp.status);
            return null;
        }
        csv = await resp.text();
    }

    return csvToObject(csv);
}

export function csvToObject(csv) {
    // console.log([...(await result.text()).matchAll(regexFileURL)]);

    const lines = csv.split("\r");
    // console.log(lines);
    const obj = {};

    lines.forEach((line) => {
        const [_, key, trans] = line.split(";");
        obj[key] = trans;
    });

    // console.log(obj);
    return obj;
}

// getTranslationCSV();
