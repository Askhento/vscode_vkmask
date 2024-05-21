/*
    to get values stored in checks  
    ```
    const minValue = schema.shape.name._def.checks.find(({ kind }) => kind === "min").value;
    
    ```

    biggest issue is parameters with 2 and more options 
*/

import { z } from "zod";
import { mergician } from "mergician";

export const uiDescriptions = {
    none: {
        name: "none",
        group: undefined,
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
        defValue: null,
        showAlways: true,
        info: null,
    },
    icon: { name: "icon", label: "Icon", group: "main", defValue: null, info: null },
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
        defValue: null,
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

const MAX_TEXTURE_SIZE_PX = 2048;
const textureAssetErrorDeps = [
    {
        source: ["stores", "assets"],
        postprocess: (_, assets, component) => {
            const { value, params } = component;
            const assetIndex = assets.findIndex((v) => v.path === value);
            if (assetIndex < 0) {
                return { needUpdate: false };
            }
            const { width, height, size, isOpaque } = assets[assetIndex];

            component.infoErrors = [];

            if (height > MAX_TEXTURE_SIZE_PX)
                component.infoErrors.push([
                    "locale.infoErrors.textures.maxHeight",
                    MAX_TEXTURE_SIZE_PX,
                    height,
                ]);

            if (width > MAX_TEXTURE_SIZE_PX)
                component.infoErrors.push([
                    "locale.infoErrors.textures.maxWiwidth",
                    MAX_TEXTURE_SIZE_PX,
                    width,
                ]);

            if (width % 2 !== 0)
                component.infoErrors.push(["locale.infoErrors.textures.oddWidth", width]);

            if (height % 2 !== 0)
                component.infoErrors.push(["locale.infoErrors.textures.oddHeight", height]);

            component.infoErrors = component.infoErrors; // to trigger rerender
            return { needUpdate: false }; // without this will infinte loop
        },
    },
];

const AssetTypes = {
    texture: {
        defValue: null, //"Textures/Spot.png",
        extensions: ["png", "jpg"],
        directory: ["Textures"],
        typeName: "texture",
        label: "locale.assetTypes.texture.label",
        dependencies: textureAssetErrorDeps,
        info: {
            clickLink:
                "https://dev.vk.com/ru/masks/publication/resources#%D0%A2%D0%B5%D0%BA%D1%81%D1%82%D1%83%D1%80%D1%8B",

            infoList: "locale.parameters.texture.infoList",
            infoHeader: "locale.parameters.texture.infoHeader",
        },
    },
    material: {
        defValue: "Materials/DefaultGrey.xml",
        extensions: ["xml", "json"],
        types: ["xml_material", "json_material"],
        directory: ["Materials"],
        typeName: "material",
        label: "locale.assetTypes.material.label",
        info: {
            clickLink: "",
            infoList: "locale.parameters.material.infoList",
            infoHeader: "locale.parameters.material.infoHeader",
            infoBody: "locale.parameters.material.infoBody",
        },
    },
    technique: {
        defValue: null, //"Techniques/DiffUnlit.xml",
        extensions: ["xml"],
        types: ["xml_technique"],
        directory: ["Techniques"],
        typeName: "technique",
        label: "locale.assetTypes.technique.label",
        info: {
            clickLink:
                "https://dev.vk.com/ru/masks/effects/model3d#%D0%9F%D0%B0%D1%80%D0%B0%D0%BC%D0%B5%D1%82%D1%80%D1%8B%20%D0%BC%D0%B0%D1%82%D0%B5%D1%80%D0%B8%D0%B0%D0%BB%D0%BE%D0%B2",
            infoBody: "locale.parameters.material.technique.infoBody",
            infoList: "locale.parameters.material.technique.infoList",
            infoHeader: "locale.parameters.material.technique.infoHeader",
        },
    },
    renderPath: {
        defValue: null, //"",
        extensions: ["xml"],
        types: ["xml_renderpath"],
        directory: ["RenderPaths"],
        typeName: "renderPath",
        label: "locale.assetTypes.renderPath.label",
    },
    animationClip: {
        defValue: null, // "",
        extensions: ["ani"],
        directory: ["Animations"],
        typeName: "animationClip",
        label: "locale.assetTypes.animationClip.label",
    },
    model3d: {
        defValue: null, //"Models/DefaultPlane.mdl",
        extensions: ["mdl"],
        directory: ["Models"],
        typeName: "model3d",
        label: "locale.assetTypes.model3d.label",
    },
    script: {
        defValue: null, //"",
        extensions: ["as"],
        directory: ["Scripts"],
        typeName: "script",
        label: "locale.assetTypes.script.label",
    },
};

const ZText = z.string().describe(uiDescriptions.text);
const ZTags = z.string().describe({
    ...uiDescriptions.tags,
    label: "locale.parameters.tags.label",
    info: {
        infoBody: "locale.parameters.tags.infoBody",
        infoHeader: "locale.parameters.tags.infoHeader",
    },
});

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
    z.string().describe(mergician(uiDescriptions.filepath, AssetTypes.technique, desc));

const ZModel3dAsset = (desc) =>
    z.string().describe(mergician(uiDescriptions.filepath, AssetTypes.model3d, desc));

const ZTextureAsset = (desc) =>
    z.string().describe(mergician(uiDescriptions.filepath, AssetTypes.texture, desc));

const ZMaterialAsset = (desc) =>
    z.string().describe(mergician(uiDescriptions.filepath, AssetTypes.material, desc));

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
            info: {
                clickLink: "https://dev.vk.com/ru/masks/animation/textures",
                infoBody: "locale.parameters.textureAnimation.type.infoBody",
                infoHeader: "locale.parameters.textureAnimation.type.infoHeader",
            },
            options: Object.keys(ZAnimationType.Values),
            optionLabels: ZAnimationTypeLabels,
            defValue: ZAnimationType.Values.mouth_open,
        }),
        trigget_start: ZEventTrigger.describe({
            ...uiDescriptions.enum,
            label: "locale.parameters.textureAnimation.triggerStart.label",
            info: {
                clickLink: "https://dev.vk.com/ru/masks/animation/textures",
                infoBody: "locale.parameters.textureAnimation.triggerStart.infoBody",
                infoHeader: "locale.parameters.textureAnimation.triggerStart.infoHeader",
                infoList: "locale.parameters.textureAnimation.triggerStart.infoList",
            },
            options: Object.keys(ZEventTrigger.Values),
            optionLabels: ZEventTriggerLabels,
            defValue: ZEventTrigger.Values.mouth_open,
        }),
        trigget_stop: ZEventTrigger.describe({
            ...uiDescriptions.enum,
            label: "locale.parameters.textureAnimation.triggerStop.label",
            info: {
                clickLink: "https://dev.vk.com/ru/masks/animation/textures",
                infoBody: "locale.parameters.textureAnimation.triggerStop.infoBody",
                infoHeader: "locale.parameters.textureAnimation.triggerStop.infoHeader",
                infoList: "locale.parameters.textureAnimation.triggerStop.infoList",
            },
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
            info: {
                clickLink: "https://dev.vk.com/ru/masks/animation/textures",
                infoBody: "locale.parameters.textureAnimation.fps.infoBody",
                infoHeader: "locale.parameters.textureAnimation.fps.infoHeader",
            },
        }),
    })
    .describe({
        ...uiDescriptions.object,
        label: "locale.parameters.textureAnimation.label",

        group: "animation",
    });

