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
    none: {
        name: "none",
        group: "main",
    },
    numberSlider: {
        name: "numberSlider",
        label: "Slider",
        group: "main",
        min: 0,
        max: 1,
        defValue: 0,
        steps: 100,
        valueLabel: "",
        showAlways: true,
        valueTemplate: (val) => {
            return val;
        },
    },
    array2d: {
        name: "array2d",
        label: "Vec2",
        group: "main",
        defValue: [0, 0],
        valueLabels: ["X", "Y"],
        showAlways: true,
    },
    array3d: {
        name: "array3d",
        label: "Vec3",
        group: "main",
        defValue: [0, 0, 0],
        valueLabels: ["X", "Y", "Z"],
        showAlways: true,
    },
    array4d: {
        name: "array4d",
        label: "Vec4",
        group: "main",
        defValue: [0, 0, 0, 0],
        valueLabels: ["X", "Y", "Z", "W"],
        showAlways: true,
    },

    enum: {
        name: "enum",
        label: "Enum",
        group: "main",
        options: [],
        optionLabels: [],
        defValue: null,
    },
    filepath: {
        name: "filepath",
        label: "Filepath",
        group: "main",
        directory: ["/"],
        extensions: [],
        types: null,
        typeName: null,
        defValue: null,
    },
    text: { name: "text", label: "Text", group: "main", defValue: "" },
    tags: {
        name: "tags",
        label: "Tag",
        group: "tags",
        defValue: "",
        groupExpanded: false,
    },
    mainScript: {
        name: "script",
        label: "Script",
        group: "Advanced",
        defValue: "main.as",
        showAlways: true,
        info: null,
    },
    icon: { name: "icon", label: "Icon", group: "main", defValue: "", info: null },
    texture: { name: "texture", label: "Texture", group: "main", defValue: "" },
    // !!!! color alpha redundant here
    color: { name: "color", label: "Color", group: "main", defValue: [1, 1, 1] },
    colorAlpha: {
        name: "colorAlpha",
        label: "Color",
        group: "main",
        defValue: [1, 1, 1, 1],
        alpha: true,
    },
    uv_transform: {
        name: "uv_transform",
        label: "UV transform",
        group: "uv_transform",
        defValue: [0, 0, 0],
        groupExpanded: false,
        compositionGroup: "uv_transform",
    },

    bool: { name: "bool", label: "", group: "main", defValue: false },
    object: {
        name: "object",
        label: "Object",
        group: "main",
        defValue: {},
        defExpanded: true,
        groups: { main: { label: null, defExpanded: true } },
    },
    array: {
        label: "Array",
        group: "main",
        elementName: "element",
        defaultElement: "defalult",
        defValue: [],
        userResizable: false,
        name: "array",
    },

    union: {
        name: "union",
    },
    discriminatedUnion: {
        name: "discriminatedUnion",
    },
};

const ZNumberSlider = z.number().describe(uiDescriptions.numberSlider);

const ZBool = z.boolean().describe(uiDescriptions.bool);
const ZArray2D = z
    .number()
    .array()
    .length(2, { message: "Array size must be 2" })
    .describe(uiDescriptions.array2d);
const ZArray3D = z
    .number()
    .array()
    .length(3, { message: "Array size must be 3" })
    .describe(uiDescriptions.array3d);
const ZArray4D = z
    .number()
    .array()
    .length(4, { message: "Array size must be 4" })
    .describe(uiDescriptions.array4d);
const ZColor = z
    .number()
    .array()
    .length(3, { message: "Color size must be 3" })
    .describe(uiDescriptions.color);
const ZColorAlpha = z
    .number()
    .array()
    .length(4, { message: "Color size must be 4" })
    .describe(uiDescriptions.colorAlpha);

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

const ZAsset = z.string().describe(uiDescriptions.filepath);

const ZText = z.string().describe(uiDescriptions.text);
const ZTags = z.string().describe(uiDescriptions.tags);

const ZVisibleType = z.enum(["always", "face", "animation", "mouth_open"]);
const ZVisibleTypeLabels = ["Always", "Face", "Animation", "Mouth open"];

const ZPatchFitMode = z.enum(["none", "crop", "pad"]);
const ZPatchFitModeLabels = ["None", "Crop", "Pad"];

const ZTechniqueAsset = (desc) =>
    z.string().describe({ ...uiDescriptions.filepath, ...AssetTypes.technique, ...desc });

const ZModel3dAsset = (desc) =>
    z.string().describe({ ...uiDescriptions.filepath, ...AssetTypes.model3d, ...desc });

const ZTextureAsset = (desc) =>
    z.string().describe({ ...uiDescriptions.filepath, ...AssetTypes.texture, ...desc });

