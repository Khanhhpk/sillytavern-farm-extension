export const NS = "star_tavern_farm";
export const extensionName = "sillytavern-farm-extension";
export const RUNTIME_KEY = '__STAR_TAVERN_FARM__';

export const ctx = {
    extension_settings: {},
    eventSource: null,
    event_types: null,
    saveSettingsDebounced: null,
    S: null,
    ui: null,
    orb: null,
    win: null,
    saveTimer: null
};

export const setExtensionContext = (params) => {
    Object.assign(ctx, params);
};

