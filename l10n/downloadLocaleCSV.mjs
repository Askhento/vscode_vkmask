const csvURL = "https://psv4.userapi.com/c237031/u102637718/docs/d52/85233d01b1c6/Klyuchi.csv";
// ? url will change
// ! add split

export async function getTranslationCSV() {
    const result = await fetch(csvURL);

    if (!result.ok) {
        console.log(result.status);
        return null;
    }

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