const ZMaterialAsset = (desc) =>
    z.string().describe({ ...uiDescriptions.filepath, ...AssetTypes.material, ...desc });

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
// ).describe(uiDescriptions.object)

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
        type: ZAnimationType.describe({
            ...uiDescriptions.enum,

            label: "Type",
            options: Object.keys(ZAnimationType.Values),
            optionLabels: ZAnimationTypeLabels,
            defValue: ZAnimationType.Values.mouth_open,
        }),
        trigget_start: ZEventTrigger.describe({
            ...uiDescriptions.enum,
            label: "Start trigger",
            options: Object.keys(ZEventTrigger.Values),
            optionLabels: ZEventTriggerLabels,
            defValue: ZEventTrigger.Values.mouth_open,
        }),
        trigget_stop: ZEventTrigger.describe({
            ...uiDescriptions.enum,
            label: "Stop trigger",
            options: Object.keys(ZEventTrigger.Values),
            optionLabels: ZEventTriggerLabels,
            defValue: ZEventTrigger.Values.mouth_close,
        }),
        fps: ZNumberSlider.describe({
            ...uiDescriptions.numberSlider,
            defValue: 30,
            min: 0,
            max: 240,
            valueLabel: "1/s",
            // valueTemplate: (val) => Math.floor(val * 100),
            label: "Fps",
        }),
    })
    .describe({ ...uiDescriptions.object, label: "Animation", group: "animation" });

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
            blend_mode: ZBlendModes.describe({
                ...uiDescriptions.enum,
                label: "Blend mode",
                options: Object.keys(ZBlendModes.Values),
                optionLabels: ZBlendModesLabels,
                defValue: ZBlendModes.Values.replace,
            }),
            color: ZColorAlpha,
            // lit: ZBool.describe(uiDesc riptions.bool({ label: "Lit" })),
            // !!! probably will miss texture property
            // texture: ZTextureAsset,
            // normal: ZTextureAsset({ label: "Normal" }),
            u_transform: ZArray3D.describe({ ...uiDescriptions.uv_transform, defValue: [1, 0, 0] }),
            v_transform: ZArray3D.describe({ ...uiDescriptions.uv_transform, defValue: [0, 1, 0] }),
            animation: ZTextureAnimation,
            // render_order: ZNumberSlider.describe(
            //     {...uiDescriptions.numberSlider,
            //         max: 100,
            //         min: -100,
            //         defValue: 0,
            //         showAlways: false,
            //         label: "Render order",
            //     }
            // ),
        })
        .describe({
            ...uiDescriptions.object,
            showAlways: false,
            label: "Texture",
            group: "texture",
            groups: {
                main: {
                    label: null,
                    defExpanded: true,
                },
                animation: {
                    label: "Animation",
                    defExpanded: false,
                },
                uv_transform: {
                    label: "UV transform",
                    defExpanded: false,
                },
            },
        })
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

// const ZMaterialObject = z
//     .object({
//         technique: ZTechniqueAsset({ label: "Technique" }),
//         textures: z
//             .object({
//                 diffuse: ZTextureAsset({ label: "Diffuse" }),
//                 normal: ZTextureAsset({ label: "Normal" }),
//                 specular: ZTextureAsset({ label: "Specular" }),
//                 emissive: ZTextureAsset({ label: "Emissive" }),
//                 environment: ZTextureAsset({ label: "Environment" }),
//             })
//             .describe(uiDescriptions.object),
//         parameters: z
//             .object({
//                 MatDiffColor: ZArray4D.describe(
//                     {...uiDescriptions.array4d,
//                         defValue: [1.0, 1.0, 1.0, 1.0],
//                         label: "Diffuse color",
//                     }
//                 ),
//                 MatSpecColor: ZArray4D.describe(
//                     {...uiDescriptions.array4d,
//                         defValue: [0.0, 0.0, 0.0, 1.0],
//                         showAlways: false,
//                         label: "Specular color",
//                     }
//                 ),
//                 MatEmissiveColor: ZArray3D.describe(
//                     {...uiDescriptions.array3d,  showAlways: false, label: "Emissive color" }
//                 ),
//                 MatEnvMapColor: ZArray3D.describe(
//                     {...uiDescriptions.array3d,
//                         defValue: [1.0, 1.0, 1.0],
//                         showAlways: false,
//                         label: "Environment color",
//                     }
//                 ),
//                 Roughness: ZNumberSlider.describe(
//                     {...uiDescriptions.numberSlider,
//                         defValue: 0.5,
//                         showAlways: false,
//                         label: "Roughness",
//                     }
//                 ),
//                 Metallic: ZNumberSlider.describe(
//                     {...uiDescriptions.numberSlider,
//                         defValue: 0.5,
//                         showAlways: false,
//                         label: "Metallness",
//                     }
//                 ),
//                 UOffset: ZArray4D.describe(
//                     {...uiDescriptions.array4d,
//                         defValue: [1.0, 0.0, 0.0, 0.0],
//                         showAlways: false,
//                         label: "U transform",
//                     }
//                 ),
//                 VOffset: ZArray4D.describe(
//                     {...uiDescriptions.array4d,
//                         defValue: [0.0, 1.0, 0.0, 0.0],
//                         showAlways: false,
//                         label: "V transform",
//                     }
//                 ),
//             })
//             .describe(uiDescriptions.object)
//             .passthrough(),
//         cull: ZCullMode.describe(
//             {...uiDescriptions.enum,
//                 label: "Culling",
//                 options: Object.keys(ZCullMode.Values),
//                 defValue: ZCullMode.Values.ccw,
//             }
//         ),
//         fill: ZFillMode.describe(
//             {...uiDescriptions.enum,
//                 label: "Fill",
//                 options: Object.keys(ZFillMode.Values),
//                 defValue: ZFillMode.Values.solid,
//                 showAlways: false,
//             }
//         ),
//     })
//     .describe(uiDescriptions.object);

