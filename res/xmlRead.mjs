import * as fs from "fs";
import * as path from "path";
import { XMLParser, XMLBuilder } from "fast-xml-parser"; // https://github.com/NaturalIntelligence/fast-xml-parser/blob/c7b3cea4ead020c21d39e135a50348208829e971/docs/v4/2.XMLparseOptions.md
import { fileURLToPath } from "url";
import { z } from "zod";

// import { uiDescriptions } from "../src/ztypes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const file = path.join(__dirname, "mask-assets", "Materials", "InvisibleOccluder.xml");

const xmlParser = new XMLParser({
    ignoreDeclaration: true,
    parseAttributeValue: true,
    ignoreAttributes: false,
    attributeNamePrefix: "",
    //name: is either tagname, or attribute name
    //jPath: upto the tag name
    isArray: (name, jpath, isLeafNode, isAttribute) => {
        return false;
    },
});

const rawXML = fs.readFileSync(file);
let xmlObject = xmlParser.parse(rawXML);

console.log(JSON.stringify(xmlObject, null, "\t"));
// xmlObject.material.technique.name = "lol it works!";

const zBasicMaterial = z.object({});
const xmlBuilder = new XMLBuilder({
    attributeNamePrefix: "",
    ignoreAttributes: false,
    format: true,
    suppressEmptyNode: true,
});

console.log(xmlBuilder.build(xmlObject));

// const ZStringArray = z.string();

// const ZMaterialAsset = z.object({

// })
