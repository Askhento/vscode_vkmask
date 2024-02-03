const csvURL = "https://psv4.userapi.com/c237031/u102637718/docs/d52/b73d9f915998/Klyuchi.csv";
// ! add split

export async function getTranslationCSV() {
    const result = await fetch(csvURL);

    if (!result.ok) return null;

    const lines = (await result.text()).split("\r");
    // console.log(lines);
    const obj = {};

    lines.forEach((line) => {
        const [_, key, trans] = line.split(";");
        obj[key] = trans;
    });

    console.log(obj);
    return obj;
}

getTranslationCSV();
