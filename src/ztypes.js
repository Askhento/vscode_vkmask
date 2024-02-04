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
        name: "array",
        label: "Array",
        group: "main",
        elementName: "element",
        defaultElement: "defalult",
        defValue: [],
        userResizable: false,
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
    "locale.faceAnchors.free.label", //"Free",
    "locale.faceAnchors.face.label", //"Face",
    "locale.faceAnchors.rightEye.label", //"Right eye",
    "locale.faceAnchors.leftEye.label", //"Left eye",
    "locale.faceAnchors.betweenEyes.label", //"Between eyes",
    "locale.faceAnchors.forehead.label", //"Forehead",
    "locale.faceAnchors.nose.label", //"Nose",
    "locale.faceAnchors.mouth.label", //"Mouth",
    "locale.faceAnchors.rightCheek.label", //"Right cheek",
    "locale.faceAnchors.leftCheek.label", //"Left cheek",
    "locale.faceAnchors.lowerLip.label", //"Lower lip",
    "locale.faceAnchors.upperLip.label", //"Upper lip",
];

const ZLightType = z.enum(["point", "ambient", "direct"]);
const ZLightTypeLabels = [
    "locale.lightTypes.point.label", //"Point",
    "locale.lightTypes.ambient.label", //"Ambient",
    "locale.lightTypes.direct.label", //"Direct"
];

const AssetTypes = {
    texture: {
        defValue: "Textures/Spot.png",
        extensions: ["png", "jpg"],
        directory: ["Textures"],
        typeName: "texture",
        label: "locale.assetTypes.texture.label",
    },
    material: {
        defValue: "Materials/DefaultGrey.xml",
        extensions: ["xml", "json"],
        types: ["xml_material", "json_material"],
        directory: ["Materials"],
        typeName: "material",
        label: "locale.assetTypes.material.label",
    },
    technique: {
        defValue: "Techniques/DiffUnlit.xml",
        extensions: ["xml"],
        types: ["xml_technique"],
        directory: ["Techniques"],
        typeName: "technique",
        label: "locale.assetTypes.technique.label",
    },
    renderPath: {
        defValue: "",
        extensions: ["xml"],
        types: ["xml_renderpath"],
        directory: ["RenderPaths"],
        typeName: "renderPath",
        label: "locale.assetTypes.renderPath.label",
    },
    animationClip: {
        defValue: "",
        extensions: ["ani"],
        directory: ["Animations"],
        typeName: "animationClip",
        label: "locale.assetTypes.animationClip.label",
    },
    model3d: {
        defValue: "Models/DefaultPlane.mdl",
        extensions: ["mdl"],
        directory: ["Models"],
        typeName: "model3d",
        label: "locale.assetTypes.model3d.label",
    },
    script: {
        defValue: "",
        extensions: ["as"],
        directory: ["Scripts"],
        typeName: "script",
        label: "locale.assetTypes.script.label",
    },
};

const ZText = z.string().describe(uiDescriptions.text);
const ZTags = z
    .string()
    .describe({ ...uiDescriptions.tags, label: "locale.parameters.tags.label" });

const ZVisibleType = z.enum(["always", "face", "animation", "mouth_open"]);
const ZVisibleTypeLabels = [
    "locale.visibleTypes.always.label", //"Always",
    "locale.visibleTypes.face.label", //"Face",
    "locale.visibleTypes.animation.label", //"Animation",
    "locale.visibleTypes.mouthOpen.label", //"Mouth open"
];

