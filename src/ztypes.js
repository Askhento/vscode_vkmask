// !!! changed to js so that i dont get errors with rollup

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
    enum: ({ label, group = "main", options, defValue, showAlways = true }) => ({
        showAlways,
        name: "enum",
        label,
        group,
        options,
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
    tags: ({ label, group = "Tags", defValue = "", showAlways = true }) => ({
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
    }) => ({
        name: "script",
        label,
        group,
        defValue,
        showAlways,
    }),
    icon: ({ label = "Icon", group = "main", defValue = "", showAlways = true }) => ({
        name: "icon",
        label,
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
        label,
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
    bool: ({ label, group = "main", defValue = false, showAlways = true }) => ({
        showAlways,
        name: "bool",
        label,
        group,
        defValue,
    }),
    object: ({ label, group = "main", defValue = {}, showAlways = true }) => ({
        showAlways,
        name: "object",
        label,
        group,
        defValue,
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
    .describe(uiDescriptions.color({ min: 0, max: 1 }));
const ZColorAlpha = z
    .number()
    .array()
    .length(4, { message: "Color size must be 4" })
    .describe(uiDescriptions.colorAlpha({ min: 0, max: 1, alpha: true }));

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
const ZLightType = z.enum(["point", "ambient", "direct"]);

const AssetTypes = {
    texture: {
        defValue: "Textures/Spot.png",
        extensions: ["png", "jpg"],
        directory: ["Textures"],
        typeName: "texture",
    },
    material: {
        defValue: "Materials/DefaultGrey.xml",
        extensions: ["xml", "json"],
        types: ["xml_material", "json_material"],
        directory: ["Materials"],
        typeName: "material",
    },
    technique: {
        defValue: "Techniques/DiffUnlit.xml",
        extensions: ["xml"],
        types: ["xml_technique"],
        directory: ["Techniques"],
        typeName: "technique",
    },
    renderPath: {
        defValue: "",
        extensions: ["xml"],
        types: ["xml_renderpath"],
        directory: ["RenderPaths"],
        typeName: "renderPath",
    },
    animationClip: {
        defValue: "",
        extensions: ["ani"],
        directory: ["Animations"],
        typeName: "animationClip",
    },
    model3d: {
        defValue: "Models/DefaultPlane.mdl",
        extensions: ["mdl"],
        directory: ["Models"],
        typeName: "model3d",
    },
    script: {
        defValue: "",
        extensions: ["as"],
        directory: ["Scripts"],
        typeName: "script",
    },
};

const ZAsset = z.string().describe(uiDescriptions.filepath({}));

const ZText = z.string().describe(uiDescriptions.text({}));
// ? idea to use function, use later to refactor
// const ZText = (desc = {}) => z.string().describe(uiDescriptions.text(desc));
// ZText({})
const ZTags = z.string().describe(uiDescriptions.tags({}));

const ZVisibleType = z.enum(["always", "face", "animation", "mouth_open"]);

const ZPatchFitMode = z.enum(["none", "crop", "pad"]);

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
            // !!! probably will miss texture property
            // texture: ZTextureAsset,
            normal: ZTextureAsset({ label: "Normal" }),
            color: ZColorAlpha,
            lit: ZBool,
            blend_mode: ZBlendModes.describe(
                uiDescriptions.enum({
                    options: Object.keys(ZBlendModes.Values),
                    defValue: ZBlendModes.Values.replace,
                })
            ),
            u_transform: ZArray3D.describe(
                uiDescriptions.array3d({ defValue: [1, 0, 0], showAlways: false })
            ),
            v_transform: ZArray3D.describe(
                uiDescriptions.array3d({ defValue: [0, 1, 0], showAlways: false })
            ),
            render_order: ZNumberSlider.describe(
                uiDescriptions.numberSlider({ max: 100, min: -100, defValue: 0, showAlways: false })
            ),
        })
        .describe(uiDescriptions.object({ showAlways: false }))
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
                    uiDescriptions.array4d({ defValue: [1.0, 1.0, 1.0, 1.0] })
                ),
                MatSpecColor: ZArray4D.describe(
                    uiDescriptions.array4d({ defValue: [0.0, 0.0, 0.0, 1.0], showAlways: false })
                ),
                MatEmissiveColor: ZArray3D.describe(uiDescriptions.array3d({ showAlways: false })),
                MatEnvMapColor: ZArray3D.describe(
                    uiDescriptions.array3d({ defValue: [1.0, 1.0, 1.0], showAlways: false })
                ),
                Roughness: ZNumberSlider.describe(
                    uiDescriptions.numberSlider({ defValue: 0.5, showAlways: false })
                ),
                Metallic: ZNumberSlider.describe(
                    uiDescriptions.numberSlider({ defValue: 0.5, showAlways: false })
                ),
                UOffset: ZArray4D.describe(
                    uiDescriptions.array4d({ defValue: [1.0, 0.0, 0.0, 0.0], showAlways: false })
                ),
                VOffset: ZArray4D.describe(
                    uiDescriptions.array4d({ defValue: [0.0, 1.0, 0.0, 0.0], showAlways: false })
                ),
            })
            .describe(uiDescriptions.object({}))
            .passthrough(),
        cull: ZCullMode.describe(
            uiDescriptions.enum({
                options: Object.keys(ZCullMode.Values),
                defValue: ZCullMode.Values.ccw,
            })
        ),
        fill: ZFillMode.describe(
            uiDescriptions.enum({
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
}, z.array(ZMaterial).describe(uiDescriptions.array({ elementName: "material", label: "Materials", defaultElement: AssetTypes.material.defValue, defValue: [] })));

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
    mouth: ZBool.describe(uiDescriptions.bool({ defValue: true })),
    eyes: ZBool.describe(uiDescriptions.bool({ defValue: true })),
    position: ZArray3D,
    rotation: ZArray3D,
    scale: ZArray3D.describe(uiDescriptions.array3d({ defValue: [1, 1, 1] })),
    texture: ZTextureObject,
}).describe(uiDescriptions.object({}));

