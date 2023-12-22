export function draggable(node) {
    let moving = false;

    let cx = +node.getAttribute("cx").slice(0, -2);
    let cy = +node.getAttribute("cy").slice(0, -2);

    node.style.position = "absolute";
    node.style.cursor = "move";
    node.style.userSelect = "none";

    function handleMouseDown() {
        moving = true;
        node.setAttribute("dragged", true);
    }

    function handleMove(e) {
        if (moving) {
            cx += e.movementX;
            cy += e.movementY;
            node.setAttribute("cx", cx + "px");
            node.setAttribute("cy", cy + "px");
        }
    }

    function handleMouseUp() {
        moving = false;
        node.setAttribute("dragged", false);
    }

    node.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleMouseUp);

    return {
        update() {
            console.log("UPd");
        },
        destroy() {
            node.removeEventListener("mousedown", handleMouseDown);
            window.removeEventListener("mousemove", handleMove);
            window.removeEventListener("mouseup", handleMouseUp);
        },
    };
}
