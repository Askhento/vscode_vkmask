// import { genereateCommands } from "../../../gen_package_json_util";

// const effectCommands = genereateCommands(effectNames, {
//     command: "vkmask.add_effect.$",
//     // title: "$",
//     // shortTitle: "Add $ effect",
// });
// print(effectCommands);

// const pluginCommands = genereateCommands(pluginNames, {
//     command: "vkmask.add_plugin.$",
//     // title: "$",
//     // shortTitle: "Add $ plugin",
// });
// print(pluginCommands);

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
