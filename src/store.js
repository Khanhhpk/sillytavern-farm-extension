export const NS = "star_tavern_farm";
export const extensionName = "sillytavern-farm-extension";
export const RUNTIME_KEY = '__STAR_TAVERN_FARM__';

export const ctx = {
    extension_settings: {},
    eventSource: null,
    event_types: null,
    saveSettingsDebounced: null,
    generateRaw: null,
    S: null,
    ui: null,
    orb: null,
    win: null,
    bagWin: null,
    passWin: null,
    shopWin: null,
    msg: null,
    saveTimer: null,
    witchTimer: null
};

export const setExtensionContext = (params) => {
    Object.assign(ctx, params);
};