export const ZMaterialObject = z.preprocess(
    (val) => {
        if (isObject(val)) {
        } else {
            //? string
        }
        return val;
    },
    z
        .object({
            technique: ZTechniqueAsset({ label: "Technique" }),
            diffuse: ZTextureAsset({ label: "Diffuse", group: "diffuse" }),
            normal: ZTextureAsset({ label: "Normal", group: "normal" }),
            specular: ZTextureAsset({ label: "Specular", group: "specular" }),
            emissive: ZTextureAsset({ label: "Emissive", group: "emissive" }),
            environment: ZTextureAsset({ label: "Environment", group: "environment" }),

            MatDiffColor: ZArray4D.describe({
                ...uiDescriptions.colorAlpha,
                defValue: [1.0, 1.0, 1.0, 1.0],
                group: "diffuse",
                label: "Diffuse color",
            }),
            MatSpecColor: ZArray4D.describe({
                ...uiDescriptions.colorAlpha,
                defValue: [0.0, 0.0, 0.0, 1.0],
                group: "specular",
                showAlways: false,
                label: "Specular color",
            }),
            MatEmissiveColor: ZArray3D.describe({
                ...uiDescriptions.color,
                showAlways: false,
                group: "emissive",
                label: "Emissive color",
            }),
            MatEnvMapColor: ZArray3D.describe({
                ...uiDescriptions.color,
                defValue: [1.0, 1.0, 1.0],
                group: "environment",
                showAlways: false,
                label: "Environment color",
            }),
            Roughness: ZNumberSlider.describe({
                ...uiDescriptions.numberSlider,
                defValue: 0.5,
                showAlways: false,
                label: "Roughness",
            }),
            Metallic: ZNumberSlider.describe({
                ...uiDescriptions.numberSlider,
                defValue: 0.5,
                showAlways: false,
                label: "Metallness",
            }),

            cull: ZCullMode.describe({
                ...uiDescriptions.enum,
                label: "Culling",
                options: Object.keys(ZCullMode.Values),
                defValue: ZCullMode.Values.ccw,
            }),
            fill: ZFillMode.describe({
                ...uiDescriptions.enum,
                label: "Fill",
                options: Object.keys(ZFillMode.Values),
                defValue: ZFillMode.Values.solid,
                showAlways: false,
            }),
        })
        .describe({
            ...uiDescriptions.object,
            label: "Material",
            groups: {
                main: {
                    label: null,
                    defExpanded: true,
                },

                diffuse: {
                    label: "Diffuse",
                    defExpanded: true,
                },

                normal: {
                    label: "Normal",
                    defExpanded: true,
                },

                specular: {
                    label: "Specular",
                    defExpanded: true,
                },

                environment: {
                    label: "Environment",
                    defExpanded: true,
                },

                emissive: {
                    label: "Emissive",
                    defExpanded: true,
                },
            },
        })
);

const ZMaterial = ZMaterialAsset({ label: "Material", group: "materials" });
// z
//     .union([ZMaterialAsset({ label: "Material" }), ZMaterialObject])
//     .describe(uiDescriptions.union);

// async function updateArrayLength() {
//         const modelPath = getValueByPath($effects, resolveRelative(relPath, path));
//         print("assetind", assetIndex);

//         const { numGeometries } = $assets[assetIndex];

//         if (value.length === numGeometries) return;

//         print("value", value);
//         value = new Array(numGeometries).fill(params.defaultElement).map((v, i) => value[i] ?? v);
//         print("updARR", value);
//         onChanged();
//     }

