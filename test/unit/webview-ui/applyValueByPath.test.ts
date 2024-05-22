import { expect, test, vi, beforeEach } from "vitest";
import { applyValueByPath2 } from "../../../src/webview-ui/utils/applyValueByPath";

let obj;

beforeEach(() => {
    obj = {
        effects: [
            {
                name: "lol",
                color: [1, 2, 3],
            },
        ],
    };
});

test("null_obj_key", async () => {
    const newObj = applyValueByPath2(obj, ["effects", 0, "name"], null);
    console.log(JSON.stringify(newObj, null, "  "));

    expect(newObj).toMatchObject({
        effects: [
            {
                color: [1, 2, 3],
            },
        ],
    });
});

test("null_array_elem", async () => {
    const newObj = applyValueByPath2(obj, ["effects", 0, "color", 1], null);
    console.log(JSON.stringify(newObj, null, "  "));

    expect(newObj).toMatchObject({
        effects: [
            {
                name: "lol",
                color: [1, 3],
            },
        ],
    });
});

test("create_deep_nested_missing_path", async () => {
    const newObj = applyValueByPath2(
        obj,
        ["effects", 0, "texture", "animation", "timeline"],
        [1, 2, 40]
    );
    console.log(JSON.stringify(newObj, null, "  "));

    expect(newObj).toMatchObject({
        effects: [
            {
                name: "lol",
                color: [1, 2, 3],
                texture: {
                    animation: {
                        timeline: [1, 2, 40],
                    },
                },
            },
        ],
    });
});
