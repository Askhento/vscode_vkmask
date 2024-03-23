/** Dispatch event on click outside of node */
export function clickOutside(node) {
    const handleClick = (event) => {
        // console.log(event.target);
        if (node && !node.contains(event.target) && !event.defaultPrevented) {
            node.dispatchEvent(new CustomEvent("click_outside", node));
        }
    };

    const handleBlur = (event) => {
        // console.log("weee blur!");
        node.dispatchEvent(new CustomEvent("click_outside", node));
    };

    window.addEventListener("blur", handleBlur, true);
    document.addEventListener("click", handleClick, true);

    return {
        destroy() {
            window.removeEventListener("blur", handleBlur, true);
            document.removeEventListener("click", handleClick, true);
        },
    };
}
