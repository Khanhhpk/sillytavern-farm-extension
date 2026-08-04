import { ctx, extensionName } from './store.js';
import * as All from './all.js';
import { BLOCK_PRICE_PG, WEATHERS, TEST_MODE, DAY_MS, CROPS, GROW, MIN, REGROW, FERTS, WATER_CD, REGROW_MAX, POKE_CD, TREASURE_CD, PETS_OUT_MAX, WITCH_STAY, witchGap, SNAP_EDGE, ZONE_NAME } from './data.js';
import { mulberry32, petSVG, spriteSVG, tileURI, warmUpCache, PETS, PASSES, P, LP, PET_P } from './graphics.js';

/* ---------- Lưu game ---------- */
export const now = () => Date.now();
export const emptyPlots = () => { const a = []; for (let i = 0; i < 24; i++) a.push({ crop: null }); return a; };
export function freshState() {
  return {
    version: 1, coins: TEST_MODE ? 9999 : 999, totalSales: 0, unlockedBlocks: 2,
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
  if (!ctx.S.petPoke) ctx.S.petPoke = {};
  if (!ctx.S.mutDesc) ctx.S.mutDesc = {};
  if (!ctx.S.passes) ctx.S.passes = {};
  if (!ctx.S.pets) ctx.S.pets = ['slime', 'octo'];
  if (!ctx.S.petsOut) ctx.S.petsOut = ctx.S.pets.slice(0, 6);
  if (!ctx.S.jobCfg) ctx.S.jobCfg = {};
  if (!ctx.S.petFind) ctx.S.petFind = {};
  if (!ctx.S.theme) ctx.S.theme = 'sakura';
  if (!ctx.S.page) ctx.S.page = 1;
  
  Object.keys(ctx.S.bag || {}).forEach(k => {
    const base = k.split('@')[0];
    if (base === 'mysbG' || base === 'mysbW' || base === 'mysbM') {
      const nk = k.replace(base, 'moonberry');
      ctx.S.bag[nk] = (ctx.S.bag[nk] || 0) + ctx.S.bag[k];
      delete ctx.S.bag[k];
    }
  });
  [ctx.S.plots, ctx.S.plots2, ctx.S.plots3].forEach(arr => (arr || []).forEach(p => {
    if (p.crop && (p.crop.id === 'mysbG' || p.crop.id === 'mysbW' || p.crop.id === 'mysbM')) p.crop.id = 'moonberry';
  }));
  
  if (!ctx.S.witch) ctx.S.witch = { nextAt: now(), leaveAt: 0, missed: 0, order: null };
  if (!ctx.S.shards) ctx.S.shards = { prism: 0, star: 0 };
  if (!ctx.S.plots2) ctx.S.plots2 = emptyPlots();
  if (!ctx.S.plots3) ctx.S.plots3 = emptyPlots();
  if (ctx.S.unlockedBlocks2 == null) ctx.S.unlockedBlocks2 = 1;
  if (ctx.S.unlockedBlocks3 == null) ctx.S.unlockedBlocks3 = 1;
  
  [ctx.S.plots, ctx.S.plots2, ctx.S.plots3].forEach(arr => arr.forEach(p => {
    const c = p.crop; if (!c) return;
    if (!c.fertUsed) c.fertUsed = {};
    if (CROPS[c.id].regrow && c.left == null) c.left = REGROW_MAX;
  }));
}
/* v0.8: hàm hỗ trợ cho trang */
export const pagePlots = pg => pg === 2 ? ctx.S.plots2 : pg === 3 ? ctx.S.plots3 : ctx.S.plots;
export const curPlots = () => pagePlots(ctx.S.page);
export const curBlocks = () => ctx.S.page === 2 ? ctx.S.unlockedBlocks2 : ctx.S.page === 3 ? ctx.S.unlockedBlocks3 : ctx.S.unlockedBlocks;
export const addBlock = () => { if (ctx.S.page === 2) ctx.S.unlockedBlocks2++; else if (ctx.S.page === 3) ctx.S.unlockedBlocks3++; else ctx.S.unlockedBlocks++; };
export const eachPage = fn => [1, 2, 3].forEach(pg => fn(pagePlots(pg), pg));
ctx.saveTimer = null;
export function save(immediate) {
  if (ctx.saveTimer) { clearTimeout(ctx.saveTimer); ctx.saveTimer = null; }
  const doSave = () => {
    if (!ctx.extension_settings[extensionName]) ctx.extension_settings[extensionName] = {};
    ctx.extension_settings[extensionName][NS] = ctx.S;
    if (ctx.saveSettingsDebounced) ctx.saveSettingsDebounced();
  };
  if (immediate) doSave(); else ctx.saveTimer = setTimeout(doSave, 500);
  try { updateInjection(); } catch (e) {}
}