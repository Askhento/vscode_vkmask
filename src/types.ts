import { z } from "zod";

const Array2D = z.number().array().length(2);
const Array3D = z.number().array().length(3, { message : "Array size must be 3"});

const ZEffect = z.object({
    name : z.string(),
    tags : z.optional(z.string()),
    size :  Array2D
})

type efff = z.infer<typeof ZEffect>;


const res = ZEffect.safeParse({
    name : "soze",
    size : [1],
    extra : "value"
})



if (!res.success) {
  // handle error then return
  console.log("Error ")
  console.log(res.error.issues[0]);

} else {
  // do something
  console.log("success");
  console.log(res.data);
}


// types.ts 
import * as t from "io-ts";

export const Effect = t.type({
    name: t.string,
});

const PatchEffect = t.intersection([
    Effect,
    t.partial({
      tag : t.string,
      size : t.array(t.number)
    })
])

type Patch = t.TypeOf<typeof PatchEffect>;

const tst : Patch = {
    name : "some",
    tag : "other"
}

export const Plugin = t.type({
    name : t.string
})

export const MaskJSON = t.intersection([
    t.type({
        preview : t.string,
        script : t.string,
        effects : t.array(Effect)
    }),
    t.partial({
        name : t.string,
        user_hint : t.string,
        facemodel_version : t.number,
        mouse_input : t.boolean,
        plugins : t.array(Plugin)
    })
])




// type: t.union([t.literal("FURNITURE"), t.literal("BOOK")]