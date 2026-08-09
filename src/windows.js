import { ctx } from './store.js';
import * as All from './all.js';

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
export function placeDungeonWin() {
  const dungeonWin = All.$id('dungeon-win');
  if (!dungeonWin) return;
  const vw = window.innerWidth, vh = window.innerHeight;
  const w = Math.min(760, vw * 0.96);
  let x = ctx.S.dungeonWin ? ctx.S.dungeonWin.fx * vw : (vw - w) / 2;
  let y = ctx.S.dungeonWin ? ctx.S.dungeonWin.fy * vh : vh * 0.04;
  dungeonWin.style.left = Math.min(Math.max(x, 0), Math.max(vw - w, 0)) + 'px';
  dungeonWin.style.top = Math.min(Math.max(y, 0), vh - 60) + 'px';
}
export function toggleWin() {
  if (ctx.win.classList.contains('open')) { closeWin(); return; }
  if (ctx.S.blockedUntil && ctx.S.blockedUntil > Date.now()) {
      All.toast('Trời phạt chưa tan, Thiên Kiếp vẫn còn... Nông Trại đóng cửa!');
      return;
  }
  if (ctx.S.needsTribulationCheck) {
      All.startTribulationEvent(() => {
          if (!ctx.S.blockedUntil || ctx.S.blockedUntil <= Date.now()) {
              toggleWin(); // Open again if they survived
          }
      });
      return;
  }
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
    if (e.target.id === 'close' || e.target.closest('#viewToggle')) return;
    if (window.innerWidth <= 640) return;
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

  const dungeonDragBar = All.$id('dungeon-drag');
  let dungeonWg = null;
  if (dungeonDragBar) {
    dungeonDragBar.addEventListener('pointerdown', e => {
      if (e.target.id === 'dungeon-close') return;
      if (window.innerWidth <= 640) return;
      dungeonDragBar.setPointerCapture(e.pointerId);
      const dungeonWin = All.$id('dungeon-win');
      dungeonWg = { id: e.pointerId, sx: e.clientX, sy: e.clientY, ox: dungeonWin.offsetLeft, oy: dungeonWin.offsetTop };
    });
    dungeonDragBar.addEventListener('pointermove', e => {
      if (!dungeonWg || e.pointerId !== dungeonWg.id) return;
      const dungeonWin = All.$id('dungeon-win');
      dungeonWin.style.left = dungeonWg.ox + e.clientX - dungeonWg.sx + 'px';
      dungeonWin.style.top = dungeonWg.oy + e.clientY - dungeonWg.sy + 'px';
    });
    dungeonDragBar.addEventListener('pointerup', e => {
      if (!dungeonWg || e.pointerId !== dungeonWg.id) return;
      try { dungeonDragBar.releasePointerCapture(e.pointerId); } catch (er) {}
      dungeonWg = null;
      const dungeonWin = All.$id('dungeon-win');
      ctx.S.dungeonWin = { fx: dungeonWin.offsetLeft / window.innerWidth, fy: dungeonWin.offsetTop / window.innerHeight };
      All.save();
    });
  }
}
