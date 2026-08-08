import { ctx, extensionName, NS } from './store.js';
import * as All from './all.js';
import { BLOCK_PRICE_PG, TEST_MODE, CROPS, REGROW_MAX } from './data.js';
import { updateInjection } from './events.js';

/* ---------- Lưu game ---------- */
export const now = () => Date.now();
export const emptyPlots = () => { const a = []; for (let i = 0; i < 24; i++) a.push({ crop: null }); return a; };
export function freshState() {
  return {
    version: 1, playerId: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : ('p-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 9)), coins: TEST_MODE ? 9999 : 999, totalSales: 0, unlockedBlocks: 2,
    plots: emptyPlots(), seeds: { douya: 4, mystery: 1 }, ferts: {}, bag: {}, petPoke: {},   // Quà khởi đầu: 4 giá đỗ + 1 hạt giống bí ẩn (popup dạy chơi hộp mù)
    pets: ['slime'], passes: {}, petsOut: ['slime'], jobCfg: {}, petFind: {},   // Tặng slime xanh lúc mở đầu (thực hiện phương án #9)
    page: 1, plots2: emptyPlots(), plots3: emptyPlots(), unlockedBlocks2: 1, unlockedBlocks3: 1,   // v0.8: ba trang (vé vào trang 2/3 tặng kèm ô đất đầu tiên)
    day0: now(), orb: { fx: 0.94, fy: 0.6 }, win: null,
  };
}
ctx.S = null;
export const blockPrice = bi => BLOCK_PRICE_PG[ctx.S.page][bi];
export function loadState() {
  if (!ctx.extension_settings[extensionName]) {
    ctx.extension_settings[extensionName] = {};
  }
  const g = ctx.extension_settings[extensionName] || {};
  ctx.S = g[NS] && g[NS].version === 1 ? g[NS] : freshState();
  if (!ctx.S.playerId) ctx.S.playerId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : ('p-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 9));
  if (!ctx.S.petPoke) ctx.S.petPoke = {};
  if (!ctx.S.mutDesc) ctx.S.mutDesc = {};
  if (!ctx.S.passes) ctx.S.passes = {};
  if (!ctx.S.pets) ctx.S.pets = ['slime', 'octo'];
  if (!ctx.S.petsOut) ctx.S.petsOut = ctx.S.pets.slice(0, 6);
  if (!ctx.S.jobCfg) ctx.S.jobCfg = {};
  if (!ctx.S.petFind) ctx.S.petFind = {};
  if (!ctx.S.theme) ctx.S.theme = 'sakura';
  if (!ctx.S.page) ctx.S.page = 1;
  if (ctx.S.dragPet === undefined) ctx.S.dragPet = false;
  ctx.S.view = 'farm';   // Luôn mặc định về nông trại khi khởi động
  const petRenameMap = { 'bunny': 'jellyfish', 'slimeNight': 'peach_soda', 'batBlob': 'mystery_blob' };
  if (ctx.S.pets) ctx.S.pets = ctx.S.pets.map(p => petRenameMap[p] || p);
  if (ctx.S.petsOut) ctx.S.petsOut = ctx.S.petsOut.map(p => petRenameMap[p] || p);
  if (petRenameMap[ctx.S.dragPet]) ctx.S.dragPet = petRenameMap[ctx.S.dragPet];
  
  Object.keys(ctx.S.jobCfg || {}).forEach(k => {
    if (petRenameMap[k]) {
      ctx.S.jobCfg[petRenameMap[k]] = ctx.S.jobCfg[k];
      delete ctx.S.jobCfg[k];
    }
  });

  Object.keys(ctx.S.bag || {}).forEach(k => {
    const base = k.split('@')[0];
    if (base === 'mysbG' || base === 'mysbW' || base === 'mysbM' || base === 'moonberry') {
      const nk = k.replace(base, 'strawberry');
      ctx.S.bag[nk] = (ctx.S.bag[nk] || 0) + ctx.S.bag[k];
      delete ctx.S.bag[k];
    }
  });
  [ctx.S.plots, ctx.S.plots2, ctx.S.plots3].forEach(arr => (arr || []).forEach(p => {
    if (p.crop && (p.crop.id === 'mysbG' || p.crop.id === 'mysbW' || p.crop.id === 'mysbM' || p.crop.id === 'moonberry')) p.crop.id = 'strawberry';
  }));
  
  if (ctx.S.ferts) {
    if (ctx.S.ferts['f1']) { ctx.S.ferts['compost'] = (ctx.S.ferts['compost'] || 0) + ctx.S.ferts['f1']; delete ctx.S.ferts['f1']; }
    if (ctx.S.ferts['f2']) { ctx.S.ferts['shiny'] = (ctx.S.ferts['shiny'] || 0) + ctx.S.ferts['f2']; delete ctx.S.ferts['f2']; }
  }
  if (!ctx.S.witch) ctx.S.witch = { nextAt: now(), leaveAt: 0, missed: 0, order: null };
  if (!ctx.S.shards) ctx.S.shards = { prism: 0, star: 0, legend: 0 };
  else if (ctx.S.shards.legend === undefined) ctx.S.shards.legend = 0;
  if (!ctx.S.tickets) ctx.S.tickets = { norm: 0, spec: 0, super: 0 };
  if (!ctx.S.gachaPity) ctx.S.gachaPity = { norm: 0, spec: 0 };
  if (!ctx.S.uniques) ctx.S.uniques = {};
  if (!ctx.S.dungeonBest) ctx.S.dungeonBest = { wave: 0, gold: 0 };

  Object.keys(ctx.S.uniques || {}).forEach(k => {
    const item = ctx.S.uniques[k];
    if (item && item.sp && item.spriteMap) {
      All.registerDynamicSprite(item.sp, item.spriteMap);
    }
  });
  if (!ctx.S.plots2) ctx.S.plots2 = emptyPlots();
  if (!ctx.S.plots3) ctx.S.plots3 = emptyPlots();
  if (ctx.S.unlockedBlocks2 == null) ctx.S.unlockedBlocks2 = 1;
  if (ctx.S.unlockedBlocks3 == null) ctx.S.unlockedBlocks3 = 1;
  
  [ctx.S.plots, ctx.S.plots2, ctx.S.plots3].forEach(arr => arr.forEach(p => {
    const c = p.crop; if (!c) return;
    if (!c.fertUsed) c.fertUsed = {};
    if (CROPS[c.id]?.regrow && c.left == null) c.left = REGROW_MAX;
  }));
}
/* v0.8: hàm hỗ trợ cho trang */
export const pagePlots = pg => pg === 2 ? ctx.S.plots2 : pg === 3 ? ctx.S.plots3 : ctx.S.plots;
export const curPlots = () => pagePlots(ctx.S.page);
export const curBlocks = () => ctx.S.page === 2 ? ctx.S.unlockedBlocks2 : ctx.S.page === 3 ? ctx.S.unlockedBlocks3 : ctx.S.unlockedBlocks;
export const addBlock = () => { if (ctx.S.page === 2) ctx.S.unlockedBlocks2++; else if (ctx.S.page === 3) ctx.S.unlockedBlocks3++; else ctx.S.unlockedBlocks++; };
export const eachPage = fn => [1, 2, 3].forEach(pg => fn(pagePlots(pg), pg));
export let testMode = false;
export function setTestMode(v) { testMode = v; }
ctx.saveTimer = null;
export function save(immediate) {
  if (testMode) return;
  if (ctx.saveTimer) { clearTimeout(ctx.saveTimer); ctx.saveTimer = null; }
  const doSave = () => {
    if (!ctx.extension_settings[extensionName]) ctx.extension_settings[extensionName] = {};
    ctx.extension_settings[extensionName][NS] = ctx.S;
    if (ctx.saveSettingsDebounced) ctx.saveSettingsDebounced();
    try { updateInjection(); } catch (e) {}
  };
  if (immediate) doSave(); else ctx.saveTimer = setTimeout(doSave, 500);
}
