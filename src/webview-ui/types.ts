import type { Asset, Selection } from "src/types";
import type { ComponentProps } from "svelte";
import type { MessageHandler } from "./common/MessageHandler";
import { Writable } from "svelte/store";

export interface Info {
    clickLink?: string;
    infoList?: string;
    infoHeader: string;
    infoBody?: string;
}

export interface BaseControlParameters {
    name: string;
    label: string;
    group?: string;
    groupExpanded?: boolean;
    defValue?: unknown;
    info: Info;
    dependencies: ControlDependency[];
}

type ControlPath = (string | number)[];

export interface BaseControlAPI<T extends BaseControlParameters = BaseControlParameters> {
    value: unknown;
    path: ControlPath;
    disabled?: boolean;
    params: T;
    runtimeInfo: {
        errors: string[];
        warnings: string[];
    };
}

export interface DataStores {
    assets: Writable<Asset[]>;
    settings: Writable<{}>;
    messageHandler: MessageHandler;
    allTags: Writable<Set<string>>;
    effects: Writable<any[]>;
    plugins: Writable<any[]>;
    selection: Writable<Selection>;
    tabInfo: Writable<Record<string, boolean>>;
    viewId: string;
}

export type ControlDataStores =
    | "assets"
    | "settings"
    | "messageHandler"
    | "allTags"
    | "effects"
    | "plugins"
    | "selection"
    | "tabInfo";

export interface ControlDependency {
    source: ControlDataStores;
    relPath: ControlPath;
    postprocess: (value: unknown, component: any, previous: unknown) => any;
}

export interface NumberSliderControlParameters extends BaseControlParameters {
    min?: number;
    max?: number;
    steps?: number;
    valueLabel?: string;
    valueTemplate?: (unknown) => string;
}

export interface FilePickerControlParameters extends BaseControlParameters {
    directory: string[];
    extensions: string[];
    types: string[];
    typeName: string;
}
