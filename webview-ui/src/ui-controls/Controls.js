import {
    effectNames,
    effectDefaults,
    uiDescriptions,
    EffectsList,
    ZEffect,
    ZPlugin,
    ZMaskSettings,
    ZMaterialObject,
} from "../../../src/ztypes.js";
import { z } from "zod";

import TextControl from "./TextControl.svelte";
import NumberSliderControl from "./NumberSliderControl.svelte";
import SwitchControl from "./SwitchControl.svelte";
import FilePickerControl from "./FilePickerControl.svelte";
import OptionsControl from "./OptionsControl.svelte";
import ColorPickerControl from "./ColorPickerControl.svelte";
import TagsControl from "./TagsControl.svelte";
import VectorControl from "./VectorControl.svelte";
import ObjectControl from "./ObjectControl.svelte";
import ArrayControl from "./ArrayControl.svelte";
import MainScriptControl from "./MainScriptControl.svelte";
import IconControl from "./IconControl.svelte";
import TexturePickerControl from "./TexturePickerControl.svelte";
import UVControl from "./UVControl.svelte";

export const uiControlsMap = {
    [uiDescriptions.bool.name]: SwitchControl,
    [uiDescriptions.numberSlider.name]: NumberSliderControl,
    [uiDescriptions.filepath.name]: FilePickerControl,
    [uiDescriptions.text.name]: TextControl,
    [uiDescriptions.enum.name]: OptionsControl,
    [uiDescriptions.color.name]: ColorPickerControl,
    [uiDescriptions.colorAlpha.name]: ColorPickerControl,
    [uiDescriptions.tags.name]: TagsControl,
    [uiDescriptions.array2d.name]: VectorControl,
    [uiDescriptions.array3d.name]: VectorControl,
    [uiDescriptions.array4d.name]: VectorControl,
    [uiDescriptions.object.name]: ObjectControl,
    [uiDescriptions.array.name]: ArrayControl,
    [uiDescriptions.mainScript.name]: MainScriptControl,
    [uiDescriptions.icon.name]: IconControl,
    [uiDescriptions.texture.name]: TexturePickerControl,
    [uiDescriptions.uv_transform.name]: UVControl,
};

function getInnerZType(schema) {
    let schemaType = schema._def.typeName;
    if (schemaType === "ZodDefault" || schemaType === "ZodOptional") {
        // !!! || schemaType === "ZodOptional"
        return getInnerZType(schema._def.innerType);
    } else if (schemaType === "ZodEffects") {
        // this should be preprocess, but also transoform and refine
        return getInnerZType(schema._def.schema);
    }
    return schema;
}

function addTypeToSchema(schema) {
    // console.log("schema ", schema)

    // peal off defaults, transforms etc so that I care only about ui
    schema = getInnerZType(schema);

    let description = schema._def.description;

    // console.log("innerZtype : ", schema)
    // console.log("desc", description)
    let res = schema;
    switch (description.name) {
        case "object":
            // if (k === "disabled") return [];
            // console.log("in object")

            res = z.object(
                Object.fromEntries(
                    Object.entries(schema.shape).flatMap(([k, v]) => {
                        return [[k, addTypeToSchema(v)]];
                    })
                )
            ); //.partial();

            // res = res.transform((value) => ({
            //     value,
            //     uiDescription: description,
            //     uiElement: uiControlsMap[description.name],
            // }));
            // return res;
            break;

        case "array":
            // schema.element is inner type for arrays
            res = z.array(addTypeToSchema(schema.element));
            //.transform(value => ({ value, uiDescription: description, uiElement: uiControlsMap[description.name] }))
            break;

        case "union":
            // case "discriminatedUnion": // ??? i don't use this union type at all !!!!
            // seems like unions are different and should not be included in ui
            // console.log("union", schema);
            res = z.union(schema.options.map((elem) => addTypeToSchema(elem)));
            return res;
            break;

        case "discriminatedUnion":
            // seems like unions are different and should not be included in ui
            console.log(
                "in desc union",
                schema.options.map((elem) => addTypeToSchema(elem))
            );
            res = z.discriminatedUnion(
                schema.discriminator,
                schema.options.map((elem) => addTypeToSchema(elem))
            );
            return res;
        // schema.options = schema.options.map(elem => addTypeToSchema(elem))
        // for (let i = 0; i < schema.options.length; i++) {
        //     const name = schema.options[i].shape.name
        //     schema.options[i] = addTypeToSchema(schema.options[i]);
        //     schema.optionsMap[name] = schema.options[i]
        // }
        // res = schema
        // break;
        // default:
        //     break;
    }

    // !!! z.nullable()
    // res = z.nullable(res);
    res = z.union([res, z.null()]).default(null); // a hack to know if prop is missing
    // z.number().transform().catch()
    res = res.transform((value) => ({
        value,
        uiDescription: description,
        uiElement: uiControlsMap[description.name],
    }));

    // if (schema._def.typeName !== "ZodLiteral" && description.name !== "object") {
    //     res = res.catch((ctx) => {
    //         console.log("error", ctx);
    //         return {
    //             value: description.defValue,
    //             uiDescription: description,
    //             uiElement: uiControlsMap[description.name],
    //             error: ctx.error,
    //         };
    //     });
    // }

    return res;
}

// const testModel3d = {
//     name: "model3d",
//     tag: "12312;free",
//     disabled: false,
//     anchor: "forehead",
//     model: "Models/Shine.mdl",
//     material: [
//         "Materials/DefaultGrey.xml",
//         {
//             textures: "Sometexire.png",
//             parameters: [1, 0, 0, 0],
//         },
//     ],
//     position: [0.0, 0.0, 0.0],
//     rotation: [0.0, 0.0, 0.0],
//     scale: [1.0, 1.0, 1.0],
// };

// console.log("mat array", ZMaterialArray._def)
// console.log("desc", ZModel3dEffect.shape.rotation)
// console.log(ZModel3dEffect.shape.anchor)

export const EffectParserForUI = addTypeToSchema(ZEffect); //z.discriminatedUnion("name", EffectsList.map(effect => addTypeToSchema(effect))).array()
export const PluginParserForUI = addTypeToSchema(ZPlugin);
export const MaskSettingsParserForUI = addTypeToSchema(ZMaskSettings);
export const AssetParserForUI = addTypeToSchema(ZMaterialObject);
