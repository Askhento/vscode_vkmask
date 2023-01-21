
// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.
(function () {
    const vscodeWeb = acquireVsCodeApi();

    // const oldState = vscodeWeb.getState() || { effects: [] };



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
            case 'deselectEffects':
                {
                    deselecEffects();
                    break;
                }


        }
    });

    function updateEffectsList(effects) {
        const ul = document.querySelector('.effectsList');
        ul.innerHTML = '';
        console.log("main.js update effects \n")
        console.log(effects)

        for (const effect of effects) {

            const li = document.createElement('li');
            li.textContent = effect.name;

            console.log(effect.selected)

            if (effect.selected)
                li.classList.add("selected")
            else
                li.classList.remove("selected")

            li.onclick = () => {
                const selected = li.classList.contains("selected");
                deselecEffects();
                console.log("Seleced = " + selected);
                if (!selected) {
                    onEffectSelected(effect.id);
                    li.classList.add("selected")
                } else {
                    onEffectDeselect();
                }
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

    function deselecEffects() {
        const ul = document.querySelector('.effectsList');
        for (let i = 0; i < ul.childElementCount; i++) {
            ul.children[i].classList.remove("selected")
        }
    }

    function updateEffects(effects) {
        // document.body.onclick = (e) => {
        //     console.log("click on empty!");
        //     e.stopPropagation();
        //     onEffectDeselect();
        // }

        updateEffectsList(effects);

    }


    function onEffectDeselect() {
        vscodeWeb.postMessage({ type: 'effectDeselected', value: undefined });
    }

    function onEffectSelected(effectId) {
        vscodeWeb.postMessage({ type: 'effectSelected', value: effectId });
    }

    function onEffectDelete(effectId) {
        vscodeWeb.postMessage({ type: 'effectDelete', value: effectId });
    }


}());
