// !!! changed to js so that i dont get errors with rollup


import { z } from "zod";
import { fromZodError } from 'zod-validation-error';

export const uiDescriptions = {
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
    filepath: ({ }) => ({
        name: 'filepath'
    }),
    text: ({ }) => ({
        name: 'text'
    }),
    color3d: ({ min, max }) => ({
        name: 'color3d',
        min: min,
        max: max
    }),
    color4d: ({ min, max }) => ({
        name: 'color4d',
        min: min,
        max: max
    }),
    bool: () => ({
        name: 'bool'
    })
}



const ZNumberSlider = z.number().describe({ name: 'numberSlider', min: 0, max: 1 });

const ZBool = z.boolean().describe(uiDescriptions.bool({}));
const ZArray2D = z.number().array().length(2, { message: "Array size must be 2" }).describe(uiDescriptions.array2d({}));
const ZArray3D = z.number().array().length(3, { message: "Array size must be 3" }).describe(uiDescriptions.array3d({}));
const ZArray4D = z.number().array().length(4, { message: "Array size must be 4" }).describe(uiDescriptions.array4d({}));
const ZColor3D = z.number().array().length(3, { message: "Color size must be 3" }).describe(uiDescriptions.color3d({ min: 0, max: 1 }));
const ZColor4D = z.number().array().length(4, { message: "Color size must be 4" }).describe(uiDescriptions.color4d({ min: 0, max: 1 }));

const ZFaceAnchor = z.enum([
    "face", "right_eye", "left_eye", "middle_eyes", "forehead", "nose", "mouth", "right_cheek", "left_cheek", "lower_lip", "upper_lip"
])
const ZLightType = z.enum(["point", "ambient", "direct"])


const ZFilePath = z.string().describe(uiDescriptions.filepath({}));
const ZText = z.string().describe(uiDescriptions.text({}))

export const TextureObject = z.object({
    diffuse: ZFilePath.optional(),
    texture: ZFilePath.optional(),
    normal: ZFilePath.optional(),
    color: ZColor4D.optional()
}).describe(() => ({ name: 'texture_object' }))



export const ZBaseEffect = z.object({
    name: ZText,
    tag: ZText.default(""),
    disabled: ZBool.default(false)
})

const ZPatchEffect = ZBaseEffect.extend(
    {
        name: z.literal("patch"),
        anchor: ZFaceAnchor.default(ZFaceAnchor.Values.forehead),
        size: ZArray2D.default([0, 0]),
        offset: ZArray3D.default([0, 0, 0])
    }
)

const ZFacemodelEffect = ZBaseEffect.extend(
    {
        name: z.literal("facemodel"),
        mouth: ZBool.default(true),
        eyes: ZBool.default(true),
        position: ZArray3D.default([0, 0, 0]),
        rotation: ZArray3D.default([0, 0, 0]),
        scale: ZArray3D.default([0, 0, 0]),
        texture: TextureObject.default({
            diffuse: "empty.png",
            color: [1, 1, 1, 1]
        })
    }
)



const ZBaseLightEffect = ZBaseEffect.extend(
    {
        name: z.literal("light"),
        color: ZArray3D.default([1, 1, 1]),
        brightness: ZNumberSlider.default(1.0),
        specular_intensity: ZNumberSlider.default(1.0),

        type: ZLightType.describe(uiDescriptions.enum({ options: Object.keys(ZLightType.Values) })).default(ZLightType.Values.direct),
        position: ZArray3D.default([0, 0, 0]),
        direction: ZArray3D.default([0, 0, 1]),
        rotation: ZArray3D.default([0, 0, 0]),
        anchor: ZFaceAnchor.describe(uiDescriptions.enum({ options: Object.keys(ZFaceAnchor.Values) })).default(ZFaceAnchor.Values.forehead),
        range: ZNumberSlider.describe(uiDescriptions.numberSlider({ min: 0.0, max: 2000.0 })).default(500.0),
    }
)

// ZBaseLightEffect.shape.type.removeDefault().Values


const ZBeautifyEffect = ZBaseEffect.extend(
    {
        name: z.literal("beautify"),
        mix: ZNumberSlider.default(0.65)
    }
);

// "lookup": "ColorFilter/lookup.png",
// "intensity": 


const ZColorfilterEffect = ZBaseEffect.extend(
    {
        name: z.literal("colorfilter"),
        intensity: ZNumberSlider.default(0.75),
        lookup: ZFilePath.default("ColorFilter/lookup.png")
    }
);

// const ZLightEffect = z.union([z.discriminatedUnion("type", [
//     z.object({
//         type: z.literal("point"),
//         position: Array3D.default([0, 0, 0]),
//         anchor: ZFaceAnchor.default(ZFaceAnchor.Values.forehead),
//         range: z.number().default(500.0)

//     }),

//     z.object({
//         type: z.literal("direct"),
//         direction: Array3D.default([0, 0, 1]),
//         rotation: Array3D.default([0, 0, 0])
//     }),

//     z.object({
//         type: z.literal("ambient"),
//     })
// ]), ZBaseLightEffect
// ])


// const EffectTypes =

// export const EffectsMap = {
//     "facemodel": ZFacemodelEffect,
//     "patch": ZPatchEffect,
//     "light": ZBaseLightEffect
// }

const EffectsList = [
    ZFacemodelEffect, ZPatchEffect, ZBaseLightEffect, ZBeautifyEffect, ZColorfilterEffect
]

export const ZEffects = z.discriminatedUnion("name", [...EffectsList]);
// console.log(ZEffects.safeParse({ name: "facemodel" }))



export const effectNames = ZEffects.options.map(val => {
    const name = val.shape.name;
    return name.value
});
// console.log(effectNames);
export const effectDefaults = {};
effectNames.forEach((name, i) => {
    const result = ZEffects.safeParse({ name: name });
    if (result.success) {
        effectDefaults[name] = {
            data: result.data,
            type: EffectsList[i]
        };
    }
});
// console.log(effectDefaults);




// Object.keys(ZEffects.options[0].shape).map(val => { console.log(val) })

// export const res = ZEffects.safeParse({
//     name: "facemodel",
//     size: [1, 1],
//     position: [1, 2, 3],
//     texture: {
//         diffuse: "someTex",
//         color: [1, 2, 3, 4]
//     }
// })



// if (!res.success) {
//     // handle error then return
//     console.log("Error ")
//     console.log(fromZodError(res.error));

// } else {
//     // do something
//     console.log("success");
//     res.data
//     console.log(res.data);

// }

