
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

    // document.querySelector('')


    // Handle messages sent from the extension to the webview
    window.addEventListener('message', event => {
        const message = event.data; // The json data that the extension sent
        console.log(message)
        switch (message.type) {

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
        const ul = document.querySelector('.effectsList');
        ul.innerHTML = '';
        console.log("main.js update effects \n")
        console.log(effects)

        for (const effect of effects) {

            const li = document.createElement('li');
            li.textContent = effect.name;

            li.onclick = () => {
                for (let i = 0; i < ul.childElementCount; i++) {
                    ul.children[i].classList.remove("selected")
                }

                onEffectSelected(effect.id);
                li.classList.toggle("selected")
            }

            const span = document.createElement('span');
            span.className = 'icon';

            span.onclick = (e) => {
                e.stopPropagation();
                onEffectDelete(effect.id)
            }
            const icon = document.createElement('i');
            icon.className = "fas fa-trash";

            span.appendChild(icon);
            li.appendChild(span);
            ul.appendChild(li);
        }
    }


    function onEffectSelected(effectId) {
        vscodeWeb.postMessage({ type: 'effectSelected', value: effectId });
    }

    function onEffectDelete(effectId) {
        vscodeWeb.postMessage({ type: 'effectDelete', value: effectId });
    }


}());
