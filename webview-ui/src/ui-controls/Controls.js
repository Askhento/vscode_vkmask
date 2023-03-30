import { effectNames, effectDefaults, uiDescriptions, EffectsList } from "../../../src/ztypes.js";

import TextControl from "./TextControl.svelte";
import NumberSliderControl from "./NumberSliderControl.svelte";
import SwitchControl from "./SwitchControl.svelte";
import FilePickerControl from './FilePickerControl.svelte'
import OptionsControl from "./OptionsControl.svelte";
import ColorPickerControl from './ColorPickerControl.svelte'
import TagsControl from './TagsControl.svelte'
import VectorControl from './VectorControl.svelte'
import ObjectControl from './ObjectControl.svelte'
import ArrayControl from './ArrayControl.svelte'

export const uiControlsMap = {
    [uiDescriptions.bool({}).name]: SwitchControl,
    [uiDescriptions.numberSlider({}).name]: NumberSliderControl,
    [uiDescriptions.filepath({}).name]: FilePickerControl,
    [uiDescriptions.text({}).name]: TextControl,
    [uiDescriptions.enum({}).name]: OptionsControl,
    [uiDescriptions.color({}).name]: ColorPickerControl,
    [uiDescriptions.colorAlpha({}).name]: ColorPickerControl,
    [uiDescriptions.tags({}).name]: TagsControl,
    [uiDescriptions.array2d({}).name]: VectorControl,
    [uiDescriptions.array3d({}).name]: VectorControl,
    [uiDescriptions.array4d({}).name]: VectorControl,
    [uiDescriptions.object({}).name]: ObjectControl,
    // [uiDescriptions.array({}).name]: ArrayControl, 

}


export let uiControls = {};
// export const uiParser = { _type : uiDescriptions.object({}).name};



function getCleanedSchema(schema) {
    // this calls to get underlying type, with description
    if (schema.innerType) schema = schema.innerType(); // for zodEffects
    if (schema.removeDefault) schema = schema.removeDefault();
    if (schema.unwrap) schema = schema.unwrap(); // for optionals
    return schema;
}

function addType(schema, description) {
    return schema.transform(value => ({ value, type: description }))
}



function parseUIElement(schema) {
    if (schema._def.typeName === "ZodLiteral") return null; // maybe will add other things to skip

    const defValue = schema._def.defaultValue ? schema._def.defaultValue() : null;
    const cleanSchema = getCleanedSchema(schema);

    const uiTypeName = cleanSchema.description.name;
    schema = schema.transform(value => ({ value, type: cleanSchema.description.name }))
    let res;
    switch (uiTypeName) {
        case "object":
            res = Object.fromEntries(
                Object.entries(cleanSchema.shape).map(
                    ([k, v]) => [k, parseUIElement(v)]
                )
            )
            break;

        case "array":
            res = cleanSchema.element.options.map(elem => parseUIElement(elem));
            break;

        default:
            res = {
                uiElement: uiControlsMap[uiTypeName],
                params: { ...cleanSchema.description, default: defValue }
            };
            break;
    }
    return {
        _type: uiTypeName,
        uiData: res
    }
}

effectNames.forEach((name, i) => {
    const obj = EffectsList[i];
    uiControls[name] = parseUIElement(obj);
})

console.log(uiControls)


// let parsersWithTransform = {};

// function addParseTransform(schema) {
//     if (schema._def.typeName === "ZodLiteral") return null; // maybe will add other things to skip
//     const cleanSchema = getCleanedSchema(schema);

//     const uiTypeName = cleanSchema.description.name;
//     schema = schema.transform(value => ({ value, type: cleanSchema.description.name }))
//     let res;
//     switch (uiTypeName) {
//         case "object":
//             res = Object.fromEntries(
//                 Object.entries(cleanSchema.shape).map(
//                     ([k, v]) => [k, parseUIElement(v)]
//                 )
//             )
//             break;

//         case "array":
//             res = cleanSchema.element.options.map(elem => parseUIElement(elem));
//             break;

//         default:
//             res = {
//                 uiElement: uiControlsMap[uiTypeName],
//                 params: cleanSchema.description
//             };
//             break;
//     }
//     return {
//         type: uiTypeName,
//         value: res
//     }
// }

// console.log(EffectsList);



// const uiEffectParsers = {};
// effectNames.forEach((name, i) => {
//     const obj = EffectsList[i];
//     uiEffectParsers[name] = parseUIElement(obj);
// })



// console.log(uiControls)
