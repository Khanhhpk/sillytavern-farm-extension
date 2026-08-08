import { ctx, RUNTIME_KEY, setExtensionContext } from './store.js';
import * as All from './all.js';
import { warmUpCache } from './graphics.js';
import { CROPS } from './data.js';

function initFarm() {
  try { window[RUNTIME_KEY]?.destroy?.(); } catch(e) {}
  All.resetDestroyed(); // Reset destroyed flag sau khi destroy() cũ chạy xong
  document.getElementById('star-tavern-farm-root')?.remove();

  All.loadState();
  if (All.cashOut) All.cashOut(true);                                    // Pot sót lại do F5 hoặc sập nguồn giữa ván: hoàn về ví ngay, im lặng
  All.initUI();
  All.applyTheme();
  All.initOrb();
  All.initWindows();
  All.initShop();
  All.initRender();
  All.initPets();
  All.initWitch();
  All.initEvents();
  All.initHero();

  All.setupExtButton();
  All.setupSlashCommand();

  const api = { destroy: All.destroy };
  window[RUNTIME_KEY] = api;
  window.FarmAll = All;

  All.renderToolbar();
  All.renderChips();
  All.renderBanner();
  All.renderPets();
  All.updateInjection();
  if (All.CS.link) All.requestDayEvent();

  const diag = [];
  if (ctx.S) diag.push('S');
  if (All.CS) diag.push('CS');
  if (ctx.ui) diag.push('ui');
  console.log('[Farm] ST Context kết nối thành công — ' + diag.join(', '));
  console.log('Farm initialized');
}

async function init() {
  // Guard: nếu đã khởi động rồi (ví dụ ST 1.17+ gọi lại qua hooks), bỏ qua
  if (window[RUNTIME_KEY]) return;

  try {
    let context = null;
    try { context = window.SillyTavern?.getContext?.(); } catch (_) {}
    if (!context) try { context = globalThis.SillyTavern?.getContext?.(); } catch (_) {}
    if (!context) context = {};

    let ext_set = context.extensionSettings || context.extension_settings || window.extension_settings || {};
    let save_set = context.saveSettingsDebounced || window.saveSettingsDebounced || (() => {});
    let ev_src = context.eventSource || window.eventSource;
    let ev_types = context.event_types || context.eventTypes || window.event_types;

    setExtensionContext({
        extension_settings: ext_set,
        saveSettingsDebounced: save_set,
        eventSource: ev_src,
        event_types: ev_types
    });
  } catch (e) {
    console.error('[Farm] Lỗi khi kết nối ST Context:', e);
    let ext_set = window.extension_settings || {};
    let save_set = window.saveSettingsDebounced || (() => {});
    let ev_src = window.eventSource;
    let ev_types = window.event_types;
    
    setExtensionContext({
        extension_settings: ext_set,
        saveSettingsDebounced: save_set,
        eventSource: ev_src,
        event_types: ev_types
    });
  }

  initFarm();
  warmUpCache(CROPS);

  // Failsafe watchdog: sau 10s, kiểm tra DOM root có tồn tại không
  setTimeout(() => {
    if (!document.getElementById('star-tavern-farm-root')) {
      console.warn('[Farm] Failsafe: Giao diện chưa được nạp. Thử khởi động lại extension...');
      try {
        initFarm();
        if (!document.getElementById('star-tavern-farm-root')) {
          console.error('[Farm] Failsafe: Khởi động lại thất bại, DOM root vẫn không tồn tại. Vui lòng kiểm tra quá trình nạp extension của SillyTavern.');
        } else {
          console.log('[Farm] Failsafe: Khởi động lại thành công.');
        }
      } catch (err) {
        console.error('[Farm] Failsafe: Khởi động lại gặp lỗi nghiêm trọng! Chi tiết lỗi:', err);
      }
    }
  }, 10000);
}

// Dùng jQuery document.ready — chuẩn của ST, đảm bảo settings + globals sẵn sàng.
// Guard RUNTIME_KEY trong init() chặn double-init nếu ST 1.17+ cũng gọi qua hooks.
/** @type {any} */
const jQuery = /** @type {any} */ (window).jQuery;
if (typeof jQuery === 'function') {
  jQuery(async () => { if (!window[RUNTIME_KEY]) await init(); });
} else {
  // Fallback nếu jQuery chưa load (rất hiếm): chờ DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { if (!window[RUNTIME_KEY]) init(); });
  } else {
    if (!window[RUNTIME_KEY]) init();
  }
}
