import * as fs from "fs";
import { posix as path } from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const [publisherType] = process.argv.slice(2);

const publishers = {
    dev: {
        displayName: "askhento_dev_mask",
        publisher: "askhento",
    },
    release: {
        displayName: "VK Mask Editor",
        publisher: "vkcom",
    },
};

function main() {
    if (!(publisherType in publishers)) {
        console.log(`unknown publisher : ${publisherType}`);
        return;
    }
    const packageJSONPath = path.join(__dirname, "package.json");
    const packageJSON = {
        ...JSON.parse(fs.readFileSync(packageJSONPath).toString()),
        ...publishers[publisherType],
    };

    const res = JSON.stringify(packageJSON, null, "  ");
    fs.writeFileSync(packageJSONPath, res);
}

main();
