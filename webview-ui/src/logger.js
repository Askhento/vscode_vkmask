
export const logDump = [] //?? is this singletone??
export const logger = (baseName) => {

    // if (process.env.NODE_ENV !== "dev") return () => { };

    // baseName = path.basename(baseName).toUpperCase().toString()
    return (...params) => {

        // 1. Convert args to a normal array
        var args = Array.prototype.slice.call(params);

        // 2. Prepend log prefix log string
        args.unshift(baseName.toUpperCase() + ": ");

        console.log.apply(console, args);

        logDump.push({ "timestamp": (new Date()).getTime(), "value": args });
    }
};

