// !!! changed to js so that i dont get errors with rollup

/*
    to get values stored in checks  
    ```
    const minValue = schema.shape.name._def.checks.find(({ kind }) => kind === "min").value;
    
    ```

    biggest issue is parameters with 2 and more options 
*/

import { z } from "zod";
// import { fromZodError } from 'zod-validation-error';



export const uiDescriptions = {
    none: ({ }) => ({
        name: 'none'
    }),
    numberSlider: ({ min, max }) => ({
        name: 'numberSlider',
        min: min,
        max: max
    }),
    array2d: ({ min, max }) => ({
        name: 'array2d',
        min: min,
        max: max
    }),
    array3d: ({ min, max }) => ({
        name: 'array3d',
        min: min,
        max: max
    }),
    array4d: ({ min, max }) => ({
        name: 'array4d',
        min: min,
        max: max
    }),
    enum: ({ options }) => ({
        name: 'enum',
        options: options
    }),
    filepath: ({ extensions, types }) => ({
        name: 'filepath',
        extensions: extensions,
        types: types
    }),
    text: ({ }) => ({
        name: 'text'
    }),
    tags: ({ }) => ({
        name: 'tags'
    }),
    color: ({ min, max }) => ({
        name: 'color',
        min: min,
        max: max
    }),
    colorAlpha: ({ min, max }) => ({
        name: 'colorAlpha',
        alpha: true,
        min: min,
        max: max
    }),
    bool: () => ({
        name: 'bool'
    }),
    object: ({ }) => ({
        name: 'object'
    }),
    array: ({ elementName, defaultElement }) => ({
        name: 'array',
        elementName: elementName,
        defaultElement: defaultElement
    }),
    union: ({ }) => ({
        name: 'union',
    }),
    discriminatedUnion: ({ }) => ({
        name: 'discriminatedUnion',
    }),
}



const ZNumberSlider = z.number().describe(uiDescriptions.numberSlider({ min: 0, max: 1 }));

const ZBool = z.boolean().describe(uiDescriptions.bool({}));
const ZArray2D = z.number().array().length(2, { message: "Array size must be 2" }).describe(uiDescriptions.array2d({}));
const ZArray3D = z.number().array().length(3, { message: "Array size must be 3" }).describe(uiDescriptions.array3d({}));
const ZArray4D = z.number().array().length(4, { message: "Array size must be 4" }).describe(uiDescriptions.array4d({}));
const ZColor = z.number().array().length(3, { message: "Color size must be 3" }).describe(uiDescriptions.color({ min: 0, max: 1 }));
const ZColorAlpha = z.number().array().length(4, { message: "Color size must be 4" }).describe(uiDescriptions.colorAlpha({ min: 0, max: 1, alpha: true }));

const ZFaceAnchor = z.enum([
    "free", "face", "right_eye", "left_eye", "middle_eyes", "forehead", "nose", "mouth", "right_cheek", "left_cheek", "lower_lip", "upper_lip"
])
const ZLightType = z.enum(["point", "ambient", "direct"])

const AssetTypes = {
    texture: {
        default: "Textures/Spot.png",
        extensions: ["png", "jpg"]
    },
    material: {
        default: "Materials/DefaultGrey.xml",
        extensions: ["xml", "json"],
        types: ["xml_material", "json_material"]
    },
    technique: {
        default: "Techniques/DiffUnlit.xml",
        extensions: ["xml"],
        types: ["xml_technique"]
    },
    renderPath: {
        default: "",
        extensions: ["xml"],
        types: ["xml_renderpath"]
    },
    animationClip: {
        default: "",
        extensions: ["ani"]
    },
    model3d: {
        default: "Models/DefaultPlane.mdl",
        extensions: ["mdl"]
    }
}





const ZAsset = z.string().describe(uiDescriptions.filepath({}));

const ZText = z.string().describe(uiDescriptions.text({}))
const ZTags = z.string().describe(uiDescriptions.tags({}))

const ZVisibleType = z.enum([
    "always",

    "face",
    "animation",
    "mouth_open"
]);

const ZPatchFitMode = z.enum([
    "none",
    "crop",
    "pad"
])

const ZTextureAsset = ZAsset.describe(uiDescriptions.filepath(AssetTypes.texture))
const ZRenderPathAsset = ZAsset.describe(uiDescriptions.filepath(AssetTypes.renderPath))
const ZTechniqueAsset = ZAsset.describe(uiDescriptions.filepath(AssetTypes.technique))

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