const ZPatchAnchor = z.enum([
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
    "fullscreen",
]);

const ZPatchEffect = ZBaseEffect.extend({
    name: z.literal("patch").describe(uiDescriptions.none({})),
    anchor: ZPatchAnchor.describe(
        uiDescriptions.enum({
            options: Object.keys(ZFaceAnchor.Values),
            defValue: ZFaceAnchor.Values.forehead,
        })
    ),
    visible: ZVisibleType.describe(
        uiDescriptions.enum({
            options: Object.keys(ZVisibleType.Values),
            defValue: ZVisibleType.Values.always,
        })
    ),
    fit: ZPatchFitMode.describe(
        uiDescriptions.enum({
            options: Object.keys(ZPatchFitMode.Values),
            defValue: ZPatchFitMode.Values.none,
        })
    ),
    size: ZArray2D.describe(uiDescriptions.array2d({ defValue: [1, 1] })),
    offset: ZArray3D,
    rotation: ZArray3D,
    allow_rotation: ZBool,
    pass: ZRenderPathAsset({ label: "RenderPath" }),
    texture: ZTextureObject,
}).describe(uiDescriptions.object({}));

// ZBaseLightEffect.shape.type.removeDefault().Values

const ZBeautifyEffect = ZBaseEffect.extend({
    name: z.literal("beautify").describe(uiDescriptions.none({})),
    mix: ZNumberSlider.describe(uiDescriptions.numberSlider({ defValue: 0.65 })),
}).describe(uiDescriptions.object({}));

// "lookup": "ColorFilter/lookup.png",
// "intensity":

const ZColorfilterEffect = ZBaseEffect.extend({
    name: z.literal("colorfilter").describe(uiDescriptions.none({})),
    intensity: ZNumberSlider.describe(
        uiDescriptions.numberSlider({
            defValue: 0.75,
            valueLabel: "%",
            valueTemplate: (val) => Math.floor(val * 100),
        })
    ),
    lookup: ZTextureAsset({ label: "LUT" }),
}).describe(uiDescriptions.object({}));

const ZModel3dEffect = ZBaseEffect.extend({
    name: z.literal("model3d").describe(uiDescriptions.none({})),
    anchor: ZFaceAnchor.describe(
        uiDescriptions.enum({
            options: Object.keys(ZFaceAnchor.Values),
            defValue: ZFaceAnchor.Values.forehead,
        })
    ),
    model: ZModel3dAsset({ label: "Model" }),
    position: ZArray3D,
    rotation: ZArray3D,
    scale: ZArray3D.describe(uiDescriptions.array3d({ defValue: [1, 1, 1] })),
    material: ZMaterialArray,
}).describe(uiDescriptions.object({}));

