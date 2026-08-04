import { ctx } from './store.js';
import { styleCSS } from './style.js';
import * as All from './all.js';
import { BLOCK_PRICE_PG, WEATHERS, TEST_MODE, DAY_MS, CROPS, GROW, MIN, REGROW, FERTS, WATER_CD, REGROW_MAX, POKE_CD, TREASURE_CD, PETS_OUT_MAX, WITCH_STAY, witchGap, SNAP_EDGE, ZONE_NAME } from './data.js';
import { mulberry32, petSVG, spriteSVG, tileURI, warmUpCache, PETS, PASSES, P, LP, PET_P } from './graphics.js';

/* ---------- DOM:Shadow root ---------- */
export const root = document.createElement('div');
root.id = 'star-tavern-farm-root';
document.body.appendChild(root);
export const sh = root.attachShadow({ mode: 'open' });
export const $id = id => sh.getElementById(id);
// CSS moved to style.css

const style = document.createElement('style');
style.textContent = styleCSS;
sh.appendChild(style);

ctx.ui = document.createElement('div');
ctx.ui.innerHTML = `
  <div id="ctx.orb" title="Ai mà thèm làm nông dân trong SillyTavern chứ!">${spriteSVG('sprout', 34)}</div>
  <div id="ctx.win">
    <div class="titlebar" id="drag">
      <h1>${spriteSVG('strawhat', 16)}Ai mà thèm làm nông dân chứ!</h1>
      <div class="close-x" id="close">×</div>
    </div>
    <div class="statusbar">
      <span class="stat">${spriteSVG('coin', 22)}<b id="coins">0</b></span>
      <span class="stat"><span id="wicon">${spriteSVG('sun', 22)}</span><span id="daytxt"></span></span>
      <span class="stat">${spriteSVG('sprout', 18)}Ruộng <span id="blocktxt"></span></span>
    </div>
    <div class="ctrlrow">
      <span class="chip witchchip" id="chipRegen" style="display:none">✦ Gieo lại sự kiện hôm nay</span>
      <span style="flex:1"></span>
      <span class="chip" id="chipLink">Liên kết thẻ nhân vật: Tắt</span>
      <span class="chip" id="chipStory" style="display:none">Ảnh hưởng cốt truyện: Tắt</span>
    </div>
    <div class="banner" id="banner"><span class="btag" id="btag"></span><span id="btxt"></span><span class="bmut" id="bmut" title="Xem khả năng đột biến">✦</span><div class="mut-popup" id="mutPopup"></div></div>
    <div id="scroll">
      <div class="field">
        <div class="pager" id="pager"></div>
        <div class="blocks" id="blocks"></div>
        <div class="mascots" id="mascots"></div>
        <div id="witch" title="Phù thuỷ tròn"></div>
        <div class="mode-tip" id="modetip"></div>
        <div class="toolbar" id="toolbar"></div>
      </div>
    </div>
    <div class="bottombar">
        <div class="btn" data-open="shop">${spriteSVG('shopIcon', 22)}Cửa hàng</div>
        <div class="btn" data-open="bag">${spriteSVG('bagIcon', 22)}Balo</div>
        <div class="btn" data-open="cfg">${spriteSVG('gearIcon', 22)}Cài đặt</div>
    </div>
    <div class="modal" id="modal">
      <div class="mpanel">
        <div class="mtitle"><span id="mtitle-text"></span><span class="grow"></span><div class="close-x" id="mclose">×</div></div>
        <div class="mbody" id="mbody"></div>
      </div>
    </div>
    <div class="toast" id="toast"></div>
  </div>`;
sh.appendChild(ctx.ui);

export function applyTheme() { ctx.ui.classList.remove('theme-sakura', 'theme-sky'); ctx.ui.classList.add('theme-' + (ctx.S && ctx.S.theme === 'sky' ? 'sky' : 'sakura')); }