function isObject(val) {
    return (typeof val === 'object' &&
        !Array.isArray(val) &&
        val !== null);
}

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
    "Luminosity"
])


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
            diffuse: val
        }
    },
    z.object({
        diffuse: ZTextureAsset.default(AssetTypes.texture.default),
        // !!! probably will miss texture property
        // texture: ZTextureAsset,
        normal: ZTextureAsset.default(""),
        color: ZColorAlpha.default([1.0, 1.0, 1.0, 1.0]),
        lit: ZBool.default(false),
        blend_mode: ZBlendModes.describe(uiDescriptions.enum({ options: Object.keys(ZBlendModes.Values) })).default(ZBlendModes.Values.replace),
        u_transform: ZArray3D.default([1, 0, 0]),
        v_transform: ZArray3D.default([0, 1, 0]),
        render_order: ZNumberSlider.describe(uiDescriptions.numberSlider({ max: 100, min: -100 })).default(0)
    }).describe(uiDescriptions.object({}))
)


// const testObj = { diffuse: "diff", normal: "somenormal" };
// console.log(isObject(testObj))
// const parseResult = ZTextureObject.safeParse(testObj);

// if (parseResult.success) {
//     console.log(parseResult.data);
// } else {
//     console.log(parseResult.error)
// }


const ZMaterialAsset = ZAsset.describe(uiDescriptions.filepath(AssetTypes.material)).default(AssetTypes.material.default)

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

const ZCullMode = z.enum(["none",
    "ccw",
    "cw"])

const ZFillMode = z.enum(["solid",
    "wireframe",
    "point",])





const ZMaterialObject = z.object({
    techniques: ZTechniqueAsset.default(AssetTypes.technique.default),
    textures: z.object({
        diffuse: ZTextureAsset.default(AssetTypes.texture.default),
        normal: ZTextureAsset.default(AssetTypes.texture.default),
        specular: ZTextureAsset.default(AssetTypes.texture.default),
        emissive: ZTextureAsset.default(AssetTypes.texture.default),
        environment: ZTextureAsset.default(AssetTypes.texture.default),
    }).describe(uiDescriptions.object({})).default({}),
    // parameters: z.object({
    //     UOffset: ZArray4D.default([1.0, 0.0, 0.0, 0.0]),
    //     VOffset: ZArray4D.default([0.0, 1.0, 0.0, 0.0]),
    //     MatDiffColor: ZArray4D.default([1.0, 1.0, 1.0, 1.0]),
    //     MatEmissiveColor: ZArray3D.default([0.0, 0.0, 0.0]),
    //     MatEnvMapColor: ZArray3D.default([1.0, 1.0, 1.0]),
    //     MatSpecColor: ZArray4D.default([0.0, 0.0, 0.0, 1.0]),
    //     Roughness: ZNumberSlider.default(0.5),
    //     Metallic: ZNumberSlider.default(0.5)
    // }).describe(uiDescriptions.object({})).passthrough(),
    cull: ZCullMode.describe(uiDescriptions.enum({ options: Object.keys(ZCullMode.Values) })).default(ZCullMode.Values.ccw),
    fill: ZFillMode.describe(uiDescriptions.enum({ options: Object.keys(ZFillMode.Values) })).default(ZFillMode.Values.solid)
}).describe(uiDescriptions.object({}))

