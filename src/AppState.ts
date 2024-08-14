import { logger } from "./Logger";
import type { LogEntry } from "./Logger";
const print = (...args: any) => logger.log(__filename, ...args);
import * as vscode from "vscode";
import { AppStates, AppError, AppState } from "./types";

export class AppStateManager {
    private static instance: AppStateManager;
    private _state: AppState;

    constructor(
        private readonly _context: vscode.ExtensionContext,
        private readonly _onSet: Function
    ) {
        if (AppStateManager.instance) return AppStateManager.instance;
        AppStateManager.instance = this;
        return this;
    }

    public set state(newState: AppState) {
        this._state = newState;
        vscode.commands.executeCommand("setContext", "vk-mask-editor.appState", this._state.state);

        this._onSet?.();
    }

    public get state() {
        return this._state;
    }
}