export const ZTextureObject =
    // z.preprocess(
    //     (val) => {
    //         if (isObject(val)) {
    //             // !!! already done on preporocess
    //             // todo : get rid of this
    //             // keep only diffuse not texture in object
    //             if (val.hasOwnProperty("texture")) {
    //                 val["diffuse"] = val["texture"];
    //                 delete val["texture"];
    //                 return val;
    //             } else {
    //                 return val;
    //             }
    //         }
    //         return {
    //             diffuse: val,
    //         };
    //     },
    z
        .object({
            diffuse: ZTextureAsset({
                info: { infoHeader: "locale.parameters.texture.diffuse.infoHeader" },
                label: "locale.parameters.texture.diffuse.label",
            }),
            blend_mode: ZBlendModes.describe({
                ...uiDescriptions.enum,
                label: "locale.parameters.texture.blendMode.label",
                info: {
                    clickLink:
                        "https://dev.vk.com/ru/masks/effects/facemodel#%D0%9F%D0%B0%D1%80%D0%B0%D0%BC%D0%B5%D1%82%D1%80%D1%8B%20texture",
                    infoHeader: "locale.parameters.texture.blendMode.infoHeader",
                    infoBody: "locale.parameters.texture.blendMode.infoBody",
                },
                options: Object.keys(ZBlendModes.Values),
                optionLabels: ZBlendModesLabels,
                defValue: ZBlendModes.Values.replace,
            }),
            color: ZColorAlpha.describe({
                ...uiDescriptions.colorAlpha,
                label: "locale.parameters.texture.color.label",
                info: {
                    clickLink:
                        "https://dev.vk.com/ru/masks/effects/facemodel#%D0%9F%D0%B0%D1%80%D0%B0%D0%BC%D0%B5%D1%82%D1%80%D1%8B%20texture",
                    infoHeader: "locale.parameters.texture.color.infoHeader",
                    infoBody: "locale.parameters.texture.color.infoBody",
                },
            }),
            // lit: ZBool.describe(uiDesc riptions.bool({ label: "Lit" })),
            // !!! probably will miss texture property
            // u_transform: ZArray3D.describe({
            //     ...uiDescriptions.uv_transform,
            //     label: "locale.parameters.texture.uvTransform.label",
            //     info: { infoList: "locale.parameters.texture.uvTransform.infoList" },
            //     defValue: [1, 0, 0],
            // }),
            // v_transform: ZArray3D.describe({
            //     ...uiDescriptions.uv_transform,
            //     label: "locale.parameters.texture.uvTransform.label",
            //     info: { infoList: "locale.parameters.texture.uvTransform.infoList" },
            //     defValue: [0, 1, 0],
            // }),
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
            info: { infoList: "locale.parameters.texture.infoList" },
            group: "texture",
            groups: {
                main: {
                    label: null,
                    defExpanded: true,
                },
                animation: {
                    label: "locale.parameters.texture.group.animation.label",
                    defExpanded: false,
                    indentLevel: 1,
                },
                uv_transform: {
                    label: "locale.parameters.texture.group.uvTransform.label",
                    defExpanded: true,
                    indentLevel: 1,
                },
            },
        });
