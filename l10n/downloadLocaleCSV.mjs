// const csvURL = "https://psv4.userapi.com/c237031/u102637718/docs/d52/85233d01b1c6/Klyuchi.csv";
const csvURL =
    "https://vk.com/doc102637718_672372615?hash=2wp74eSghPNeuZGbPksirGwN5tpJqWKZrqFq7DYbV9X&dl=ogj7s8eWVAejSk6aGkw70f2mo4V2tW3a4RsVYgVzHFs&t2fs=ce3f666264e360c68c_3&t2fs=ce3f666264e360c68c_6";
// ? url will change
// ! add split

const regexFileURL = /https\:\/\/psv4\.userapi\.com\/.*/gm;

export async function getTranslationCSV() {
    const result = await fetch(csvURL);

    if (!result.ok) {
        console.log(result.status);
        return null;
    }

    console.log([...(await result.text()).matchAll(regexFileURL)]);
    return;

    const lines = (await result.text()).split("\r");
    // console.log(lines);
    const obj = {};

    lines.forEach((line) => {
        const [_, key, trans] = line.split(";");
        obj[key] = trans;
    });

    // console.log(obj);
    return obj;
}

getTranslationCSV();