const ZPatchFitMode = z.enum(["none", "crop", "pad"]);
const ZPatchFitModeLabels = [
    "locale.patchFitModex.none.label", //"None",
    "locale.patchFitModex.crop.label", //"Crop",
    "locale.patchFitModex.pad.label", //"Pad"
];

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
    "locale.blendModes.replace.label", //"Replace",
    "locale.blendModes.alpha.label", //"Alpha",
    "locale.blendModes.additive.label", //"Additive",
    "locale.blendModes.addAlpha.label", //"Add alpha",
    "locale.blendModes.multiply.label", //"Multiply",
    "locale.blendModes.lighten.label", //"Lighten",
    "locale.blendModes.darken.label", //"Darken",
    "locale.blendModes.linearLight.label", //"Linear Light",
    "locale.blendModes.screen.label", //"Screen",
    "locale.blendModes.overlay.label", //"Overlay",
    "locale.blendModes.softLight.label", //"Soft Light",
    "locale.blendModes.softLight2.label", //"Soft Light 2",
    "locale.blendModes.colorDodge.label", //"Color Dodge",
    "locale.blendModes.colorBurn.label", //"Color Burn",
    "locale.blendModes.vividLight.label", //"Vivid Light",
    "locale.blendModes.pinLight.label", //"Pin Light",
    "locale.blendModes.hardMix.label", //"Hard Mix",
    "locale.blendModes.difference.label", //"Difference",
    "locale.blendModes.exclusion.label", //"Exclusion",
    "locale.blendModes.hue.label", //"Hue",
    "locale.blendModes.saturation.label", //"Saturation",
    "locale.blendModes.color.label", //"Color",
    "locale.blendModes.luminosity.label", //"Luminosity",
];

const ZAnimationType = z.enum(["once", "loop"]);

const ZAnimationTypeLabels = [
    "locale.animationTypes.once.label", //"Once",
    "locale.animationTypes.loop.label", //"Loop"
];

const ZEventTrigger = z.enum([
    "none",
    "mouth_open",
    "mouth_close",
    "face_found",
    "face_lost",
    "tap",
]);

const ZEventTriggerLabels = [
    "locale.eventTriggers.none.label", //"None",
    "locale.eventTriggers.mouthOpen.label", //"Mouth Open",
    "locale.eventTriggers.mouthClose.label", //"Mouth Close",
    "locale.eventTriggers.faceFound.label", //"Face Found",
    "locale.eventTriggers.faceLost.label", //"Face Lost",
    "locale.eventTriggers.tap.label", //"Tap"
];

const ZTextureAnimation = z
    .object({
        type: ZAnimationType.describe({
            ...uiDescriptions.enum,

            label: "locale.parameters.textureAnimation.type.label",
            options: Object.keys(ZAnimationType.Values),
            optionLabels: ZAnimationTypeLabels,
            defValue: ZAnimationType.Values.mouth_open,
        }),
        trigget_start: ZEventTrigger.describe({
            ...uiDescriptions.enum,
            label: "locale.parameters.textureAnimation.triggerStart.label",
            options: Object.keys(ZEventTrigger.Values),
            optionLabels: ZEventTriggerLabels,
            defValue: ZEventTrigger.Values.mouth_open,
        }),
        trigget_stop: ZEventTrigger.describe({
            ...uiDescriptions.enum,
            label: "locale.parameters.textureAnimation.triggerStop.label",
            options: Object.keys(ZEventTrigger.Values),
            optionLabels: ZEventTriggerLabels,
            defValue: ZEventTrigger.Values.mouth_close,
        }),
        fps: ZNumberSlider.describe({
            ...uiDescriptions.numberSlider,
            defValue: 30,
            min: 0,
            max: 240,
            valueLabel: "locale.parameters.textureAnimation.fps.valueLabel",
            // valueTemplate: (val) => Math.floor(val * 100),
            label: "locale.parameters.textureAnimation.fps.label",
        }),
    })
    .describe({
        ...uiDescriptions.object,
        label: "locale.parameters.textureAnimation.label",
        group: "animation",
    });

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
            diffuse: ZTextureAsset({ label: "locale.parameters.texture.diffuse.label" }),
            blend_mode: ZBlendModes.describe({
                ...uiDescriptions.enum,
                label: "locale.parameters.texture.blendMode.label",
                options: Object.keys(ZBlendModes.Values),
                optionLabels: ZBlendModesLabels,
                defValue: ZBlendModes.Values.replace,
            }),
            color: ZColorAlpha.describe({
                ...uiDescriptions.colorAlpha,
                label: "locale.parameters.texture.color.label",
            }),
            // lit: ZBool.describe(uiDesc riptions.bool({ label: "Lit" })),
            // !!! probably will miss texture property
            // texture: ZTextureAsset,
            // normal: ZTextureAsset({ label: "Normal" }),
            u_transform: ZArray3D.describe({
                ...uiDescriptions.uv_transform,
                label: "locale.parameters.texture.uvTransform.label",
                defValue: [1, 0, 0],
            }),
            v_transform: ZArray3D.describe({
                ...uiDescriptions.uv_transform,
                label: "locale.parameters.texture.uvTransform.label",
                defValue: [0, 1, 0],
            }),
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
            label: "locale.parameters.texture.label",
            group: "texture",
            groups: {
                main: {
                    label: null,
                    defExpanded: true,
                },
                animation: {
                    label: "locale.parameters.texture.groups.animation.label",
                    defExpanded: false,
                },
                uv_transform: {
                    label: "locale.parameters.texture.groups.uvTransform.label",
                    defExpanded: false,
                },
            },
        })
);