// );

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
            diffuse: ZTextureAsset({
                info: {
                    infoHeader: "locale.material.diffuse.infoHeader",
                    infoBody: "locale.material.diffuse.infoBody",
                    infoList: "locale.parameters.texture.infoList",
                    clickLink:
                        "https://dev.vk.com/ru/masks/effects/model3d#%D0%9F%D0%B0%D1%80%D0%B0%D0%BC%D0%B5%D1%82%D1%80%D1%8B%20%D0%BC%D0%B0%D1%82%D0%B5%D1%80%D0%B8%D0%B0%D0%BB%D0%BE%D0%B2",
                },
                label: "locale.material.diffuse.label",
                group: "diffuse",
            }),
            normal: ZTextureAsset({
                info: {
                    infoHeader: "locale.material.normal.infoHeader",
                    infoBody: "locale.material.normal.infoBody",
                    infoList: "locale.parameters.texture.infoList",
                    clickLink:
                        "https://dev.vk.com/ru/masks/effects/model3d#%D0%9F%D0%B0%D1%80%D0%B0%D0%BC%D0%B5%D1%82%D1%80%D1%8B%20%D0%BC%D0%B0%D1%82%D0%B5%D1%80%D0%B8%D0%B0%D0%BB%D0%BE%D0%B2",
                },
                label: "locale.material.normal.label",
                group: "normal",
            }),
            specular: ZTextureAsset({
                info: {
                    infoHeader: "locale.material.specular.infoHeader",
                    infoBody: "locale.material.specular.infoBody",
                    infoList: "locale.parameters.texture.infoList",
                    clickLink:
                        "https://dev.vk.com/ru/masks/effects/model3d#%D0%9F%D0%B0%D1%80%D0%B0%D0%BC%D0%B5%D1%82%D1%80%D1%8B%20%D0%BC%D0%B0%D1%82%D0%B5%D1%80%D0%B8%D0%B0%D0%BB%D0%BE%D0%B2",
                },
                label: "locale.material.specular.label",
                group: "specular",
            }),
            emissive: ZTextureAsset({
                info: {
                    infoHeader: "locale.material.emissive.infoHeader",
                    infoBody: "locale.material.emissive.infoBody",
                    infoList: "locale.parameters.texture.infoList",
                    clickLink:
                        "https://dev.vk.com/ru/masks/effects/model3d#%D0%9F%D0%B0%D1%80%D0%B0%D0%BC%D0%B5%D1%82%D1%80%D1%8B%20%D0%BC%D0%B0%D1%82%D0%B5%D1%80%D0%B8%D0%B0%D0%BB%D0%BE%D0%B2",
                },
                label: "locale.material.emissive.label",
                group: "emissive",
            }),
            environment: ZTextureAsset({
                info: {
                    infoHeader: "locale.material.environment.infoHeader",
                    infoBody: "locale.material.environment.infoBody",
                    infoList: "locale.parameters.texture.infoList",
                    clickLink:
                        "https://dev.vk.com/ru/masks/effects/model3d#%D0%9F%D0%B0%D1%80%D0%B0%D0%BC%D0%B5%D1%82%D1%80%D1%8B%20%D0%BC%D0%B0%D1%82%D0%B5%D1%80%D0%B8%D0%B0%D0%BB%D0%BE%D0%B2",
                },
                label: "locale.material.environment.label",
                group: "environment",
            }),

            MatDiffColor: ZArray4D.describe({
                ...uiDescriptions.colorAlpha,
                defValue: [1.0, 1.0, 1.0, 1.0],
                group: "diffuse",
                label: "locale.material.diffuseColor.label",
                info: {
                    infoHeader: "locale.material.diffuseColor.infoHeader",
                    infoBody: "locale.material.diffuseColor.infoBody",
                    infoList: "locale.material.diffuseColor.infoList",
                    clickLink:
                        "https://dev.vk.com/ru/masks/effects/model3d#%D0%9F%D0%B0%D1%80%D0%B0%D0%BC%D0%B5%D1%82%D1%80%D1%8B%20%D0%BC%D0%B0%D1%82%D0%B5%D1%80%D0%B8%D0%B0%D0%BB%D0%BE%D0%B2",
                },
            }),
            MatSpecColor: ZArray4D.describe({
                ...uiDescriptions.colorAlpha,
                defValue: [0.0, 0.0, 0.0, 1.0],
                group: "specular",
                showAlways: false,
                label: "locale.material.specularColor.label",
                info: {
                    infoHeader: "locale.material.specularColor.infoHeader",
                    infoBody: "locale.material.specularColor.infoBody",
                    infoList: "locale.material.specularColor.infoList",
                    clickLink:
                        "https://dev.vk.com/ru/masks/effects/model3d#%D0%9F%D0%B0%D1%80%D0%B0%D0%BC%D0%B5%D1%82%D1%80%D1%8B%20%D0%BC%D0%B0%D1%82%D0%B5%D1%80%D0%B8%D0%B0%D0%BB%D0%BE%D0%B2",
                },
            }),
            MatEmissiveColor: ZArray3D.describe({
                ...uiDescriptions.color,
                showAlways: false,
                group: "emissive",
                label: "locale.material.emissiveColor.label",
                info: {
                    infoHeader: "locale.material.emissiveColor.infoHeader",
                    infoBody: "locale.material.emissiveColor.infoBody",
                    infoList: "locale.material.emissiveColor.infoList",
                    clickLink:
                        "https://dev.vk.com/ru/masks/effects/model3d#%D0%9F%D0%B0%D1%80%D0%B0%D0%BC%D0%B5%D1%82%D1%80%D1%8B%20%D0%BC%D0%B0%D1%82%D0%B5%D1%80%D0%B8%D0%B0%D0%BB%D0%BE%D0%B2",
                },
            }),
            MatEnvMapColor: ZArray3D.describe({
                ...uiDescriptions.color,
                defValue: [1.0, 1.0, 1.0],
                group: "environment",
                showAlways: false,
                label: "locale.material.environmentColor.label",
                info: {
                    infoHeader: "locale.material.environmentColor.infoHeader",
                    infoBody: "locale.material.environmentColor.infoBody",
                    infoList: "locale.material.environmentColor.infoList",
                    clickLink:
                        "https://dev.vk.com/ru/masks/effects/model3d#%D0%9F%D0%B0%D1%80%D0%B0%D0%BC%D0%B5%D1%82%D1%80%D1%8B%20%D0%BC%D0%B0%D1%82%D0%B5%D1%80%D0%B8%D0%B0%D0%BB%D0%BE%D0%B2",
                },
            }),
            Roughness: ZNumberSlider.describe({
                ...uiDescriptions.numberSlider,
                defValue: 0.5,
                showAlways: false,
                label: "locale.material.roughness.label",
                info: {
                    infoHeader: "locale.material.roughness.infoHeader",
                    infoBody: "locale.material.roughness.infoBody",
                    infoList: "locale.material.roughness.infoList",
                    clickLink:
                        "https://dev.vk.com/ru/masks/effects/model3d#%D0%9F%D0%B0%D1%80%D0%B0%D0%BC%D0%B5%D1%82%D1%80%D1%8B%20%D0%BC%D0%B0%D1%82%D0%B5%D1%80%D0%B8%D0%B0%D0%BB%D0%BE%D0%B2",
                },
            }),
            Metallic: ZNumberSlider.describe({
                ...uiDescriptions.numberSlider,
                defValue: 0.5,
                showAlways: false,
                label: "locale.material.metallness.label",
                info: {
                    infoHeader: "locale.material.metallness.infoHeader",
                    infoBody: "locale.material.metallness.infoBody",
                    infoList: "locale.material.metallness.infoList",
                    clickLink:
                        "https://dev.vk.com/ru/masks/effects/model3d#%D0%9F%D0%B0%D1%80%D0%B0%D0%BC%D0%B5%D1%82%D1%80%D1%8B%20%D0%BC%D0%B0%D1%82%D0%B5%D1%80%D0%B8%D0%B0%D0%BB%D0%BE%D0%B2",
                },
            }),

            cull: ZCullMode.describe({
                ...uiDescriptions.enum,
                label: "locale.material.culling.label",
                info: {
                    infoHeader: "locale.material.culling.infoHeader",
                    infoBody: "locale.material.culling.infoBody",
                    infoList: "locale.material.culling.infoList",
                    clickLink:
                        "https://dev.vk.com/ru/masks/effects/model3d#%D0%9F%D0%B0%D1%80%D0%B0%D0%BC%D0%B5%D1%82%D1%80%D1%8B%20%D0%BC%D0%B0%D1%82%D0%B5%D1%80%D0%B8%D0%B0%D0%BB%D0%BE%D0%B2",
                },
                options: Object.keys(ZCullMode.Values),
                optionLabels: CullModeLabels,
                defValue: ZCullMode.Values.ccw,
            }),
            fill: ZFillMode.describe({
                ...uiDescriptions.enum,
                label: "locale.material.fill.label",
                info: {
                    infoHeader: "locale.material.fill.infoHeader",
                    infoBody: "locale.material.fill.infoBody",
                    infoList: "locale.material.fill.infoList",
                    clickLink:
                        "https://dev.vk.com/ru/masks/effects/model3d#%D0%9F%D0%B0%D1%80%D0%B0%D0%BC%D0%B5%D1%82%D1%80%D1%8B%20%D0%BC%D0%B0%D1%82%D0%B5%D1%80%D0%B8%D0%B0%D0%BB%D0%BE%D0%B2",
                },
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
                    label: "locale.material.group.diffuse.label",
                    defExpanded: true,
                },

                normal: {
                    label: "locale.material.group.normal.label",
                    defExpanded: true,
                },

                specular: {
                    label: "locale.material.group.specular.label",
                    defExpanded: true,
                },

                environment: {
                    label: "locale.material.group.environment.label",
                    defExpanded: true,
                },

                emissive: {
                    label: "locale.material.group.emissive.label",
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
                        // force empty material list
                        if (value.length) {
                            component.value = [];
                            component.disabled = true;
                            return { needUpdate: true };
                        }
                        return { needUpdate: false };
                    }

                    const { numGeometries, processorError } = assets[assetIndex];

                    if (processorError) {
                        // component.value = [];
                        component.disabled = true;
                        return { needUpdate: false };
                    }

                    if (value.length === numGeometries) return { needUpdate: false }; // without this will infinte loop

                    component.value = new Array(numGeometries)
                        .fill(params.defaultElement)
                        .map((v, i) => value[i] ?? v);

                    return { needUpdate: true };
                },
            },
        ],

        elementName: "locale.parameters.materialArray.elementName",
        label: "locale.parameters.materialArray.label",
        info: { infoList: "locale.parameters.materialArray.infoList" },
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
        info: {
            clickLink:
                "https://dev.vk.com/ru/masks/effects/facemodel#%D0%9F%D0%B0%D1%80%D0%B0%D0%BC%D0%B5%D1%82%D1%80%D1%8B%20%D1%8D%D1%84%D1%84%D0%B5%D0%BA%D1%82%D0%B0",
            infoBody: "locale.parameters.facemodel.mouth.infoBody",
            infoHeader: "locale.parameters.facemodel.mouth.infoHeader",
        },
        group: "visible",
    }),
    eyes: ZBool.describe({
        ...uiDescriptions.bool,
        defValue: true,
        label: "locale.parameters.facemodel.eyes.label",
        info: {
            clickLink:
                "https://dev.vk.com/ru/masks/effects/facemodel#%D0%9F%D0%B0%D1%80%D0%B0%D0%BC%D0%B5%D1%82%D1%80%D1%8B%20%D1%8D%D1%84%D1%84%D0%B5%D0%BA%D1%82%D0%B0",
            infoBody: "locale.parameters.facemodel.eyes.infoBody",
            infoHeader: "locale.parameters.facemodel.eyes.infoHeader",
        },
        group: "visible",
    }),
    // position: ZArray3D.describe({
    //     ...uiDescriptions.array3d,
    //     label: "locale.parameters.facemodel.position.label",
    //     info: { infoList: "locale.parameters.facemodel.position.infoList" },
    //     group: "transform",
    // }),
    // scale: ZArray3D.describe({
    //     ...uiDescriptions.array3d,
    //     defValue: [1, 1, 1],
    //     label: "locale.parameters.facemodel.scale.label",
    //     info: { infoList: "locale.parameters.facemodel.scale.infoList" },
    //     group: "transform",
    // }),
    // rotation: ZArray3D.describe({
    //     ...uiDescriptions.array3d,
    //     label: "locale.parameters.facemodel.rotation.label",
    //     info: { infoList: "locale.parameters.facemodel.rotation.infoList" },
    //     group: "transform",
    // }),
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
            label: "locale.parameters.facemodel.group.visible.label",
            defExpanded: true,
        },

        transform: {
            label: "locale.parameters.facemodel.group.transform.label",
            defExpanded: true,
        },

        texture: {
            label: "locale.parameters.facemodel.group.texture.label",
            defExpanded: true,
            disableMargin: true,
        },

        tags: {
            label: "locale.parameters.tags.label",
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
        info: {
            clickLink: "https://dev.vk.com/ru/masks/effects/patch",
            infoList: "locale.parameters.patch.anchor.infoList",
            infoHeader: "locale.parameters.patch.anchor.infoHeader",
            infoBody: "locale.parameters.patch.anchor.infoBody",
        },
        group: "anchor",
        options: Object.keys(ZPatchAnchor.Values),
        optionLabels: ZPatchAnchorLabels,
        defValue: ZFaceAnchor.Values.forehead,
    }),
    visible: ZVisibleType.describe({
        ...uiDescriptions.enum,
        label: "locale.parameters.patch.visible.label",
        info: {
            clickLink: "https://dev.vk.com/ru/masks/effects/patch",
            infoList: "locale.parameters.patch.visible.infoList",
            infoHeader: "locale.parameters.patch.visible.infoHeader",
            infoBody: "locale.parameters.patch.visible.infoBody",
        },
        group: "advanced",
        options: Object.keys(ZVisibleType.Values),
        optionLabels: ZVisibleTypeLabels,
        defValue: ZVisibleType.Values.face,
    }),
    fit: ZPatchFitMode.describe({
        ...uiDescriptions.enum,
        label: "locale.parameters.patch.fit.label",
        info: {
            clickLink: "https://dev.vk.com/ru/masks/effects/patch",
            infoList: "locale.parameters.patch.fit.infoList",
            infoHeader: "locale.parameters.patch.fit.infoHeader",
            infoBody: "locale.parameters.patch.fit.infoBody",
        },
        group: "advanced",
        options: Object.keys(ZPatchFitMode.Values),
        optionLabels: ZPatchFitModeLabels,
        defValue: ZPatchFitMode.Values.none,
    }),
    size: ZArray2D.describe({
        ...uiDescriptions.array2d,
        defValue: [1, 1],
        label: "locale.parameters.patch.size.label",
        info: {
            clickLink: "https://dev.vk.com/ru/masks/effects/patch",
            infoList: "locale.parameters.patch.size.infoList",
            infoHeader: "locale.parameters.patch.size.infoHeader",
            infoBody: "locale.parameters.patch.size.infoBody",
        },
        group: "transform",
        dependencies: patchAnchorDeps,
    }),
    offset: ZArray3D.describe({
        ...uiDescriptions.array3d,
        label: "locale.parameters.patch.offset.label",
        info: {
            clickLink: "https://dev.vk.com/ru/masks/effects/patch",
            infoList: "locale.parameters.patch.offset.infoList",
            infoHeader: "locale.parameters.patch.offset.infoHeader",
            infoBody: "locale.parameters.patch.offset.infoBody",
        },
        group: "transform",
        dependencies: patchAnchorDeps,
    }),
    allow_rotation: ZBool.describe({
        ...uiDescriptions.bool,
        label: "locale.parameters.patch.allowRotation.label",
        info: {
            clickLink: "https://dev.vk.com/ru/masks/effects/patch",
            infoList: "locale.parameters.patch.allowRotation.infoList",
            infoHeader: "locale.parameters.patch.allowRotation.infoHeader",
            infoBody: "locale.parameters.patch.allowRotation.infoBody",
        },
        group: "anchor",
    }),
    rotation: ZArray3D.describe({
        ...uiDescriptions.array3d,
        label: "locale.parameters.patch.rotation.label",
        info: {
            clickLink: "https://dev.vk.com/ru/masks/effects/patch",
            infoList: "locale.parameters.patch.rotation.infoList",
            infoHeader: "locale.parameters.patch.rotation.infoHeader",
            infoBody: "locale.parameters.patch.rotation.infoBody",
        },
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
            label: "locale.parameters.patch.group.anchor.label",
            defExpanded: true,
        },

        transform: {
            label: "locale.parameters.patch.group.transform.label",
            defExpanded: true,
        },

        texture: {
            label: "locale.parameters.patch.group.texture.label",
            defExpanded: true,
            disableMargin: true,
        },

        tags: {
            label: "locale.parameters.tags.label",
            defExpanded: false,
        },

        advanced: {
            label: "locale.parameters.patch.group.advanced.label",
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
        info: {
            clickLink: "https://dev.vk.com/ru/masks/effects/beautify",
            infoHeader: "locale.parameters.beautify.mix.infoHeader",
            infoBody: "locale.parameters.beautify.mix.infoBody",
        },
    }),
}).describe({
    ...uiDescriptions.object,
    label: "locale.parameters.beautify.label",

    groups: {
        main: {
            label: "locale.parameters.group.main",
            defExpanded: true,
        },
        tags: {
            label: "locale.parameters.tags.label",
            defExpanded: false,
        },
    },
});

