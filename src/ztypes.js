// !!! changed to js so that i dont get errors with rollup
// import * as l10n from "@vscode/l10n";

/*
    to get values stored in checks  
    ```
    const minValue = schema.shape.name._def.checks.find(({ kind }) => kind === "min").value;
    
    ```

    biggest issue is parameters with 2 and more options 
*/

import { z } from "zod";

export const uiDescriptions = {
    none: () => ({
        name: "none",
        group: "main",
    }),
    numberSlider: ({
        label,
        group = "main",
        min = 0,
        max = 1,
        defValue = 0,
        steps = 100,
        valueLabel = "",
        showAlways = true,
        valueTemplate = (val) => {
            return val;
        },
    }) => ({
        showAlways,
        name: "numberSlider",
        label,
        group,
        steps,
        min: min,
        max: max,
        defValue,
        valueLabel,
        valueTemplate,
    }),
    array2d: ({ label, group = "main", min, max, defValue = [0, 0], showAlways = true }) => ({
        showAlways,
        name: "array2d",
        label,
        group,
        min: min,
        max: max,
        defValue,
    }),
    array3d: ({ label, group = "main", min, max, defValue = [0, 0, 0], showAlways = true }) => ({
        showAlways,
        name: "array3d",
        label,
        group,
        min: min,
        max: max,
        defValue,
    }),
    array4d: ({ label, group = "main", min, max, defValue = [0, 0, 0, 0], showAlways = true }) => ({
        showAlways,
        name: "array4d",
        label,
        group,
        min: min,
        max: max,
        defValue,
    }),
    enum: ({ label, group = "main", options, optionLabels, defValue, showAlways = true }) => ({
        showAlways,
        name: "enum",
        label,
        group,
        options,
        optionLabels,
        defValue,
    }),
    filepath: ({
        label,
        group = "main",
        directory = ["/"],
        extensions,
        types,
        typeName,
        defValue,
        showAlways = true,
    }) => ({
        showAlways,
        name: "filepath",
        directory,
        label,
        group,
        extensions,
        types,
        typeName,
        defValue,
    }),
    text: ({ label, group = "main", defValue = "", showAlways = true }) => ({
        showAlways,
        name: "text",
        label,
        group,
        defValue,
    }),
    tags: ({ label = "Tag", group = "Tags", defValue = "", showAlways = true }) => ({
        showAlways,
        name: "tags",
        label,
        group,
        defValue,
    }),
    mainScript: ({
        label = "Script",
        group = "Advanced",
        defValue = "main.as",
        showAlways = true,
        info,
    }) => ({
        name: "script",
        label,
        group,
        defValue,
        showAlways,
        info,
    }),
    icon: ({ label = "Icon", group = "main", defValue = "", showAlways = true, info }) => ({
        name: "icon",
        label,
        info,
        group,
        defValue,
        showAlways,
    }),
    texture: ({ label = "Texture", group = "main", defValue = "", showAlways = true }) => ({
        name: "texture",
        label,
        group,
        defValue,
        showAlways,
    }),
    // !!!! color alpha redundant here
    color: ({ label, group = "main", min, max, defValue = [1, 1, 1], showAlways = true }) => ({
        showAlways,
        name: "color",
        label,
        group,
        min: min,
        max: max,
        defValue,
        showAlways,
    }),
    colorAlpha: ({
        label = "Color",
        group = "main",
        min,
        max,
        defValue = [1, 1, 1, 1],
        showAlways = true,
    }) => ({
        showAlways,
        name: "colorAlpha",
        label,
        group,
        alpha: true,
        min: min,
        max: max,
        defValue,
    }),
    uv_transform: ({
        label = "UV transform",
        group = "UV transform",
        defValue = [0, 0, 0],
        showAlways = true,
    }) => ({
        showAlways,
        name: "uv_transform",
        label,
        group,
        compositionGroup: "uv_transform",
        defValue,
    }),
    bool: ({ label, group = "main", defValue = false, showAlways = true }) => ({
        showAlways,
        name: "bool",
        label,
        group,
        defValue,
    }),
    object: ({ label, group = "main", defValue = {}, showAlways = true, defExpanded = true }) => ({
        showAlways,
        name: "object",
        label,
        group,
        defValue,
        defExpanded,
    }),
    array: ({
        label = "array",
        group = "main",
        elementName,
        defaultElement,
        defValue = [],
        showAlways = true,
    }) => ({
        showAlways,
        name: "array",
        label,
        group,
        elementName: elementName,
        defaultElement: defaultElement,
        defValue,
    }),
    union: ({}) => ({
        name: "union",
    }),
    discriminatedUnion: ({}) => ({
        name: "discriminatedUnion",
    }),
};

const ZNumberSlider = z.number().describe(uiDescriptions.numberSlider({ min: 0, max: 1 }));

const ZBool = z.boolean().describe(uiDescriptions.bool({ defValue: false }));
const ZArray2D = z
    .number()
    .array()
    .length(2, { message: "Array size must be 2" })
    .describe(uiDescriptions.array2d({}));
const ZArray3D = z
    .number()
    .array()
    .length(3, { message: "Array size must be 3" })
    .describe(uiDescriptions.array3d({}));
const ZArray4D = z
    .number()
    .array()
    .length(4, { message: "Array size must be 4" })
    .describe(uiDescriptions.array4d({}));
const ZColor = z
    .number()
    .array()
    .length(3, { message: "Color size must be 3" })
    .describe(uiDescriptions.color({ min: 0, max: 1, label: "Color" }));
