import { ctx } from './store.js';
import * as All from './all.js';
import { startTribulationEvent, startPoorTribulationNotice, startLockedModal } from './events.js';

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
export function placeBjWin() {
  const bjWin = All.$id('bj-win');
  if (!bjWin) return;
  const vw = window.innerWidth, vh = window.innerHeight;
  const w = Math.min(600, vw * 0.96);
  let x = ctx.S.bjWin ? ctx.S.bjWin.fx * vw : (vw - w) / 2;
  let y = ctx.S.bjWin ? ctx.S.bjWin.fy * vh : vh * 0.04;
  bjWin.style.left = Math.min(Math.max(x, 0), Math.max(vw - w, 0)) + 'px';
  bjWin.style.top = Math.min(Math.max(y, 0), vh - 60) + 'px';
}
export function placeRaceWin() {
  const raceWin = All.$id('race-win');
  if (!raceWin) return;
  const vw = window.innerWidth, vh = window.innerHeight;
  const w = Math.min(600, vw * 0.96);
  let x = ctx.S.raceWin ? ctx.S.raceWin.fx * vw : (vw - w) / 2;
  let y = ctx.S.raceWin ? ctx.S.raceWin.fy * vh : vh * 0.04;
  raceWin.style.left = Math.min(Math.max(x, 0), Math.max(vw - w, 0)) + 'px';
  raceWin.style.top = Math.min(Math.max(y, 0), vh - 60) + 'px';
}
export function toggleWin() {
  try {
      if (ctx.win.classList.contains('open')) { closeWin(); return; }
      if (ctx.S.blockedUntil && ctx.S.blockedUntil > Date.now()) {
          startLockedModal();
          return;
      }
      ctx.win.classList.add('open');
      All.showResetAnnouncement();
      layout(); placeWin(); settle(); renderAll();
      tick = window.setInterval(() => { renderDynamic(); }, 1000);

      if (ctx.S.needsTribulationCheck) {
          startTribulationEvent(() => {
              if (ctx.S.blockedUntil && ctx.S.blockedUntil > Date.now()) {
                  closeWin(); // Đóng lại nếu bị khóa
              }
          });
          return;
      }
      if (ctx.S.needsPoorTribulationNotice) {
          startPoorTribulationNotice(() => {
              // Bảng đã mở sẵn, chạy xong thì thôi
          });
          delete ctx.S.needsPoorTribulationNotice;
          save(true);
          return;
      }
  } catch (e) {
      console.error("[Farm] toggleWin Error: ", e);
      if (All.toast) All.toast("Error: " + e.message);
  }
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

  const bjDragBar = All.$id('bj-drag');
  let bjWg = null;
  if (bjDragBar) {
    bjDragBar.addEventListener('pointerdown', e => {
      if (e.target.classList.contains('close-x')) return;
      if (window.innerWidth <= 640) return;
      bjDragBar.setPointerCapture(e.pointerId);
      const bjWin = All.$id('bj-win');
      bjWg = { id: e.pointerId, sx: e.clientX, sy: e.clientY, ox: bjWin.offsetLeft, oy: bjWin.offsetTop };
    });
    bjDragBar.addEventListener('pointermove', e => {
      if (!bjWg || e.pointerId !== bjWg.id) return;
      const bjWin = All.$id('bj-win');
      bjWin.style.left = bjWg.ox + e.clientX - bjWg.sx + 'px';
      bjWin.style.top = bjWg.oy + e.clientY - bjWg.sy + 'px';
    });
    bjDragBar.addEventListener('pointerup', e => {
      if (!bjWg || e.pointerId !== bjWg.id) return;
      try { bjDragBar.releasePointerCapture(e.pointerId); } catch (er) {}
      bjWg = null;
      const bjWin = All.$id('bj-win');
      ctx.S.bjWin = { fx: bjWin.offsetLeft / window.innerWidth, fy: bjWin.offsetTop / window.innerHeight };
      All.save();
    });
  }

  const raceDragBar = All.$id('race-drag');
  let raceWg = null;
  if (raceDragBar) {
    raceDragBar.addEventListener('pointerdown', e => {
      if (e.target.classList.contains('close-x')) return;
      if (window.innerWidth <= 640) return;
      raceDragBar.setPointerCapture(e.pointerId);
      const raceWin = All.$id('race-win');
      raceWg = { id: e.pointerId, sx: e.clientX, sy: e.clientY, ox: raceWin.offsetLeft, oy: raceWin.offsetTop };
    });
    raceDragBar.addEventListener('pointermove', e => {
      if (!raceWg || e.pointerId !== raceWg.id) return;
      const raceWin = All.$id('race-win');
      raceWin.style.left = raceWg.ox + e.clientX - raceWg.sx + 'px';
      raceWin.style.top = raceWg.oy + e.clientY - raceWg.sy + 'px';
    });
    raceDragBar.addEventListener('pointerup', e => {
      if (!raceWg || e.pointerId !== raceWg.id) return;
      try { raceDragBar.releasePointerCapture(e.pointerId); } catch (er) {}
      raceWg = null;
      const raceWin = All.$id('race-win');
      ctx.S.raceWin = { fx: raceWin.offsetLeft / window.innerWidth, fy: raceWin.offsetTop / window.innerHeight };
      All.save();
    });
  }

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && ctx.win && ctx.win.classList.contains('open')) {
      renderDynamic();
    }
  });
}
