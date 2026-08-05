import { ctx } from './store.js';
import * as All from './all.js';

import { tick, toggleWin } from './windows.js';
import { heartbeat, setInjection, renderTimeout } from './events.js';
import { wander, petSleepT, endScene, petHopT } from './pets.js';
import { save } from './state.js';
import { toastTimer } from './witch.js';
import { disposers, resizeTimer } from './orb.js';
import { root } from './ui.js';
import { RUNTIME_KEY } from './store.js';

/* ---------- Huỷ (C11 §8) ---------- */
let destroyed = false;
export function resetDestroyed() { destroyed = false; }
export function destroy() {
  if (destroyed) return; destroyed = true;
  try { if (tick) window.clearInterval(tick); } catch (e) {}
  try { window.clearInterval(heartbeat); } catch (e) {}
  try { window.clearInterval(wander); } catch (e) {}
  try { Object.keys(petHopT).forEach(k => window.clearTimeout(petHopT[k])); } catch (e) {}
  try { Object.keys(petSleepT).forEach(k => window.clearTimeout(petSleepT[k])); } catch (e) {}
  try { endScene(); } catch (e) {}
  try { if (ctx.saveTimer) { clearTimeout(ctx.saveTimer); save(true); } } catch (e) {}
  try { if (toastTimer) window.clearTimeout(toastTimer); } catch (e) {}
  try { if (resizeTimer) window.clearTimeout(resizeTimer); } catch (e) {}
  try { if (renderTimeout) window.clearTimeout(renderTimeout); } catch (e) {}
  while (disposers.length) { try { disposers.pop()(); } catch (e) {} }
  try { setInjection(''); } catch (e) {}
  try { root.remove(); } catch (e) {}
  try { if (extMenuBtn) extMenuBtn.remove(); } catch (e) {}
  try { delete window[RUNTIME_KEY]; } catch (e) {}
}

// Thêm nút mở nông trại vào menu công cụ (magic wand) của SillyTavern
export let extMenuBtn = null;
export function setupExtButton() {
  if (extMenuBtn) { try { extMenuBtn.remove(); } catch(e){} }
  const extMenu = document.querySelector('#extensionsMenu');
  if (!extMenu) { window.setTimeout(setupExtButton, 500); return; }
  
  extMenuBtn = document.createElement('div');
  extMenuBtn.id = 'farm-wand-btn';
  extMenuBtn.className = 'list-group-item flex-container flexGap5 interactable';
  extMenuBtn.tabIndex = 0;
  extMenuBtn.innerHTML = '<div class="fa-fw fa-solid fa-leaf extensionsMenuExtensionButton"></div> Nông Trại';
  extMenuBtn.style.cursor = 'pointer';

  extMenuBtn.addEventListener('click', toggleWin);
  extMenu.appendChild(extMenuBtn);
}

export function setupSlashCommand() {
  // Đăng ký lệnh chat /farm
  (async function() {
    try {
      let scp, SlashCommand;
      try {
        // @ts-ignore
        scp = (await import('../../../slash-commands/SlashCommandParser.js')).SlashCommandParser;
        // @ts-ignore
        SlashCommand = (await import('../../../slash-commands/SlashCommand.js')).SlashCommand;
      } catch (err) {}
      
      // @ts-ignore
      scp = scp || window.SlashCommandParser || globalThis.SlashCommandParser;
      // @ts-ignore
      SlashCommand = SlashCommand || window.SlashCommand || globalThis.SlashCommand;

      if (scp && SlashCommand && SlashCommand.fromProps) {
        scp.addCommandObject(SlashCommand.fromProps({
            name: 'farm',
            callback: async () => { toggleWin(); return ''; },
            helpString: 'Mở/Đóng giao diện Nông trại (SillyTavern Farm)'
        }));
      }
    } catch(e) {
      console.error('[Farm] Lỗi đăng ký lệnh /farm:', e);
    }
  })();
}