const lookupInfo = {
    clickLink:
        "https://dev.vk.com/ru/masks/publication/resources#%D0%A6%D0%B2%D0%B5%D1%82%D0%BE%D0%B2%D0%B0%D1%8F%20%D1%82%D0%B0%D0%B1%D0%BB%D0%B8%D1%86%D0%B0",

    infoList: "locale.parameters.colorfilter.lookup.infoList",
    infoHeader: "locale.parameters.colorfilter.lookup.infoHeader",
};

const LOOKUP_MAX_SIZE_PX = 512;
const LOOKUP_MAX_SIZE_BYTES = 600 * 1000;
const lookupErrorDeps = [
    {
        source: ["stores", "assets"],
        postprocess: (_, assets, component) => {
            const { value, params } = component;
            const assetIndex = assets.findIndex((v) => v.path === value);
            if (assetIndex < 0) {
                return { needUpdate: false };
            }
            const { width, height, size, isOpaque } = assets[assetIndex];

            component.infoErrors = [];

            if (height > LOOKUP_MAX_SIZE_PX)
                component.infoErrors.push([
                    "locale.infoErrors.textures.maxHeight",
                    LOOKUP_MAX_SIZE_PX,
                    height,
                ]);

            if (width > LOOKUP_MAX_SIZE_PX)
                component.infoErrors.push([
                    "locale.infoErrors.textures.maxWiwidth",
                    LOOKUP_MAX_SIZE_PX,
                    width,
                ]);

            if (width % 2 !== 0)
                component.infoErrors.push(["locale.infoErrors.textures.oddWidth", width]);

            if (height % 2 !== 0)
                component.infoErrors.push(["locale.infoErrors.textures.oddHeight", height]);

            if (size > LOOKUP_MAX_SIZE_BYTES)
                component.infoErrors.push([
                    "locale.infoErrors.colorfilter.lookup.maxSize",
                    Math.floor(LOOKUP_MAX_SIZE_BYTES / 1000),
                    Math.floor(size / 1000),
                ]);

            component.infoErrors = component.infoErrors; // trigger reactivity
            return { needUpdate: false }; // without this will infinte loop
        },
    },
];

