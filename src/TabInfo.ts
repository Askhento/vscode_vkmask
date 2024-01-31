import { ViewIds } from "./types";

export class TabInfo {
    public info = {};

    constructor() {
        for (const viewId of Object.values(ViewIds)) {
            this.info[viewId] = {};
        }
    }

    public get(viewId: string) {
        if (!(viewId in this.info)) {
            console.log(`TabInfo : viewId not in our list : ${viewId}`);
            return null;
        }
        return this.info[viewId];
    }

    public set(viewId: string, value: unknown) {
        if (!(viewId in this.info)) {
            console.log(`TabInfo : viewId not in our list : ${viewId}`);
            return;
        }
        this.info[viewId] = value;
    }
}
