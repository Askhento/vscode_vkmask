
// types.ts 
import * as t from "io-ts";

export const Effect = t.intersection([
    t.type({
        name: t.string,
    }), t.partial({
        disabled: t.boolean,
        tag: t.string
    })
]);

const PatchEffect = t.intersection([
    Effect,
    t.partial({
        size: t.array(t.number)
    })
])

type Patch = t.TypeOf<typeof PatchEffect>;


export const Plugin = t.type({
    name: t.string
})


export const MaskJSON = t.intersection([
    t.type({
        script: t.string,
        effects: t.array(Effect)
    }),
    t.union([
        t.type({
            preview: t.string
        }),
        t.type({
            icon: t.string,
        })
    ]),
    t.partial({
        name: t.string,
        user_hint: t.string,
        facemodel_version: t.number,
        mouse_input: t.boolean,
        plugins: t.array(Plugin)
    })
])




// type: t.union([t.literal("FURNITURE"), t.literal("BOOK")]