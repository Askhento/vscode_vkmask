
// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.
(function () {
    const vscodeWeb = acquireVsCodeApi();

    // const oldState = vscodeWeb.getState() || { effects: [] };

    let currentElementAfter;

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
            li.addEventListener('dragstart', () => {
                li.classList.add("dragging")
            })

            li.addEventListener('dragend', () => {
                li.classList.remove("dragging")

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
