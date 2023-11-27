import * as path from "path";
import * as fs from "fs";
import * as vscode from "vscode";
import { EventEmitter } from "events";
import { logger } from "./Logger";
const print = (...args: any) => logger.log(__filename, ...args);
import { copyRecursiveSync } from "./utils/copyFilesRecursive";
import { jsonPrettyArray } from "./utils/jsonStringify";
import sharp from "sharp";

import { XMLParser, XMLBuilder } from "fast-xml-parser"; // https://github.com/NaturalIntelligence/fast-xml-parser/blob/c7b3cea4ead020c21d39e135a50348208829e971/docs/v4/2.XMLparseOptions.md
import { AssetTypes } from "./types";
import { SmartBuffer } from "smart-buffer";

/*
    add exclude 
    add types of assets 50/50
    add builtin assets DONE
    add error type for files which is not possible to parse
*/

export interface Asset {
    baseName: string;
    absPath: string;
    extension: string;
    path: string;
    type: string;
    projectFile?: boolean;
    preview?: string;
    meta?: object;
}

const PREWVIEW_SIZE = 128;

class AssetWatcher extends EventEmitter {
    public assets: Array<Asset> = [];
    public builtInAssets: Array<Asset> = [];
    private xmlParser = new XMLParser({
        ignoreDeclaration: true,
    });
    directory: string = "";
    extensionPath: string = "";

    public onAssetsChange: (() => void) | undefined;

    constructor() {
        super();
    }

    async searchBuiltinAssets(extensionUri: vscode.Uri) {
        const builtinPath = path.join(extensionUri.fsPath, "res", "build-in-assets.json");
        const builtInRaw = fs.readFileSync(builtinPath, "utf8");
        const builtInJSON = JSON.parse(builtInRaw) as Array<Asset>;

        // !!!add error check, file could be missing
        this.builtInAssets = builtInJSON;
        print("builtins assets: ", this.builtInAssets);
    }

    async searchAssets() {
        print("Searching assets");
        const files = await vscode.workspace.findFiles("**");

        const newAssets = files.map(async (file) => {
            return await this.fileToAsset(file.fsPath, true);
        });

        print(`new assets count :  ${newAssets.length}`);
        // print(`builtin assets count :  ${this.builtInAssets.length}`);

        this.assets = await Promise.all(newAssets);
        // this.assets = [...this.builtInAssets, ...newAssets];
    }

    async getAssets(builtins = false) {
        if (!this.assets.length) {
            await this.searchAssets();
        }
        return builtins ? [...(this.builtInAssets ?? []), ...this.assets] : this.assets;
    }

    async renameFile(relativePath: string, newName: string) {
        const { dir, name, ext } = path.parse(relativePath);

        const fullDir = path.join(this.directory, dir);
        const oldFullPath = path.join(this.directory, relativePath);
        const newFullPath = path.format({
            dir: fullDir,
            name: newName,
            ext,
        });

        const newRelPath = path.format({
            dir,
            name: newName,
            ext,
        });

        try {
            fs.renameSync(oldFullPath, newFullPath);
        } catch (error) {
            print("error renaming file ", relativePath, newName, error);
            return "";
        }

        return newRelPath;
    }

    readAsset(assetRelativePath: string, assetType: string) {
        const fullPath = path.join(this.directory, assetRelativePath);

        let rawBuffer: Buffer;
        try {
            rawBuffer = fs.readFileSync(fullPath);
        } catch (error) {
            print("error read file", path, error);
            return "";
        }

        const processor = assetProcessors[assetType];
        if (!processor) {
            print("reading, missing proccesssor for asset", assetType, assetRelativePath);
            return "";
        }

        // !proccessor could have error!
        return processor.read(rawBuffer);
    }

    writeAsset(assetRelativePath: string, data: any, assetType: string) {
        const processor = assetProcessors[assetType];
        if (!processor) {
            print("writing, missing proccesssor for asset", assetType, assetRelativePath);
            return;
        }

        // ???? maybe use Buffer
        const processedStr = processor.write(data);

        const fullPath = path.join(this.directory, assetRelativePath);

        try {
            fs.writeFileSync(fullPath, processedStr);
        } catch (error) {
            print("error writing file", assetRelativePath, error);
        }
    }

