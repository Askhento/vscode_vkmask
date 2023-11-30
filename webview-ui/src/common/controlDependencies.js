import { get } from "svelte/store";
import { getValueByPath, resolveRelative } from "../utils/applyValueByPath";
// import { RequestTarget, RequestCommand, SelectionType, AppState } from "../../../src/types";

export function applyDeps(component, stores, dependencies) {
    if (!dependencies) return;
    console.log("aplydeps!", dependencies);

    const dataSources = {
        component,
        stores,
    };

    return dependencies.reduce((previous, { source, relPath, postprocess }) => {
        const relSourcePath = relPath ? resolveRelative(relPath, component.path) : [];

        let dataSource = getValueByPath(dataSources, source);
        if (source[0] === "stores") dataSource = get(dataSource);

        const value = getValueByPath(dataSource, relSourcePath);

        if (postprocess) return postprocess(previous, value, component);

        return value;
    }, null);
}