const ZColorfilterEffect = ZBaseEffect.extend({
    name: z.literal("colorfilter").describe(uiDescriptions.none),
    anchor: ZPatchAnchor.describe({
        ...uiDescriptions.enum,
        label: "locale.parameters.colorfilter.anchor.label",
        info: {
            clickLink: "https://dev.vk.com/ru/masks/effects/colorfilter",
            infoHeader: "locale.parameters.patch.anchor.infoHeader",
            infoBody: "locale.parameters.patch.anchor.infoBody",
            infoList: "locale.parameters.patch.anchor.infoList",
        },
        group: "anchor",
        options: Object.keys(ZPatchAnchor.Values),
        optionLabels: ZPatchAnchorLabels,
        defValue: ZFaceAnchor.Values.forehead,
    }),
    visible: ZVisibleType.describe({
        ...uiDescriptions.enum,
        label: "locale.parameters.colorfilter.visible.label",
        info: {
            clickLink: "https://dev.vk.com/ru/masks/effects/colorfilter",
            infoHeader: "locale.parameters.patch.visible.infoHeader",
            infoBody: "locale.parameters.patch.visible.infoBody",
            infoList: "locale.parameters.patch.visible.infoList",
        },
        group: "advanced",
        options: Object.keys(ZVisibleType.Values),
        optionLabels: ZVisibleTypeLabels,
        defValue: ZVisibleType.Values.face,
    }),
    fit: ZPatchFitMode.describe({
        ...uiDescriptions.enum,
        label: "locale.parameters.colorfilter.fit.label",
        info: {
            clickLink: "https://dev.vk.com/ru/masks/effects/colorfilter",
            infoHeader: "locale.parameters.patch.fit.infoHeader",
            infoBody: "locale.parameters.patch.fit.infoBody",
            infoList: "locale.parameters.patch.fit.infoList",
        },
        group: "advanced",
        options: Object.keys(ZPatchFitMode.Values),
        optionLabels: ZPatchFitModeLabels,
        defValue: ZPatchFitMode.Values.none,
    }),
    size: ZArray2D.describe({
        ...uiDescriptions.array2d,
        defValue: [1, 1],
        label: "locale.parameters.colorfilter.size.label",
        info: {
            clickLink: "https://dev.vk.com/ru/masks/effects/colorfilter",
            infoHeader: "locale.parameters.patch.size.infoHeader",
            infoBody: "locale.parameters.patch.size.infoBody",
            infoList: "locale.parameters.patch.size.infoList",
        },
        group: "transform",
        dependencies: patchAnchorDeps,
    }),
    offset: ZArray3D.describe({
        ...uiDescriptions.array3d,
        label: "locale.parameters.colorfilter.offset.label",
        info: {
            clickLink: "https://dev.vk.com/ru/masks/effects/colorfilter",
            infoHeader: "locale.parameters.patch.offset.infoHeader",
            infoBody: "locale.parameters.patch.offset.infoBody",
            infoList: "locale.parameters.patch.offset.infoList",
        },
        group: "transform",
        dependencies: patchAnchorDeps,
    }),
    allow_rotation: ZBool.describe({
        ...uiDescriptions.bool,
        label: "locale.parameters.colorfilter.allowRotation.label",
        info: {
            clickLink: "https://dev.vk.com/ru/masks/effects/colorfilter",
            infoHeader: "locale.parameters.patch.allowRotation.infoHeader",
            infoBody: "locale.parameters.patch.allowRotation.infoBody",
            infoList: "locale.parameters.patch.allowRotation.infoList",
        },
        group: "anchor",
    }),
    rotation: ZArray3D.describe({
        ...uiDescriptions.array3d,
        label: "locale.parameters.colorfilter.rotation.label",
        info: {
            clickLink: "https://dev.vk.com/ru/masks/effects/colorfilter",
            infoHeader: "locale.parameters.patch.rotation.infoHeader",
            infoBody: "locale.parameters.patch.rotation.infoBody",
            infoList: "locale.parameters.patch.rotation.infoList",
        },
        group: "transform",
        dependencies: patchAnchorDeps,
    }),

    lookup: ZTextureAsset({
        label: "locale.parameters.colorfilter.lookup.label",
        info: lookupInfo,
        group: "colorfilter",
        dependencies: lookupErrorDeps,
    }),
    intensity: ZNumberSlider.describe({
        ...uiDescriptions.numberSlider,
        defValue: 0.75,
        valueLabel: "locale.parameters.colorfilter.intensity.valueLabel",
        valueTemplate: (val) => Math.floor(val * 100),
        label: "locale.parameters.colorfilter.intensity.label",
        info: {
            clickLink: "https://dev.vk.com/ru/masks/effects/colorfilter",
            infoHeader: "locale.parameters.colorfilter.intensity.infoHeader",
            infoBody: "locale.parameters.colorfilter.intensity.infoBody",
            infoList: "locale.parameters.colorfilter.intensity.infoList",
        },
        group: "colorfilter",
    }),
}).describe({
    ...uiDescriptions.object,
    label: "locale.parameters.colorfilter.label",

    groups: {
        main: {
            label: null,
            defExpanded: true,
        },

        anchor: {
            label: "locale.parameters.colorfilter.group.anchor.label",
            defExpanded: true,
        },

        transform: {
            label: "locale.parameters.colorfilter.group.transform.label",
            defExpanded: true,
        },

        colorfilter: {
            label: "locale.parameters.colorfilter.group.colorfilter.label",
            defExpanded: true,
        },

        tags: {
            label: "locale.parameters.tags.label",
            defExpanded: false,
        },

        advanced: {
            label: "locale.parameters.colorfilter.group.advanced.label",
            defExpanded: false,
        },
    },
});

