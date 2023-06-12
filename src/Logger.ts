import * as path from 'path';
import * as vscode from 'vscode';
import * as util from 'util' // has no default export
import * as fs from 'fs';
import { jsonPrettyArray } from './utils/jsonStringify';

import { userSettings } from "./UserSettings";

type LogEntry = {
    timestamp: number,
    value: unknown
}

export class Logger {
    private outputChannel: vscode.OutputChannel;
    private logDump: Array<LogEntry> = [];
    private useOutputChannel = false;
    private keepLogs = false;

    constructor(extensionOuputName: string) {
        this.outputChannel = vscode.window.createOutputChannel(extensionOuputName);

        const useOutputChannelSection = "vkmask.output-channel"
        this.useOutputChannel = !!userSettings.getSettings()[useOutputChannelSection]?.value;
        this.updateChannelVisibility();

        userSettings.on(`configChanged:${useOutputChannelSection}`, (section) => {
            this.useOutputChannel = section.value;
            this.updateChannelVisibility();
        })

        const keepLogsSection = "vkmask.keep-logs"
        this.keepLogs = !!userSettings.getSettings()[keepLogsSection]?.value;

        userSettings.on(`configChanged:${keepLogsSection}`, (section) => {
            this.keepLogs = section.value;
            // console.log("kkeep", this.keepLogs)
        })


    }

    updateChannelVisibility() {
        if (this.useOutputChannel)
            this.outputChannel.show(true);
        else
            this.outputChannel.hide();
    }

    public append(prefix: string, o: any) {
        // const prefix = `[${new Date().toLocaleString()}]`;

        this.outputChannel.appendLine(prefix + ": " + util.inspect(o, { compact: false }));

    }

    // public getLogger(baseName: string) {


    // }
    public log(baseName: string, ...params: unknown[]) {
        baseName = path.basename(baseName).toUpperCase().toString()

        //  Convert args to a normal array
        const args = Array.prototype.slice.call(params);

        const newArgs = [baseName + ": ", ...args]
        // if (process.env.NODE_ENV !== "dev") return () => { };
        console.log.apply(console, newArgs);

        //  Save logs for something
        if (this.keepLogs)
            this.logDump.push({ timestamp: (new Date()).getTime(), value: newArgs });

        if (this.useOutputChannel)
            this.append(baseName, args)

    }

    public dumpLogs(webviewLogDump: LogEntry[], dumpPath: string) {

        // combining multiple dumps into one, based on timestamp

        // console.log("Delete", webviewLogDump)
        // console.log("Delete", this.logDump)

        // return;
        const dumps = [...this.logDump, ...webviewLogDump]
        const fullLogDump = dumps.sort((a: LogEntry, b: LogEntry) => a.timestamp - b.timestamp);

        vscode.window.showInformationMessage('Dumping logs to ' + dumpPath);

        const jsonDump = jsonPrettyArray(fullLogDump, "\t");
        const jsonDumpPath = path.join(dumpPath, "logDump.json");
        fs.writeFileSync(jsonDumpPath, jsonDump, { encoding: 'utf-8' })

        vscode.workspace.openTextDocument(jsonDumpPath).then(document => {
            return vscode.window.showTextDocument(document)
        })
    }
}

export const logger = new Logger("vkmask")
// export const getLogger = outputlogger.getLogger;