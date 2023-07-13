import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

// import { logger } from "./logger.js";
// const print = logger(__filename);
import { EventEmitter } from "events";

interface Section  {
    type: "string",
    default: string | boolean | number,
    value: string | boolean | number,
};

class UserSettings extends EventEmitter {

    settings: Record<string, Section> = {};
    filteredSections: string[] = [];
    extensionUri: vscode.Uri | undefined;

    constructor() {
        super();
        // this.init(sections);
    }

    async init(extensionUri: vscode.Uri) {
        // this.extensionUri = extensionUri;

        this.readSections(extensionUri);

        const configuration = vscode.workspace.getConfiguration();

        this.updateSettings(this.filteredSections);
        vscode.workspace.onDidChangeConfiguration((e) => {

            const affected = this.filteredSections.filter(section => e.affectsConfiguration(section))
            // console.log("affected configs", affected);
            this.updateSettings(affected);

        })
    }

    readSections(extensionUri: vscode.Uri) {

        const configPath = path.join(extensionUri.fsPath, "package.json");
        const rawConfig = fs.readFileSync(configPath, 'utf8');

        try {
            const jsonConfig = JSON.parse(rawConfig);
            // console.log(jsonConfig)
            const props = jsonConfig.contributes.configuration.properties;
            // const { type, value, default : renameDefault }  : Section = props ;
            this.filteredSections = Object.keys(props);
            this.filteredSections.forEach((section) => {
                this.settings[section] = props[section] as Section
            })

        } catch (err) {
            console.log(err)
        }

    }


    updateSettings(sections: string[]) {
        const configuration = vscode.workspace.getConfiguration();


        sections.forEach((section) => {
            // !!!!! will  need a better type
            this.settings[section].value = configuration.get(section) ?? "empty"
            this.emitChangedSectionEvent(section)
        })
        // this.emitChangeEvent(); // @deprecated
    }

    emitChangedSectionEvent(section: string) {
        const eventType = `configChanged:${section}`;
        if (this.listenerCount(eventType))
            this.emit(eventType, this.settings[section])

    }

    /**
     * @deprecated seems kinda useless 
     */
    emitChangeEvent() {
        this.emit("configChanged", this.settings)
    }

    public getSettings() {
        return this.settings;
    }
}


// Exports class singleton to prevent multiple 
export const userSettings = new UserSettings();