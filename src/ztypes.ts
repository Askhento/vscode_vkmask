import { z } from "zod";
import { fromZodError } from 'zod-validation-error';

const Array2D = z.number().array().length(2, { message: "Array size must be 2" });
const Array3D = z.number().array().length(3, { message: "Array size must be 3" });
const Array4D = z.number().array().length(4, { message: "Array size must be 4" });


const TextureObject = z.object({
    diffuse: z.string().optional(),
    texture: z.string().optional(),
    normal: z.string().optional()
})


const ZEffect = z.object({
    name: z.string(),
    tags: z.optional(z.string()),
})

const ZPatchEffect = ZEffect.extend(
    {
        name: z.literal("patch"),
        size: Array2D.optional(),
        offset: Array3D.optional()
    }
)

const ZFacemodelEffect = ZEffect.extend(
    {
        name: z.literal("facemodel"),
        position: Array3D.optional(),
        rotation: Array3D.optional(),
        scale: Array3D.optional(),
        texture: z.union([
            z.string(),
            TextureObject
        ]).optional()
    }
)



const ZEffects = z.union([
    ZFacemodelEffect, ZPatchEffect
]);

const EffectNames = ZEffects.options.map(val => val.shape.name.value);
// console.log(EffectNames);


export const res = ZEffects.safeParse({
    name: "facemodel",
    size: [1, 1],
    position: [1, 2, 2],
    texture: 1
})


if (!res.success) {
    // handle error then return
    console.log("Error ")
    console.log(fromZodError(res.error));

} else {
    // do something
    console.log("success");
    console.log(res.data);
}