const ZPlaneEffect = ZBaseEffect.extend({
    name: z.literal("plane").describe(uiDescriptions.none({})),
    anchor: ZFaceAnchor.describe(
        uiDescriptions.enum({
            options: Object.keys(ZFaceAnchor.Values),
            defValue: ZFaceAnchor.Values.forehead,
        })
    ),
    position: ZArray3D,
    rotation: ZArray3D,
    scale: ZArray3D.describe(uiDescriptions.array3d({ defValue: [1, 1, 1] })),
    material: ZMaterialArray,
}).describe(uiDescriptions.object({}));

// const ZBaseTest = ZBaseEffect.extend(
//     {
//         name: z.literal("light"),
//         color: ZColor.default([1, 1, 1]),
//         brightness: ZNumberSlider.default(1.0),
//         specular_intensity: ZNumberSlider.default(1.0)
//     }
// )

const ZLightEffect = z
    .union([
        z
            .object({
                name: z.literal("light"),
                color: ZColor.default([1, 1, 1]),
                brightness: ZNumberSlider.default(1.0),
                specular_intensity: ZNumberSlider.default(1.0),
                type: z.literal("point"),
                position: ZArray3D.default([0, 0, 0]),
                anchor: ZFaceAnchor.describe(
                    uiDescriptions.enum({ options: Object.keys(ZFaceAnchor.Values) })
                ).default(ZFaceAnchor.Values.forehead),
                range: z.number().default(500.0),
            })
            .describe(uiDescriptions.object({})),

        z
            .object({
                name: z.literal("light"),
                color: ZColor.default([1, 1, 1]),
                brightness: ZNumberSlider.default(1.0),
                specular_intensity: ZNumberSlider.default(1.0),
                type: z.literal("direct"),
                direction: ZArray3D.default([0, 0, 1]),
                rotation: ZArray3D.default([0, 0, 0]),
            })
            .describe(uiDescriptions.object({})),

        z
            .object({
                name: z.literal("light"),
                color: ZColor.default([1, 1, 1]),
                brightness: ZNumberSlider.default(1.0),
                specular_intensity: ZNumberSlider.default(1.0),
                type: z.literal("ambient"),
            })
            .describe(uiDescriptions.object({})),
    ])
    .describe(uiDescriptions.union({}));

const ZLightBase = ZBaseEffect.extend({
    name: z.literal("light").describe(uiDescriptions.none({})),
    color: ZColor.describe(uiDescriptions.color({ defValue: [1, 1, 1], showAlways: true })),
    brightness: ZNumberSlider.describe(
        uiDescriptions.numberSlider({ defValue: 1, showAlways: true })
    ),
    specular_intensity: ZNumberSlider.describe(
        uiDescriptions.numberSlider({ defValue: 1, showAlways: true })
    ),
});

const ZLightAmbientEffect = ZLightBase.merge(
    z.object({
        type: z.literal("ambient").describe(
            uiDescriptions.enum({
                options: Object.keys(ZLightType.Values),
                defValue: ZLightType.Values.ambient,
            })
        ),
    })
).describe(uiDescriptions.object({}));

const ZLightDirectEffect = ZLightBase.merge(
    z.object({
        type: z.literal("direct").describe(
            uiDescriptions.enum({
                options: Object.keys(ZLightType.Values),
                defValue: ZLightType.Values.ambient,
            })
        ),
        direction: ZArray3D.describe(uiDescriptions.array3d({ defValue: [0, 0, 1] })),
        rotation: ZArray3D,
    })
).describe(uiDescriptions.object({}));

const ZLightPointEffect = ZLightBase.merge(
    z.object({
        type: z.literal("point").describe(
            uiDescriptions.enum({
                options: Object.keys(ZLightType.Values),
                defValue: ZLightType.Values.ambient,
            })
        ),
        anchor: ZFaceAnchor.describe(
            uiDescriptions.enum({
                options: Object.keys(ZFaceAnchor.Values),
                defValue: ZFaceAnchor.Values.forehead,
            })
        ),
        range: ZNumberSlider.describe(
            uiDescriptions.numberSlider({ min: 0.0, max: 2000.0, defValue: 500.0 })
        ),
        position: ZArray3D,
    })
).describe(uiDescriptions.object({}));

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
    progress: ZNumberSlider.describe(uiDescriptions.numberSlider({ defValue: 1 })),
}).describe(uiDescriptions.object({}));

