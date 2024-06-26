import { isObject } from "../../utils/isObject";

export function applyValueByPath2(obj, path, value) {
    // parts = path.split(".");
    // console.log("apply!", obj, path, value);
    if (path.length === 0) {
        obj = value;
        return obj;
    }

    const lastPath = path[0];

    // if (elem == null) {
    //     console.log(`APPLYBALUEBYPATH : error wrong path ${path}`, obj, value);
    //     return obj;
    // }

    if (path.length === 1) {
        if (value == null) {
            // I need to remove obj key or array element
            if (Array.isArray(obj)) {
                // need to splice
                // method mutates array in this case
                obj.splice(lastPath, 1);
            } else if (isObject(obj)) {
                // use delete or spread
                const { [lastPath]: removed, ...rest } = obj;
                obj = rest;
            }

            return obj;
        }

        obj[lastPath] = value;
        return obj;
    } else {
        // !!! could be terrible
        // this is for adding nested obj structures
        // probably sometimes it should be an array
        if (obj[lastPath] == null) obj[lastPath] = {};
        const elem = obj[lastPath];

        // remove first path element
        const res = applyValueByPath2(elem, path.slice(1), value);
        obj[lastPath] = res;
        return obj;
    }
}

export function resolveRelative(relPath, currentPath) {
    const resultPath = [...currentPath];
    relPath.forEach((el) => {
        if (el === "..") {
            resultPath.pop();
            return;
        }
        resultPath.push(el);
    });

    return resultPath;
}

export function getValueByPath(obj, path) {
    // console.log("getvalue", path);
    let relValue = obj;
    const currentPath = [];
    path.forEach((el) => {
        currentPath.push[el];
        try {
            relValue = relValue[el];
        } catch (error) {
            console.error("getValueError on ", currentPath, obj);
            return null;
        }
    });

    return relValue;
}
