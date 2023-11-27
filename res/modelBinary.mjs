import * as fs from "fs";
import * as path from "path";
import { XMLParser, XMLBuilder } from "fast-xml-parser"; // https://github.com/NaturalIntelligence/fast-xml-parser/blob/c7b3cea4ead020c21d39e135a50348208829e971/docs/v4/2.XMLparseOptions.md
import { fileURLToPath } from "url";
import { z } from "zod";
import { SmartBuffer } from "smart-buffer";

// import { uiDescriptions } from "../src/ztypes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const file = path.join(__dirname, "Cubin.mdl");

const elementTypeSizes = {
    INT: 4, // INT
    FLOAT: 4, // FLOAT
    FLOAT_VEC2: 2 * 4, // FLOAT vec2
    FLOAT_VEC3: 3 * 4, // vec3
    FLOAT_VEC4: 4 * 4, // vec4
    UBYTE4: 4, // unsigned
    UBYTE4_NORM: 4, // unsigned
};

const LEGACY_VERTEXELEMENTS = [
    elementTypeSizes.FLOAT_VEC3, // Position
    elementTypeSizes.FLOAT_VEC3, // Normal
    elementTypeSizes.UBYTE4_NORM, // Color
    elementTypeSizes.FLOAT_VEC2, // Texcoord1
    elementTypeSizes.FLOAT_VEC2, // Texcoord2
    elementTypeSizes.FLOAT_VEC3, // Cubetexcoord1
    elementTypeSizes.FLOAT_VEC3, // Cubetexcoord2
    elementTypeSizes.FLOAT_VEC4, // Tangent
    elementTypeSizes.FLOAT_VEC4, // Blendweights
    elementTypeSizes.UBYTE4, // Blendindices
    elementTypeSizes.FLOAT_VEC4, // Instancematrix1
    elementTypeSizes.FLOAT_VEC4, // Instancematrix2
    elementTypeSizes.FLOAT_VEC4, // Instancematrix3
    elementTypeSizes.INT, // Objectindex
];

const modelBuffer = SmartBuffer.fromBuffer(fs.readFileSync(file));

const version = modelBuffer.readString(4);

// !!! only for UMDL
// my mac seems to be Little endian
const vbCount = modelBuffer.readUInt32LE();
const vCount = modelBuffer.readUInt32LE();
const elemMask = modelBuffer.readUInt32LE().toString(2);

console.log(`model version = ${version}`);
console.log(`vbCount = ${vbCount}`);
console.log(`vCount = ${vCount}`);
console.log(`elemMask = ${elemMask}`);

// todo : multiple vbCount
let vertexSize = 0;
for (let i = 0; i < elemMask.length; i++) {
    // const element = array[i];
    const elemExist = +elemMask.at(-(i + 1));
    const elemSize = elemExist * LEGACY_VERTEXELEMENTS[i];
    vertexSize += elemSize;
}

console.log(`vertexSize = ${vertexSize} bytes`);
const vertDataSize = vCount * vertexSize;

const morphableStart = modelBuffer.readUInt32LE();
const morphableCount = modelBuffer.readUInt32LE();

modelBuffer.readOffset += vertDataSize;

const ibCount = modelBuffer.readUInt32LE();
const iCount = modelBuffer.readUInt32LE();
const iSize = modelBuffer.readUInt32LE();

console.log(`ibCount = ${ibCount}`);
console.log(`iCount = ${iCount}`);
console.log(`iSize = ${iSize} bytes`);

const indexDataSize = iSize * iCount;

modelBuffer.readOffset += indexDataSize;

const numGeometries = modelBuffer.readUInt32LE();
console.log(`numGeometries = ${numGeometries}`);

console.log(`current = ${modelBuffer.readOffset}`);