const ZColorAlpha = z
    .number()
    .array()
    .length(4, { message: "Color size must be 4" })
    .describe(uiDescriptions.colorAlpha({ min: 0, max: 1, alpha: true, label: "Color" }));

const ZFaceAnchor = z.enum([
    "free",
    "face",
    "right_eye",
    "left_eye",
    "middle_eyes",
    "forehead",
    "nose",
    "mouth",
    "right_cheek",
    "left_cheek",
    "lower_lip",
    "upper_lip",
]);

const ZFaceAnchorLabels = [
    "Free",
    "Face",
    "Right eye",
    "Left eye",
    "Between eyes",
    "Forehead",
    "Nose",
    "Mouth",
    "Right cheek",
    "Left cheek",
    "Lower lip",
    "Upper lip",
];

const ZLightType = z.enum(["point", "ambient", "direct"]);
const ZLightTypeLabels = ["Point", "Ambient", "Direct"];

const AssetTypes = {
    texture: {
        defValue: "Textures/Spot.png",
        extensions: ["png", "jpg"],
        directory: ["Textures"],
        typeName: "texture",
        label: "Texture",
    },
    material: {
        defValue: "Materials/DefaultGrey.xml",
        extensions: ["xml", "json"],
        types: ["xml_material", "json_material"],
        directory: ["Materials"],
        typeName: "material",
        label: "Material",
    },
    technique: {
        defValue: "Techniques/DiffUnlit.xml",
        extensions: ["xml"],
        types: ["xml_technique"],
        directory: ["Techniques"],
        typeName: "technique",
        label: "Technique",
    },
    renderPath: {
        defValue: "",
        extensions: ["xml"],
        types: ["xml_renderpath"],
        directory: ["RenderPaths"],
        typeName: "renderPath",
        label: "Render path",
    },
    animationClip: {
        defValue: "",
        extensions: ["ani"],
        directory: ["Animations"],
        typeName: "animationClip",
        label: "Animation clip",
    },
    model3d: {
        defValue: "Models/DefaultPlane.mdl",
        extensions: ["mdl"],
        directory: ["Models"],
        typeName: "model3d",
        label: "Model 3d",
    },
    script: {
        defValue: "",
        extensions: ["as"],
        directory: ["Scripts"],
        typeName: "script",
        label: "Script",
    },
};

const ZAsset = z.string().describe(uiDescriptions.filepath({}));

const ZText = z.string().describe(uiDescriptions.text({}));
// ? idea to use function, use later to refactor
// const ZText = (desc = {}) => z.string().describe(uiDescriptions.text(desc));
// ZText({})
const ZTags = z.string().describe(uiDescriptions.tags({}));

const ZVisibleType = z.enum(["always", "face", "animation", "mouth_open"]);
const ZVisibleTypeLabels = ["Always", "Face", "Animation", "Mouth open"];

const ZPatchFitMode = z.enum(["none", "crop", "pad"]);
const ZPatchFitModeLabels = ["None", "Crop", "Pad"];

// const ZTextureAsset = ZAsset.describe(uiDescriptions.filepath(AssetTypes.texture));
// const ZModel3dAsset = ZAsset.describe(uiDescriptions.filepath(AssetTypes.model3d));
// const ZScriptAsset = ZAsset.describe(uiDescriptions.filepath(AssetTypes.script));
// const ZRenderPathAsset = ZAsset.describe(uiDescriptions.filepath(AssetTypes.renderPath));

const ZTechniqueAsset = (desc) =>
    z.string().describe({ ...uiDescriptions.filepath(AssetTypes.technique), ...desc });

const ZModel3dAsset = (desc) =>
    z.string().describe({ ...uiDescriptions.filepath(AssetTypes.model3d), ...desc });

const ZRenderPathAsset = (desc) =>
    z.string().describe({ ...uiDescriptions.filepath(AssetTypes.renderPath), ...desc });

const ZTextureAsset = (desc) =>
    z.string().describe({ ...uiDescriptions.filepath(AssetTypes.texture), ...desc });

const ZMaterialAsset = (desc) =>
    z.string().describe({ ...uiDescriptions.filepath(AssetTypes.material), ...desc });

// const ZMaterialAsset({ label : material}) = ZAsset.describe(uiDescriptions.filepath(AssetTypes.material));

// export const ZTextureObject = z.union(
//     [
//         ZTextureAsset.default(AssetTypes.texture.default).transform(val => ({
//             diffuse: val,
//             color: [1.0, 1.0, 1.0, 1.0]
//         })),
//         z.object({
//             diffuse: ZTextureAsset.default(AssetTypes.texture.default),
//             // !!! probably will miss texture property
//             // texture: ZTextureAsset,
//             normal: ZTextureAsset.optional(),
//             color: ZColorAlpha.default([1.0, 1.0, 1.0, 1.0])
//         })
//     ]
// ).describe(uiDescriptions.object({}))

const ZBlendModes = z.enum([
    "replace",
    "alpha",
    "add",
    "addalpha",
    "Multiply",
    "Lighten",
    "Darken",
    "LinearLight",
    "Screen",
    "Overlay",
    "SoftLight",
    "SoftLight2",
    "ColorDodge",
    "ColorBurn",
    "VividLight",
    "PinLight",
    "HardMix",
    "Difference",
    "Exclusion",
    "Hue",
    "Saturation",
    "Color",
    "Luminosity",
]);

