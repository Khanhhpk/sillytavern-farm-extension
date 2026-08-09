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

window.resetNaoya = () => {
    let s = ctx.S;
    if (s.pets) s.pets = s.pets.filter(p => p !== 'naoyaSlime');
    if (s.hero && s.hero.roster) delete s.hero.roster.naoyaSlime;
    if (s.achiv && s.achiv.naoya) s.achiv.naoya.claimed = false;
    if (typeof ctx.saveSettingsDebounced === 'function') ctx.saveSettingsDebounced();
    console.log('✅ Đã reset Naoya thành công. Hãy F5 tải lại trang!');
};