const modelDeps = [
    {
        source: ["stores", "assets"],
        postprocess: (_, assets, component) => {
            const { value, params } = component;
            const assetIndex = assets.findIndex((v) => v.path === value);
            if (assetIndex < 0) {
                return { needUpdate: false };
            }
            const { processorError } = assets[assetIndex];

            component.infoErrors = [];

            if (processorError) {
                component.infoErrors.push(["locale.infoErrors.model3d.processorError"]);
            }

            component.infoErrors = component.infoErrors; // to trigger rerender
            return { needUpdate: false }; // without this will infinte loop
        },
    },
];

const ZModel3dEffect = ZBaseEffect.extend({
    name: z.literal("model3d").describe(uiDescriptions.none),
    anchor: ZFaceAnchor.describe({
        ...uiDescriptions.enum,
        label: "locale.parameters.model3d.anchor.label",
        info: {
            clickLink: "https://dev.vk.com/ru/masks/effects/model3d",
            infoList: "locale.parameters.model3d.anchor.infoList",
            infoBody: "locale.parameters.model3d.anchor.infoBody",
            infoHeader: "locale.parameters.model3d.anchor.infoHeader",
        },
        group: "anchor",

        options: Object.keys(ZFaceAnchor.Values),
        optionLabels: ZFaceAnchorLabels,
        defValue: ZFaceAnchor.Values.forehead,
    }),
    model: ZModel3dAsset({
        label: "locale.parameters.model3d.model.label",
        group: "model",
        info: {
            clickLink: "https://dev.vk.com/ru/masks/effects/model3d",
            infoList: "locale.parameters.model3d.model.infoList",
            infoBody: "locale.parameters.model3d.model.infoBody",
            infoHeader: "locale.parameters.model3d.model.infoHeader",
        },
        dependencies: modelDeps,
        structural: true,
    }),
    position: ZArray3D.describe({
        ...uiDescriptions.array3d,
        label: "locale.parameters.model3d.position.label",
        info: {
            clickLink: "https://dev.vk.com/ru/masks/effects/model3d",
            infoList: "locale.parameters.model3d.position.infoList",
            infoBody: "locale.parameters.model3d.position.infoBody",
            infoHeader: "locale.parameters.model3d.position.infoHeader",
        },
        group: "transform",
    }),
    scale: ZArray3D.describe({
        ...uiDescriptions.array3d,
        defValue: [1, 1, 1],
        label: "locale.parameters.model3d.scale.label",
        info: {
            clickLink: "https://dev.vk.com/ru/masks/effects/model3d",
            infoList: "locale.parameters.model3d.scale.infoList",
            infoBody: "locale.parameters.model3d.scale.infoBody",
            infoHeader: "locale.parameters.model3d.scale.infoHeader",
        },
        group: "transform",
    }),
    rotation: ZArray3D.describe({
        ...uiDescriptions.array3d,
        label: "locale.parameters.model3d.rotation.label",
        info: {
            clickLink: "https://dev.vk.com/ru/masks/effects/model3d",
            infoList: "locale.parameters.model3d.rotation.infoList",
            infoBody: "locale.parameters.model3d.rotation.infoBody",
            infoHeader: "locale.parameters.model3d.rotation.infoHeader",
        },
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
            label: "locale.parameters.model3d.group.anchor.label",
            defExpanded: true,
        },

        transform: {
            label: "locale.parameters.model3d.group.transform.label",
            defExpanded: true,
        },
        model: {
            label: "locale.parameters.model3d.group.model.label",
            defExpanded: true,
        },
        materials: {
            label: "locale.parameters.model3d.group.materials.label",
            defExpanded: true,
        },
        tags: {
            label: "locale.parameters.tags.label",
            defExpanded: false,
        },
    },
});

