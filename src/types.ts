
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