import { posix as path } from "path";
import * as fs from "fs";
import { logger } from "./Logger";
const print = (...args: any) => console.log(...args); //logger.log(__filename, ...args);
import { copyRecursiveSync } from "./utils/copyFilesRecursive";
import { jsonPrettyArray } from "./utils/jsonStringify";
import sharp from "sharp";

import { XMLParser, XMLBuilder } from "fast-xml-parser"; // https://github.com/NaturalIntelligence/fast-xml-parser/blob/c7b3cea4ead020c21d39e135a50348208829e971/docs/v4/2.XMLparseOptions.md
import { AssetTypes, Asset } from "./types";
import { SmartBuffer } from "smart-buffer";

/*
    add exclude 
    add types of assets 50/50
    add builtin assets DONE
    add error type for files which is not possible to parse
*/

const PREVIEW_SIZE = 128;

export class AssetsProcessor {
    private xmlParser = new XMLParser({
        ignoreDeclaration: true,
    });

    readFileType(ext: string, buffer: Buffer) {
        let type = "unknown";
        // !!!! error handling

        switch (ext) {
            case ".xml":
                try {
                    let xmlObject = this.xmlParser.parse(buffer);
                    const xmlType = Object.keys(xmlObject)?.[0] ?? "error";
                    type = "xml_" + xmlType;
                } catch (e) {
                    type = "xml_error";
                }
                break;

            case ".json":
                try {
                    const rawJson = buffer.toString();
                    const parsedJson = JSON.parse(rawJson);
                    const jsonType = parsedJson.techniques ? "material" : "error";
                    type = "json_" + jsonType;
                } catch (e) {
                    type = "json_error";
                }
                break;

            case ".png":
            case ".jpg":
                type = AssetTypes.image;
                break;

            case ".hlsl":
            case ".glsl":
                type = "shader";
                break;

            case ".as":
                type = "script";
                break;

            case ".mdl":
                type = AssetTypes.model3d;
                break;

            default:
                break;
        }

        return type;
    }

    async read(type: string, fileBuffer: Buffer) {
        if (!(type in assetProcessors)) {
            print(`read type ${type} not in proccessors`);
            return {};
        }

        return await assetProcessors[type].read(fileBuffer);
    }

    async write(type: string, data: any) {
        if (!(type in assetProcessors)) {
            print(`write type ${type} not in proccessors`);
            return {};
        }

        return await assetProcessors[type].write(data);
    }

    async fileToAsset(
        absPath: string,
        relativePath: string,
        projectFile: boolean = false
    ): Promise<Asset> {
        const { ext, name } = path.parse(absPath);
        // const absPath = path.resolve(file);
        const fileBuffer = fs.readFileSync(absPath);
        const type = await this.readFileType(ext, fileBuffer);

        const typesToProcess = new Set([AssetTypes.image, AssetTypes.model3d]);

        let processOutput = {};
        if (typesToProcess.has(type)) {
            processOutput = await this.read(type, fileBuffer);
        }

        // const baseName = path.basename(file);
        // const extension = path.extname(file);

        return {
            baseName: name,
            absPath,
            path: relativePath,
            extension: ext,
            type,
            projectFile,
            ...processOutput,
        };
    }

    // async getImageMeta(absPath: string, type: string) {
    //     if (type !== "image") return;
    //     const imageBuffer = fs.readFileSync(absPath);

    //     try {
    //         const imgSharp = await sharp(imageBuffer);
    //         const { isOpaque } = await imgSharp.stats();
    //         const { width, height, size, format } = await imgSharp.metadata();

    //         // print(thumbnail);
    //         return {
    //             width,
    //             height,
    //             size,
    //             format,
    //             isOpaque,
    //         };
    //     } catch (err) {
    //         print(err);
    //     }

    //     return {};
    // }

    // async getImagePreview(absPath: string, type: string) {
    //     if (type !== "image") return;

    //     const imageBuffer = fs.readFileSync(absPath);

    //     try {
    //         const thumbnailBuffer = await sharp(imageBuffer)
    //             .resize({
    //                 fit: "contain",
    //                 width: PREVIEW_SIZE,
    //                 height: PREVIEW_SIZE,
    //                 // withoutEnlargement: true,
    //             })
    //             .jpeg({ force: true, quality: 80 })
    //             .toBuffer();

    //         const thumbnail = thumbnailBuffer.toString("base64");
    //         // print(thumbnail);
    //         return thumbnail;
    //     } catch (err) {
    //         print(err);
    //     }

