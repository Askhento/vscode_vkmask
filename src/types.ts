// ??? seems like that using typescript should be everywhere
export const ViewIds = {
    inspector: "vkmask.inspector",
    assetsManager: "vkmask.assets_manager",
    main: "vkmask.main",
};

export const RequestTarget = {
    ...ViewIds,
    extension: "extension",
    all: "all",
};

export const RequestCommand = {
    getEffects: "getEffects",
    getPlugins: "getPlugins",
    getAssets: "getAssets",
    getSettings: "getSettings",
    getMaskSettings: "getMaskSettings",
    getSelection: "getSelection",

    updateAssets: "updateAssets",
    updateSettings: "updateSettings",
    updateMaskSettings: "updateMaskSettings",
    updateEffects: "updateEffects",
    updatePlugins: "updatePlugins",
    updateSelection: "updateSelection",
};

export const AppStates = {
    LOADING: 0,
    RUNNING: 1,
    WELCOME: 2,
    ERROR: 3,
};

export const SelectionType = {
    effect: "EFFECT",
    plugin: "PLUGIN",
    asset: "ASSET",
    maskSettings: "MASKSETTINGS",
    empty: "EMPTY",
} as const;

type ObjValues<T> = T[keyof T];
type SelectionType = ObjValues<typeof SelectionType>;

export interface Selection {
    type: SelectionType;
    id?: number;
}
