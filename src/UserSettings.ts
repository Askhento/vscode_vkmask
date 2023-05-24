import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

import { logger } from "./logger";
import { EventEmitter } from "events";
const print = logger(__filename);

// todo : update settings from webview
type Section = {
    type: "string",
    default: string | boolean | number,
    value: string | boolean | number,
}

class UserSettings extends EventEmitter {

    settings: Record<string, Section> = {};
    filteredSections: string[] = [];
    extensionUri: vscode.Uri;

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
            print("affected configs", affected);
            this.updateSettings(affected);

        })
    }

    readSections(extensionUri: vscode.Uri) {

        const configPath = path.join(extensionUri.fsPath, "package.json");
        const rawConfig = fs.readFileSync(configPath, 'utf8');

        try {
            const jsonConfig = JSON.parse(rawConfig);
            // print(jsonConfig)
            const props = jsonConfig.contributes.configuration.properties;
            // const { type, value, default : renameDefault }  : Section = props ;
            this.filteredSections = Object.keys(props);
            this.filteredSections.forEach((section) => {
                this.settings[section] = props[section] as Section
            })

        } catch (err) {
            print(err)
        }

    }


    updateSettings(sections: string[]) {
        const configuration = vscode.workspace.getConfiguration();

        sections.forEach((section) => {
            this.settings[section].value = configuration.get(section)
        })
        this.emitChangeEvent();
    }

    public emitChangeEvent() {
        this.emit("configChanged", this.settings)

    }

    public getSettings() {
        return this.settings;
    }
}


// Exports class singleton to prevent multiple 
export const userSettings = new UserSettings();