import { ctx } from './store.js';
import * as All from './all.js';
import { BLOCK_PRICE_PG, WEATHERS, TEST_MODE, DAY_MS, CROPS, GROW, MIN, REGROW, FERTS, WATER_CD, REGROW_MAX, POKE_CD, TREASURE_CD, PETS_OUT_MAX, WITCH_STAY, witchGap, SNAP_EDGE, ZONE_NAME } from './data.js';
import { mulberry32, petSVG, spriteSVG, tileURI, warmUpCache, PETS, PASSES, P, LP, PET_P } from './graphics.js';
import { layout } from './orb.js';
import { settle } from './utils.js';
import { renderAll, renderDynamic } from './render.js';
import { save } from './state.js';

/* ---------- Bật tắt / kéo cửa sổ nổi ---------- */
export let tick = null;
export function placeWin() {
  const vw = window.innerWidth, vh = window.innerHeight;
  const w = Math.min(760, vw * 0.96);
  let x = ctx.S.win ? ctx.S.win.fx * vw : (vw - w) / 2;
  let y = ctx.S.win ? ctx.S.win.fy * vh : vh * 0.04;
  ctx.win.style.left = Math.min(Math.max(x, 0), Math.max(vw - w, 0)) + 'px';
  ctx.win.style.top = Math.min(Math.max(y, 0), vh - 60) + 'px';
}
export function toggleWin() {
  if (ctx.win.classList.contains('open')) { closeWin(); return; }
  ctx.win.classList.add('open');
  layout(); placeWin(); settle(); renderAll();
  tick = window.setInterval(() => { renderDynamic(); }, 1000);
}
export function closeWin() {
  ctx.win.classList.remove('open');
  if (tick) { window.clearInterval(tick); tick = null; }
  save(true);
}

export let wg = null;
export let dragBar = null;




export function initWindows() {
  All.$id('close').addEventListener('click', closeWin);
  dragBar = All.$id('drag');
  dragBar.addEventListener('pointerdown', e => {
    if (e.target.id === 'close') return;
    dragBar.setPointerCapture(e.pointerId);
    wg = { id: e.pointerId, sx: e.clientX, sy: e.clientY, ox: ctx.win.offsetLeft, oy: ctx.win.offsetTop };
  });
  dragBar.addEventListener('pointermove', e => {
    if (!wg || e.pointerId !== wg.id) return;
    ctx.win.style.left = wg.ox + e.clientX - wg.sx + 'px';
    ctx.win.style.top = wg.oy + e.clientY - wg.sy + 'px';
  });
  dragBar.addEventListener('pointerup', e => {
    if (!wg || e.pointerId !== wg.id) return;
    try { dragBar.releasePointerCapture(e.pointerId); } catch (er) {}
    wg = null;
    ctx.S.win = { fx: ctx.win.offsetLeft / window.innerWidth, fy: ctx.win.offsetTop / window.innerHeight };
    All.save();
  });
}
