import { posix as path } from "path";

export const assetWhiteListExt = [
    "jpg",
    "jpeg",
    "png",
    "json",
    "xml",
    "as",
    "glsl",
    "hlsl",
    "ani",
    "mdl",
];
export const assetWhitelistSet = new Set(assetWhiteListExt);
export const assetInWhiteList = (assetPath) => {
    const ext = path.parse(assetPath).ext.slice(1); // remove . at biginning

    return assetWhitelistSet.has(ext);
};