const ZBlendModesLabels = [
    "Replace",
    "Alpha",
    "Additive",
    "Add alpha",
    "Multiply",
    "Lighten",
    "Darken",
    "Linear Light",
    "Screen",
    "Overlay",
    "Soft Light",
    "Soft Light 2",
    "Color Dodge",
    "Color Burn",
    "Vivid Light",
    "Pin Light",
    "Hard Mix",
    "Difference",
    "Exclusion",
    "Hue",
    "Saturation",
    "Color",
    "Luminosity",
];

const ZAnimationType = z.enum(["once", "loop"]);

const ZAnimationTypeLabels = ["Once", "Loop"];

const ZEventTrigger = z.enum([
    "none",
    "mouth_open",
    "mouth_close",
    "face_found",
    "face_lost",
    "tap",
]);

const ZEventTriggerLabels = ["None", "Mouth Open", "Mouth Close", "Face Found", "Face Lost", "Tap"];

const ZTextureAnimation = z
    .object({
        type: ZAnimationType.describe(
            uiDescriptions.enum({
                label: "Type",
                options: Object.keys(ZAnimationType.Values),
                optionLabels: ZAnimationTypeLabels,
                defValue: ZAnimationType.Values.mouth_open,
            })
        ),
        trigget_start: ZEventTrigger.describe(
            uiDescriptions.enum({
                label: "Start trigger",
                options: Object.keys(ZEventTrigger.Values),
                optionLabels: ZEventTriggerLabels,
                defValue: ZEventTrigger.Values.mouth_open,
            })
        ),
        trigget_stop: ZEventTrigger.describe(
            uiDescriptions.enum({
                label: "Stop trigger",
                options: Object.keys(ZEventTrigger.Values),
                optionLabels: ZEventTriggerLabels,
                defValue: ZEventTrigger.Values.mouth_close,
            })
        ),
        fps: ZNumberSlider.describe(
            uiDescriptions.numberSlider({
                defValue: 30,
                min: 0,
                max: 240,
                valueLabel: "1/s",
                // valueTemplate: (val) => Math.floor(val * 100),
                label: "Fps",
            })
        ),
    })
    .describe(uiDescriptions.object({ label: "Animation", defExpanded: false }));

export const ZTextureObject = z.preprocess(
    (val) => {
        if (isObject(val)) {
            // keep only diffuse not texture in object
            if (val.hasOwnProperty("texture")) {
                val["diffuse"] = val["texture"];
                delete val["texture"];
                return val;
            } else {
                return val;
            }
        }
        return {
            diffuse: val,
        };
    },
    z
        .object({
            diffuse: ZTextureAsset({ label: "Diffuse" }),
            blend_mode: ZBlendModes.describe(
                uiDescriptions.enum({
                    label: "Blend mode",
                    options: Object.keys(ZBlendModes.Values),
                    optionLabels: ZBlendModesLabels,
                    defValue: ZBlendModes.Values.replace,
                })
            ),
            color: ZColorAlpha,
            lit: ZBool.describe(uiDescriptions.bool({ label: "Lit" })),
            // !!! probably will miss texture property
            // texture: ZTextureAsset,
            // normal: ZTextureAsset({ label: "Normal" }),
            u_transform: ZArray3D.describe(
                uiDescriptions.uv_transform({
                    defValue: [1, 0, 0],
                })
            ),
            v_transform: ZArray3D.describe(
                uiDescriptions.uv_transform({
                    defValue: [0, 1, 0],
                })
            ),
            animation: ZTextureAnimation,
            // render_order: ZNumberSlider.describe(
            //     uiDescriptions.numberSlider({
            //         max: 100,
            //         min: -100,
            //         defValue: 0,
            //         showAlways: false,
            //         label: "Render order",
            //     })
            // ),
        })
        .describe(uiDescriptions.object({ showAlways: false, label: "Texture" }))
);

// const testObj = { diffuse: "diff", normal: "somenormal" };
// console.log(isObject(testObj))
// const parseResult = ZTextureObject.safeParse(testObj);

// if (parseResult.success) {
//     console.log(parseResult.data);
// } else {
//     console.log(parseResult.error)
// }

// {
// 	"techniques": [{"name": "Techniques/Diff.xml"}],
// 	"textures": {
// 		"normal" : "Textures/Normal.png"
// 	},
// 	"shaderParameters": {
// 		"UOffset": "1 0 0 0",
// 		"VOffset": "0 1 0 0",
// 		"MatDiffColor": "1 1 1 1",
// 		"MatEmissiveColor": "0 0 0",
// 		"MatEnvMapColor": "1 1 1",
// 		"MatSpecColor": "0 0 0 1",
// 		"Roughness": "0.5",
// 		"Metallic": "0"
// 	},
// 	"shaderParameterAnimations": null,
// 	"cull": "ccw",
// 	"shadowcull": "ccw",
// 	"fill": "solid",
// 	"depthbias": {
// 		"constant": 0.0,
// 		"slopescaled": 0.0
// 	},
// 	"alphatocoverage": false,
// 	"lineantialias": false,
// 	"renderorder": 128,
// 	"occlusion": true
// }

const ZCullMode = z.enum(["none", "ccw", "cw"]);

const ZFillMode = z.enum(["solid", "wireframe", "point"]);