    readFileType(file: string) {
        let type = "unknown";
        // !!!! error handling
        const ext = path.extname(file);

        switch (ext) {
            case ".xml":
                try {
                    const rawXML = fs.readFileSync(file);
                    let xmlObject = this.xmlParser.parse(rawXML);
                    const xmlType = Object.keys(xmlObject)?.[0] ?? "error";
                    type = "xml_" + xmlType;
                } catch (e) {
                    type = "xml_error";
                }
                break;

            case ".json":
                try {
                    const rawJson = fs.readFileSync(file).toString();
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

    async fileToAsset(file: string, projectFile: boolean = false): Promise<Asset> {
        const absPath = this.getAbsPath(file);
        const type = await this.readFileType(file);
        // const preview = await this.getImagePreview(absPath, type);
        // const meta = await this.getImageMeta(absPath, type);

        const typesToProcess = new Set([AssetTypes.image, AssetTypes.model3d]);

        let processOutput = {};
        if (typesToProcess.has(type) && type in assetProcessors) {
            const fileBuffer = fs.readFileSync(absPath);
            processOutput = { ...(await assetProcessors[type].read(fileBuffer)) };
        }

        // const baseName = path.basename(file);
        // const extension = path.extname(file);
        const { ext, name } = path.parse(file);

        return {
            baseName: name,
            absPath,
            path: this.getRelative(file),
            extension: ext,
            type,
            projectFile,
            ...processOutput,
        };
    }

    attach(context: vscode.ExtensionContext) {
        this.extensionPath = context.extensionPath;

        if (vscode.workspace.workspaceFolders?.length) {
            this.directory = vscode.workspace.workspaceFolders?.[0]?.uri?.fsPath;
        }

        if (!this.directory) {
            print("dirrectory is undefined, unable to attach");
            return;
        }

        // ! test for multple files deleted
        // ! possibly add some debounce

        const watcher = vscode.workspace.createFileSystemWatcher(
            new vscode.RelativePattern(this.directory, "**")
        );

        watcher.onDidCreate(async (e) => {
            const fspath = this.getRelative(e.fsPath);
            print("created file ", fspath);
            const index = this.assets.findIndex((asset) => asset.path === fspath);
            if (index < 0) {
                this.assets.splice(index, 0, await this.fileToAsset(e.fsPath, true));
                this.fireChangedEvent();
            }
        });

        watcher.onDidChange(async (e) => {
            const fspath = this.getRelative(e.fsPath);
            print("created file ", fspath);
            const index = this.assets.findIndex((asset) => asset.path === fspath);
            if (index >= 0) {
                this.assets.splice(index, 1, await this.fileToAsset(e.fsPath, true));
                this.fireChangedEvent();
            }
        });

        watcher.onDidDelete((e) => {
            const fspath = this.getRelative(e.fsPath);
            print("deleted file ", fspath);
            const index = this.assets.findIndex((asset) => asset.path === fspath);
            if (index >= 0) {
                this.assets.splice(index, 1);
                this.fireChangedEvent();
            }
        });
    }

    async getImageMeta(absPath: string, type: string) {
        if (type === "image") {
            const imageBuffer = fs.readFileSync(absPath);

            try {
                const imgMeta = await (await sharp(imageBuffer)).metadata();

                // print(thumbnail);
                return imgMeta;
            } catch (err) {
                print(err);
            }
        }
        return null;
    }

    async getImagePreview(absPath: string, type: string) {
        if (type === "image") {
            const imageBuffer = fs.readFileSync(absPath);

            try {
                const thumbnailBuffer = await sharp(imageBuffer)
                    .resize({
                        fit: "contain",
                        width: PREWVIEW_SIZE,
                        height: PREWVIEW_SIZE,
                        // withoutEnlargement: true,
                    })
                    .jpeg({ force: true, quality: 80 })
                    .toBuffer();

                const thumbnail = thumbnailBuffer.toString("base64");
                // print(thumbnail);
                return thumbnail;
            } catch (err) {
                print(err);
            }
        }

        return "";
    }

    async uploadAssets(extensions: string[], to: string[]) {
        // todo : decide what to do when name conflict

        const filters: any = Object.fromEntries(extensions.map((ext) => [ext, ext]));

        const options: vscode.OpenDialogOptions = {
            canSelectMany: false,
            openLabel: "Open",
            canSelectFiles: true,
            canSelectFolders: false,
            filters,
            title: "Select assets",
        };

        const fileUri = await vscode.window.showOpenDialog(options);

        if (!fileUri || !fileUri[0]) {
            return "";
        }

        const file = fileUri[0].fsPath;
        const base = path.basename(file);
        const relative = path.join(...to, base);
        const dest = path.join(this.directory, relative);

        // file already in the folder
        if (file === dest) return relative;

        // fs.copyFileSync(file, dest);
        // copyRecursiveSync(file, dest);
        fs.cpSync(file, dest, {}); // it works !!! even with missing destination
        return relative;
    }

    async copyAssets(from: string[], to: string[]) {
        const fullFrom = path.join(this.extensionPath, ...from);
        const fullTo = this.findNextIncrementName(path.join(this.directory, ...to));

        try {
            fs.cpSync(fullFrom, fullTo);
            return path.join(...to);
        } catch (error) {
            return "";
        }
    }

    async removeAsset(asset: string[]) {
        const fullPath = path.join(this.directory, ...asset);

        try {
            fs.unlinkSync(fullPath);
            return fullPath;
        } catch (error) {
            return "";
        }
    }

    findNextIncrementName(desiredPath: string, sep = "_", index = 1) {
        const { dir, name, ext } = path.parse(desiredPath);
        while (true) {
            const exist = fs.existsSync(desiredPath);
            if (!exist) return desiredPath;
            desiredPath = path.format({ dir, ext, name: `${name}${sep}${index}` });
            index++;
        }
    }

    getAbsPath(file: string) {
        return path.resolve(file);
    }

    getRelative(file: string) {
        return path.relative(this.directory, file);
    }

    fireChangedEvent() {
        this.emit("assetsChanged", { assets: this.assets });
    }
}

// Exports class singleton to prevent multiple
export const Assets = new AssetWatcher();

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
            const thumbnailBuffer = await sharp(imageBuffer);

            const meta = await thumbnailBuffer.metadata();

            const preview = (
                await thumbnailBuffer
                    .resize({
                        fit: "contain",
                        width: PREWVIEW_SIZE,
                        height: PREWVIEW_SIZE,
                        // withoutEnlargement: true,
                    })
                    .jpeg({ force: true, quality: 80 })
                    .toBuffer()
            ).toString("base64");

            // print(thumbnail);
            return {
                preview,
                meta,
            };
        },
        write: () => {},
    },
};