export const ZMaterialArray = z.preprocess(
    (val) => {
        if (!Array.isArray(val)) return [val];
        return val;
    },
    z.array(ZMaterial).describe({
        ...uiDescriptions.array,
        dependencies: [
            {
                source: ["stores", "effects"],
                relPath: ["..", "model"],
            },
            {
                source: ["stores", "assets"],
                postprocess: (modelPath, assets, component) => {
                    const { value, params } = component;
                    const assetIndex = assets.findIndex((v) => v.path === modelPath);

                    if (assetIndex < 0) {
                        if (value.length) {
                            component.value = [];
                            return { needUpdate: true };
                        }
                        return { needUpdate: false };
                    }

                    const { numGeometries } = assets[assetIndex];

                    if (value.length === numGeometries) return { needUpdate: false }; // without this will infinte loop

                    component.value = new Array(numGeometries)
                        .fill(params.defaultElement)
                        .map((v, i) => value[i] ?? v);

                    return { needUpdate: true };
                },
            },
        ],

        elementName: "locale.materialArray.elementName",
        label: "Materials",
        group: "materials",
        defaultElement: AssetTypes.material.defValue,
        defValue: [AssetTypes.material.defValue],
        userResizable: false,
    })
);

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
//         diffuse: ZAsset.default(AssetTypes.texture.default).describe({...uiDescriptions.filepath,  extensions: AssetTypes.texture.extensions }),
//         texture: ZAsset.default(AssetTypes.texture.default).describe({...uiDescriptions.filepath,  extensions: AssetTypes.texture.extensions }),
//         normal: ZAsset.default(AssetTypes.texture.default).describe({...uiDescriptions.filepath,  extensions: AssetTypes.texture.extensions }),
//         color: ZColorAlpha.default([1.0, 1.0, 1.0, 1.0])
//     }).describe(uiDescriptions.object)

export const ZBaseEffect = z
    .object({
        name: ZText.describe(uiDescriptions.none),
        tag: ZTags,
        // disabled: ZBool.default(false)
    })
    // ??? does need this ????
    .describe(uiDescriptions.object)
    .passthrough();

const ZFacemodelEffect = ZBaseEffect.extend({
    name: z.literal("facemodel").describe(uiDescriptions.none),
    mouth: ZBool.describe({
        ...uiDescriptions.bool,
        defValue: true,
        label: "Mouth",
        group: "visible",
    }),
    eyes: ZBool.describe({
        ...uiDescriptions.bool,
        defValue: true,
        label: "Eyes",
        group: "visible",
    }),
    position: ZArray3D.describe({
        ...uiDescriptions.array3d,
        label: "Position",
        group: "transform",
    }),
    scale: ZArray3D.describe({
        ...uiDescriptions.array3d,
        defValue: [1, 1, 1],
        label: "Scale",
        group: "transform",
    }),
    rotation: ZArray3D.describe({
        ...uiDescriptions.array3d,
        label: "Rotation",
        group: "transform",
    }),
    texture: ZTextureObject,
}).describe({
    ...uiDescriptions.object,
    label: "Facemodel",
    groups: {
        main: {
            label: null,
            defExpanded: true,
        },

        visible: {
            label: "Visible",
            defExpanded: true,
        },

        transform: {
            label: "Transform",
            defExpanded: true,
        },

        texture: {
            label: "Texture",
            defExpanded: true,
            disableMargin: true,
        },

        tags: {
            label: "Tags",
            defExpanded: false,
        },
    },
});

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

const patchAnchorDeps = [
    {
        source: ["stores", "effects"],
        relPath: ["..", "anchor"],
        postprocess: (_, anchor, component) => {
            if (anchor === ZPatchAnchor.Values.fullscreen) component.disabled = true;
            return { needUpdate: false };
        },
    },
];
const patchRotationDeps = [
    {
        source: ["stores", "effects"],
        relPath: ["..", "allow_rotation"],
        postprocess: (_, allowRotation, component) => {
            if (!allowRotation) component.disabled = true;
            return { needUpdate: false };
        },
    },
];

const ZPatchEffect = ZBaseEffect.extend({
    name: z.literal("patch").describe(uiDescriptions.none),
    anchor: ZPatchAnchor.describe({
        ...uiDescriptions.enum,
        label: "Anchor",
        group: "anchor",
        options: Object.keys(ZPatchAnchor.Values),
        optionLabels: ZPatchAnchorLabels,
        defValue: ZFaceAnchor.Values.forehead,
    }),
    visible: ZVisibleType.describe({
        ...uiDescriptions.enum,
        label: "Visible",
        group: "advanced",
        options: Object.keys(ZVisibleType.Values),
        optionLabels: ZVisibleTypeLabels,
        defValue: ZVisibleType.Values.always,
    }),
    fit: ZPatchFitMode.describe({
        ...uiDescriptions.enum,
        label: "Fit",
        group: "advanced",
        options: Object.keys(ZPatchFitMode.Values),
        optionLabels: ZPatchFitModeLabels,
        defValue: ZPatchFitMode.Values.none,
    }),
    size: ZArray2D.describe({
        ...uiDescriptions.array2d,
        defValue: [1, 1],
        label: "Size",
        group: "transform",
        dependencies: patchAnchorDeps,
    }),
    offset: ZArray3D.describe({
        ...uiDescriptions.array3d,
        label: "Offset",
        group: "transform",
        dependencies: patchAnchorDeps,
    }),
    allow_rotation: ZBool.describe({
        ...uiDescriptions.bool,
        label: "Allow rotation",
        group: "anchor",
    }),
    rotation: ZArray3D.describe({
        ...uiDescriptions.array3d,
        label: "Rotation",
        group: "transform",
        dependencies: patchAnchorDeps,
    }),
    // pass: ZRenderPathAsset({ label: "Render Path" }),
    texture: ZTextureObject,
}).describe({
    ...uiDescriptions.object,
    label: "Patch",
    groups: {
        main: {
            label: null,
            defExpanded: true,
        },

        anchor: {
            label: "Anchor",
            defExpanded: true,
        },

        transform: {
            label: "Transform",
            defExpanded: true,
        },

        texture: {
            label: "Texture",
            defExpanded: true,
            disableMargin: true,
        },

        tags: {
            label: "Tags",
            defExpanded: false,
        },

        advanced: {
            label: "Advanced",
            defExpanded: false,
        },
    },
});

