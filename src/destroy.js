import { ctx } from './store.js';
import * as All from './all.js';
import { BLOCK_PRICE_PG, WEATHERS, TEST_MODE, DAY_MS, CROPS, GROW, MIN, REGROW, FERTS, WATER_CD, REGROW_MAX, POKE_CD, TREASURE_CD, PETS_OUT_MAX, WITCH_STAY, witchGap, SNAP_EDGE, ZONE_NAME } from './data.js';
import { mulberry32, petSVG, spriteSVG, tileURI, warmUpCache, PETS, PASSES, P, LP, PET_P } from './graphics.js';
import { tick } from './windows.js';
import { heartbeat, setInjection } from './events.js';
import { wander, petSleepT, endScene, petHopT } from './pets.js';
import { toggleWin } from './windows.js';
import { save } from './state.js';
import { toastTimer } from './witch.js';
import { disposers } from './orb.js';
import { root } from './ui.js';
import { RUNTIME_KEY } from './store.js';

/* ---------- Huỷ (C11 §8) ---------- */
let destroyed = false;
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
        scp = (await import('../../../slash-commands/SlashCommandParser.js')).SlashCommandParser;
        SlashCommand = (await import('../../../slash-commands/SlashCommand.js')).SlashCommand;
      } catch (err) {}
      
      scp = scp || window.SlashCommandParser || globalThis.SlashCommandParser;
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