const ZMaterialObject = z
    .object({
        technique: ZTechniqueAsset({ label: "Technique" }),
        textures: z
            .object({
                diffuse: ZTextureAsset({ label: "Diffuse" }),
                normal: ZTextureAsset({ label: "Normal" }),
                specular: ZTextureAsset({ label: "Specular" }),
                emissive: ZTextureAsset({ label: "Emissive" }),
                environment: ZTextureAsset({ label: "Environment" }),
            })
            .describe(uiDescriptions.object({})),
        parameters: z
            .object({
                MatDiffColor: ZArray4D.describe(
                    uiDescriptions.array4d({
                        defValue: [1.0, 1.0, 1.0, 1.0],
                        label: "Diffuse color",
                    })
                ),
                MatSpecColor: ZArray4D.describe(
                    uiDescriptions.array4d({
                        defValue: [0.0, 0.0, 0.0, 1.0],
                        showAlways: false,
                        label: "Specular color",
                    })
                ),
                MatEmissiveColor: ZArray3D.describe(
                    uiDescriptions.array3d({ showAlways: false, label: "Emissive color" })
                ),
                MatEnvMapColor: ZArray3D.describe(
                    uiDescriptions.array3d({
                        defValue: [1.0, 1.0, 1.0],
                        showAlways: false,
                        label: "Environment color",
                    })
                ),
                Roughness: ZNumberSlider.describe(
                    uiDescriptions.numberSlider({
                        defValue: 0.5,
                        showAlways: false,
                        label: "Roughness",
                    })
                ),
                Metallic: ZNumberSlider.describe(
                    uiDescriptions.numberSlider({
                        defValue: 0.5,
                        showAlways: false,
                        label: "Metallness",
                    })
                ),
                UOffset: ZArray4D.describe(
                    uiDescriptions.array4d({
                        defValue: [1.0, 0.0, 0.0, 0.0],
                        showAlways: false,
                        label: "U transform",
                    })
                ),
                VOffset: ZArray4D.describe(
                    uiDescriptions.array4d({
                        defValue: [0.0, 1.0, 0.0, 0.0],
                        showAlways: false,
                        label: "V transform",
                    })
                ),
            })
            .describe(uiDescriptions.object({}))
            .passthrough(),
        cull: ZCullMode.describe(
            uiDescriptions.enum({
                label: "Culling",
                options: Object.keys(ZCullMode.Values),
                defValue: ZCullMode.Values.ccw,
            })
        ),
        fill: ZFillMode.describe(
            uiDescriptions.enum({
                label: "Fill",
                options: Object.keys(ZFillMode.Values),
                defValue: ZFillMode.Values.solid,
                showAlways: false,
            })
        ),
    })
    .describe(uiDescriptions.object({}));

const ZMaterial = z
    .union([ZMaterialAsset({ label: "Material" }), ZMaterialObject])
    .describe(uiDescriptions.union({}));

export const ZMaterialArray = z.preprocess((val) => {
    if (!Array.isArray(val)) return [val];
    return val;
}, z.array(ZMaterial).describe(uiDescriptions.array({ elementName: "material", label: "Materials", defaultElement: AssetTypes.material.defValue, defValue: [AssetTypes.material.defValue] })));

// console.log(ZMaterialArray.innerType().element.options[1].description)

// const testType = z.union([
//     z.string().transform((val) => {

//         return {
//             value: val,
//             type: 'string'
//         };
//     }).default(),
//     z.number().superRefine((val, ctx) => {

//     })
// ]).array()

// const testArray = [1, "string", 2, 3];

// const parseResult = testType.safeParse(testArray);

// if (parseResult.success) {
//     console.log(parseResult.data);
// } else {
//     console.log(parseResult.error)
// }

// TextureObject.options[1].shape.

// export const TextureObject =
//     z.object({
//         diffuse: ZAsset.default(AssetTypes.texture.default).describe(uiDescriptions.filepath({ extensions: AssetTypes.texture.extensions })),
//         texture: ZAsset.default(AssetTypes.texture.default).describe(uiDescriptions.filepath({ extensions: AssetTypes.texture.extensions })),
//         normal: ZAsset.default(AssetTypes.texture.default).describe(uiDescriptions.filepath({ extensions: AssetTypes.texture.extensions })),
//         color: ZColorAlpha.default([1.0, 1.0, 1.0, 1.0])
//     }).describe(uiDescriptions.object({}))

export const ZBaseEffect = z
    .object({
        name: ZText.describe(uiDescriptions.none({})),
        tag: ZTags,
        // disabled: ZBool.default(false)
    })
    // ??? does need this ????
    .describe(uiDescriptions.object({}))
    .passthrough();

const ZFacemodelEffect = ZBaseEffect.extend({
    name: z.literal("facemodel").describe(uiDescriptions.none({})),
    mouth: ZBool.describe(uiDescriptions.bool({ defValue: true, label: "Mouth" })),
    eyes: ZBool.describe(uiDescriptions.bool({ defValue: true, label: "Eyes" })),
    position: ZArray3D.describe(uiDescriptions.array3d({ label: "Position", group: "Transform" })),
    scale: ZArray3D.describe(
        uiDescriptions.array3d({ defValue: [1, 1, 1], label: "Scale", group: "Transform" })
    ),
    rotation: ZArray3D.describe(uiDescriptions.array3d({ label: "Rotation", group: "Transform" })),
    texture: ZTextureObject,
}).describe(uiDescriptions.object({ label: "Facemodel" }));