    //     return "";
    // }
}

export interface AssetProcessor {
    read: (Buffer) => any;
    write: (any) => any;
}

const matShaderParameters = [
    "MatDiffColor",
    "MatSpecColor",
    "MatEmissiveColor",
    "MatEnvMapColor",
    "Roughness",
    "Metallic",
    "UOffset",
    "VOffset",
];
const materialTextures = ["diffuse", "normal", "specular", "emissive", "environment"];

const materialParameters = ["cull", "fill"];

const elementTypeSizes = {
    INT: 4, // INT
    FLOAT: 4, // FLOAT
    FLOAT_VEC2: 2 * 4, // FLOAT vec2
    FLOAT_VEC3: 3 * 4, // vec3
    FLOAT_VEC4: 4 * 4, // vec4
    UBYTE4: 4, // unsigned
    UBYTE4_NORM: 4, // unsigned
};

export const LEGACY_VERTEXELEMENTS = [
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

// ? for now this is just a proof of concept, should clean up later!
export const assetProcessors: Record<string, AssetProcessor> = {
    [AssetTypes.json_material]: {
        read: (buffer: Buffer) => {
            const materialObj = JSON.parse(buffer.toString());

            materialObj.parameters = {};

            // flattening objects to be able to group controls

            if (materialObj.shaderParameters) {
                matShaderParameters.forEach((key) => {
                    if (!(key in materialObj.shaderParameters)) return;
                    let values = materialObj.shaderParameters[key]
                        .split(" ")
                        .map((v) => parseFloat(v));
                    if (values.length === 1) values = values[0]; // something  not only arrays!
                    materialObj[key] = values;
                });
            }

            if (materialObj.textures) {
                materialTextures.forEach((key) => {
                    if (!(key in materialObj.textures)) return;
                    let value = materialObj.textures[key];
                    materialObj[key] = value;
                });
            }

            // delete materialObj.shaderParameters;

            // ? what if missing
            materialObj.technique = materialObj.techniques?.[0]?.name;

            return materialObj;
        },
        write: (materialObj: any) => {
            // ? add shaderParameters obj

            materialObj.shaderParameters = { ...(materialObj.shaderParameters ?? {}) };

            matShaderParameters.forEach((key) => {
                if (key in materialObj) {
                    const param = materialObj[key];
                    let str;
                    if (param.length) {
                        str = param.join(" ").trim();
                    } else {
                        str = String(param);
                    }
                    materialObj.shaderParameters[key] = str;
                    delete materialObj[key];
                }
            });

            materialObj.textures = { ...(materialObj.textures ?? {}) };
            materialTextures.forEach((texture) => {
                if (texture in materialObj) {
                    materialObj.textures[texture] = materialObj[texture];
                    delete materialObj[texture];
                }
            });

            materialObj.techniques = [{ name: materialObj.technique }];

            delete materialObj.technique;
            delete materialObj.parameters;

            return jsonPrettyArray(materialObj);
        },
    },

    [AssetTypes.xml_material]: {
        read: (buffer: Buffer) => {
            const xmlParser = new XMLParser({
                ignoreDeclaration: true,
                parseAttributeValue: false,
                ignoreAttributes: false,
                attributeNamePrefix: "",
            });

            const materialObj = xmlParser.parse(buffer).material;
            print("xml parsed", materialObj);

            if (!materialObj) {
                print("no material for xml_processor", buffer.toString());
                return {};
            }

            const parametersSet = new Set(matShaderParameters);

            if (materialObj.parameter) {
                if (!Array.isArray(materialObj.parameter)) {
                    materialObj.parameter = [materialObj.parameter];
                }

                materialObj.parameter.forEach((parObj) => {
                    const { value, name } = parObj;
                    if (!parametersSet.has(name)) return;
                    let values = value.split(" ").map((v) => parseFloat(v));
                    if (values.length === 1) values = values[0]; // something  not only arrays!
                    materialObj[name] = values;
                });
            }

            if (materialObj.texture) {
                if (!Array.isArray(materialObj.texture)) {
                    materialObj.texture = [materialObj.texture];
                }

                const textureSet = new Set(materialTextures);

                materialObj.texture.forEach((obj) => {
                    const { name, unit } = obj;
                    if (!textureSet.has(unit)) return;
                    materialObj[unit] = name;
                });
            }

            materialObj.technique = materialObj.technique.name;

            materialParameters.forEach((key) => {
                if (!(key in materialObj)) return;
                materialObj[key] = materialObj[key].value;
            });

            return materialObj;
        },

        write: (materialObj: any) => {
            materialParameters.forEach((key) => {
                if (!(key in materialObj)) return;
                materialObj[key] = { value: materialObj[key] };
            });

            materialObj.technique = { name: materialObj.technique };

            materialObj.parameter = [];
            matShaderParameters.forEach((key) => {
                if (!(key in materialObj)) return;

                const param = materialObj[key];

                let str;
                if (param.length) {
                    str = param.join(" ").trim();
                } else {
                    str = String(param);
                }

                materialObj.parameter.push({
                    name: key,
                    value: str,
                });
                delete materialObj[key];
            });

            materialObj.texture = [];
            materialTextures.forEach((unit) => {
                if (!(unit in materialObj)) return;
                materialObj.texture.push({
                    unit,
                    name: materialObj[unit],
                });

                delete materialObj[unit];
            });

            materialObj = { material: materialObj };

            const xmlBuilder = new XMLBuilder({
                attributeNamePrefix: "",
                ignoreAttributes: false,
                format: true,
                suppressEmptyNode: true,
            });

            // print("mat obj before build", materialObj);

            try {
                const res = xmlBuilder.build(materialObj);
                return res;
            } catch (error) {
                print("error writing ", materialObj, error);
            }

            return "";
        },
    },

    [AssetTypes.model3d]: {
        read: (buffer: Buffer) => {
            const modelBuffer = SmartBuffer.fromBuffer(buffer);

            const version = modelBuffer.readString(4);

            // !!! only for UMDL
            // my mac seems to be Little endian
            const vertBufferCount = modelBuffer.readUInt32LE();
            const vertCount = modelBuffer.readUInt32LE();
            const elemMask = modelBuffer.readUInt32LE().toString(2);

            // console.log(`model version = ${version}`);
            // console.log(`vertBufferCount = ${vertBufferCount}`);
            // console.log(`vertCount = ${vertCount}`);
            // console.log(`elemMask = ${elemMask}`);

            // todo : multiple vertBufferCount
            let vertexSize = 0;
            for (let i = 0; i < elemMask.length; i++) {
                // const element = array[i];
                const elemExist = +elemMask.at(-(i + 1));
                const elemSize = elemExist * LEGACY_VERTEXELEMENTS[i];
                vertexSize += elemSize;
            }

            // console.log(`vertexSize = ${vertexSize} bytes`);
            const vertDataSize = vertCount * vertexSize;

            const morphableStart = modelBuffer.readUInt32LE();
            const morphableCount = modelBuffer.readUInt32LE();

            modelBuffer.readOffset += vertDataSize;

            const indexBufferCount = modelBuffer.readUInt32LE();
            const indexCount = modelBuffer.readUInt32LE();
            const indexSize = modelBuffer.readUInt32LE();

            // console.log(`indexBufferCount = ${indexBufferCount}`);
            // console.log(`indexCount = ${indexCount}`);
            // console.log(`indexSize = ${indexSize} bytes`);

            const indexDataSize = indexSize * indexCount;

            modelBuffer.readOffset += indexDataSize;

            const numGeometries = modelBuffer.readUInt32LE();
            // console.log(`numGeometries = ${numGeometries}`);

            return {
                numGeometries,
                vertCount,
                indexCount,
                sizeBytes: Buffer.byteLength(buffer),
            };
        },
        write: () => {
            print("NO processor for model3d");
            return "";
        },
    },

    [AssetTypes.image]: {
        read: async (imageBuffer: Buffer) => {
            const imgSharp = await sharp(imageBuffer);
            const { isOpaque } = await imgSharp.stats();
            const { width, height, size, format } = await imgSharp.metadata();
            const preview = (
                await imgSharp
                    .resize({
                        fit: "contain",
                        width: PREVIEW_SIZE,
                        height: PREVIEW_SIZE,
                        // withoutEnlargement: true,
                    })
                    .jpeg({ force: true, quality: 80 })
                    .toBuffer()
            ).toString("base64");
            // print(thumbnail);
            return {
                preview,
                width,
                height,
                size,
                format,
                isOpaque,
            };
            return {
                preview: "",
                width: 100,
                height: 100,
                size: 10,
                format: "png",
                isOpaque: true,
            };
        },
        write: () => {},
    },
};
