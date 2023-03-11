import * as path from 'path';

export const logger = (baseName: string) => {

    if (process.env.NODE_ENV !== "dev") return () => { };

    baseName = path.basename(baseName).toUpperCase().toString()
    return (msg: unknown) => {
        console.log(baseName + ": ", msg);

    }
};