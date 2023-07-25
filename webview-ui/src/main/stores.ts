import { SelectionType } from "../../../src/types";
import type { Selection } from "../../../src/types";
import { writable } from "svelte/store";

export const effects = writable();
export const selection = writable<Selection>({ type: SelectionType.empty });