const ZPatchAnchor = z.enum([
    "free",
    "fullscreen",
    "face",
    "right_eye",
    "left_eye",
    "middle_eyes",
    "forehead",
    "nose",
    "mouth",
    "right_cheek",
    "left_cheek",
    "lower_lip",
    "upper_lip",
]);

const ZPatchAnchorLabels = [
    "Free",
    "Fullscreen",
    "Face",
    "Right eye",
    "Left eye",
    "Between eyes",
    "Forehead",
    "Nose",
    "Mouth",
    "Right cheek",
    "Left cheek",
    "Lower lip",
    "Upper lip",
];

const ZPatchEffect = ZBaseEffect.extend({
    name: z.literal("patch").describe(uiDescriptions.none({})),
    anchor: ZPatchAnchor.describe(
        uiDescriptions.enum({
            label: "Anchor",
            options: Object.keys(ZPatchAnchor.Values),
            optionLabels: ZPatchAnchorLabels,
            defValue: ZFaceAnchor.Values.forehead,
        })
    ),
    visible: ZVisibleType.describe(
        uiDescriptions.enum({
            label: "Visible",
            options: Object.keys(ZVisibleType.Values),
            optionLabels: ZVisibleTypeLabels,
            defValue: ZVisibleType.Values.always,
        })
    ),
    fit: ZPatchFitMode.describe(
        uiDescriptions.enum({
            label: "Fit",
            options: Object.keys(ZPatchFitMode.Values),
            optionLabels: ZPatchFitModeLabels,
            defValue: ZPatchFitMode.Values.none,
        })
    ),
    size: ZArray2D.describe(
        uiDescriptions.array2d({ defValue: [1, 1], label: "Size", group: "Transform" })
    ),
    offset: ZArray3D.describe(uiDescriptions.array3d({ label: "Offset", group: "Transform" })),
    allow_rotation: ZBool.describe(
        uiDescriptions.bool({ label: "Allow rotation", group: "Transform" })
    ),
    rotation: ZArray3D.describe(uiDescriptions.array3d({ label: "Rotation", group: "Transform" })),
    // pass: ZRenderPathAsset({ label: "Render Path" }),
    texture: ZTextureObject,
}).describe(uiDescriptions.object({ label: "Patch" }));

// ZBaseLightEffect.shape.type.removeDefault().Values

const ZBeautifyEffect = ZBaseEffect.extend({
    name: z.literal("beautify").describe(uiDescriptions.none({})),
    mix: ZNumberSlider.describe(uiDescriptions.numberSlider({ defValue: 0.65, label: "Mix" })),
}).describe(uiDescriptions.object({ label: "Beautify" }));

// "lookup": "ColorFilter/lookup.png",
// "intensity":

const ZColorfilterEffect = ZBaseEffect.extend({
    name: z.literal("colorfilter").describe(uiDescriptions.none({})),
    intensity: ZNumberSlider.describe(
        uiDescriptions.numberSlider({
            defValue: 0.75,
            valueLabel: "%",
            valueTemplate: (val) => Math.floor(val * 100),
            label: "Intensity",
        })
    ),
    lookup: ZTextureAsset({ label: "LUT" }),
}).describe(uiDescriptions.object({ label: "Color filter" }));

const ZModel3dEffect = ZBaseEffect.extend({
    name: z.literal("model3d").describe(uiDescriptions.none({})),
    anchor: ZFaceAnchor.describe(
        uiDescriptions.enum({
            label: "Anchor",
            options: Object.keys(ZFaceAnchor.Values),
            optionLabels: ZFaceAnchorLabels,
            defValue: ZFaceAnchor.Values.forehead,
        })
    ),
    model: ZModel3dAsset({ label: "Model 3d Asset" }),
    position: ZArray3D.describe(uiDescriptions.array3d({ label: "Position", group: "Transform" })),
    scale: ZArray3D.describe(
        uiDescriptions.array3d({ defValue: [1, 1, 1], label: "Scale", group: "Transform" })
    ),
    rotation: ZArray3D.describe(uiDescriptions.array3d({ label: "Rotation", group: "Transform" })),
    material: ZMaterialArray,
}).describe(uiDescriptions.object({ label: "Model 3d" }));

const ZPlaneEffect = ZBaseEffect.extend({
    name: z.literal("plane").describe(uiDescriptions.none({})),
    anchor: ZFaceAnchor.describe(
        uiDescriptions.enum({
            label: "Anchor",
            options: Object.keys(ZFaceAnchor.Values),
            optionLabels: ZFaceAnchorLabels,
            defValue: ZFaceAnchor.Values.forehead,
        })
    ),
    position: ZArray3D.describe(uiDescriptions.array3d({ label: "Position", group: "Transform" })),
    scale: ZArray3D.describe(
        uiDescriptions.array3d({ defValue: [1, 1, 1], lable: "Scale", group: "Transform" })
    ),
    rotation: ZArray3D.describe(uiDescriptions.array3d({ label: "Rotation", group: "Transform" })),
    material: ZMaterialArray,
}).describe(uiDescriptions.object({ label: "Plane" }));

// const ZBaseTest = ZBaseEffect.extend(
//     {
//         name: z.literal("light"),
//         color: ZColor.default([1, 1, 1]),
//         brightness: ZNumberSlider.default(1.0),
//         specular_intensity: ZNumberSlider.default(1.0)
//     }
// )

