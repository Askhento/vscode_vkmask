
// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.
import { effectDefaults } from "./defaults.js";

(function () {

    const vscodeWeb = acquireVsCodeApi();

    // const oldState = vscodeWeb.getState() || { effects: [] };

    let currentElementAfter;


    let effectsList = Object.keys(effectDefaults);

    const effectInputEl = document.querySelector(".add-effect-input");
    effectInputEl.addEventListener("input", (e) => {
        removeDropDownList();

        const value = effectInputEl.value.toLowerCase();

        if (value === "") return;

        const filteredElements = effectsList.filter(effect => (effect.substring(0, value.length).toLowerCase() === value));
        createEffectsDropDown(filteredElements);
    });

    effectInputEl.addEventListener("click", (e) => {
        const value = effectInputEl.value.toLowerCase();

        if (value !== "") return;

        removeDropDownList();
        createEffectsDropDown(effectsList);
    });


    function createEffectsDropDown(list) {
        const wrapper = document.querySelector("#add-effect-input-wrapper");

        const effectUL = document.createElement("ul");
        effectUL.className = "autocomplete-effects-list";
        effectUL.id = "autocomplete-effects-list";

        list.forEach(effectName => {
            const listItem = document.createElement("li");
            const effectButton = document.createElement("button");
            effectButton.innerHTML = effectName;
            effectButton.addEventListener("click", onEffectDropDownClick)

            listItem.appendChild(effectButton);
            effectUL.appendChild(listItem);
        })

        wrapper.appendChild(effectUL);
    }

    function removeDropDownList() {
        const effectUL = document.querySelector("#autocomplete-effects-list");
        if (effectUL) effectUL.remove();
    }

    function onEffectDropDownClick(e) {

        const value = e.target.innerHTML.toLowerCase();

        if (!(value in effectDefaults)) return;

        sendAddEffect(effectDefaults[value]);

        effectInputEl.value = "";
        removeDropDownList();
    }

    // const effectAddButton = document.querySelector("#add-effect-btn");
    // effectAddButton.addEventListener("click", () => {
    //     // ! should I remove add button ?
    //     const value = effectInputEl.value.toLowerCase();

    //     if (!(value in effectDefaults)) return;

    //     sendAddEffect(effectDefaults[value]);

    //     // console.log(effectDefaults[value])
    // })

    // Handle messages sent from the extension to the webview
    window.addEventListener('message', event => {
        const message = event.data; // The json data that the extension sent
        console.log(message)
        switch (message.type) {

            case 'updateEffects':
                {
                    console.log("main.js : received updatingEffects");
                    updateEffects(message.effects);
                    break;
                }
            case 'deselectEffects':
                {
                    console.log("main.js : received deselect effects");
                    // deselecEffects();
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
            li.setAttribute("effectId", effect.id);

            li.draggable = true;
            li.addEventListener('dragstart', (e) => {
                li.classList.add("dragging")
            })

            li.addEventListener('dragend', (e) => {
                li.classList.remove("dragging")
                e.stopPropagation();
                sendEffectSwap(
                    parseInt(li.getAttribute("effectId")),
                    currentElementAfter ? parseInt(currentElementAfter.getAttribute("effectId")) : undefined
                );
            })

            if (effect.selected)
                li.classList.add("selected")

            // ? add deselect  all on click in empty space

            li.onclick = () => {
                const selected = li.classList.contains("selected");
                if (!selected) {
                    sendEffectSelected(effect.id);
                } else {
                    sendEffectDeselect(effect.id);
                }
            }


            const span = document.createElement('span');
            span.className = 'icon';

            span.onclick = (e) => {
                e.stopPropagation();
                // li.remove();
                console.log("main.js : send remove " + effect.id)
                sendEffectDelete(effect.id)
            }
            const icon = document.createElement('i');
            icon.className = "fas fa-trash";

            ul.addEventListener('dragover', (e) => {
                e.preventDefault();
                const afterElement = getDragAfterElement(ul, e.clientY);
                if (currentElementAfter !== afterElement) {
                    currentElementAfter = afterElement;
                } else {
                    return;
                }

                const draggable = document.querySelector('.dragging');

                if (afterElement == null) {
                    ul.appendChild(draggable)
                } else {
                    ul.insertBefore(draggable, afterElement)
                }
            })

            span.appendChild(icon);
            li.appendChild(span);
            ul.appendChild(li);
        }
    }

    // function deselecEffects() {
    //     const ul = document.querySelector('.effectsList');
    //     for (let i = 0; i < ul.childElementCount; i++) {
    //         ul.children[i].classList.remove("selected")
    //     }
    // }

    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('li:not(.dragging)')]

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect()
            const offset = y - box.top - box.height / 2
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child }
            } else {
                return closest
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element
    }

    function updateEffects(effects) {
        // document.body.onclick = (e) => {
        //     console.log("click on empty!");
        //     e.stopPropagation();
        //     sendEffectDeselect();
        // }

        updateEffectsList(effects);

    }

    function sendAddEffect(object) {
        console.log(object);
        vscodeWeb.postMessage({ type: 'effectAdd', value: object });
    }

    function sendEffectSwap(old, after) {
        vscodeWeb.postMessage({ type: 'effectSwap', value: [old, after] });
    }

    function sendAllEffectsDeselect() {
        vscodeWeb.postMessage({ type: 'effectDeselected', value: undefined });
    }

    function sendEffectDeselect(effectId) {
        vscodeWeb.postMessage({ type: 'effectDeselected', value: effectId });
    }

    function sendEffectSelected(effectId) {
        vscodeWeb.postMessage({ type: 'effectSelected', value: effectId });
    }

    function sendEffectDelete(effectId) {
        vscodeWeb.postMessage({ type: 'effectDelete', value: effectId });
    }


}());
