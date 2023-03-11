import { effectNames, effectDefaults, uiDescriptions } from "../../../src/ztypes.js";

import TextControl from "./TextControl.svelte";
import NumberSliderControl from "./NumberSliderControl.svelte";
import SwitchControl from "./SwitchControl.svelte";
import FilePickerControl from './FilePickerControl.svelte'
import OptionsControl from "./OptionsControl.svelte";


export const uiControlsMap = {
    [uiDescriptions.bool]: SwitchControl,
    [uiDescriptions.number]: NumberSliderControl,
    [uiDescriptions.filepath]: TextControl,
    [uiDescriptions.text]: TextControl,
    [uiDescriptions.enum]: OptionsControl
}

export let uiControls = {};

for (const effectName in effectDefaults) {
    const { data, type } = effectDefaults[effectName];
    const shape = type.shape;
    uiControls[effectName] = {};

    for (const field in shape) {
        let element = shape[field].removeDefault ? shape[field].removeDefault() : shape[field];

        if (!element.description) continue;
        const desc = element.description;
        // console.log(desc)
        if (desc in uiControlsMap) {
            uiControls[effectName][field] = uiControlsMap[desc];
            console.log(field, desc)
        }
        // console.log(`${field} : ${element.description}`);


    }
}



console.log(uiControls)
