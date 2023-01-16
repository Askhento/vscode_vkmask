
// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.
(function () {
    const vscodeWeb = acquireVsCodeApi();

    // const oldState = vscodeWeb.getState() || { effects: [] };

    /** @type {Array<{ value: string }>} */
    // let effects = oldState.effects;
    let effects = [];

    // updateColorList(colors);

    // document.querySelector('.add-color-button').addEventListener('click', () => {
    //     addColor();
    // });



    // Handle messages sent from the extension to the webview
    window.addEventListener('message', event => {
        const message = event.data; // The json data that the extension sent
        console.log(message)
        switch (message.type) {
            // case 'addColor':
            //     {
            //         addColor();
            //         break;
            //     }
            // case 'clearColors':
            //     {
            //         console.log("clearing colors")
            //         colors = [];
            //         updateColorList(colors);
            //         break;
            //     }
            case 'updateEffects':
                {
                    console.log("updatingEffects")
                    effects = [];
                    updateEffects(message.effects);
                    break;
                }

        }
    });

    function updateEffects(effects) {
        const ul = document.querySelector('.color-list');
        ul.textContent = '';
        console.log("main.js update effects \n")
        console.log(effects)
        for (const effect of effects) {
            const li = document.createElement('li');
            li.className = 'color-preview';
            li.textContent = effect.name;
            li.addEventListener('click', (e) => {
                const value = e.target;
                // console.log(value);
                // console.log(vscodeWeb)
                vscodeWeb.postMessage({ type: 'effect-clicked', value: effect });

            });

            ul.appendChild(li);

        }
    }

    // /**
    //  * @param {Array<{ value: string }>} colors
    //  */
    // function updateColorList(colors) {
    //     const ul = document.querySelector('.color-list');
    //     ul.textContent = '';
    //     for (const color of colors) {
    //         const li = document.createElement('li');
    //         li.className = 'color-entry';

    //         const colorPreview = document.createElement('div');
    //         colorPreview.className = 'color-preview';
    //         colorPreview.style.backgroundColor = `#${color.value}`;
    //         colorPreview.addEventListener('click', () => {
    //             onColorClicked(color.value);
    //         });
    //         li.appendChild(colorPreview);

    //         const input = document.createElement('input');
    //         input.className = 'color-input';
    //         input.type = 'text';
    //         input.value = color.value;
    //         input.addEventListener('change', (e) => {
    //             const value = e.target.value;
    //             if (!value) {
    //                 // Treat empty value as delete
    //                 colors.splice(colors.indexOf(color), 1);
    //             } else {
    //                 color.value = value;
    //             }
    //             updateColorList(colors);
    //         });
    //         li.appendChild(input);

    //         ul.appendChild(li);
    //     }

    //     // Update the saved state
    //     vscodeWeb.setState({ colors: colors });
    // }

    // /** 
    //  * @param {string} color 
    //  */
    // function onColorClicked(color) {
    //     vscodeWeb.postMessage({ type: 'colorSelected', value: color });
    // }

    // /**
    //  * @returns string
    //  */
    // function getNewCalicoColor() {
    //     const colors = ['020202', 'f1eeee', 'a85b20', 'daab70', 'efcb99'];
    //     return colors[Math.floor(Math.random() * colors.length)];
    // }

    // function addColor() {
    //     colors.push({ value: getNewCalicoColor() });
    //     updateColorList(colors);
    // }
}());
