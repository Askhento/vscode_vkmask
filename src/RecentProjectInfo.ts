import * as vscode from "vscode";
import { posix as path } from "path";
import * as fs from "fs";
import slash from "slash";
import { trueCasePathSync } from "./utils/trueCasePathSync";

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

    //? #bug need to compare paths with path.relative ?
    async addInfo(newPath: string) {
        if (!fs.existsSync(newPath)) {
            console.log(`RecentProjectInfo  addInfo: ${newPath} don't exist`);
            return;
        }
        const oldInfo = await this.getInfo();

        const name = path.basename(newPath);
        const newEntry: RecentProjectInfo = {
            name,
            path: newPath,
            dateModified: new Date().getTime(),
        };

        newInfo.push(newEntry);

        return this.updateInfo(newInfo);
    }

    // async updateExist() {
    //     const oldInfo = await this.getInfo();
    //     let newInfo = oldInfo.filter((info) => fs.existsSync(info.path));
    //     await this.updateInfo(newInfo);
    // }

    static async processInfo(storedInfo: RecentProjectInfo[]) {
        let newInfo = storedInfo
            .map((info) => {
                info.path = path.normalize(info.path);
                info.path = slash(trueCasePathSync(fs.realpathSync(info.path)));
                info.name = path.basename(info.path);
                return info;
            })
            .filter((info) => {
                console.log(fs.existsSync(info.path), info.path);
                const maskJsonFile = path.join(info.path, "mask.json");

                return fs.existsSync(maskJsonFile);
            })
            .sort((a, b) => b.dateModified - a.dateModified);

        let uniqueInfo = [];
        outerLoop: for (let i = 0; i < newInfo.length - 1; i++) {
            const nextInfo = newInfo[i];

            for (let j = 0; j < uniqueInfo.length; j++) {
                const unique = uniqueInfo[j];

                console.log(unique.path, nextInfo.path, path.relative(unique.path, nextInfo.path));
                if (path.relative(unique.path, nextInfo.path) === "") {
                    continue outerLoop;
                }
            }

            uniqueInfo.push(nextInfo);
        }

        uniqueInfo = uniqueInfo.slice(0, this.maxInfoCount);

        return uniqueInfo;
    }

    async getInfo(): RecentProjectInfo[] {
        let storedInfo = await this.context.globalState.get(this.infoStorageKey);
        if (storedInfo === undefined) storedInfo = [];
        const processedInfo = RecentProjects.processInfo(storedInfo);
        return processedInfo;
    }

    async updateInfo(newInfo: RecentProjectInfo[]) {
        const processedInfo = RecentProjects.processInfo(newInfo);
        return this.context.globalState.update(this.infoStorageKey, processedInfo);
    }

    async clearInfo() {
        return this.updateInfo([]);
    }
}
