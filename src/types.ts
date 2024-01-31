export const ViewIds = {
    parameters: "vkmask.parameters",
    assetsManager: "vkmask.assetsManager",
    effects: "vkmask.effects",
    plugins: "vkmask.plugins",
    projectManager: "vkmask.projectManager",
    liquifiedWarpEditor: "vkmask.liquifiedWarpEditor",
} as const;

export const RequestTarget = {
    ...ViewIds,
    control: "control",
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
    showLiquifiedWarpEditor: "showLiquifiedWarpEditor", // ? showWebviewPanel instead

    readAsset: "readAsset",
    writeAsset: "writeAsset",
    renameAsset: "renameAsset",
    getCreatedAssets: "getCreatedAssets",
    getUploadedAsset: "getUploadedAsset",
    removeAsset: "removeAsset",

    getUploadedAsset: "getUploadedAsset",

    getLocalization: "getLocalization",

    getTabInfo: "getTabInfo",
    updateTabInfo: "updateTabInfo",

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
    // maskSettings: "MASKSETTINGS",
    empty: "EMPTY",
} as const;

type ObjValues<T> = T[keyof T];
// type SelectionType = ObjValues<typeof SelectionType>;

// ?? meh (
export interface Selection {
    type: ObjValues<typeof SelectionType>;
    id?: number;
    path?: string;
    assetType?: string;
    baseName?: string;
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

export const AssetTypes = {
    xml_material: "xml_material",
    json_material: "json_material",
    model3d: "model3d",
    image: "image",
};

export interface Asset {
    baseName: string;
    absPath: string;
    extension: string;
    path: string;
    type: string;
    projectFile?: boolean;
    preview?: string;
}