// const ZLightEffect = z
//     .union([
//         z
//             .object({
//                 name: z.literal("light"),
//                 color: ZColor.default([1, 1, 1]),
//                 brightness: ZNumberSlider.default(1.0),
//                 specular_intensity: ZNumberSlider.default(1.0),
//                 type: z.literal("point"),
//                 position: ZArray3D.default([0, 0, 0]),
//                 anchor: ZFaceAnchor.describe(
//                     uiDescriptions.enum({ options: Object.keys(ZFaceAnchor.Values) })
//                 ).default(ZFaceAnchor.Values.forehead),
//                 range: z.number().default(500.0),
//             })
//             .describe(uiDescriptions.object({})),

//         z
//             .object({
//                 name: z.literal("light"),
//                 color: ZColor.default([1, 1, 1]),
//                 brightness: ZNumberSlider.default(1.0),
//                 specular_intensity: ZNumberSlider.default(1.0),
//                 type: z.literal("direct"),
//                 direction: ZArray3D.default([0, 0, 1]),
//                 rotation: ZArray3D.default([0, 0, 0]),
//             })
//             .describe(uiDescriptions.object({})),

//         z
//             .object({
//                 name: z.literal("light"),
//                 color: ZColor.default([1, 1, 1]),
//                 brightness: ZNumberSlider.default(1.0),
//                 specular_intensity: ZNumberSlider.default(1.0),
//                 type: z.literal("ambient"),
//             })
//             .describe(uiDescriptions.object({})),
//     ])
//     .describe(uiDescriptions.union({}));

const ZLightBase = ZBaseEffect.extend({
    name: z.literal("light").describe(uiDescriptions.none({})),
    color: ZColor.describe(
        uiDescriptions.color({ defValue: [1, 1, 1], showAlways: true, label: "Color" })
    ),
    brightness: ZNumberSlider.describe(
        uiDescriptions.numberSlider({ defValue: 1, showAlways: true, label: "Brightness" })
    ),
    specular_intensity: ZNumberSlider.describe(
        uiDescriptions.numberSlider({ defValue: 1, showAlways: true, label: "Specular factor" })
    ),
});

const ZLightAmbientEffect = ZLightBase.merge(
    z.object({
        type: z.literal("ambient").describe(
            uiDescriptions.enum({
                label: "Type",
                options: Object.keys(ZLightType.Values),
                optionLabels: ZLightTypeLabels,
                defValue: ZLightType.Values.ambient,
            })
        ),
    })
).describe(uiDescriptions.object({ label: "Light" }));

const ZLightDirectEffect = ZLightBase.merge(
    z.object({
        type: z.literal("direct").describe(
            uiDescriptions.enum({
                label: "Type",
                options: Object.keys(ZLightType.Values),
                optionLabels: ZLightTypeLabels,
                defValue: ZLightType.Values.ambient,
            })
        ),
        direction: ZArray3D.describe(
            uiDescriptions.array3d({ defValue: [0, 0, 1], label: "Direction" })
        ),
        rotation: ZArray3D.describe(uiDescriptions.array3d({ label: "Rotation" })),
    })
).describe(uiDescriptions.object({ label: "Light" }));

const ZLightPointEffect = ZLightBase.merge(
    z.object({
        type: z.literal("point").describe(
            uiDescriptions.enum({
                label: "Type",
                options: Object.keys(ZLightType.Values),
                optionLabels: ZLightTypeLabels,
                defValue: ZLightType.Values.ambient,
            })
        ),
        anchor: ZFaceAnchor.describe(
            uiDescriptions.enum({
                label: "Anchor",
                options: Object.keys(ZFaceAnchor.Values),
                optionLabels: ZFaceAnchorLabels,
                defValue: ZFaceAnchor.Values.forehead,
            })
        ),
        range: ZNumberSlider.describe(
            uiDescriptions.numberSlider({ min: 0.0, max: 2000.0, defValue: 500.0, label: "Range" })
        ),
        position: ZArray3D.describe(uiDescriptions.array3d({ label: "Position" })),
    })
).describe(uiDescriptions.object({ label: "Light" }));

const ZLight = [ZLightAmbientEffect, ZLightDirectEffect, ZLightPointEffect];

// console.log(ZLightEffect.parse({ name: "light", type: "point" }))

// console.log(ZLightEffect.description)

const testLight = {
    name: "light",
    tag: "1233",
    disabled: true,
    anchor: "right_eye",
    type: "ambient",
    color: [0.88, 0.14, 0.14],
    brightness: 0.45,
    specular_intensity: 0.25,
    range: 1500,
    position: [0.0, 0.0, 13.0],
    direction: [0.0, 0.0, 1.0],
    rotation: [0.0, 0.0, 0.0],
};

// console.log(ZLightEffect.parse(testLight))

const ZLiquifiedWarpEffect = ZBaseEffect.extend({
    name: z.literal("liquifiedwarp").describe(uiDescriptions.none({})),
    progress: ZNumberSlider.describe(
        uiDescriptions.numberSlider({ defValue: 1, label: "Progress" })
    ),
}).describe(uiDescriptions.object({ label: "Liquified Warp" }));

const ZPostEffectType = z.enum(["blur", "dispersion", "glow", "noise", "sharpen"]);
const ZPostEffectTypeLabels = ["Blur", "Dispersion", "Glow", "Noise", "Sharpen"];

