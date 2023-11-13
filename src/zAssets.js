import { z } from "zod";

import { uiDescriptions } from "./ztypes.js";

const ZStringArray = z.string();

const ZMaterialAsset = z.object({});

// {
// 	"techniques": [
// 		{
// 			"name": "Techniques/NoTextureUnlit.xml",
// 			"quality": 0,
// 			"loddistance": 0.0
// 		}
// 	],
// "textures": {
//     "normal": "Textures/Normal.png",
//     "diffuse": "Textures/Normal.jpg"
// },
// 	"shaderParameters": {
// 		"UOffset": "1 0 0 0",
// 		"VOffset": "0 1 0 0",
// 		"MatDiffColor": "1 0 1 1",
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