/* ---------- ctx.Sửa #5: thảm cỏ mặt ruộng + trang trí hoá hạt giống (vị trí cố định, không rung) ---------- */
export const fieldEl = sh.querySelector('.field');
fieldEl.style.backgroundImage = tileURI('grass', 4242);
/* ---------- v0.8: lật ba trang (mở khoá bằng vé; da = W1 ruộng nổi đầm sen / M1 mạch quặng kim cương) ---------- */
export function applyPageSkin() {
  fieldEl.classList.toggle('pg2', ctx.S.page === 2);
  fieldEl.classList.toggle('pg3', ctx.S.page === 3);
  fieldEl.style.backgroundImage = tileURI(ctx.S.page === 2 ? 'water' : ctx.S.page === 3 ? 'mine' : 'grass', 4242);
  fieldEl.style.backgroundSize = '192px 192px';        // v1.0: cả ba trang dùng chung khung vẽ 96 lát ×2
}
export function renderPager() {
  const names = { 1: 'Đồng cỏ', 2: 'Vùng nước', 3: 'Khu mỏ' };
  $id('pager').innerHTML = [1, 2, 3].map(pg => {
    const un = pageUnlocked(pg);
    return `<span class="ptab p${pg}${ctx.S.page === pg ? ' active' : ''}${un ? '' : ' lock'}" data-pg="${pg}">${names[pg]}${un ? '' : ' 🔒'}</span>`;
  }).join('');
}
ctx.ui.addEventListener('click', e => {                     // Bấm bất cứ đâu ngoài pager = thu quả cầu lại (giai đoạn capture, chạy trước các xử lý click khác)
  const pager = $id('pager');
  if (pager && pager.classList.contains('open') && !e.target.closest('#pager')) pager.classList.remove('open');
}, true);
$id('pager') && $id('pager').addEventListener('click', e => {
  const pager = $id('pager');
  const t = e.target.closest('[data-pg]');
  if (!t) { pager.classList.toggle('open'); return; }    // Bấm quả cầu = bung ra, bấm chỗ trống trên thanh = thu lại
  const pg = +t.dataset.pg;
  if (!pageUnlocked(pg)) return toast('Cần mua vé ' + (pg === 2 ? 'vùng nước' : 'khu mỏ') + ' ở cửa hàng trước đã');
  if (pg === ctx.S.page) { pager.classList.remove('open'); return; }   // Bấm đúng trang hiện tại = tiện tay thu lại
  ctx.S.page = pg; save();
  mode = null;                                          // Đổi trang thì thoát chế độ công cụ, tránh thao tác nhầm sang trang khác
  pager.classList.remove('open');                        // Chọn xong thì tự co về quả cầu
  applyPageSkin(); renderPager(); renderPlots(); renderStatus(); renderToolbar();
});
/* Phương án 3: vuốt trái phải ở khu ruộng để đổi trang (dùng thử song song với thanh viên nang của phương án 2; nếu bỏ thì xoá cả khối này) */
export let swX = null, swY = null;
fieldEl.addEventListener('touchstart', e => { if (e.touches.length === 1) { swX = e.touches[0].clientX; swY = e.touches[0].clientY; } }, { passive: true });
fieldEl.addEventListener('touchend', e => {
  if (swX == null) return;
  const dx = e.changedTouches[0].clientX - swX, dy = e.changedTouches[0].clientY - swY;
  swX = swY = null;
  if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.5) return;   // Phải là vuốt ngang chiếm ưu thế mới tính là lật trang
  const dir = dx < 0 ? 1 : -1;                          // Vuốt sang trái = trang sau
  let pg = ctx.S.page + dir;
  while (pg >= 1 && pg <= 3 && !pageUnlocked(pg)) pg += dir;   // Bỏ qua các trang chưa mở khoá
  if (pg < 1 || pg > 3 || pg === ctx.S.page) return;
  ctx.S.page = pg; save();
  mode = null;                                          // Đổi trang thì thoát chế độ công cụ (giống như bấm tab đổi trang)
  applyPageSkin(); renderPager(); renderPlots(); renderStatus(); renderToolbar();
  toast(pg === 1 ? 'Về đồng cỏ~' : pg === 2 ? 'Tới vùng nước~' : 'Tới khu mỏ~');
}, { passive: true });
fieldEl.style.backgroundSize = '192px 192px';
export const decoLayer = document.createElement('div');
decoLayer.style.cssText = 'position:absolute;inset:0;overflow:hidden;pointer-events:none;';
fieldEl.insertBefore(decoLayer, fieldEl.firstChild);
(function () {                                        // ctx.Sửa #13: trang trí chỉ ở phần đất trống hai bên (màn hẹp thì dời xuống dải xanh dưới đáy)
  const drnd = mulberry32(20260717);
  function addDeco(o, cls, pos) {
    const el = document.createElement('span');
    el.className = cls;
    el.style.cssText = 'position:absolute;' + pos;
    el.innerHTML = spriteSVG(o.n, o.s | 0);
    decoLayer.appendChild(el);
  }
  /* #44: bụi cây nghỉ hưu —— cả ba trang đều không giữ (chen vào trang 2/3 quá lạc quẻ, cỏ hoa trên thảm cỏ trang 1 là đủ) */
  /* Màn rộng: hoa cỏ hồng ở phần đất trống hai bên */
  const side = [];
  for (let i = 0; i < 3; i++) side.push({ n: 'pinkgrass', s: 28 + drnd() * 8, x: 0.4 + drnd() * 1.5, y: 8 + i * 17 + drnd() * 6 });
  for (let i = 0; i < 2; i++) side.push({ n: 'pinkgrass', s: 28 + drnd() * 8, x: 90 + drnd() * 3, y: 24 + i * 17 + drnd() * 6 });
  side.forEach(o => addDeco(o, 'dside', `left:${o.x}%;top:${o.y}%;`));
  /* Màn hẹp: hoa cỏ hồng dời xuống dải xanh dưới đáy */
  for (let i = 0; i < 3; i++) addDeco({ n: 'pinkgrass', s: 28 + drnd() * 6 }, 'dbot', `left:${9 + i * 16 + drnd() * 5}%;bottom:4px;`);
})();

