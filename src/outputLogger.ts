import * as path from 'path';
import * as vscode from 'vscode';
import * as util from 'util' // has no default export

import { userSettings } from "./UserSettings";


export class Logger {
    private outputChannel: vscode.OutputChannel;
    private logDump: [Record<string, unknown>];


    constructor(extensionOuputName: string) {
        this.outputChannel = vscode.window.createOutputChannel(extensionOuputName);
        this.outputChannel.show(true);
    }

    public append(o: any) {
        // const prefix = `[${new Date().toLocaleString()}]`;

        if (o.constructor === Array) {
            o.forEach(item => this.append(item));
        }
        else {

            // this.outputChannel.append(prefix + ' ');
            const isObject = (typeof o === 'object' && o !== null);
            //be carefull stringify can not convert circular dependencies
            //this.outputChannel.appendLine(isObject ? JSON.stringify(o) : o);
            this.outputChannel.appendLine(isObject ? util.inspect(o, { compact: false }) : o);
        }
    }

    public getLogger(baseName: string) {

        baseName = path.basename(baseName).toUpperCase().toString()
        return (...params) => {

            // 1. Convert args to a normal array
            var args = Array.prototype.slice.call(params);

            // 2. Prepend log prefix log string
            args.unshift(baseName + ": ");

            // if (process.env.NODE_ENV !== "dev") return () => { };
            console.log.apply(console, args);

            // 3. Save logs for something
            if (userSettings.getSettings()["vkmask.keep-logs"].value)
                this.logDump.push({ "timestamp": (new Date()).getTime(), "value": args });

            if (userSettings.getSettings()["vkmask.output-channel"].value)
                this.append(args)

        }
    }
}

export const outputlogger = new Logger("vkmask")