const ZPostEffectEffect = ZBaseEffect.extend({
    name: z.literal("posteffect").describe(uiDescriptions.none({})),
    intensity: ZNumberSlider.describe(
        uiDescriptions.numberSlider({ defValue: 1, label: "Intensity" })
    ),
    type: ZPostEffectType.describe(
        uiDescriptions.enum({
            label: "Type",
            options: Object.keys(ZPostEffectType.Values),
            defValue: ZPostEffectType.Values.sharpen,
            optionLabels: ZPostEffectTypeLabels,
        })
    ),
}).describe(uiDescriptions.object({ label: "Post effect" }));

// "name": "liquifiedwarp",
// "progress": 0.8,

// const lightOptions = z.enum(["A", "B"]);
// // ZFaceAnchor.describe(
// //     uiDescriptions.enum({
// //       options: Object.keys(ZFaceAnchor.Values),
// //       defValue: ZFaceAnchor.Values.forehead,
// //     })
// //   ),

// const lightBase = z.object({
//   name: z.literal("light").describe(uiDescriptions.none({})),
// });

// const lightA = lightBase
//   .merge(
//     z.object({
//       //   name: z.literal("light").describe(uiDescriptions.none({})),

//       type: z.literal("A").describe(
//         uiDescriptions.enum({
//           options: Object.keys(lightOptions.Values),
//           defValue: lightOptions.Values.A,
//         })
//       ),
//       param1: z.number().describe(uiDescriptions.numberSlider({ defValue: 1 })),
//     })
//   )
//   .describe(uiDescriptions.object({}));

// const lightB = lightBase
//   .merge(
//     z.object({
//       //   name: z.literal("light").describe(uiDescriptions.none({})),

//       type: z.literal("B").describe(
//         uiDescriptions.enum({
//           options: Object.keys(lightOptions.Values),
//           defValue: lightOptions.Values.A,
//         })
//       ),
//       param1: z.number().describe(uiDescriptions.numberSlider({ defValue: 1 })),
//       param2: z.number().describe(uiDescriptions.numberSlider({ defValue: 2 })),
//     })
//   )
//   .describe(uiDescriptions.object({}));

// const light = [lightA, lightB];
// const light = z
//   .union([lightBase.merge(lightA), lightBase.merge(lightB)])
//   .describe(uiDescriptions.union({}));

// // light.options[0]

// console.log(
//   "parse light res",

//   light.parse({
//     name: "light",

//     type: "B",
//     param1: 123,
//     param2: 111,
//   })
// );

export const EffectsList = [
    ZFacemodelEffect,
    ZPlaneEffect,
    ZModel3dEffect,
    ZPatchEffect,
    ...ZLight,
    // ZLightAmbientEffect,

    ZBeautifyEffect,
    ZLiquifiedWarpEffect,
    ZColorfilterEffect,
    ZPostEffectEffect,
];

// export const ZEffect = z
//     .discriminatedUnion("name", [...EffectsList])
//     .describe(uiDescriptions.discriminatedUnion({}));

export const ZEffect = z.union(EffectsList).describe(uiDescriptions.union({}));

export const ZEffects = ZEffect.array().describe(uiDescriptions.array({}));
// console.log(ZEffects.safeParse({ name: "facemodel" }))

export const effectNames = [...new Set(ZEffect.options.map((val) => val.shape.name.value))];
// console.log("effectsNames", effectNames);
export const effectDefaults = {};
effectNames.forEach((name, i) => {
    effectDefaults[name] = {
        data: {
            name,
        },
    };
    //   const result = ZEffect.safeParse({ name: name });

    //   if (result.success) {
    //     // console.log("ztypes data");
    //     // console.log(result.data)
    //     effectDefaults[name] = {
    //       data: result.data,
    //       type: EffectsList[i],
    //     };
    //   } else {
    //     console.log(result.error);
    //   }
});

const ZPerspectivePlugin = z
    .object({
        name: z.literal("perspective").describe(uiDescriptions.none({})),
        fov: ZNumberSlider.describe(
            uiDescriptions.numberSlider({
                min: 30,
                max: 90,
                defValue: 30,
                steps: 15,
                showAlways: false,
                label: "Field of view",
            })
        ),
        near_clip: ZNumberSlider.describe(
            uiDescriptions.numberSlider({
                min: 0.1,
                max: 5000,
                defValue: 0.1,
                showAlways: false,
                label: "Near plane",
            })
        ),
        far_clip: ZNumberSlider.describe(
            uiDescriptions.numberSlider({
                min: 1,
                max: 5000,
                defValue: 3000,
                steps: 100,
                showAlways: false,
                label: "Far plane",
            })
        ),
    })
    .describe(uiDescriptions.object({ label: "Perspective" }));

const ZMirrorPlugin = z
    .object({
        name: z.literal("mirror").describe(uiDescriptions.none({})),
        enabled: ZBool.describe(uiDescriptions.bool({ defValue: true, label: "Enable" })),
        debug: ZBool.describe(uiDescriptions.bool({ defValue: false, label: "Debug" })),
    })
    .describe(uiDescriptions.object({ label: "Mirror" }));

const ZFixedDetectionPlugin = z
    .object({
        name: z.literal("fixeddetection").describe(uiDescriptions.none({})),

        // !!! need explanation
        rotation: ZArray4D.describe(
            uiDescriptions.array4d({ defValue: [0.1, 0.21, 0.7, 0.2], label: "Rotation" })
        ),
        offset: ZNumberSlider.describe(
            uiDescriptions.numberSlider({ defValue: 0.7, label: "Offset" })
        ),
    })
    .describe(uiDescriptions.object({ label: "Detection fix" }));