// ZBaseLightEffect.shape.type.removeDefault().Values

const ZBeautifyEffect = ZBaseEffect.extend({
    name: z.literal("beautify").describe(uiDescriptions.none),
    mix: ZNumberSlider.describe({ ...uiDescriptions.numberSlider, defValue: 0.65, label: "Mix" }),
}).describe({
    ...uiDescriptions.object,
    label: "Beautify",
    groups: {
        main: {
            label: "Main",
            defExpanded: true,
        },
        tags: {
            label: "Tags",
            defExpanded: false,
        },
    },
});

// "lookup": "ColorFilter/lookup.png",
// "intensity":

const ZColorfilterEffect = ZBaseEffect.extend({
    name: z.literal("colorfilter").describe(uiDescriptions.none),
    anchor: ZPatchAnchor.describe({
        ...uiDescriptions.enum,
        label: "Anchor",
        group: "anchor",
        options: Object.keys(ZPatchAnchor.Values),
        optionLabels: ZPatchAnchorLabels,
        defValue: ZFaceAnchor.Values.forehead,
    }),
    visible: ZVisibleType.describe({
        ...uiDescriptions.enum,
        label: "Visible",
        group: "advanced",
        options: Object.keys(ZVisibleType.Values),
        optionLabels: ZVisibleTypeLabels,
        defValue: ZVisibleType.Values.always,
    }),
    fit: ZPatchFitMode.describe({
        ...uiDescriptions.enum,
        label: "Fit",
        group: "advanced",
        options: Object.keys(ZPatchFitMode.Values),
        optionLabels: ZPatchFitModeLabels,
        defValue: ZPatchFitMode.Values.none,
    }),
    size: ZArray2D.describe({
        ...uiDescriptions.array2d,
        defValue: [1, 1],
        label: "Size",
        group: "transform",
        dependencies: patchAnchorDeps,
    }),
    offset: ZArray3D.describe({
        ...uiDescriptions.array3d,
        label: "Offset",
        group: "transform",
        dependencies: patchAnchorDeps,
    }),
    allow_rotation: ZBool.describe({
        ...uiDescriptions.bool,
        label: "Allow rotation",
        group: "anchor",
    }),
    rotation: ZArray3D.describe({
        ...uiDescriptions.array3d,
        label: "Rotation",
        group: "transform",
        dependencies: patchAnchorDeps,
    }),

    lookup: ZTextureAsset({ label: "LUT", group: "colorfilter" }),
    intensity: ZNumberSlider.describe({
        ...uiDescriptions.numberSlider,
        defValue: 0.75,
        valueLabel: "%",
        valueTemplate: (val) => Math.floor(val * 100),
        label: "Intensity",
        group: "colorfilter",
    }),
}).describe({
    ...uiDescriptions.object,
    label: "Color filter",
    groups: {
        main: {
            label: null,
            defExpanded: true,
        },

        anchor: {
            label: "Anchor",
            defExpanded: true,
        },

        transform: {
            label: "Transform",
            defExpanded: true,
        },

        colorfilter: {
            label: "Colorfilter",
            defExpanded: true,
        },

        tags: {
            label: "Tags",
            defExpanded: false,
        },

        advanced: {
            label: "Advanced",
            defExpanded: false,
        },
    },
});

