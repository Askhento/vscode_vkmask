import { debounce } from "../utils/debounce";
export function scrollAttributeDebounced(node) {
    const handleScroll = debounce(() => {
        node.dataset.scroll = window.scrollY;
    });

    document.addEventListener("scroll", handleScroll, true);

    // initial store
    handleScroll();

    return {
        destroy() {
            document.removeEventListener("scroll", handleScroll, true);
        },
    };
}
