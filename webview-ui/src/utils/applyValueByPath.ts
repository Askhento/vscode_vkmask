export function applyValueByPath2(obj, path, value) {
    // parts = path.split(".");
    // console.log(obj, path, value);
    if (path.length === 0) {
        obj = value;
        return obj;
    }

    const lastPath = path[0];

    const elem = obj[lastPath];

    // if (elem == null) {
    //     console.log(`APPLYBALUEBYPATH : error wrong path ${path}`, obj, value);
    //     return obj;
    // }

    if (path.length === 1) {
        if (value == null) {
            // I need to remove obj key or array element
            if (Array.isArray(obj)) {
                // need to splice
                obj = obj.splice(lastPath, 1);
            } else {
                // use delete or spread
                const { [lastPath]: removed, ...rest } = obj;
                obj = rest;
            }

            return obj;
        }

        obj[lastPath] = value;
        return obj;
    } else {
        // remove first path element
        return applyValueByPath(elem, path.slice(1), value);
    }
}