export const PluginsList = [ZMirrorPlugin, ZPerspectivePlugin, ZFixedDetectionPlugin];

export const ZPlugin = z.union(PluginsList).describe(uiDescriptions.union({}));

export const ZPlugins = ZPlugin.array().describe(uiDescriptions.array({}));
// console.log(ZPlugins.safeParse({ name: "facemodel" }))

export const pluginNames = [...new Set(ZPlugin.options.map((val) => val.shape.name.value))];

const UserHintOptions = ["none", "open_mouth", "tap_change", "with_friends", "start_recording"];
const UserHintOptionsLabels = [
    "None",
    "Open mouth",
    "Tap on screen",
    "Try with friends",
    "Start recording",
];

const ZEnum = (defValue, label, options = [], optionLabels = [], showAlways = false) => {
    return z.enum(options).describe(
        uiDescriptions.enum({
            options,
            optionLabels,
            defValue,
            showAlways,
            label,
        })
    );
};

const ZNumberEnum = (
    defValue,
    label,
    group = "main",
    options = [],
    optionLabels = [],
    showAlways = false
) => {
    return z.number().describe(
        uiDescriptions.enum({
            options,
            optionLabels,
            defValue,
            showAlways,
            label,
            group,
        })
    );
};

const iconInfo = {
    clickLink:
        "https://dev.vk.com/ru/masks/publication/resources#%D0%98%D0%BA%D0%BE%D0%BD%D0%BA%D0%B0",

    infoList: [
        "PNG format",
        "Should not contain transparent layer",
        "Should preview what masks look like",
        "Max size 60Kb",
    ],
    infoHeader: "Icon should meet these requirements :",
};
const ZIcon = z.string().describe(uiDescriptions.icon({ info: iconInfo }));

const scriptInfo = {
    clickLink: "https://dev.vk.com/ru/masks/development/script-creation",
};
const ZMainScriptAsset = z.string().describe(uiDescriptions.mainScript({ info: scriptInfo }));

const MaskSettings = {
    // name: ZText.describe(uiDescriptions.text({ defValue: "defaultName", label: "Name" })),
    icon: ZIcon,
    user_hint: ZEnum(UserHintOptions[0], "User Hint", UserHintOptions, UserHintOptionsLabels),
    // num_faces: ZNumberEnum(1, "Number faces", "main", [0, 1, 2], ["0", "1", "2"]),
    // facemodel_version: ZNumberEnum(0, "Facemodel version", "Advanced", [0, 1], ["old", "new"]),
    mouse_input: z.boolean().describe(
        uiDescriptions.bool({
            label: "Mouse input",
            defValue: false,
            showAlways: false,
            group: "Permissions",
        })
    ),
    // icon: ZTextureAsset.describe(uiDescriptions.filepath({ ...AssetTypes.texture, label: "Icon" })),
    script: ZMainScriptAsset,
};

export const ZMaskSettings = z.object(MaskSettings).describe(uiDescriptions.object({})).partial();

export const ZMaskConfig = z.object({
    ...MaskSettings,
    effects: ZEffects.default([]),
    plugins: ZPlugins.default([]),
});

function isObject(val) {
    return typeof val === "object" && !Array.isArray(val) && val !== null;
}

function replaceObjectSynonim(obj, nameFrom, nameTo) {
    if (obj.hasOwnProperty(nameFrom)) {
        obj[nameTo] = obj[nameFrom];
        delete obj[nameFrom];
    }
    return obj;
}

export const ZMaskConfigPreprocess = z.preprocess(
    (val) => {
        return replaceObjectSynonim(val, "preview", "icon");
    },
    z
        .object({
            name: z.unknown().optional(), // !!! this will ensure order of parsed keys
            icon: z.unknown().optional(),
            effects: z
                .array(
                    z
                        .object({
                            texture: z
                                .preprocess((val) => {
                                    if (isObject(val)) {
                                        // keep only diffuse, not texture in object
                                        val = replaceObjectSynonim(val, "texture", "diffuse");
                                        if (!isObject(val.animation)) {
                                            val.animation = {};
                                        }
                                        return val;
                                    }
                                    return {
                                        diffuse: val,
                                        animation: {},
                                    };
                                }, z.object({}).passthrough())
                                .optional(),

                            material: z
                                .preprocess((val) => {
                                    if (!Array.isArray(val)) return [val];
                                    return val;
                                }, z.array(z.union([z.string(), z.object({}).passthrough()])))
                                .optional(),
                        })
                        .passthrough()
                )
                .default([]),
            plugins: z
                .array(
                    z
                        .object({
                            name: z
                                .preprocess((val) => {
                                    // ??? what if non string
                                    return val.toLowerCase();
                                }, z.string())
                                .optional(),
                        })
                        .passthrough()
                )
                .default([]),
        })
        .passthrough()
);

// const maskTest = {
//     name: "test",
//     effects: [
//         {
//             name: "some",
//             material: "textueeeee",
//         },
//         {
//             name: "facemodel",
//             texture: "textureeee",
//         },
//         {
//             name: "test_deep",
//             texture: {
//                 diffuse: "somth_tex",
//                 animation: {
//                     num_frames: 100500,
//                     fps: 25,
//                 },
//             },
//         },
//     ],
//     plugins: [
//         {
//             name: "mirror",
//             enabled: true,
//         },
//     ],
// };

// console.log(ZMaskConfigPreprocess.parse(maskTest))
