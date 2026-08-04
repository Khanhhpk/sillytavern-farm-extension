import { ctx } from './store.js';
import * as All from './all.js';
import { BLOCK_PRICE_PG, WEATHERS, TEST_MODE, DAY_MS, CROPS, GROW, MIN, REGROW, FERTS, WATER_CD, REGROW_MAX, POKE_CD, TREASURE_CD, PETS_OUT_MAX, WITCH_STAY, witchGap, SNAP_EDGE, ZONE_NAME } from './data.js';
import { mulberry32, petSVG, spriteSVG, tileURI, warmUpCache, PETS, PASSES, P, LP, PET_P } from './graphics.js';

/* ---------- Huỷ (C11 §8) ---------- */
export function destroy() {
  if (destroyed) return; destroyed = true;
  try { if (tick) pwin.clearInterval(tick); } catch (e) {}
  try { pwin.clearInterval(heartbeat); } catch (e) {}
  try { pwin.clearInterval(wander); } catch (e) {}
  try { Object.keys(petHopT).forEach(k => pwin.clearTimeout(petHopT[k])); } catch (e) {}
  try { Object.keys(petSleepT).forEach(k => pwin.clearTimeout(petSleepT[k])); } catch (e) {}
  try { endScene(); } catch (e) {}
  try { if (ctx.saveTimer) { clearTimeout(ctx.saveTimer); save(true); } } catch (e) {}
  try { if (toastTimer) pwin.clearTimeout(toastTimer); } catch (e) {}
  while (disposers.length) { try { disposers.pop()(); } catch (e) {} }
  try { setInjection(''); } catch (e) {}
  try { root.remove(); } catch (e) {}
  try { if (extMenuBtn) extMenuBtn.remove(); } catch (e) {}
  try { if (pwin[RUNTIME_KEY] === api) delete pwin[RUNTIME_KEY]; } catch (e) {}
}

// Thêm nút mở nông trại vào menu công cụ (magic wand) của SillyTavern
export let extMenuBtn = null;
export function setupExtButton() {
  if (extMenuBtn) { try { extMenuBtn.remove(); } catch(e){} }
  const extMenu = pdoc.querySelector('#extensionsMenu');
  if (!extMenu) { pwin.setTimeout(setupExtButton, 500); return; }
  
  extMenuBtn = pdoc.createElement('div');
  extMenuBtn.id = 'farm-wand-btn';
  extMenuBtn.className = 'list-group-item flex-container flexGap5 interactable';
  extMenuBtn.tabIndex = 0;
  extMenuBtn.innerHTML = '<div class="fa-fw fa-solid fa-leaf extensionsMenuExtensionButton"></div> Nông Trại';}
