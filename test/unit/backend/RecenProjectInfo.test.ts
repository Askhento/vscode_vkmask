import { expect, test, vi, beforeEach } from "vitest";
import { RecentProjectInfo, RecentProjects } from "../../../src/RecentProjectInfo";
let infoMoch: RecentProjectInfo[];
beforeEach(() => {
    infoMoch = [
        {
            name: "model3d",
            path: "f:/PROJECTOS_SSD/urhovk/templates-test/model3d",
            dateModified: 1719489813053,
        },
        {
            name: "222",
            path: "f:/PROJECTOS_SSD/urhovk/222",
            dateModified: 1719184278429,
        },
        {
            name: "f:\\PROJECTOS_SSD\\urhovk\\templates-test\\model3d",
            path: "f:\\PROJECTOS_SSD\\urhovk\\templates-test\\model3d",
            dateModified: 1718230021023,
        },
        {
            name: "123",
            path: "f:/PROJECTOS_SSD/urhovk/123",
            dateModified: 1714426877845,
        },
        {
            name: "bbee",
            path: "f:/PROJECTOS_SSD/urhovk/bbee",
            dateModified: 1714417137463,
        },
        {
            name: "test",
            path: "f:/PROJECTOS_SSD/urhovk/Test", // !!!! case
            dateModified: 1714156852898,
        },
        {
            name: "bbee",
            path: "/PROJECTOS_SSD/urhovk/bbee",
            dateModified: 1713378304924,
        },
        {
            name: "test",
            path: "/PROJECTOS_SSD/urhovk/test",
            dateModified: 1713377725791,
        },
        {
            name: "test",
            path: "f:\\PROJECTOS_SSD\\urhovk\\test",
            dateModified: 1713364542218,
        },
    ];
});

test("test_process", async () => {
    console.log("process", await RecentProjects.processInfo(infoMoch));

    // expect(newObj).toMatchObject({
    //     effects: [
    //         {
    //             color: [1, 2, 3],
    //         },
    //     ],
    // });
});
