import { get } from "svelte/store";
import { getValueByPath, resolveRelative } from "../utils/applyValueByPath";
import type { ControlDependency } from "../types";
// import { RequestTarget, RequestCommand, SelectionType, AppState } from "../../../src/types";

export function applyDeps(component, stores, dependencies: ControlDependency[]) {
    if (!dependencies) return { needUpdate: false };
    // console.log("aplydeps!", dependencies);

    return dependencies.reduce((previous, { sources, relPath, postprocess }) => {
        if (!component.path) {
            console.error("component null path");
            return;
        }
        const componentPath = [...component.path];
        componentPath.shift(); // remove root to be able to override in ztypes

        // get is svelte specific
        let hasUknownSource = false;
        let dataSources = sources.map(({ key, relPath }) => {
            if (!(key in stores)) {
                console.error("unknown source ", key, component);
                hasUknownSource = true;
                return null;
            }

            const store = get(stores[key]);

            if (relPath) {
                const relSourcePath = resolveRelative(relPath, componentPath);
                return getValueByPath(store, relSourcePath);
            } else {
                return store;
            }
        });

        if (hasUknownSource) return null;

        if (postprocess) {
            try {
                return postprocess(dataSources, component, previous);
            } catch (error) {
                console.error("Error apply deps:", component, value, previous, error);
                return null;
            }
        }

        return null;
    }, null);
}