const ZModel3dEffect = ZBaseEffect.extend({
    name: z.literal("model3d").describe(uiDescriptions.none),
    anchor: ZFaceAnchor.describe({
        ...uiDescriptions.enum,
        label: "Anchor",
        group: "anchor",

        options: Object.keys(ZFaceAnchor.Values),
        optionLabels: ZFaceAnchorLabels,
        defValue: ZFaceAnchor.Values.forehead,
    }),
    model: ZModel3dAsset({ label: "Model 3d Asset", group: "model" }),
    position: ZArray3D.describe({
        ...uiDescriptions.array3d,
        label: "Position",
        group: "transform",
    }),
    scale: ZArray3D.describe({
        ...uiDescriptions.array3d,
        defValue: [1, 1, 1],
        label: "Scale",
        group: "transform",
    }),
    rotation: ZArray3D.describe({
        ...uiDescriptions.array3d,
        label: "Rotation",
        group: "transform",
    }),
    material: ZMaterialArray,
}).describe({
    ...uiDescriptions.object,
    label: "Model 3d",
    groups: {
        main: {
            label: null,
            defExpanded: true,
        },

        anchor: {
            label: "Anchor",
            defExpanded: true,
        },

        transform: {
            label: "Transform",
            defExpanded: true,
        },
        model: {
            label: "Model",
            defExpanded: true,
        },
        materials: {
            label: "Materials",
            defExpanded: true,
        },
        tags: {
            label: "Tags",
            defExpanded: false,
        },
    },
});

const ZPlaneEffect = ZBaseEffect.extend({
    name: z.literal("plane").describe(uiDescriptions.none),
    anchor: ZFaceAnchor.describe({
        ...uiDescriptions.enum,
        label: "Anchor",
        group: "anchor",

        options: Object.keys(ZFaceAnchor.Values),
        optionLabels: ZFaceAnchorLabels,
        defValue: ZFaceAnchor.Values.forehead,
    }),
    position: ZArray3D.describe({
        ...uiDescriptions.array3d,
        label: "Position",
        group: "transform",
    }),
    scale: ZArray3D.describe({
        ...uiDescriptions.array3d,
        defValue: [1, 1, 1],
        lable: "Scale",
        group: "transform",
    }),
    rotation: ZArray3D.describe({
        ...uiDescriptions.array3d,
        label: "Rotation",
        group: "transform",
    }),
    material: ZMaterial,
}).describe({
    ...uiDescriptions.object,
    label: "Plane",

    groups: {
        main: {
            label: null,
            defExpanded: true,
        },

        anchor: {
            label: "Anchor",
            defExpanded: true,
        },

        transform: {
            label: "Transform",
            defExpanded: true,
        },
        materials: {
            label: "Material",
            defExpanded: true,
        },
        tags: {
            label: "Tags",
            defExpanded: false,
        },
    },
});

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
//                     {...uiDescriptions.enum,  options: Object.keys(ZFaceAnchor.Values) }
//                 ).default(ZFaceAnchor.Values.forehead),
//                 range: z.number().default(500.0),
//             })
//             .describe(uiDescriptions.object),

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
//             .describe(uiDescriptions.object),

//         z
//             .object({
//                 name: z.literal("light"),
//                 color: ZColor.default([1, 1, 1]),
//                 brightness: ZNumberSlider.default(1.0),
//                 specular_intensity: ZNumberSlider.default(1.0),
//                 type: z.literal("ambient"),
//             })
//             .describe(uiDescriptions.object),
//     ])
//     .describe(uiDescriptions.union);

const ZLightBase = ZBaseEffect.extend({
    name: z.literal("light").describe(uiDescriptions.none),
    color: ZColor.describe({
        ...uiDescriptions.color,
        defValue: [1, 1, 1],
        showAlways: true,
        label: "Color",
    }),
    brightness: ZNumberSlider.describe({
        ...uiDescriptions.numberSlider,
        defValue: 1,
        showAlways: true,
        label: "Brightness",
    }),
    specular_intensity: ZNumberSlider.describe({
        ...uiDescriptions.numberSlider,
        defValue: 1,
        showAlways: true,
        label: "Specular factor",
    }),
});

const ZLightAmbientEffect = ZLightBase.merge(
    z.object({
        type: z.literal("ambient").describe({
            ...uiDescriptions.enum,
            label: "Type",
            options: Object.keys(ZLightType.Values),
            optionLabels: ZLightTypeLabels,
            defValue: ZLightType.Values.ambient,
        }),
    })
).describe({
    ...uiDescriptions.object,
    label: "Light",
    groups: {
        main: {
            label: null,
            defExpanded: true,
        },

        tags: {
            label: "Tags",
            defExpanded: false,
        },
    },
});

const ZLightDirectEffect = ZLightBase.merge(
    z.object({
        type: z.literal("direct").describe({
            ...uiDescriptions.enum,
            label: "Type",
            options: Object.keys(ZLightType.Values),
            optionLabels: ZLightTypeLabels,
            defValue: ZLightType.Values.ambient,
        }),
        direction: ZArray3D.describe({
            ...uiDescriptions.array3d,
            defValue: [0, 0, 1],
            label: "Direction",
            group: "transform",
        }),
        rotation: ZArray3D.describe({
            ...uiDescriptions.array3d,
            label: "Rotation",
            group: "transform",
        }),
    })
).describe({
    ...uiDescriptions.object,
    label: "Light",
    groups: {
        main: {
            label: null,
            defExpanded: true,
        },

        anchor: {
            label: "Anchor",
            defExpanded: true,
        },

        transform: {
            label: "Transform",
            defExpanded: true,
        },

        tags: {
            label: "Tags",
            defExpanded: false,
        },
    },
});