/* ---------- ctx.Sửa #15: lớp bong bóng cảm xúc dùng chung ---------- */
export const fxLayer = document.createElement('div');
fxLayer.style.cssText = 'position:absolute;inset:0;overflow:visible;pointer-events:none;z-index:8;';
fieldEl.appendChild(fxLayer);
export function plotEmote(pi, name) {
  const p = sh.querySelector('.plot[data-pi="' + pi + '"]');
  if (!p) return;
  const pr = p.getBoundingClientRect(), fr = fieldEl.getBoundingClientRect();
  const el = document.createElement('span');
  el.className = 'emote';
  el.style.left = (pr.left - fr.left + pr.width / 2 - 12) + 'px';
  el.style.top = (pr.top - fr.top - 14) + 'px';
  el.innerHTML = spriteSVG(name, 24);
  fxLayer.appendChild(el);
  window.setTimeout(() => el.remove(), 1300);
}


export function initUI() {
ctx.ui.addEventListener('click', e => {                     // Bấm bất cứ đâu ngoài pager = thu quả cầu lại (giai đoạn capture, chạy trước các xử lý click khác)
  const pager = $id('pager');
  if (pager && pager.classList.contains('open') && !e.target.closest('#pager')) pager.classList.remove('open');
}, true);
$id('pager') && $id('pager').addEventListener('click', e => {
  const pager = $id('pager');
  const t = e.target.closest('[data-pg]');
  if (!t) { pager.classList.toggle('open'); return; }    // Bấm quả cầu = bung ra, bấm chỗ trống trên thanh = thu lại
  const pg = +t.dataset.pg;
  if (!pageUnlocked(pg)) return toast('Cần mua vé ' + (pg === 2 ? 'vùng nước' : 'khu mỏ') + ' ở cửa hàng trước đã');
  if (pg === ctx.S.page) { pager.classList.remove('open'); return; }   // Bấm đúng trang hiện tại = tiện tay thu lại
  ctx.S.page = pg; save();
  mode = null;                                          // Đổi trang thì thoát chế độ công cụ, tránh thao tác nhầm sang trang khác
  pager.classList.remove('open');                        // Chọn xong thì tự co về quả cầu
  applyPageSkin(); renderPager(); renderPlots(); renderStatus(); renderToolbar();
});
/* Phương án 3: vuốt trái phải ở khu ruộng để đổi trang (dùng thử song song với thanh viên nang của phương án 2; nếu bỏ thì xoá cả khối này) */
  swX = null; swY = null;
fieldEl.addEventListener('touchstart', e => { if (e.touches.length === 1) { swX = e.touches[0].clientX; swY = e.touches[0].clientY; } }, { passive: true });
fieldEl.addEventListener('touchend', e => {
  if (swX == null) return;
  const dx = e.changedTouches[0].clientX - swX, dy = e.changedTouches[0].clientY - swY;
  swX = swY = null;
  if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.5) return;   // Phải là vuốt ngang chiếm ưu thế mới tính là lật trang
  const dir = dx < 0 ? 1 : -1;                          // Vuốt sang trái = trang sau
  let pg = ctx.S.page + dir;
  while (pg >= 1 && pg <= 3 && !pageUnlocked(pg)) pg += dir;   // Bỏ qua các trang chưa mở khoá
  if (pg < 1 || pg > 3 || pg === ctx.S.page) return;
  ctx.S.page = pg; save();
  mode = null;                                          // Đổi trang thì thoát chế độ công cụ (giống như bấm tab đổi trang)
  applyPageSkin(); renderPager(); renderPlots(); renderStatus(); renderToolbar();
  toast(pg === 1 ? 'Về đồng cỏ~' : pg === 2 ? 'Tới vùng nước~' : 'Tới khu mỏ~');
}, { passive: true });
(function () {                                        // ctx.Sửa #13: trang trí chỉ ở phần đất trống hai bên (màn hẹp thì dời xuống dải xanh dưới đáy)
  const drnd = mulberry32(20260717);
  function addDeco(o, cls, pos) {
    const el = document.createElement('span');
    el.className = cls;
    el.style.cssText = 'position:absolute;' + pos;
    el.innerHTML = spriteSVG(o.n, o.s | 0);
    decoLayer.appendChild(el);
  }
  /* #44: bụi cây nghỉ hưu —— cả ba trang đều không giữ (chen vào trang 2/3 quá lạc quẻ, cỏ hoa trên thảm cỏ trang 1 là đủ) */
  /* Màn rộng: hoa cỏ hồng ở phần đất trống hai bên */
  const side = [];
  for (let i = 0; i < 3; i++) side.push({ n: 'pinkgrass', s: 28 + drnd() * 8, x: 0.4 + drnd() * 1.5, y: 8 + i * 17 + drnd() * 6 });
  for (let i = 0; i < 2; i++) side.push({ n: 'pinkgrass', s: 28 + drnd() * 8, x: 90 + drnd() * 3, y: 24 + i * 17 + drnd() * 6 });
  side.forEach(o => addDeco(o, 'dside', `left:${o.x}%;top:${o.y}%;`));
  /* Màn hẹp: hoa cỏ hồng dời xuống dải xanh dưới đáy */
  for (let i = 0; i < 3; i++) addDeco({ n: 'pinkgrass', s: 28 + drnd() * 6 }, 'dbot', `left:${9 + i * 16 + drnd() * 5}%;bottom:4px;`);
})();
}