const ZPlaneEffect = ZBaseEffect.extend({
    name: z.literal("plane").describe(uiDescriptions.none),
    anchor: ZFaceAnchor.describe({
        ...uiDescriptions.enum,
        label: "locale.parameters.plane.anchor.label",
        info: {
            infoBody: "locale.parameters.plane.anchor.infoBody",
            infoHeader: "locale.parameters.plane.anchor.infoHeader",
            infoList: "locale.parameters.plane.anchor.infoList",
        },
        group: "anchor",

        options: Object.keys(ZFaceAnchor.Values),
        optionLabels: ZFaceAnchorLabels,
        defValue: ZFaceAnchor.Values.forehead,
    }),
    position: ZArray3D.describe({
        ...uiDescriptions.array3d,
        label: "locale.parameters.plane.position.label",
        info: {
            infoBody: "locale.parameters.plane.position.infoBody",
            infoHeader: "locale.parameters.plane.position.infoHeader",
            infoList: "locale.parameters.plane.position.infoList",
        },
        group: "transform",
    }),
    scale: ZArray3D.describe({
        ...uiDescriptions.array3d,
        defValue: [1, 1, 1],
        label: "locale.parameters.plane.scale.label",
        info: {
            infoBody: "locale.parameters.plane.scale.infoBody",
            infoHeader: "locale.parameters.plane.scale.infoHeader",
            infoList: "locale.parameters.plane.scale.infoList",
        },
        group: "transform",
    }),
    rotation: ZArray3D.describe({
        ...uiDescriptions.array3d,
        label: "locale.parameters.plane.rotation.label",
        info: {
            infoBody: "locale.parameters.plane.rotation.infoBody",
            infoHeader: "locale.parameters.plane.rotation.infoHeader",
            infoList: "locale.parameters.plane.rotation.infoList",
        },
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
            label: "locale.parameters.plane.group.anchor.label",
            defExpanded: true,
        },

        transform: {
            label: "locale.parameters.plane.group.transform.label",
            defExpanded: true,
        },
        materials: {
            label: "locale.parameters.plane.group.material.label",
            defExpanded: true,
        },
        tags: {
            label: "locale.parameters.tags.label",
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
        info: {
            infoList: "locale.parameters.light.color.infoList",
            infoHeader: "locale.parameters.light.color.infoHeader",
            infoBody: "locale.parameters.light.color.infoBody",
            clickLink: "https://dev.vk.com/ru/masks/effects/light",
        },
    }),
    brightness: ZNumberSlider.describe({
        ...uiDescriptions.numberSlider,
        defValue: 1,
        showAlways: true,
        label: "locale.parameters.light.brightness.label",
        info: {
            infoList: "locale.parameters.light.brightness.infoList",
            infoHeader: "locale.parameters.light.brightness.infoHeader",
            infoBody: "locale.parameters.light.brightness.infoBody",
            clickLink: "https://dev.vk.com/ru/masks/effects/light",
        },
    }),
    specular_intensity: ZNumberSlider.describe({
        ...uiDescriptions.numberSlider,
        defValue: 1,
        showAlways: true,
        label: "locale.parameters.light.specularFactor.label",
        info: {
            infoList: "locale.parameters.light.specularFactor.infoList",
            infoHeader: "locale.parameters.light.specularFactor.infoHeader",
            infoBody: "locale.parameters.light.specularFactor.infoBody",
            clickLink: "https://dev.vk.com/ru/masks/effects/light",
        },
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
                label: "locale.parameters.group.main",
                defExpanded: true,
            },

            tags: {
                label: "locale.parameters.tags.label",
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
            info: {
                infoList: "locale.parameters.light.direction.infoList",
                infoHeader: "locale.parameters.light.direction.infoHeader",
                infoBody: "locale.parameters.light.direction.infoBody",
                clickLink: "https://dev.vk.com/ru/masks/effects/light",
            },
            group: "transform",
        }),
        rotation: ZArray3D.describe({
            ...uiDescriptions.array3d,
            label: "locale.parameters.light.rotation.label",
            info: {
                infoList: "locale.parameters.light.rotation.infoList",
                infoHeader: "locale.parameters.light.rotation.infoHeader",
                infoBody: "locale.parameters.light.rotation.infoBody",
                clickLink: "https://dev.vk.com/ru/masks/effects/light",
            },
            group: "transform",
        }),
        ...ZLightBase,
    })
    .describe({
        ...uiDescriptions.object,
        label: "locale.parameters.light.label",

        groups: {
            main: {
                label: "locale.parameters.group.main",
                defExpanded: true,
            },

            anchor: {
                label: "locale.parameters.light.group.anchor.label",
                defExpanded: true,
            },

            transform: {
                label: "locale.parameters.light.group.transform.label",
                defExpanded: true,
            },

            tags: {
                label: "locale.parameters.tags.label",
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
            info: {
                infoList: "locale.parameters.light.anchor.infoList",
                infoHeader: "locale.parameters.light.anchor.infoHeader",
                infoBody: "locale.parameters.light.anchor.infoBody",
                clickLink: "https://dev.vk.com/ru/masks/effects/light",
            },
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
            info: {
                infoList: "locale.parameters.light.range.infoList",
                infoHeader: "locale.parameters.light.range.infoHeader",
                infoBody: "locale.parameters.light.range.infoBody",
                clickLink: "https://dev.vk.com/ru/masks/effects/light",
            },
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
            info: {
                infoList: "locale.parameters.light.position.infoList",
                infoHeader: "locale.parameters.light.position.infoHeader",
                infoBody: "locale.parameters.light.position.infoBody",
                clickLink: "https://dev.vk.com/ru/masks/effects/light",
            },
            group: "transform",
        }),
        ...ZLightBase,
    })
    .describe({
        ...uiDescriptions.object,
        label: "locale.parameters.light.label",

        groups: {
            main: {
                label: "locale.parameters.group.main",
                defExpanded: true,
            },

            anchor: {
                label: "locale.parameters.light.group.anchor.label",
                defExpanded: true,
            },

            transform: {
                label: "locale.parameters.light.group.transform.label",
                defExpanded: true,
            },

            tags: {
                label: "locale.parameters.tags.label",
                defExpanded: false,
            },
        },
    });

const ZLights = [ZLightAmbientEffect, ZLightDirectEffect, ZLightPointEffect];

const ZLiquifiedTypes = z.enum(["zoom", "shift"]);

const ZLiquifiedTypeLabels = [
    "locale.parameters.liquifiedwarp.point.type.zoom.label",
    "locale.parameters.liquifiedwarp.point.type.shift.label",
];

const ZLiquifiedPoint = z
    .object({
        type: ZLiquifiedTypes.describe({
            ...uiDescriptions.enum,
            label: "locale.parameters.liquifiedwarp.point.type.label",
            info: { infoList: "locale.parameters.liquifiedwarp.point.type.infoList" },

            options: Object.keys(ZLiquifiedTypes.Values),
            optionLabels: ZLiquifiedTypeLabels,
            defValue: ZLiquifiedTypes.Values.zoom,
        }),
        anchor: ZFaceAnchor.describe({
            ...uiDescriptions.enum,
            label: "locale.parameters.liquifiedwarp.point.anchor.label",
            info: { infoList: "locale.parameters.liquifiedwarp.point.anchor.infoList" },

            options: Object.keys(ZFaceAnchor.Values),
            optionLabels: ZFaceAnchorLabels,
            defValue: ZFaceAnchor.Values.forehead,
        }),
        // "offset": [-4.5, 0.0],
        // "radius": [50.0, 50.0],
        // "angle": 0.0,
        scale: ZNumberSlider.describe({
            ...uiDescriptions.numberSlider,
            defValue: 1.0,
            min: -100,
            max: 100,
            label: "locale.parameters.liquifiedwarp.point.scale.label",
            info: { infoList: "locale.parameters.liquifiedwarp.point.scale.infoList" },
        }),
    })
    .describe({
        ...uiDescriptions.object,
        label: "locale.parameters.liquifiedwarp.label",
        group: "points",
    });

const liquifiedDefaultPoint = {
    type: ZLiquifiedTypes.Values.zoom,
    anchor: ZFaceAnchor.Values.nose,
    offset: [0.0, 0.0],
    radius: [10.0, 10.0],
    scale: 2.0,
};