export const ZMaterialArray = z.preprocess(
    (val) => {
        if (!Array.isArray(val)) return [val];
        return val;
    },
    z.array(z.union([
        ZMaterialAsset,
        ZMaterialObject
    ]).describe(uiDescriptions.union({}))
    ).describe(uiDescriptions.array({ elementName: "material", defaultElement: AssetTypes.material.default }))
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
//         diffuse: ZAsset.default(AssetTypes.texture.default).describe(uiDescriptions.filepath({ extensions: AssetTypes.texture.extensions })),
//         texture: ZAsset.default(AssetTypes.texture.default).describe(uiDescriptions.filepath({ extensions: AssetTypes.texture.extensions })),
//         normal: ZAsset.default(AssetTypes.texture.default).describe(uiDescriptions.filepath({ extensions: AssetTypes.texture.extensions })),
//         color: ZColorAlpha.default([1.0, 1.0, 1.0, 1.0])
//     }).describe(uiDescriptions.object({}))


export const ZBaseEffect = z.object({
    name: ZText.describe(uiDescriptions.none({})),
    tag: ZTags.default(""),
    // disabled: ZBool.default(false)
}).describe(uiDescriptions.object({})).passthrough()





const ZFacemodelEffect = ZBaseEffect.extend(
    {
        name: z.literal("facemodel").describe(uiDescriptions.none({})),
        mouth: ZBool.default(true),
        eyes: ZBool.default(true),
        position: ZArray3D.default([0, 0, 0]),
        rotation: ZArray3D.default([0, 0, 0]),
        scale: ZArray3D.default([1, 1, 1]),
        texture: ZTextureObject
    }
).describe(uiDescriptions.object({}))


const ZPatchEffect = ZBaseEffect.extend(
    {
        name: z.literal("patch").describe(uiDescriptions.none({})),
        anchor: ZFaceAnchor.describe(uiDescriptions.enum({ options: Object.keys(ZFaceAnchor.Values) })).default(ZFaceAnchor.Values.forehead),
        visible: ZVisibleType.describe(uiDescriptions.enum({ options: Object.keys(ZVisibleType.Values) })).default(ZVisibleType.Values.always),
        fit: ZPatchFitMode.describe(uiDescriptions.enum({ options: Object.keys(ZPatchFitMode.Values) })).default(ZPatchFitMode.Values.none),
        size: ZArray2D.default([1, 1]),
        offset: ZArray3D.default([0, 0, 0]),
        rotation: ZArray3D.default([0, 0, 0]),
        allow_rotation: ZBool.default(false),
        texture: ZTextureObject,
        pass: ZRenderPathAsset.default(AssetTypes.renderPath.default)
    }
).describe(uiDescriptions.object({}))


const ZBaseLightEffect = ZBaseEffect.extend(
    {
        name: z.literal("light").describe(uiDescriptions.none({})),
        anchor: ZFaceAnchor.describe(uiDescriptions.enum({ options: Object.keys(ZFaceAnchor.Values) })).default(ZFaceAnchor.Values.forehead),
        type: ZLightType.describe(uiDescriptions.enum({ options: Object.keys(ZLightType.Values) })).default(ZLightType.Values.direct),
        color: ZColor.default([1, 1, 1]),
        brightness: ZNumberSlider.default(1.0),
        specular_intensity: ZNumberSlider.default(1.0),
        range: ZNumberSlider.describe(uiDescriptions.numberSlider({ min: 0.0, max: 2000.0 })).default(500.0),
        position: ZArray3D.default([0, 0, 0]),
        direction: ZArray3D.default([0, 0, 1]),
        rotation: ZArray3D.default([0, 0, 0]),
    }
).describe(uiDescriptions.object({}))

// ZBaseLightEffect.shape.type.removeDefault().Values

const ZBeautifyEffect = ZBaseEffect.extend(
    {
        name: z.literal("beautify").describe(uiDescriptions.none({})),
        mix: ZNumberSlider.default(0.65)
    }
).describe(uiDescriptions.object({}))

// "lookup": "ColorFilter/lookup.png",
// "intensity": 


const ZColorfilterEffect = ZBaseEffect.extend(
    {
        name: z.literal("colorfilter").describe(uiDescriptions.none({})),
        intensity: ZNumberSlider.default(0.75),
        lookup: ZAsset.describe(uiDescriptions.filepath({ extensions: AssetTypes.texture.extensions })).default(AssetTypes.texture.default),

    }
).describe(uiDescriptions.object({}))




const ZModel3dEffect = ZBaseEffect.extend(
    {
        name: z.literal("model3d").describe(uiDescriptions.none({})),
        anchor: ZFaceAnchor.describe(uiDescriptions.enum({ options: Object.keys(ZFaceAnchor.Values) })).default(ZFaceAnchor.Values.forehead),
        model: ZAsset.describe(uiDescriptions.filepath({ extensions: AssetTypes.model3d.extensions })).default(AssetTypes.model3d.default),
        material: ZMaterialArray.default([AssetTypes.material.default]),
        position: ZArray3D.default([0, 0, 0]),
        rotation: ZArray3D.default([0, 0, 0]),
        scale: ZArray3D.default([1, 1, 1]),
    }
).describe(uiDescriptions.object({}))



const ZPlaneEffect = ZBaseEffect.extend(
    {
        name: z.literal("plane").describe(uiDescriptions.none({})),
        anchor: ZFaceAnchor.describe(uiDescriptions.enum({ options: Object.keys(ZFaceAnchor.Values) })).default(ZFaceAnchor.Values.forehead),
        material: ZMaterialArray.default([AssetTypes.material.default]),
        position: ZArray3D.default([0, 0, 0]),
        rotation: ZArray3D.default([0, 0, 0]),
        scale: ZArray3D.default([1, 1, 1]),
    }
).describe(uiDescriptions.object({}))



// const ZBaseTest = ZBaseEffect.extend(
//     {
//         name: z.literal("light"),
//         color: ZColor.default([1, 1, 1]),
//         brightness: ZNumberSlider.default(1.0),
//         specular_intensity: ZNumberSlider.default(1.0)
//     }
// )

const ZLightEffect = (z.union([
    z.object({
        name: z.literal("light"),
        color: ZColor.default([1, 1, 1]),
        brightness: ZNumberSlider.default(1.0),
        specular_intensity: ZNumberSlider.default(1.0),
        type: z.literal("point"),
        position: ZArray3D.default([0, 0, 0]),
        anchor: ZFaceAnchor.describe(uiDescriptions.enum({ options: Object.keys(ZFaceAnchor.Values) })).default(ZFaceAnchor.Values.forehead),
        range: z.number().default(500.0)
    }).describe(uiDescriptions.object({})),

    z.object({
        name: z.literal("light"),
        color: ZColor.default([1, 1, 1]),
        brightness: ZNumberSlider.default(1.0),
        specular_intensity: ZNumberSlider.default(1.0),
        type: z.literal("direct"),
        direction: ZArray3D.default([0, 0, 1]),
        rotation: ZArray3D.default([0, 0, 0])
    }).describe(uiDescriptions.object({})),

    z.object({
        name: z.literal("light"),
        color: ZColor.default([1, 1, 1]),
        brightness: ZNumberSlider.default(1.0),
        specular_intensity: ZNumberSlider.default(1.0),
        type: z.literal("ambient"),
    }).describe(uiDescriptions.object({}))
])
).describe(uiDescriptions.union({}))




// console.log(ZLightEffect.parse({ name: "light", type: "point" }))

// console.log(ZLightEffect.description)

const testLight = {
    "name": "light",
    "tag": "1233",
    "disabled": true,
    "anchor": "right_eye",
    "type": "ambient",
    "color": [0.88, 0.14, 0.14],
    "brightness": 0.45,
    "specular_intensity": 0.25,
    "range": 1500,
    "position": [0.0, 0.0, 13.0],
    "direction": [0.0, 0.0, 1.0],
    "rotation": [0.0, 0.0, 0.0]
}


// console.log(ZLightEffect.parse(testLight))



const ZLiquifiedWarpEffect = ZBaseEffect.extend(
    {
        name: z.literal("liquifiedwarp").describe(uiDescriptions.none({})),
        progress: ZNumberSlider.default(1.0)
    }
).describe(uiDescriptions.object({}))




const ZPostEffectType = z.enum([
    "blur",
    "dispersion",
    "glow",
    "noise",
    "sharpen"
])

const ZPostEffectEffect = ZBaseEffect.extend(
    {
        name: z.literal("posteffect").describe(uiDescriptions.none({})),
        intensity: ZNumberSlider.default(1.0),
        type: ZPostEffectType.describe(uiDescriptions.enum({ options: Object.keys(ZPostEffectType.Values) })).default(ZPostEffectType.Values.sharpen),

    }
).describe(uiDescriptions.object({}))


// "name": "liquifiedwarp",
// "progress": 0.8,

export const EffectsList = [
    ZFacemodelEffect,
    ZPlaneEffect,
    ZModel3dEffect,
    ZPatchEffect,
    ZBaseLightEffect,
    ZBeautifyEffect,
    ZLiquifiedWarpEffect,
    ZColorfilterEffect,
    ZPostEffectEffect
]




export const ZEffect = z.discriminatedUnion("name", [...EffectsList]).describe(uiDescriptions.discriminatedUnion({}))
export const ZEffects = ZEffect.array().describe(uiDescriptions.array({}))
// console.log(ZEffects.safeParse({ name: "facemodel" }))



export const effectNames = ZEffect.options.map(val => {
    // if (val.options) val = val.options[0]
    // console.log(val)
    const name = val.shape.name;
    return name.value
});
// console.log(effectNames);
export const effectDefaults = {};
effectNames.forEach((name, i) => {
    const result = ZEffect.safeParse({ name: name });

    if (result.success) {
        // console.log("ztypes data");
        // console.log(result.data)
        effectDefaults[name] = {
            data: result.data,
            type: EffectsList[i]
        };
    } else {
        console.log(result.error)
    }
});


// t.type({
//     script: t.string,
//     effects: t.array(Effect)
// }),
// t.union([
//     t.type({
//         preview: t.string
//     }),
//     t.type({
//         icon: t.string,
//     })
// ]),
// t.partial({
//     name: t.string,
//     user_hint: t.string,
//     facemodel_version: t.number,
//     mouse_input: t.boolean,
//     plugins: t.array(Plugin)
// })

export const ZMaskConfig = z.object({
    name: z.string().default("defaultName"),
    user_hint: z.string().default(""),
    facemodel_version: z.number().default(0),
    mouse_input: z.boolean().default(false),
    preview: z.string().default(""),
    script: z.string().default("main.as"),
    effects: ZEffects.default([]),
    plugins: z.array(z.object({}).passthrough()).default([])
})


