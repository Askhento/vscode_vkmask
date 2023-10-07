export const ViewIds = {
    inspector: "vkmask.inspector",
    assetsManager: "vkmask.assetsManager",
    effects: "vkmask.effects",
    plugins: "vkmask.plugins",
    projectManager: "vkmask.projectManager",
} as const;

export const RequestTarget = {
    ...ViewIds,
    extension: "extension",
    all: "all",
} as const;

export const RequestCommand = {
    getEffects: "getEffects",
    getPlugins: "getPlugins",
    getAssets: "getAssets",
    getSettings: "getSettings",
    getMaskSettings: "getMaskSettings",
    getSelection: "getSelection",
    getLogs: "getLogs",
    getAppState: "getAppState",
    getRecentProjectInfo: "getRecentProjectInfo",

    updateAssets: "updateAssets",
    updateSettings: "updateSettings",
    updateMaskSettings: "updateMaskSettings",
    updateEffects: "updateEffects",
    updatePlugins: "updatePlugins",
    updateSelection: "updateSelection",
    updateAppState: "updateAppState",

    showError: "showError",

    getCreatedAssets: "getCreatedAssets",
    getUploadedAsset: "getUploadedAsset",
    removeAsset: "removeAsset",

    getLocalization: "getLocalization",

    openProject: "openProject",
    createProject: "createProject",
    createConfig: "createConfig",
} as const;

export const AppState = {
    loading: "LOADING",
    running: "RUNNING",
    welcome: "WELCOME",
    error: "ERROR",
};

// enum emulation
export const SelectionType = {
    effect: "EFFECT",
    plugin: "PLUGIN",
    asset: "ASSET",
    maskSettings: "MASKSETTINGS",
    empty: "EMPTY",
} as const;

type ObjValues<T> = T[keyof T];
// type SelectionType = ObjValues<typeof SelectionType>;

export interface Selection {
    type: ObjValues<typeof SelectionType>;
    id?: number;
}

// errors
export const ErrorType = {
    configSyntax: "CONFIGSYNTAX",
    configZod: "CONFIGZOD",
    configMissing: "CONFIGMISSING",
} as const;

//? maybe  add origin of the erorr and who could solve it
export interface AppError {
    type: ObjValues<typeof ErrorType>;
    value?: any;
}