const ZLiquifiedWarpEffect = ZBaseEffect.extend({
    name: z.literal("liquifiedwarp").describe(uiDescriptions.none),
    progress: ZNumberSlider.describe({
        ...uiDescriptions.numberSlider,
        defValue: 1,
        label: "locale.parameters.liquifiedwarp.progress.label",
        info: { infoList: "locale.parameters.liquifiedwarp.progress.infoList" },
    }),
    points: z.array(ZLiquifiedPoint).describe({
        ...uiDescriptions.array,
        elementName: "locale.parameters.liquifiedwarp.points.elementName",
        // label: "locale.parameters.liquifiedwarp.points.label",
        info: { infoList: "locale.parameters.liquifiedwarp.points.infoList" },
        group: "points",
        defaultElement: liquifiedDefaultPoint,
        defValue: [liquifiedDefaultPoint],
        userResizable: true,
    }),
}).describe({
    ...uiDescriptions.object,
    label: "locale.parameters.liquifiedwarp.label",
    groups: {
        main: {
            label: "locale.parameters.group.main",
            defExpanded: true,
        },
        points: {
            label: "locale.parameters.liquifiedwarp.group.points.label",
            defExpanded: true,
        },
        tags: {
            label: "locale.parameters.tags.label",
            defExpanded: false,
        },
    },
});

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
        label: "locale.parameters.posteffect.type.label",
        info: {
            infoList: "locale.parameters.posteffect.type.infoList",
            infoBody: "locale.parameters.posteffect.type.infoBody",
            infoHeader: "locale.parameters.posteffect.type.infoHeader",
            clickLink: "https://dev.vk.com/ru/masks/effects/posteffect",
        },
        options: Object.keys(ZPostEffectType.Values),
        defValue: ZPostEffectType.Values.sharpen,
        optionLabels: ZPostEffectTypeLabels,
    }),
    intensity: ZNumberSlider.describe({
        ...uiDescriptions.numberSlider,
        defValue: 1,
        label: "locale.parameters.posteffect.intensity.label",
        info: {
            infoList: "locale.parameters.posteffect.intensity.infoList",
            infoBody: "locale.parameters.posteffect.intensity.infoBody",
            infoHeader: "locale.parameters.posteffect.intensity.infoHeader",
            clickLink: "https://dev.vk.com/ru/masks/effects/posteffect",
        },
    }),
}).describe({
    ...uiDescriptions.object,
    label: "locale.parameters.posteffect.label",

    groups: {
        main: {
            label: "locale.parameters.group.main",
            defExpanded: true,
        },
        tags: {
            label: "locale.parameters.tags.label",
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
            info: { infoList: "locale.parameters.perspective.fieldOfView.infoList" },
        }),
        near_clip: ZNumberSlider.describe({
            ...uiDescriptions.numberSlider,
            min: 0.1,
            max: 5000,
            defValue: 0.1,
            label: "locale.parameters.perspective.nearPlane.label",
            info: { infoList: "locale.parameters.perspective.nearPlane.infoList" },
        }),
        far_clip: ZNumberSlider.describe({
            ...uiDescriptions.numberSlider,
            min: 1,
            max: 5000,
            defValue: 3000,
            steps: 100,
            label: "locale.parameters.perspective.farPlane.label",
            info: { infoList: "locale.parameters.perspective.farPlane.infoList" },
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
            info: { infoList: "locale.parameters.mirror.enable.infoList" },
        }),
        debug: ZBool.describe({
            ...uiDescriptions.bool,
            defValue: false,
            label: "locale.parameters.mirror.debug.label",
            info: { infoList: "locale.parameters.mirror.debug.infoList" },
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
            info: { infoList: "locale.parameters.fixedDeteciton.rotation.infoList" },
        }),
        offset: ZNumberSlider.describe({
            ...uiDescriptions.numberSlider,
            defValue: 0.7,
            label: "locale.parameters.fixedDeteciton.offset.label",
            info: { infoList: "locale.parameters.fixedDeteciton.offset.infoList" },
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
    "locale.projectManager.userHint.tapChange.label",
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
};

const ZIcon = z.string().describe({
    ...uiDescriptions.icon,
    info: iconInfo,
    label: "locale.projectManager.icon.label",
});

const scriptInfo = {
    clickLink: "https://dev.vk.com/ru/masks/development/script-creation",
    infoHeader: "locale.projectManager.mainScript.infoHeader",
    infoBody: "locale.projectManager.mainScript.infoBody",
};
const ZMainScriptAsset = z.string().describe({
    ...uiDescriptions.mainScript,
    info: scriptInfo,
    group: "advanced",
    label: "locale.projectManager.mainScript.label",
});

const MaskSettings = {
    icon: ZIcon,
    user_hint: z.enum(UserHintOptions).describe({
        ...uiDescriptions.enum,
        options: UserHintOptions,
        optionLabels: UserHintOptionsLabels,
        defValue: UserHintOptions[0],
        label: "locale.projectManager.userHint.label",
        info: {
            clickLink:
                "https://dev.vk.com/ru/masks/configuration#%D0%9F%D0%B0%D1%80%D0%B0%D0%BC%D0%B5%D1%82%D1%80%D1%8B",
            infoBody: "locale.projectManager.userHint.infoBody",
            infoHeader: "locale.projectManager.userHint.infoHeader",
            infoList: "locale.projectManager.userHint.infoList",
        },
    }),

    // defValue, label, options = [], optionLabels = [], group = "main"
    // num_faces: ZNumberEnum(1, "Number faces", "main", [0, 1, 2], ["0", "1", "2"]),
    // facemodel_version: ZNumberEnum(0, "Facemodel version", "Advanced", [0, 1], ["old", "new"]),
    mouse_input: z.boolean().describe({
        ...uiDescriptions.bool,
        label: "locale.projectManager.mouseInput.label",
        info: {
            clickLink:
                "https://dev.vk.com/ru/masks/configuration#%D0%9F%D0%B0%D1%80%D0%B0%D0%BC%D0%B5%D1%82%D1%80%D1%8B",
            infoBody: "locale.projectManager.mouseInput.infoBody",
            infoHeader: "locale.projectManager.mouseInput.infoHeader",
            infoList: "locale.projectManager.mouseInput.infoList",
        },
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
                label: "locale.projectManager.group.main.label",
                defExpanded: true,
            },
            permissions: {
                label: "locale.projectManager.group.permissions.label",
                defExpanded: false,
            },
            advanced: {
                label: "locale.projectManager.group.advanced.label",
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

//test

export const ZMaskConfigPreprocess = z.preprocess(
    (val) => {
        return replaceObjectSynonim(val, "preview", "icon");
    },
    z
        .object({
            icon: z.unknown().optional(),
            effects: z
                .array(
                    z
                        .union([
                            z
                                .object({
                                    name: z
                                        .union([z.literal("patch"), z.literal("facemodel")])
                                        .optional(),
                                    texture: z
                                        .preprocess((val) => {
                                            if (val == null) return;
                                            if (isObject(val)) {
                                                // keep only diffuse, not texture in object
                                                val = replaceObjectSynonim(
                                                    val,
                                                    "texture",
                                                    "diffuse"
                                                );
                                                // if (!isObject(val.animation)) {
                                                //     val.animation = {};
                                                // }
                                                return val;
                                            }
                                            return {
                                                diffuse: val,
                                                // animation: {},
                                            };
                                        }, z.object({}).passthrough())
                                        .optional(),
                                    // // .default({}),
                                })
                                .passthrough(),

                            z
                                .object({
                                    name: z.literal("model3d").optional(),
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
                                    name: z
                                        .union([
                                            z.literal("ambientLight"),
                                            z.literal("pointLight"),
                                            z.literal("directLight"),
                                            z.literal("posteffect"),
                                            z.literal("beautify"),
                                            z.literal("colorfilter"),
                                            z.literal("liquifiedwarp"),
                                            z.literal("plane"),
                                        ])
                                        .optional(),
                                })
                                .passthrough(),
                        ])
                        .optional()
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
