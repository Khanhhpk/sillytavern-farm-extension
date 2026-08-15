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


if (typeof window !== 'undefined') {
    window['testTribulation'] = () => {
        if (ctx.S) {
            ctx.S.coins = 2500000000;
            ctx.S.needsTribulationCheck = true;
            delete ctx.S.blockedUntil;
            if (ctx.saveSettingsDebounced) ctx.saveSettingsDebounced();
            console.log('✅ Đã giả lập mốc tài sản 2.5 Tỷ và ép chạy sự kiện Thiên Kiếp! Hãy bấm vào quả cầu Nông Trại để xem.');
        } else {
            console.log('❌ Nông trại chưa được tải (ctx.S null). Hãy mở game một lần trước.');
        }
    };

    window['testPoorTribulation'] = () => {
        if (ctx.S) {
            ctx.S.needsPoorTribulationNotice = true;
            delete ctx.S.blockedUntil;
            if (ctx.saveSettingsDebounced) ctx.saveSettingsDebounced();
            console.log('✅ Đã giả lập người nghèo gặp Thiên Đạo! Hãy bấm vào quả cầu Nông Trại để xem.');
        } else {
            console.log('❌ Nông trại chưa được tải (ctx.S null). Hãy mở game một lần trước.');
        }
    };


}
