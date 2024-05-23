import { get } from "svelte/store";
import { getValueByPath, resolveRelative } from "../utils/applyValueByPath";
// import { RequestTarget, RequestCommand, SelectionType, AppState } from "../../../src/types";

export function applyDeps(component, stores, dependencies) {
    if (!dependencies) return { needUpdate: false };
    // console.log("aplydeps!", dependencies);

    const dataSources = {
        component,
        stores,
    };

    return dependencies.reduce((previous, { source, relPath, postprocess }) => {
        if (!component.path) {
            console.error("component null path");
            return { needUpdate: false };
        }
        const componentPath = [...component.path];
        componentPath.shift(); // remove root to be able to override in ztypes
        const relSourcePath = relPath ? resolveRelative(relPath, componentPath) : [];

        // get is svelte specific
        let dataSource = get(stores[source]);
        // if (source[0] === "stores") dataSource = get(dataSource);

        const value = getValueByPath(dataSource, relSourcePath);

        if (postprocess) {
            try {
                return postprocess(value, component, previous);
            } catch (error) {
                console.error("Error apply deps:", component.path, error);
                return { needUpdate: false };
            }
        }

        return value;
    }, null);
}
