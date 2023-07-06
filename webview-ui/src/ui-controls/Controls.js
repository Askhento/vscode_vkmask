import {
  effectNames,
  effectDefaults,
  uiDescriptions,
  EffectsList,
  ZEffect,
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
  [uiDescriptions.array({}).name]: ArrayControl,
};

export let uiControls = {};
// export const uiParser = { _type : uiDescriptions.object({}).name};

function parseUIElement(schema) {
  if (schema._def.typeName === "ZodLiteral") return null;

  const defValue = schema._def.defaultValue ? schema._def.defaultValue() : null;
  const cleanSchema = getInnerZType(schema);
  console.log("clean chema", cleanSchema);
  const uiTypeName = cleanSchema.description.name;
  // schema = schema.transform(value => ({ value, type: cleanSchema.description.name })) // ? does it make anything
  let res;
  switch (uiTypeName) {
    case "union":
      break;

    case "object":
      res = Object.fromEntries(
        Object.entries(cleanSchema.shape).flatMap(([k, v]) => {
          if (k === "disabled") return [];
          return [[k, parseUIElement(v)]];
        })
      );
      break;

    case "array":
      res = cleanSchema.element.options.map((elem) => parseUIElement(elem));
      break;

    default:
      res = {
        uiElement: uiControlsMap[uiTypeName],
        params: { ...cleanSchema.description, default: defValue },
      };
      break;
  }
  return {
    _type: uiTypeName,
    uiDescription: res,
  };
}

// effectNames.forEach((name, i) => {
//     const obj = EffectsList[i];
//     uiControls[name] = parseUIElement(obj);
// })

console.log("old controls!", uiControls);

// // I don't know the order of zod calls so i use recursive calls
// function getInnerZType(schema) {
//     let schemaType = schema._def.typeName;
//     if (schemaType === "ZodDefault" || schemaType === "ZodOptional") {
//         return getInnerZType(schema._def.innerType);
//     } else if (schemaType === "ZodEffects") {     // this should be preprocess, but also transoform and refine
//         return getInnerZType(schema._def.schema);
//     }
//     return schema;
// }

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

      break;

    case "array":
      // schema.element is inner type for arrays
      res = z.array(addTypeToSchema(schema.element));
      //.transform(value => ({ value, uiDescription: description, uiElement: uiControlsMap[description.name] }))
      break;

    case "union":
      // case "discriminatedUnion": // ??? i don't use this union type at all !!!!
      // seems like unions are different and should not be included in ui
      res = z.union(schema.options.map((elem) => addTypeToSchema(elem)));
      return res;
      break;

    case "discriminatedUnion":
      // seems like unions are different and should not be included in ui
      // console.log("in desc union", schema.discriminator)
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

  res = z.union([res, z.null()]).default(null); // a hack to know if prop is missing

  res = res.transform((value) => ({
    value,
    uiDescription: description,
    uiElement: uiControlsMap[description.name],
  }));
  return res;
}

const testModel3d = {
  name: "model3d",
  tag: "12312;free",
  disabled: false,
  anchor: "forehead",
  model: "Models/Shine.mdl",
  material: [
    "Materials/DefaultGrey.xml",
    {
      textures: "Sometexire.png",
      parameters: [1, 0, 0, 0],
    },
  ],
  position: [0.0, 0.0, 0.0],
  rotation: [0.0, 0.0, 0.0],
  scale: [1.0, 1.0, 1.0],
};

// console.log("mat array", ZMaterialArray._def)
// console.log("desc", ZModel3dEffect.shape.rotation)
// console.log(ZModel3dEffect.shape.anchor)

export const EffectParserForUI = addTypeToSchema(ZEffect); //z.discriminatedUnion("name", EffectsList.map(effect => addTypeToSchema(effect))).array()
