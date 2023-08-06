// ??? seems like that using typescript should be everywhere
export const ViewIds = {
    inspector: "vkmask.inspector",
    assetsManager: "vkmask.assets_manager",
    effects: "vkmask.effects",
    plugins: "vkmask.plugins",
    maskSettings: "vkmask.mask_settings",
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

    updateAssets: "updateAssets",
    updateSettings: "updateSettings",
    updateMaskSettings: "updateMaskSettings",
    updateEffects: "updateEffects",
    updatePlugins: "updatePlugins",
    updateSelection: "updateSelection",
    updateAppState: "updateAppState",
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

export interface Error {
    type: ObjValues<typeof ErrorType>;
    value?: any;
}
