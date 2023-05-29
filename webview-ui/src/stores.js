import { writable } from 'svelte/store';

export const effects = writable();


export const selection = writable();

export const controls = writable();

export const assets = writable([]);

export const logDump = writable();
logDump.set([])

export const userSettings = writable();