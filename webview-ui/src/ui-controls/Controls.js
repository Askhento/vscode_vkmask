import { effectNames, effectDefaults, uiDescriptions } from "../../../src/ztypes.js";

import TextControl from "./TextControl.svelte";
import NumberSliderControl from "./NumberSliderControl.svelte";
import SwitchControl from "./SwitchControl.svelte";
import FilePickerControl from './FilePickerControl.svelte'
import OptionsControl from "./OptionsControl.svelte";
import ColorPickerControl from './ColorPickerControl.svelte'


export const uiControlsMap = {
    [uiDescriptions.bool({}).name]: SwitchControl,
    [uiDescriptions.numberSlider({}).name]: NumberSliderControl,
    [uiDescriptions.filepath({}).name]: TextControl,
    [uiDescriptions.text({}).name]: TextControl,
    [uiDescriptions.enum({}).name]: OptionsControl,
    [uiDescriptions.color({}).name]: ColorPickerControl,
    [uiDescriptions.colorAlpha({}).name]: ColorPickerControl
}

export let uiControls = {};

for (const effectName in effectDefaults) {
    const { data, type } = effectDefaults[effectName];
    const shape = type.shape;
    uiControls[effectName] = {};

    for (const field in shape) {
        let element = shape[field].removeDefault ? shape[field].removeDefault() : shape[field];
        console.log(`${field} : ${element.description}`);

        if (!element.description) continue;
        const key = element.description.name;
        if (key in uiControlsMap) {
            uiControls[effectName][field] = uiControlsMap[key];
        }
    }
}



console.log(uiControls)
