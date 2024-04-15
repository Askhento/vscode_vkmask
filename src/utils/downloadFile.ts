import fs from "fs";
import { Readable } from "stream";
import { finished } from "stream/promises";
import { posix as path } from "path";

export const downloadFile = async (url, fileName, targetDir) => {
    if (!fs.existsSync(targetDir)) {
        console.log(`targetDir does not exist!`, targetDir, fileName, url);
        return null;
    }
    const res = await fetch(url);

    const destination = path.join(targetDir, fileName);

    // seems like have to do it manually
    if (fs.existsSync(destination)) fs.rmSync(destination);

    const fileStream = fs.createWriteStream(destination, { flags: "wx" });
    await finished(Readable.fromWeb(res.body).pipe(fileStream));
    return destination;
};
