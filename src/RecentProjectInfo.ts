import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";

export interface RecentProjectInfo {
    name: string;
    path: string;
    dateModified: number;
}

export class RecentProjects {
    // private projectInfos: RecentProjectInfo = [];

    constructor(
        private context: vscode.ExtensionContext,
        private maxInfoCount: number = 10,
        private infoStorageKey = "vkmask.recentProjects"
    ) {}

    async addInfo(newPath: string) {
        const oldInfo = await this.getInfo();

        const name = path.basename(newPath);
        const newEntry: RecentProjectInfo = {
            name,
            path: newPath,
            dateModified: new Date().getTime(),
        };

        let newInfo = oldInfo.filter((info) => newPath !== info.path && fs.existsSync(info.path));
        newInfo.push(newEntry);
        newInfo.sort((a, b) => a.dateModified - b.dateModified);
        newInfo = newInfo.slice(0, this.maxInfoCount);

        console.log("ProjectInfo : ", newInfo);
        return this.updateInfo(newInfo);
    }

    // todo clear non existent on get
    async getInfo() {
        let info = (await this.context.globalState.get(this.infoStorageKey)) as RecentProjectInfo[];
        if (info === undefined) info = [];
        return info;
    }

    async clearInfo() {
        return this.updateInfo([]);
    }

    async updateInfo(newInfo: RecentProjectInfo[]) {
        return this.context.globalState.update(this.infoStorageKey, newInfo);
    }
}