const ZLightPointEffect = ZLightBase.merge(
    z.object({
        type: z.literal("point").describe({
            ...uiDescriptions.enum,
            label: "Type",
            options: Object.keys(ZLightType.Values),
            optionLabels: ZLightTypeLabels,
            defValue: ZLightType.Values.ambient,
        }),
        anchor: ZFaceAnchor.describe({
            ...uiDescriptions.enum,
            label: "Anchor",
            group: "anchor",
            options: Object.keys(ZFaceAnchor.Values),
            optionLabels: ZFaceAnchorLabels,
            defValue: ZFaceAnchor.Values.forehead,
        }),
        range: ZNumberSlider.describe({
            ...uiDescriptions.numberSlider,
            min: 0.0,
            max: 2000.0,
            defValue: 500.0,
            label: "Range",
        }),
        position: ZArray3D.describe({
            ...uiDescriptions.array3d,
            // dependencies: [
            //     {
            //         source: ["stores", "effects"],
            //         relPath: ["..", "range"],
            //         postprocess: (_, range, component) => {
            //             component.disabled = range > 500;
            //             return null;
            //         },
            //     },
            // ],
            label: "Position",
            group: "transform",
        }),
    })
).describe({
    ...uiDescriptions.object,
    label: "Light",
    groups: {
        main: {
            label: null,
            defExpanded: true,
        },

        anchor: {
            label: "Anchor",
            defExpanded: true,
        },

        transform: {
            label: "Transform",
            defExpanded: true,
        },

        tags: {
            label: "Tags",
            defExpanded: false,
        },
    },
});

const ZLight = [ZLightAmbientEffect, ZLightDirectEffect, ZLightPointEffect];

// console.log(ZLightEffect.parse({ name: "light", type: "point" }))

// console.log(ZLightEffect.description)

// const testLight = {
//     name: "light",
//     tag: "1233",
//     disabled: true,
//     anchor: "right_eye",
//     type: "ambient",
//     color: [0.88, 0.14, 0.14],
//     brightness: 0.45,
//     specular_intensity: 0.25,
//     range: 1500,
//     position: [0.0, 0.0, 13.0],
//     direction: [0.0, 0.0, 1.0],
//     rotation: [0.0, 0.0, 0.0],
// };

// console.log(ZLightEffect.parse(testLight))

const ZLiquifiedWarpEffect = ZBaseEffect.extend({
    name: z.literal("liquifiedwarp").describe(uiDescriptions.none),
    progress: ZNumberSlider.describe({
        ...uiDescriptions.numberSlider,
        defValue: 1,
        label: "Progress",
    }),
}).describe({ ...uiDescriptions.object, label: "Liquified Warp" });

const ZPostEffectType = z.enum(["blur", "dispersion", "glow", "noise", "sharpen"]);
const ZPostEffectTypeLabels = ["Blur", "Dispersion", "Glow", "Noise", "Sharpen"];

const ZPostEffectEffect = ZBaseEffect.extend({
    name: z.literal("posteffect").describe(uiDescriptions.none),
    type: ZPostEffectType.describe({
        ...uiDescriptions.enum,
        label: "Type",
        options: Object.keys(ZPostEffectType.Values),
        defValue: ZPostEffectType.Values.sharpen,
        optionLabels: ZPostEffectTypeLabels,
    }),
    intensity: ZNumberSlider.describe({
        ...uiDescriptions.numberSlider,
        defValue: 1,
        label: "Intensity",
    }),
}).describe({
    ...uiDescriptions.object,
    label: "Post effect",
    groups: {
        main: {
            label: "Main",
            defExpanded: true,
        },
        tags: {
            label: "Tags",
            defExpanded: false,
        },
    },
});

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
//     .describe(uiDescriptions.discriminatedUnion);

export const ZEffect = z.union(EffectsList).describe(uiDescriptions.union);

export const ZEffects = ZEffect.array().describe(uiDescriptions.array);
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
        name: z.literal("perspective").describe(uiDescriptions.none),
        fov: ZNumberSlider.describe({
            ...uiDescriptions.numberSlider,
            min: 30,
            max: 90,
            defValue: 30,
            steps: 15,
            showAlways: false,
            label: "Field of view",
        }),
        near_clip: ZNumberSlider.describe({
            ...uiDescriptions.numberSlider,
            min: 0.1,
            max: 5000,
            defValue: 0.1,
            showAlways: false,
            label: "Near plane",
        }),
        far_clip: ZNumberSlider.describe({
            ...uiDescriptions.numberSlider,
            min: 1,
            max: 5000,
            defValue: 3000,
            steps: 100,
            showAlways: false,
            label: "Far plane",
        }),
    })
    .describe({ ...uiDescriptions.object, label: "Perspective" });

