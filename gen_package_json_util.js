export function genereateCommands(list = [], template = {}) {
    return JSON.stringify(
        list.map((name) => {
            return Object.fromEntries(
                Object.entries(template).flatMap(([k, v]) => {
                    return [[k, v.replace("$", name)]];
                })
            );
        }),
        null,
        "\t"
    );
}