const ZCullMode = z.enum(["none", "ccw", "cw"]);
const CullModeLabels = [
    "locale.cullModes.none.label",
    "locale.cullModes.ccw.label",
    "locale.cullModes.cw.label",
];
const ZFillMode = z.enum(["solid", "wireframe", "point"]);
const FillModeLabels = [
    "locale.fillModes.solid.label",
    "locale.fillModes.wireframe.label",
    "locale.fillModes.point.label",
];

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
            technique: ZTechniqueAsset({ label: "locale.material.technique.label" }),
            diffuse: ZTextureAsset({ label: "locale.material.diffuse.label", group: "diffuse" }),
            normal: ZTextureAsset({ label: "locale.material.normal.label", group: "normal" }),
            specular: ZTextureAsset({ label: "locale.material.specular.label", group: "specular" }),
            emissive: ZTextureAsset({ label: "locale.material.emissive.label", group: "emissive" }),
            environment: ZTextureAsset({
                label: "locale.material.environment.label",
                group: "environment",
            }),

            MatDiffColor: ZArray4D.describe({
                ...uiDescriptions.colorAlpha,
                defValue: [1.0, 1.0, 1.0, 1.0],
                group: "diffuse",
                label: "locale.material.diffuseColor.label",
            }),
            MatSpecColor: ZArray4D.describe({
                ...uiDescriptions.colorAlpha,
                defValue: [0.0, 0.0, 0.0, 1.0],
                group: "specular",
                showAlways: false,
                label: "locale.material.specularColor.label",
            }),
            MatEmissiveColor: ZArray3D.describe({
                ...uiDescriptions.color,
                showAlways: false,
                group: "emissive",
                label: "locale.material.emissiveColor.label",
            }),
            MatEnvMapColor: ZArray3D.describe({
                ...uiDescriptions.color,
                defValue: [1.0, 1.0, 1.0],
                group: "environment",
                showAlways: false,
                label: "locale.material.environmentColor.label",
            }),
            Roughness: ZNumberSlider.describe({
                ...uiDescriptions.numberSlider,
                defValue: 0.5,
                showAlways: false,
                label: "locale.material.roughness.label",
            }),
            Metallic: ZNumberSlider.describe({
                ...uiDescriptions.numberSlider,
                defValue: 0.5,
                showAlways: false,
                label: "locale.material.metallness.label",
            }),

            cull: ZCullMode.describe({
                ...uiDescriptions.enum,
                label: "locale.material.culling.label",
                options: Object.keys(ZCullMode.Values),
                optionLabels: CullModeLabels,
                defValue: ZCullMode.Values.ccw,
            }),
            fill: ZFillMode.describe({
                ...uiDescriptions.enum,
                label: "locale.material.fill.label",
                options: Object.keys(ZFillMode.Values),
                optionLabels: FillModeLabels,
                defValue: ZFillMode.Values.solid,
            }),
        })
        .describe({
            ...uiDescriptions.object,
            label: "locale.material.label",
            groups: {
                main: {
                    label: null,
                    defExpanded: true,
                },

                diffuse: {
                    label: "locale.material.groups.diffuse.label",
                    defExpanded: true,
                },

                normal: {
                    label: "locale.material.groups.normal.label",
                    defExpanded: true,
                },

                specular: {
                    label: "locale.material.groups.specular.label",
                    defExpanded: true,
                },

                environment: {
                    label: "locale.material.groups.environment.label",
                    defExpanded: true,
                },

                emissive: {
                    label: "locale.material.groups.emissive.label",
                    defExpanded: true,
                },
            },
        })
);