const ZMirrorPlugin = z
    .object({
        name: z.literal("mirror").describe(uiDescriptions.none),
        enabled: ZBool.describe({ ...uiDescriptions.bool, defValue: true, label: "Enable" }),
        debug: ZBool.describe({ ...uiDescriptions.bool, defValue: false, label: "Debug" }),
    })
    .describe({ ...uiDescriptions.object, label: "Mirror" });

const ZFixedDetectionPlugin = z
    .object({
        name: z.literal("fixeddetection").describe(uiDescriptions.none),

        // !!! need explanation for parameters
        rotation: ZArray4D.describe({
            ...uiDescriptions.array4d,
            defValue: [0.1, 0.21, 0.7, 0.2],
            label: "Rotation",
        }),
        offset: ZNumberSlider.describe({
            ...uiDescriptions.numberSlider,
            defValue: 0.7,
            label: "Offset",
        }),
    })
    .describe({ ...uiDescriptions.object, label: "Detection fix" });

export const PluginsList = [ZMirrorPlugin, ZPerspectivePlugin, ZFixedDetectionPlugin];

export const ZPlugin = z.union(PluginsList).describe(uiDescriptions.union);

export const ZPlugins = ZPlugin.array().describe(uiDescriptions.array);
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

const ZEnum = (defValue, label, options = [], optionLabels = [], group = "main") => {
    return z
        .enum(options)
        .describe({ ...uiDescriptions.enum, options, optionLabels, defValue, group, label });
};

const ZNumberEnum = (
    defValue,
    label,
    group = "main",
    options = [],
    optionLabels = [],
    showAlways = false
) => {
    return z.number().describe({
        ...uiDescriptions.enum,
        options,
        optionLabels,
        defValue,
        showAlways,
        label,
        group,
    });
};

const iconInfo = {
    clickLink:
        "https://dev.vk.com/ru/masks/publication/resources#%D0%98%D0%BA%D0%BE%D0%BD%D0%BA%D0%B0",

    infoList: `PNG format
        Should not contain transparent layer
        Should preview what masks look like
        Max size 60KB`,
    infoHeader: "Icon should meet these requirements :",
    infoErrorHeader: "Errors :",
};
const ZIcon = z.string().describe({
    ...uiDescriptions.icon,
    info: iconInfo,
    label: "locale.projectManager.iconControl.label",
});

const scriptInfo = {
    clickLink: "https://dev.vk.com/ru/masks/development/script-creation",
};
const ZMainScriptAsset = z.string().describe({
    ...uiDescriptions.mainScript,
    info: scriptInfo,
    group: "advanced",
    label: "locale.projectManager.mainScript.label",
});

const MaskSettings = {
    icon: ZIcon,
    user_hint: ZEnum(
        UserHintOptions[0],
        "locale.projectManager.userHint.label",
        UserHintOptions,
        UserHintOptionsLabels
    ),
    // num_faces: ZNumberEnum(1, "Number faces", "main", [0, 1, 2], ["0", "1", "2"]),
    // facemodel_version: ZNumberEnum(0, "Facemodel version", "Advanced", [0, 1], ["old", "new"]),
    mouse_input: z.boolean().describe({
        ...uiDescriptions.bool,
        label: "locale.projectManager.mouseInput.label",
        defValue: false,
        showAlways: false,
        group: "permissions",
    }),
    script: ZMainScriptAsset,
};

export const ZMaskSettings = z
    .object(MaskSettings)
    .describe({
        ...uiDescriptions.object,
        groups: {
            main: {
                label: "locale.projectManager.groups.main.label",
                defExpanded: true,
            },
            permissions: {
                label: "locale.projectManager.groups.permissions.label",
                defExpanded: false,
            },
            advanced: {
                label: "locale.projectManager.groups.advanced.label",
                defExpanded: false,
            },
        },
    })
    .partial();

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
                    z.union([
                        z
                            .object({
                                name: z.union([z.literal("patch"), z.literal("facemodel")]),
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
                                    .default({ animation: {} }),
                            })
                            .passthrough(),

                        z
                            .object({
                                name: z.literal("model3d"),
                                material: z
                                    .preprocess((val) => {
                                        if (!Array.isArray(val)) return [val];
                                        return val;
                                    }, z.array(z.unknown())) // was union string and object
                                    .optional()
                                    .default([]),
                            })
                            .passthrough(),
                        z
                            .object({
                                name: z.union([
                                    z.literal("light"),
                                    z.literal("posteffect"),
                                    z.literal("beautify"),
                                    z.literal("colorfilter"),
                                    z.literal("liquifiedwarp"),
                                    z.literal("plane"),
                                ]),
                            })
                            .passthrough(),
                    ])
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
