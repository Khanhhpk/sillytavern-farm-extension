import { ctx } from './store.js';
import * as All from './all.js';
import { BLOCK_PRICE_PG, WEATHERS, TEST_MODE, DAY_MS, CROPS, GROW, MIN, REGROW, FERTS, WATER_CD, REGROW_MAX, POKE_CD, TREASURE_CD, PETS_OUT_MAX, WITCH_STAY, witchGap, SNAP_EDGE, ZONE_NAME } from './data.js';
import { mulberry32, petSVG, spriteSVG, tileURI, warmUpCache, PETS, PASSES, P, LP, PET_P } from './graphics.js';
import { save } from './state.js';
import { toggleWin, placeWin } from './windows.js';
import { renderPlots } from './render.js';

/* ---------- Bóng nổi: kéo / hít mép / phân xử cú bấm (C11 §4) ---------- */

export const disposers = [];
export let gesture = null, destroyed = false;
export function placeOrb() {
  const vw = window.innerWidth, vh = window.innerHeight;
  const x = Math.min(Math.max(ctx.S.orb.fx * vw, 4), vw - 56);
  const y = Math.min(Math.max(ctx.S.orb.fy * vh, 4), vh - 56);
  ctx.orb.style.left = x + 'px'; ctx.orb.style.top = y + 'px';
  ctx.orb.classList.toggle('dockL', ctx.S.orb.dock === 'L');   // ctx.Sửa #12: khôi phục trạng thái thu nửa
  ctx.orb.classList.toggle('dockR', ctx.S.orb.dock === 'R');
}
export function onOrbDown(e) {
  if (!e.isPrimary || (e.pointerType === 'mouse' && e.button !== 0)) return;
  if (gesture) return;
  ctx.orb.setPointerCapture(e.pointerId);
  gesture = { id: e.pointerId, sx: e.clientX, sy: e.clientY, ox: ctx.orb.offsetLeft, oy: ctx.orb.offsetTop, drag: false };
}
export function onOrbMove(e) {
  if (!gesture || e.pointerId !== gesture.id) return;
  if (Math.hypot(e.clientX - gesture.sx, e.clientY - gesture.sy) > 5) {
    gesture.drag = true;
    ctx.orb.classList.remove('dockL', 'dockR');   // ctx.Sửa #12: khi kéo thì hiện đầy đủ
  }
  if (gesture.drag) {
    ctx.orb.style.left = gesture.ox + e.clientX - gesture.sx + 'px';
    ctx.orb.style.top = gesture.oy + e.clientY - gesture.sy + 'px';
  }
}
export function onOrbUp(e, cancelled) {
  if (!gesture || e.pointerId !== gesture.id) return;
  const wasDrag = gesture.drag;
  try { ctx.orb.releasePointerCapture(e.pointerId); } catch (er) {}
  gesture = null;
  if (cancelled) return;
  const vw = window.innerWidth, vh = window.innerHeight;
  if (wasDrag) {
    let nx = Math.min(Math.max(ctx.orb.offsetLeft, 4), vw - 56);    // ctx.Sửa #1: lại gần mép mới hít, còn lại đứng nguyên chỗ
    let dock = null;
    if (nx < SNAP_EDGE) { nx = 4; dock = 'L'; }
    else if (nx > vw - 56 - SNAP_EDGE) { nx = vw - 56; dock = 'R'; }
    ctx.orb.style.left = nx + 'px';
    ctx.S.orb = { fx: nx / vw, fy: Math.min(Math.max(ctx.orb.offsetTop, 4), vh - 56) / vh, dock };   // ctx.Sửa #12
    ctx.orb.classList.toggle('dockL', dock === 'L');
    ctx.orb.classList.toggle('dockR', dock === 'R');
    save();
  } else toggleWin();
}

export let resizeTimer = null;
export const onResize = () => {
  if (resizeTimer) window.clearTimeout(resizeTimer);
  resizeTimer = window.setTimeout(() => {
    placeOrb();
    if (ctx.win.classList.contains('open')) { layout(); placeWin(); renderPlots(); }
  }, 150);
};


/* ---------- ctx.Sửa #11: bố cục dọc thu nhỏ đồng loạt (ô tính theo chiều rộng màn hình, sprite lấy bội số của 16) ---------- */
export let SPRITE_PX = 64, DECO_PX = 56;
export function layout() {
  const vw = window.innerWidth;
  let plot = 74;
  if (vw <= 640) plot = Math.max(52, Math.min(74, Math.floor((Math.min(vw * 0.96, 760) - 92) / 4)));
  ctx.win.style.setProperty('--plot', plot + 'px');
  SPRITE_PX = 48;                                       // v0.9: 64→48 (thu 3 lần), hình chi tiết không bị thô (vẫn giữ luật sắt bội số nguyên của 16)
  DECO_PX = plot >= 70 ? 56 : 40;
}


export function initOrb() {
  ctx.orb = All.$id('orb');
  ctx.win = All.$id('win');
  ctx.orb.addEventListener('pointerdown', onOrbDown);
  ctx.orb.addEventListener('pointermove', onOrbMove);
  ctx.orb.addEventListener('pointerup', e => onOrbUp(e, false));
  ctx.orb.addEventListener('pointercancel', e => onOrbUp(e, true));
  window.addEventListener('resize', onResize);
  disposers.push(() => window.removeEventListener('resize', onResize));
  placeOrb();
}