const ZMaterial = ZMaterialAsset({ label: "locale.materialAsset.label", group: "materials" });
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
        label: "locale.materialArray.label",
        group: "materials",
        defaultElement: AssetTypes.material.defValue,
        defValue: [AssetTypes.material.defValue],
        userResizable: false,
    })
);

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
        label: "locale.parameters.facemodel.mouth.label",
        group: "visible",
    }),
    eyes: ZBool.describe({
        ...uiDescriptions.bool,
        defValue: true,
        label: "locale.parameters.facemodel.eyes.label",
        group: "visible",
    }),
    position: ZArray3D.describe({
        ...uiDescriptions.array3d,
        label: "locale.parameters.facemodel.position.label",
        group: "transform",
    }),
    scale: ZArray3D.describe({
        ...uiDescriptions.array3d,
        defValue: [1, 1, 1],
        label: "locale.parameters.facemodel.scale.label",
        group: "transform",
    }),
    rotation: ZArray3D.describe({
        ...uiDescriptions.array3d,
        label: "locale.parameters.facemodel.rotation.label",
        group: "transform",
    }),
    texture: ZTextureObject,
}).describe({
    ...uiDescriptions.object,
    label: "locale.parameters.facemodel.label",
    groups: {
        main: {
            label: null,
            defExpanded: true,
        },

        visible: {
            label: "locale.parameters.facemodel.groups.visible.label",
            defExpanded: true,
        },

        transform: {
            label: "locale.parameters.facemodel.groups.transform.label",
            defExpanded: true,
        },

        texture: {
            label: "locale.parameters.facemodel.groups.texture.label",
            defExpanded: true,
            disableMargin: true,
        },

        tags: {
            label: "locale.parameters.facemodel.groups.tags.label",
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
    "locale.patchAnchors.free.label",
    "locale.patchAnchors.fullscreen.label",
    "locale.patchAnchors.face.label",
    "locale.patchAnchors.rightEye.label",
    "locale.patchAnchors.leftEye.label",
    "locale.patchAnchors.betweenEyes.label",
    "locale.patchAnchors.forehead.label",
    "locale.patchAnchors.nose.label",
    "locale.patchAnchors.mouth.label",
    "locale.patchAnchors.rightCheek.label",
    "locale.patchAnchors.leftCheek.label",
    "locale.patchAnchors.lowerLip.label",
    "locale.patchAnchors.upperLip.label",
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

// const patchRotationDeps = [
//     {
//         source: ["stores", "effects"],
//         relPath: ["..", "allow_rotation"],
//         postprocess: (_, allowRotation, component) => {
//             if (!allowRotation) component.disabled = true;
//             return { needUpdate: false };
//         },
//     },
// ];

const ZPatchEffect = ZBaseEffect.extend({
    name: z.literal("patch").describe(uiDescriptions.none),
    anchor: ZPatchAnchor.describe({
        ...uiDescriptions.enum,
        label: "locale.parameters.patch.anchor.label",
        group: "anchor",
        options: Object.keys(ZPatchAnchor.Values),
        optionLabels: ZPatchAnchorLabels,
        defValue: ZFaceAnchor.Values.forehead,
    }),
    visible: ZVisibleType.describe({
        ...uiDescriptions.enum,
        label: "locale.parameters.patch.visible.label",
        group: "advanced",
        options: Object.keys(ZVisibleType.Values),
        optionLabels: ZVisibleTypeLabels,
        defValue: ZVisibleType.Values.always,
    }),
    fit: ZPatchFitMode.describe({
        ...uiDescriptions.enum,
        label: "locale.parameters.patch.fit.label",
        group: "advanced",
        options: Object.keys(ZPatchFitMode.Values),
        optionLabels: ZPatchFitModeLabels,
        defValue: ZPatchFitMode.Values.none,
    }),
    size: ZArray2D.describe({
        ...uiDescriptions.array2d,
        defValue: [1, 1],
        label: "locale.parameters.patch.size.label",
        group: "transform",
        dependencies: patchAnchorDeps,
    }),
    offset: ZArray3D.describe({
        ...uiDescriptions.array3d,
        label: "locale.parameters.patch.offset.label",
        group: "transform",
        dependencies: patchAnchorDeps,
    }),
    allow_rotation: ZBool.describe({
        ...uiDescriptions.bool,
        label: "locale.parameters.patch.allowRotation.label",
        group: "anchor",
    }),
    rotation: ZArray3D.describe({
        ...uiDescriptions.array3d,
        label: "locale.parameters.patch.rotation.label",
        group: "transform",
        dependencies: patchAnchorDeps,
    }),
    // pass: ZRenderPathAsset({ label: "Render Path" }),
    texture: ZTextureObject,
}).describe({
    ...uiDescriptions.object,
    label: "locale.parameters.patch.label",
    groups: {
        main: {
            label: null,
            defExpanded: true,
        },

        anchor: {
            label: "locale.parameters.patch.groups.anchor.label",
            defExpanded: true,
        },

        transform: {
            label: "locale.parameters.patch.groups.transform.label",
            defExpanded: true,
        },

        texture: {
            label: "locale.parameters.patch.groups.texture.label",
            defExpanded: true,
            disableMargin: true,
        },

        tags: {
            label: "locale.parameters.patch.groups.tags.label",
            defExpanded: false,
        },

        advanced: {
            label: "locale.parameters.patch.groups.advanced.label",
            defExpanded: false,
        },
    },
});

// ZBaseLightEffect.shape.type.removeDefault().Values

const ZBeautifyEffect = ZBaseEffect.extend({
    name: z.literal("beautify").describe(uiDescriptions.none),
    mix: ZNumberSlider.describe({
        ...uiDescriptions.numberSlider,
        defValue: 0.65,
        label: "locale.parameters.beautify.mix.label",
    }),
}).describe({
    ...uiDescriptions.object,
    label: "locale.parameters.beautify.label",
    groups: {
        main: {
            label: "locale.parameters.beautify.groups.main.label",
            defExpanded: true,
        },
        tags: {
            label: "locale.parameters.beautify.groups.tags.label",
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
        label: "locale.parameters.colorFilter.anchor.label",
        group: "anchor",
        options: Object.keys(ZPatchAnchor.Values),
        optionLabels: ZPatchAnchorLabels,
        defValue: ZFaceAnchor.Values.forehead,
    }),
    visible: ZVisibleType.describe({
        ...uiDescriptions.enum,
        label: "locale.parameters.colorFilter.visible.label",
        group: "advanced",
        options: Object.keys(ZVisibleType.Values),
        optionLabels: ZVisibleTypeLabels,
        defValue: ZVisibleType.Values.always,
    }),
    fit: ZPatchFitMode.describe({
        ...uiDescriptions.enum,
        label: "locale.parameters.colorFilter.fit.label",
        group: "advanced",
        options: Object.keys(ZPatchFitMode.Values),
        optionLabels: ZPatchFitModeLabels,
        defValue: ZPatchFitMode.Values.none,
    }),
    size: ZArray2D.describe({
        ...uiDescriptions.array2d,
        defValue: [1, 1],
        label: "locale.parameters.colorFilter.size.label",
        group: "transform",
        dependencies: patchAnchorDeps,
    }),
    offset: ZArray3D.describe({
        ...uiDescriptions.array3d,
        label: "locale.parameters.colorFilter.offset.label",
        group: "transform",
        dependencies: patchAnchorDeps,
    }),
    allow_rotation: ZBool.describe({
        ...uiDescriptions.bool,
        label: "locale.parameters.colorFilter.allowRotation.label",
        group: "anchor",
    }),
    rotation: ZArray3D.describe({
        ...uiDescriptions.array3d,
        label: "locale.parameters.colorFilter.rotation.label",
        group: "transform",
        dependencies: patchAnchorDeps,
    }),

    lookup: ZTextureAsset({
        label: "locale.parameters.colorFilter.lut.label",
        group: "colorfilter",
    }),
    intensity: ZNumberSlider.describe({
        ...uiDescriptions.numberSlider,
        defValue: 0.75,
        valueLabel: "locale.parameters.colorFilter.intensity.valueLabel",
        valueTemplate: (val) => Math.floor(val * 100),
        label: "locale.parameters.colorFilter.intensity.label",
        group: "colorfilter",
    }),
}).describe({
    ...uiDescriptions.object,
    label: "locale.parameters.colorFilter.label",
    groups: {
        main: {
            label: null,
            defExpanded: true,
        },

        anchor: {
            label: "locale.parameters.colorFilter.groups.anchor.label",
            defExpanded: true,
        },

        transform: {
            label: "locale.parameters.colorFilter.groups.transform.label",
            defExpanded: true,
        },

        colorfilter: {
            label: "locale.parameters.colorFilter.groups.colorfilter.label",
            defExpanded: true,
        },

        tags: {
            label: "locale.parameters.colorFilter.groups.tags.label",
            defExpanded: false,
        },

        advanced: {
            label: "locale.parameters.colorFilter.groups.advanced.label",
            defExpanded: false,
        },
    },
});

const ZModel3dEffect = ZBaseEffect.extend({
    name: z.literal("model3d").describe(uiDescriptions.none),
    anchor: ZFaceAnchor.describe({
        ...uiDescriptions.enum,
        label: "locale.parameters.model3d.anchor.label",
        group: "anchor",

        options: Object.keys(ZFaceAnchor.Values),
        optionLabels: ZFaceAnchorLabels,
        defValue: ZFaceAnchor.Values.forehead,
    }),
    model: ZModel3dAsset({ label: "locale.parameters.model3d.model.label", group: "model" }),
    position: ZArray3D.describe({
        ...uiDescriptions.array3d,
        label: "locale.parameters.model3d.position.label",
        group: "transform",
    }),
    scale: ZArray3D.describe({
        ...uiDescriptions.array3d,
        defValue: [1, 1, 1],
        label: "locale.parameters.model3d.scale.label",
        group: "transform",
    }),
    rotation: ZArray3D.describe({
        ...uiDescriptions.array3d,
        label: "locale.parameters.model3d.rotation.label",
        group: "transform",
    }),
    material: ZMaterialArray,
}).describe({
    ...uiDescriptions.object,
    label: "locale.parameters.model3d.label",
    groups: {
        main: {
            label: null,
            defExpanded: true,
        },

        anchor: {
            label: "locale.parameters.model3d.groups.anchor.label",
            defExpanded: true,
        },

        transform: {
            label: "locale.parameters.model3d.groups.transform.label",
            defExpanded: true,
        },
        model: {
            label: "locale.parameters.model3d.groups.model.label",
            defExpanded: true,
        },
        materials: {
            label: "locale.parameters.model3d.groups.materials.label",
            defExpanded: true,
        },
        tags: {
            label: "locale.parameters.model3d.groups.tags.label",
            defExpanded: false,
        },
    },
});

const ZPlaneEffect = ZBaseEffect.extend({
    name: z.literal("plane").describe(uiDescriptions.none),
    anchor: ZFaceAnchor.describe({
        ...uiDescriptions.enum,
        label: "locale.parameters.plane.anchor.label",
        group: "anchor",

        options: Object.keys(ZFaceAnchor.Values),
        optionLabels: ZFaceAnchorLabels,
        defValue: ZFaceAnchor.Values.forehead,
    }),
    position: ZArray3D.describe({
        ...uiDescriptions.array3d,
        label: "locale.parameters.plane.position.label",
        group: "transform",
    }),
    scale: ZArray3D.describe({
        ...uiDescriptions.array3d,
        defValue: [1, 1, 1],
        label: "locale.parameters.plane.scale.label",
        group: "transform",
    }),
    rotation: ZArray3D.describe({
        ...uiDescriptions.array3d,
        label: "locale.parameters.plane.rotation.label",
        group: "transform",
    }),
    material: ZMaterial,
}).describe({
    ...uiDescriptions.object,
    label: "locale.parameters.plane.label",

    groups: {
        main: {
            label: null,
            defExpanded: true,
        },

        anchor: {
            label: "locale.parameters.plane.groups.anchor.label",
            defExpanded: true,
        },

        transform: {
            label: "locale.parameters.plane.groups.transform.label",
            defExpanded: true,
        },
        materials: {
            label: "locale.parameters.plane.groups.material.label",
            defExpanded: true,
        },
        tags: {
            label: "locale.parameters.plane.groups.tags.label",
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

const ZLightBase = {
    color: ZColor.describe({
        ...uiDescriptions.color,
        defValue: [1, 1, 1],
        showAlways: true,
        label: "locale.parameters.light.color.label",
    }),
    brightness: ZNumberSlider.describe({
        ...uiDescriptions.numberSlider,
        defValue: 1,
        showAlways: true,
        label: "locale.parameters.light.brightness.label",
    }),
    specular_intensity: ZNumberSlider.describe({
        ...uiDescriptions.numberSlider,
        defValue: 1,
        showAlways: true,
        label: "locale.parameters.light.specularFactor.label",
    }),
    tag: ZTags,
};

const ZLightAmbientEffect = z
    .object({
        name: z.literal("ambientLight").describe(uiDescriptions.none),

        // type: z.literal("ambient").describe({
        //     ...uiDescriptions.enum,
        //     label: "locale.parameters.light.type.label",
        //     options: Object.keys(ZLightType.Values),
        //     optionLabels: ZLightTypeLabels,
        //     defValue: ZLightType.Values.ambient,
        // }),
        ...ZLightBase,
    })
    .describe({
        ...uiDescriptions.object,
        label: "locale.parameters.light.label",
        groups: {
            main: {
                label: null,
                defExpanded: true,
            },

            tags: {
                label: "locale.parameters.light.groups.tags.label",
                defExpanded: false,
            },
        },
    });

const ZLightDirectEffect = z
    .object({
        name: z.literal("directLight").describe(uiDescriptions.none),
        // type: z.literal("direct").describe({
        //     ...uiDescriptions.enum,
        //     label: "locale.parameters.light.type.label",
        //     options: Object.keys(ZLightType.Values),
        //     optionLabels: ZLightTypeLabels,
        //     defValue: ZLightType.Values.ambient,
        // }),
        direction: ZArray3D.describe({
            ...uiDescriptions.array3d,
            defValue: [0, 0, 1],
            label: "locale.parameters.light.direction.label",
            group: "transform",
        }),
        rotation: ZArray3D.describe({
            ...uiDescriptions.array3d,
            label: "locale.parameters.light.rotation.label",
            group: "transform",
        }),
        ...ZLightBase,
    })
    .describe({
        ...uiDescriptions.object,
        label: "locale.parameters.light.label",
        groups: {
            main: {
                label: null,
                defExpanded: true,
            },

            anchor: {
                label: "locale.parameters.light.groups.anchor.label",
                defExpanded: true,
            },

            transform: {
                label: "locale.parameters.light.groups.transform.label",
                defExpanded: true,
            },

            tags: {
                label: "locale.parameters.light.groups.tags.label",
                defExpanded: false,
            },
        },
    });

const ZLightPointEffect = z
    .object({
        name: z.literal("pointLight").describe(uiDescriptions.none),

        // type: z.literal("point").describe({
        //     ...uiDescriptions.enum,
        //     label: "locale.parameters.light.type.label",
        //     options: Object.keys(ZLightType.Values),
        //     optionLabels: ZLightTypeLabels,
        //     defValue: ZLightType.Values.ambient,
        // }),
        anchor: ZFaceAnchor.describe({
            ...uiDescriptions.enum,
            label: "locale.parameters.light.anchor.label",
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
            label: "locale.parameters.light.range.label",
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
            label: "locale.parameters.light.position.label",
            group: "transform",
        }),
        ...ZLightBase,
    })
    .describe({
        ...uiDescriptions.object,
        label: "locale.parameters.light.label",
        groups: {
            main: {
                label: null,
                defExpanded: true,
            },

            anchor: {
                label: "locale.parameters.light.groups.anchor.label",
                defExpanded: true,
            },

            transform: {
                label: "locale.parameters.light.groups.transform.label",
                defExpanded: true,
            },

            tags: {
                label: "locale.parameters.light.groups.tags.label",
                defExpanded: false,
            },
        },
    });

const ZLights = [ZLightAmbientEffect, ZLightDirectEffect, ZLightPointEffect];

const ZLiquifiedWarpEffect = ZBaseEffect.extend({
    name: z.literal("liquifiedwarp").describe(uiDescriptions.none),
    progress: ZNumberSlider.describe({
        ...uiDescriptions.numberSlider,
        defValue: 1,
        label: "locale.parameters.liquifiedwarp.progress.label",
    }),
}).describe({ ...uiDescriptions.object, label: "locale.parameters.liquifiedwarp.label" });

const ZPostEffectType = z.enum(["blur", "dispersion", "glow", "noise", "sharpen"]);
const ZPostEffectTypeLabels = [
    "locale.postEffectTypes.blur.label",
    "locale.postEffectTypes.dispersion.label",
    "locale.postEffectTypes.glow.label",
    "locale.postEffectTypes.noise.label",
    "locale.postEffectTypes.sharpen.label",
];

const ZPostEffectEffect = ZBaseEffect.extend({
    name: z.literal("posteffect").describe(uiDescriptions.none),
    type: ZPostEffectType.describe({
        ...uiDescriptions.enum,
        label: "locale.parameters.postEffect.type.label",
        options: Object.keys(ZPostEffectType.Values),
        defValue: ZPostEffectType.Values.sharpen,
        optionLabels: ZPostEffectTypeLabels,
    }),
    intensity: ZNumberSlider.describe({
        ...uiDescriptions.numberSlider,
        defValue: 1,
        label: "locale.parameters.postEffect.intensity.label",
    }),
}).describe({
    ...uiDescriptions.object,
    label: "locale.parameters.postEffect.label",
    groups: {
        main: {
            label: "locale.parameters.postEffect.groups.main.label",
            defExpanded: true,
        },
        tags: {
            label: "locale.parameters.postEffect.groups.tags.label",
            defExpanded: false,
        },
    },
});

export const EffectsList = [
    ZFacemodelEffect,
    ZPlaneEffect,
    ZModel3dEffect,
    ZPatchEffect,
    ...ZLights,

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
            label: "locale.parameters.perspective.fieldOfView.label",
        }),
        near_clip: ZNumberSlider.describe({
            ...uiDescriptions.numberSlider,
            min: 0.1,
            max: 5000,
            defValue: 0.1,
            label: "locale.parameters.perspective.nearPlane.label",
        }),
        far_clip: ZNumberSlider.describe({
            ...uiDescriptions.numberSlider,
            min: 1,
            max: 5000,
            defValue: 3000,
            steps: 100,
            label: "locale.parameters.perspective.farPlane.label",
        }),
    })
    .describe({ ...uiDescriptions.object, label: "locale.parameters.perspective.label" });

const ZMirrorPlugin = z
    .object({
        name: z.literal("mirror").describe(uiDescriptions.none),
        enabled: ZBool.describe({
            ...uiDescriptions.bool,
            defValue: true,
            label: "locale.parameters.mirror.enable.label",
        }),
        debug: ZBool.describe({
            ...uiDescriptions.bool,
            defValue: false,
            label: "locale.parameters.mirror.debug.label",
        }),
    })
    .describe({ ...uiDescriptions.object, label: "locale.parameters.mirror.label" });

const ZFixedDetectionPlugin = z
    .object({
        name: z.literal("fixeddetection").describe(uiDescriptions.none),

        // !!! need explanation for parameters
        rotation: ZArray4D.describe({
            ...uiDescriptions.array4d,
            defValue: [0.1, 0.21, 0.7, 0.2],
            label: "locale.parameters.fixedDeteciton.rotation.label",
        }),
        offset: ZNumberSlider.describe({
            ...uiDescriptions.numberSlider,
            defValue: 0.7,
            label: "locale.parameters.fixedDeteciton.offset.label",
        }),
    })
    .describe({ ...uiDescriptions.object, label: "locale.parameters.fixedDeteciton.label" });

export const PluginsList = [ZMirrorPlugin, ZPerspectivePlugin, ZFixedDetectionPlugin];

export const ZPlugin = z.union(PluginsList).describe(uiDescriptions.union);

export const ZPlugins = ZPlugin.array().describe(uiDescriptions.array);
// console.log(ZPlugins.safeParse({ name: "facemodel" }))

export const pluginNames = [...new Set(ZPlugin.options.map((val) => val.shape.name.value))];

const UserHintOptions = ["none", "open_mouth", "tap_change", "with_friends", "start_recording"];
const UserHintOptionsLabels = [
    "locale.projectManager.userHint.none.label",
    "locale.projectManager.userHint.openMouth.label",
    "locale.projectManager.userHint.tapOnScreen.label",
    "locale.projectManager.userHint.tryWithFriends.label",
    "locale.projectManager.userHint.startRecording.label",
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

    infoList: "locale.projectManager.icon.infoList",
    infoHeader: "locale.projectManager.icon.infoHeader",
    infoErrorHeader: "locale.projectManager.icon.infoErrorHeader",
};
const ZIcon = z.string().describe({
    ...uiDescriptions.icon,
    info: iconInfo,
    label: "locale.projectManager.icon.label",
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
                                    z.literal("ambientLight"),
                                    z.literal("pointLight"),
                                    z.literal("directLight"),
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
