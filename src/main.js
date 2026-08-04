import { ctx, RUNTIME_KEY, setExtensionContext } from './store.js';
import * as All from './all.js';
import { warmUpCache } from './graphics.js';
import { CROPS } from './data.js';

export function initFarm() {
  try { window[RUNTIME_KEY]?.destroy?.(); } catch(e) {}
  // Removed document.getElementById('star-tavern-farm-root')?.remove(); because it removes the DOM created on module load.

  All.loadState();
  All.applyTheme();
  All.placeOrb();
  All.initEvents();
  console.log('Farm initialized');
}

export async function init() {
  try {
    let context = null;
    try { context = window.SillyTavern?.getContext?.(); } catch (_) {}
    if (!context) try { context = globalThis.SillyTavern?.getContext?.(); } catch (_) {}
    if (!context) context = {};

    let ext_set = context.extensionSettings || context.extension_settings || window.extension_settings || {};
    let save_set = context.saveSettingsDebounced || window.saveSettingsDebounced || (() => {});
    let ev_src = context.eventSource || window.eventSource;
    let ev_types = context.event_types || context.eventTypes || window.event_types;
    let gen_raw = context.generateRaw || window.generateRaw;

    setExtensionContext({
        extension_settings: ext_set,
        saveSettingsDebounced: save_set,
        eventSource: ev_src,
        event_types: ev_types,
        generateRaw: gen_raw
    });

    console.log('[Farm] ST Context kết nối thành công');
  } catch (e) {
    console.error('[Farm] Lỗi khi kết nối ST Context:', e);
    let ext_set = window.extension_settings || {};
    let save_set = window.saveSettingsDebounced || (() => {});
    let ev_src = window.eventSource;
    let ev_types = window.event_types;
    let gen_raw = window.generateRaw;
    
    setExtensionContext({
        extension_settings: ext_set,
        saveSettingsDebounced: save_set,
        eventSource: ev_src,
        event_types: ev_types,
        generateRaw: gen_raw
    });
  }

  initFarm();
  warmUpCache(CROPS);
}