const ZPostEffectType = z.enum(["blur", "dispersion", "glow", "noise", "sharpen"]);

const ZPostEffectEffect = ZBaseEffect.extend({
    name: z.literal("posteffect").describe(uiDescriptions.none({})),
    intensity: ZNumberSlider.describe(uiDescriptions.numberSlider({ defValue: 1 })),
    type: ZPostEffectType.describe(
        uiDescriptions.enum({
            options: Object.keys(ZPostEffectType.Values),
            defValue: ZPostEffectType.Values.sharpen,
        })
    ),
}).describe(uiDescriptions.object({}));

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
            })
        ),
        near_clip: ZNumberSlider.describe(
            uiDescriptions.numberSlider({ min: 0.1, max: 5000, defValue: 0.1, showAlways: false })
        ),
        far_clip: ZNumberSlider.describe(
            uiDescriptions.numberSlider({
                min: 1,
                max: 5000,
                defValue: 3000,
                steps: 100,
                showAlways: false,
            })
        ),
    })
    .describe(uiDescriptions.object({}));

const ZMirrorPlugin = z
    .object({
        name: z.literal("mirror").describe(uiDescriptions.none({})),
        enabled: ZBool.describe(uiDescriptions.bool({ defValue: true })),
        debug: ZBool.describe(uiDescriptions.bool({ defValue: false })),
    })
    .describe(uiDescriptions.object({}));

const ZFixedDetectionPlugin = z
    .object({
        name: z.literal("fixeddetection").describe(uiDescriptions.none({})),

        rotation: ZArray4D.default([0.1, 0.21, 0.7, 0.2]),
        offset: ZNumberSlider.describe(uiDescriptions.numberSlider({ defValue: 0.7 })),
    })
    .describe(uiDescriptions.object({}));

export const PluginsList = [ZMirrorPlugin, ZPerspectivePlugin, ZFixedDetectionPlugin];

export const ZPlugin = z.union(PluginsList).describe(uiDescriptions.union({}));

export const ZPlugins = ZPlugin.array().describe(uiDescriptions.array({}));
// console.log(ZPlugins.safeParse({ name: "facemodel" }))

export const pluginNames = [...new Set(ZPlugin.options.map((val) => val.shape.name.value))];

const UserHintOptions = ["none", "open_mouth", "tap_change", "with_friends", "start_recording"];

const ZEnum = (defValue, label, options = [], showAlways = false) => {
    return z.enum(options).describe(
        uiDescriptions.enum({
            options,
            defValue,
            showAlways,
            label,
        })
    );
};

const ZNumberEnum = (defValue, label, group = "main", options = [], showAlways = false) => {
    return z.number().describe(
        uiDescriptions.enum({
            options,
            defValue,
            showAlways,
            label,
            group,
        })
    );
};

const ZMainScriptAsset = z.string().describe(uiDescriptions.mainScript({}));
const ZIcon = z.string().describe(uiDescriptions.icon({}));

const MaskSettings = {
    name: ZText.describe(uiDescriptions.text({ defValue: "defaultName", label: "Name" })),
    user_hint: ZEnum(UserHintOptions[0], "User Hint", UserHintOptions),
    facemodel_version: ZNumberEnum(0, "Facemodel version", "Advanced", [0, 1]), // !!!! STRING !!!!
    // num_faces: ZEnum(1, [0, 1, 2]),
    mouse_input: z.boolean().describe(
        uiDescriptions.bool({
            label: "Mouse input",
            defValue: false,
            showAlways: false,
            group: "Advanced",
        })
    ),
    icon: ZIcon,
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
                                        return replaceObjectSynonim(val, "texture", "diffuse");
                                    }
                                    return {
                                        diffuse: val,
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

const maskTest = {
    name: "test",
    effects: [
        {
            name: "some",
            material: "textueeeee",
        },
        {
            name: "facemodel",
            texture: "textureeee",
        },
        {
            name: "test_deep",
            texture: {
                diffuse: "somth_tex",
                animation: {
                    num_frames: 100500,
                    fps: 25,
                },
            },
        },
    ],
    plugins: [
        {
            name: "mirror",
            enabled: true,
        },
    ],
};

// console.log(ZMaskConfigPreprocess.parse(maskTest))
