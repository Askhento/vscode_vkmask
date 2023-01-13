// types.ts 
import * as t from "io-ts";

export const Effect = t.type({
    name: t.string,
});


export const Plugin = t.type({
    name : t.string
})

export const MaskJSON = t.intersection([
    t.type({
        name : t.string,
        preview : t.string,
        script : t.string,
        effects : t.array(Effect)
    }),
    t.partial({
        facemodel_version : t.number,
        mouse_input : t.boolean,
        plugins : t.array(Plugin)
    })
])




// type: t.union([t.literal("FURNITURE"), t.literal("BOOK")]