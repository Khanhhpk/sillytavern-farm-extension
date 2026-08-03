import { TEST_MODE, MIN, GROW, REGROW, DAY_MS, WATER_CD, REGROW_MAX, POKE_CD, TREASURE_CD, PETS_OUT_MAX, WITCH_STAY, witchGap, SNAP_EDGE, CROPS, ZONE_NAME, FERTS, BLOCK_PRICE_PG, blockPrice, WEATHERS } from './src/data.js';
import { petSVG, spriteSVG, tileURI, PETS, mulberry32, P, LP, PET_P } from './src/graphics.js';
import { styleCSS } from './src/style.js';
// sillytavern-farm-extension – built by build.cjs (no Webpack)

// Shadow DOM style element – used by initFarm() via sh.appendChild(style)
const style = document.createElement('style');
style.textContent = styleCSS;

// ST globals – declared as 'let' at module scope so initFarm() can close over them.
let extension_settings, eventSource, event_types, saveSettingsDebounced, generateRaw;


/* ============================================================
 * Ai mà thèm làm nông dân trong SillyTavern chứ! · Bản chính thức v1.1
 * Script toàn cục cho Tavern Helper. Nút bóng nổi → cửa sổ nông trại → hộp mù thế giới quan.
 * Lưu game: biến toàn cục star_tavern_farm của Tavern Helper (không dùng localStorage/world book; tên khoá không bao giờ đổi, cập nhật hay nhập lại đều không mất dữ liệu)
 * Giữ lại công tắc TEST_MODE (true = số liệu test nhanh), bản chính thức luôn là false
 * ============================================================ */


function initFarm() {
     // v1.0: bản chính thức
  const NS = "star_tavern_farm";
  const extensionName = "sillytavern-farm-extension";
  const RUNTIME_KEY = '__STAR_TAVERN_FARM__';
  const pwin = window, pdoc = document;

  /* ---------- Đơn thể: diệt bản cũ trước ---------- */
  try { pwin[RUNTIME_KEY]?.destroy?.(); } catch (e) {}
  pdoc.getElementById('star-tavern-farm-root')?.remove();


  /* ---------- Lưu game ---------- */
  const now = () => Date.now();
  const emptyPlots = () => { const a = []; for (let i = 0; i < 24; i++) a.push({ crop: null }); return a; };
  function freshState() {
    return {
      version: 1, coins: TEST_MODE ? 9999 : 999, totalSales: 0, unlockedBlocks: 2,
      plots: emptyPlots(), seeds: { douya: 4, mystery: 1 }, ferts: {}, bag: {}, petPoke: {},   // Quà khởi đầu: 4 giá đỗ + 1 hạt giống bí ẩn (popup dạy chơi hộp mù)
      pets: ['slime'], passes: {}, petsOut: ['slime'], jobCfg: {}, petFind: {},   // Tặng slime xanh lúc mở đầu (thực hiện phương án #9)
      page: 1, plots2: emptyPlots(), plots3: emptyPlots(), unlockedBlocks2: 1, unlockedBlocks3: 1,   // v0.8: ba trang (vé vào trang 2/3 tặng kèm ô đất đầu tiên)
      day0: now(), orb: { fx: 0.94, fy: 0.6 }, win: null,
    };
  }
  let S = null;
  function loadState() {
    if (!extension_settings[extensionName]) {
      extension_settings[extensionName] = {};
    }
    const g = extension_settings[extensionName] || {};
    S = g[NS] && g[NS].version === 1 ? g[NS] : freshState();
    if (!S.petPoke) S.petPoke = {};
    if (!S.mutDesc) S.mutDesc = {};
    if (!S.passes) S.passes = {};
    if (!S.pets) S.pets = ['slime', 'octo'];
    if (!S.petsOut) S.petsOut = S.pets.slice(0, 6);
    if (!S.jobCfg) S.jobCfg = {};
    if (!S.petFind) S.petFind = {};
    if (!S.theme) S.theme = 'sakura';
    if (!S.page) S.page = 1;
    
    Object.keys(S.bag || {}).forEach(k => {
      const base = k.split('@')[0];
      if (base === 'mysbG' || base === 'mysbW' || base === 'mysbM') {
        const nk = k.replace(base, 'moonberry');
        S.bag[nk] = (S.bag[nk] || 0) + S.bag[k];
        delete S.bag[k];
      }
    });
    [S.plots, S.plots2, S.plots3].forEach(arr => (arr || []).forEach(p => {
      if (p.crop && (p.crop.id === 'mysbG' || p.crop.id === 'mysbW' || p.crop.id === 'mysbM')) p.crop.id = 'moonberry';
    }));
    
    if (!S.witch) S.witch = { nextAt: now(), leaveAt: 0, missed: 0, order: null };
    if (!S.shards) S.shards = { prism: 0, star: 0 };
    if (!S.plots2) S.plots2 = emptyPlots();
    if (!S.plots3) S.plots3 = emptyPlots();
    if (S.unlockedBlocks2 == null) S.unlockedBlocks2 = 1;
    if (S.unlockedBlocks3 == null) S.unlockedBlocks3 = 1;
    
    [S.plots, S.plots2, S.plots3].forEach(arr => arr.forEach(p => {
      const c = p.crop; if (!c) return;
      if (!c.fertUsed) c.fertUsed = {};
      if (CROPS[c.id].regrow && c.left == null) c.left = REGROW_MAX;
    }));
  }
  /* v0.8: hàm hỗ trợ cho trang */
  const pagePlots = pg => pg === 2 ? S.plots2 : pg === 3 ? S.plots3 : S.plots;
  const curPlots = () => pagePlots(S.page);
  const curBlocks = () => S.page === 2 ? S.unlockedBlocks2 : S.page === 3 ? S.unlockedBlocks3 : S.unlockedBlocks;
  const addBlock = () => { if (S.page === 2) S.unlockedBlocks2++; else if (S.page === 3) S.unlockedBlocks3++; else S.unlockedBlocks++; };
  const eachPage = fn => [1, 2, 3].forEach(pg => fn(pagePlots(pg), pg));
  let saveTimer = null;
  function save(immediate) {
    if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; }
    const doSave = () => {
      if (!extension_settings[extensionName]) extension_settings[extensionName] = {};
      extension_settings[extensionName][NS] = S;
      if (saveSettingsDebounced) saveSettingsDebounced();
    };
    if (immediate) doSave(); else saveTimer = setTimeout(doSave, 500);
    try { updateInjection(); } catch (e) {}
  }
  /* ---------- Tiện ích ---------- */
  const gameDay = () => Math.floor((now() - S.day0) / DAY_MS) + 1;
  const weatherOf = d => WEATHERS[Math.floor(mulberry32(d * 7919)() * WEATHERS.length)];
  const isRain = () => weatherOf(gameDay()) === 'Mưa nhỏ';
  function settle() {
    if (CS.link && !eventFresh() && !eventPending) requestDayEvent();   // #17: sự kiện hết hạn là gieo lại ngay (tính giờ theo mốc neo)
    /* v0.8b: lịch ghé thăm của phù thuỷ tròn (cần vé vùng nước; đến giờ thì rời đi; lỡ 2 lượt thì bảo hiểm) */
    if (S.passes.water && S.witch) {
      const wz = S.witch;
      if (wz.leaveAt && now() >= wz.leaveAt) {            // Đến giờ dọn hàng
        wz.leaveAt = 0;
        if (wz.order && !wz.order.done) wz.missed++;      // Không nhận đơn tính là lỡ (đếm cho cơ chế bảo hiểm)
        wz.order = null;
        wz.nextAt = now() + witchGap();
        save(); try { renderWitch(); } catch (e) {}
      }
      const open = (() => { try { return sh.getElementById('win').classList.contains('open'); } catch (e) { return false; } })();
      if (!wz.leaveAt && open && (now() >= wz.nextAt || wz.missed >= 2)) witchArrive();   // Chỉ ghé khi bảng đang mở (đã ghé thì phải được nhìn thấy)
    }
    /* Xét đột biến: công bố ngay lúc chín, mỗi vụ một lần; bón phân là bộ khuếch đại (0/1/2 loại phân → xác suất ×0.3/0.65/1.0); v0.8 tính cho cả ba trang */
    let mutChanged = false;
    eachPage((plots, pg) => plots.forEach((p, pi) => {
      const c = p.crop;
      if (!c || now() < c.matureAt || c.mutRolled) return;
      mutChanged = true;
      rollMutation(c, pg === S.page ? pi : null);         // Bong bóng chỉ nổi ở trang hiện tại
    }));
    if (mutChanged) save();
    /* ===== v0.6b: thú làm việc (chỉ có hiệu lực khi ra sân) + tìm kho báu ===== */
    let wChanged = false;
    const outed = id => S.petsOut.indexOf(id) >= 0;
    if (outed('cloudMallow')) {                           // Bé bông mây: mây mưa nhỏ tự động tưới (miễn phí, hoàn toàn tự động, v0.8 tưới cả ba trang)
      eachPage(plots => plots.forEach(p => {
        const c = p.crop;
        if (!c || now() >= c.matureAt || now() < c.wateredUntil) return;
        c.matureAt = now() + (c.matureAt - now()) * 0.75;
        c.wateredUntil = now() + WATER_CD;
        wChanged = true;
      }));
    }
    /* #27: thu hoạch đổi sang kích hoạt bằng cách chọc (xem petHarvest) — rau chín nằm lại ruộng chờ user quay lại xem, không bị tim đập lén cuốn đi nữa */
    let tGain = 0, tSeed = null, tMyst = null, tPrism = 0, tStar = 0;            // Loại tìm kho báu (thú ra sân không có job): định kỳ nhặt tiền, thỉnh thoảng tha hạt giống về
    S.petsOut.forEach(id => {
      const pd = PETS[id];
      if (!pd || pd.job) return;
      if (S.petFind[id] == null) { S.petFind[id] = now(); wChanged = true; return; }   // Lần đầu chỉ khởi động bộ đếm
      if (now() - S.petFind[id] < TREASURE_CD) return;
      S.petFind[id] = now();
      tGain += 10 + Math.floor(Math.random() * 41);      // v1.0:10~50G
      if ((id === 'impBlob' || id === 'angelBlob') && Math.random() < 0.2) {    // #29: quỷ/thiên thần độc quyền · hạt giống bí ẩn (v1.0: 20%)
        S.seeds.mystery = (S.seeds.mystery || 0) + 1;
        tMyst = id;
      }
      if (id === 'prismBlob' && Math.random() < 0.2) { S.shards.prism++; tPrism++; }   // v1.0: mảnh lăng quang (đổi đơn)
      if (id === 'starBell' && Math.random() < 0.15) { S.shards.star++; tStar++; }     // v1.0: mảnh ngôi sao (triệu hồi phù thuỷ, quý hơn)
      if (!tSeed && !tMyst && Math.random() < 0.1) {
        const ids = Object.keys(CROPS).filter(k => !CROPS[k].hidden);   // #34: họ bí ẩn không đi theo đường tìm kho báu thường
        tSeed = ids[Math.floor(Math.random() * ids.length)];
        S.seeds[tSeed] = (S.seeds[tSeed] || 0) + 1;
      }
      wChanged = true;
    });
    if (tGain) {
      S.coins += tGain;
      toast('Các bé tròn đi tìm kho báu về: +' + tGain + ' G' + (tSeed ? ', còn tha về cả hạt giống ' + CROPS[tSeed].name + '!' : '') +
        (tMyst ? (tMyst === 'impBlob' ? ', bé quỷ nhỏ tha về một hạt giống bí ẩn đen sì…' : ', bé thiên thần ngậm về một hạt giống bí ẩn ánh lên lấp lánh…') : '') +
        (tPrism ? ', bé lăng quang nhả ra ' + tPrism + ' mảnh lăng quang' : '') + (tStar ? ', bé chuông sao rung rơi ' + tStar + ' mảnh ngôi sao✦' : ''));
      renderStatus();
    }
    if (wChanged) save();
    /* Sửa #10: ngày mưa giảm một lần 10% thời gian còn lại của cây chưa chín (#27 sửa kèm: bù lại const d bị mất); v0.8 ba trang cùng mưa */
    if (!isRain()) return;
    const d = gameDay();
    eachPage(plots => plots.forEach(p => {
      const c = p.crop;
      if (!c || now() >= c.matureAt || c.rainDay === d) return;
      c.matureAt = now() + (c.matureAt - now()) * 0.9;
      c.rainDay = d;
    }));
  }
    const pageUnlocked = p => p === 1 || (p === 2 && S.passes.water) || (p === 3 && S.passes.mine);

  const fmtLeft = ms => {
    if (ms <= 0) return 'Thu hoạch được';
    const m = Math.ceil(ms / MIN);
    return m >= 60 ? Math.floor(m / 60) + 'g' + (m % 60) + 'p' : m + 'p';
  };

  /* ---------- DOM:Shadow root ---------- */
  const root = pdoc.createElement('div');
  root.id = 'star-tavern-farm-root';
  pdoc.body.appendChild(root);
  const sh = root.attachShadow({ mode: 'open' });
  // CSS moved to style.css

  sh.appendChild(style);

  const ui = pdoc.createElement('div');
  ui.innerHTML = `
    <div id="orb" title="Ai mà thèm làm nông dân trong SillyTavern chứ!">${spriteSVG('sprout', 34)}</div>
    <div id="win">
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
      <div class="banner" id="banner"><span class="btag" id="btag"></span><span id="btxt"></span></div>
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
  sh.appendChild(ui);
  const $id = x => sh.getElementById(x);
  function applyTheme() { ui.classList.remove('theme-sakura', 'theme-sky'); ui.classList.add('theme-' + (S && S.theme === 'sky' ? 'sky' : 'sakura')); }

  /* ---------- Sửa #5: thảm cỏ mặt ruộng + trang trí hoá hạt giống (vị trí cố định, không rung) ---------- */
  const fieldEl = sh.querySelector('.field');
  fieldEl.style.backgroundImage = tileURI('grass', 4242);
  /* ---------- v0.8: lật ba trang (mở khoá bằng vé; da = W1 ruộng nổi đầm sen / M1 mạch quặng kim cương) ---------- */
  function applyPageSkin() {
    fieldEl.classList.toggle('pg2', S.page === 2);
    fieldEl.classList.toggle('pg3', S.page === 3);
    fieldEl.style.backgroundImage = tileURI(S.page === 2 ? 'water' : S.page === 3 ? 'mine' : 'grass', 4242);
    fieldEl.style.backgroundSize = '192px 192px';        // v1.0: cả ba trang dùng chung khung vẽ 96 lát ×2
  }
  function renderPager() {
    const names = { 1: 'Đồng cỏ', 2: 'Vùng nước', 3: 'Khu mỏ' };
    $id('pager').innerHTML = [1, 2, 3].map(pg => {
      const un = pageUnlocked(pg);
      return `<span class="ptab p${pg}${S.page === pg ? ' active' : ''}${un ? '' : ' lock'}" data-pg="${pg}">${names[pg]}${un ? '' : ' 🔒'}</span>`;
    }).join('');
  }
  ui.addEventListener('click', e => {                     // Bấm bất cứ đâu ngoài pager = thu quả cầu lại (giai đoạn capture, chạy trước các xử lý click khác)
    const pager = $id('pager');
    if (pager && pager.classList.contains('open') && !e.target.closest('#pager')) pager.classList.remove('open');
  }, true);
  $id('pager') && $id('pager').addEventListener('click', e => {
    const pager = $id('pager');
    const t = e.target.closest('[data-pg]');
    if (!t) { pager.classList.toggle('open'); return; }    // Bấm quả cầu = bung ra, bấm chỗ trống trên thanh = thu lại
    const pg = +t.dataset.pg;
    if (!pageUnlocked(pg)) return toast('Cần mua vé ' + (pg === 2 ? 'vùng nước' : 'khu mỏ') + ' ở cửa hàng trước đã');
    if (pg === S.page) { pager.classList.remove('open'); return; }   // Bấm đúng trang hiện tại = tiện tay thu lại
    S.page = pg; save();
    mode = null;                                          // Đổi trang thì thoát chế độ công cụ, tránh thao tác nhầm sang trang khác
    pager.classList.remove('open');                        // Chọn xong thì tự co về quả cầu
    applyPageSkin(); renderPager(); renderPlots(); renderStatus(); renderToolbar();
  });
  /* Phương án 3: vuốt trái phải ở khu ruộng để đổi trang (dùng thử song song với thanh viên nang của phương án 2; nếu bỏ thì xoá cả khối này) */
  let swX = null, swY = null;
  fieldEl.addEventListener('touchstart', e => { if (e.touches.length === 1) { swX = e.touches[0].clientX; swY = e.touches[0].clientY; } }, { passive: true });
  fieldEl.addEventListener('touchend', e => {
    if (swX == null) return;
    const dx = e.changedTouches[0].clientX - swX, dy = e.changedTouches[0].clientY - swY;
    swX = swY = null;
    if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.5) return;   // Phải là vuốt ngang chiếm ưu thế mới tính là lật trang
    const dir = dx < 0 ? 1 : -1;                          // Vuốt sang trái = trang sau
    let pg = S.page + dir;
    while (pg >= 1 && pg <= 3 && !pageUnlocked(pg)) pg += dir;   // Bỏ qua các trang chưa mở khoá
    if (pg < 1 || pg > 3 || pg === S.page) return;
    S.page = pg; save();
    mode = null;                                          // Đổi trang thì thoát chế độ công cụ (giống như bấm tab đổi trang)
    applyPageSkin(); renderPager(); renderPlots(); renderStatus(); renderToolbar();
    toast(pg === 1 ? 'Về đồng cỏ~' : pg === 2 ? 'Tới vùng nước~' : 'Tới khu mỏ~');
  }, { passive: true });
  fieldEl.style.backgroundSize = '192px 192px';
  const decoLayer = pdoc.createElement('div');
  decoLayer.style.cssText = 'position:absolute;inset:0;overflow:hidden;pointer-events:none;';
  fieldEl.insertBefore(decoLayer, fieldEl.firstChild);
  (function () {                                        // Sửa #13: trang trí chỉ ở phần đất trống hai bên (màn hẹp thì dời xuống dải xanh dưới đáy)
    const drnd = mulberry32(20260717);
    function addDeco(o, cls, pos) {
      const el = pdoc.createElement('span');
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

  /* ---------- Sửa #15: lớp bong bóng cảm xúc dùng chung ---------- */
  const fxLayer = pdoc.createElement('div');
  fxLayer.style.cssText = 'position:absolute;inset:0;overflow:visible;pointer-events:none;z-index:8;';
  fieldEl.appendChild(fxLayer);
  function plotEmote(pi, name) {
    const p = sh.querySelector('.plot[data-pi="' + pi + '"]');
    if (!p) return;
    const pr = p.getBoundingClientRect(), fr = fieldEl.getBoundingClientRect();
    const el = pdoc.createElement('span');
    el.className = 'emote';
    el.style.left = (pr.left - fr.left + pr.width / 2 - 12) + 'px';
    el.style.top = (pr.top - fr.top - 14) + 'px';
    el.innerHTML = spriteSVG(name, 24);
    fxLayer.appendChild(el);
    pwin.setTimeout(() => el.remove(), 1300);
  }

  /* ---------- Nạp trạng thái ---------- */
  loadState();
  applyTheme();                                          // v1.0: mặc da theo sở thích lưu trong save

  /* ============================================================
   * Mô-đun liên kết: công tắc ① sự kiện thế giới quan (API phụ) + công tắc ② tiêm cốt truyện
   * ============================================================ */
  const esc = s => String(s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  const clampN = (x, lo, hi, dflt) => { x = Number(x); return isFinite(x) ? Math.min(hi, Math.max(lo, x)) : dflt; };
  /* Cấu hình API phụ: lưu trong localStorage của host, khoá bị làm rối bằng base64, vĩnh viễn không vào cây biến (tránh rò rỉ khi xuất thẻ) */
  const SEC_LS_KEY = 'star_tavern_farm_sec';
  let SEC = { url: '', key: '', model: '', autoReset: true, resetHours: 4, wbLimit: 20000 };
  try {
    const raw = pwin.localStorage.getItem(SEC_LS_KEY);
    if (raw) {
      const o = JSON.parse(raw);
      SEC = { url: o.url || '', key: o.key ? atob(o.key) : '', model: o.model || '',
        autoReset: o.autoReset !== false, resetHours: clampN(o.resetHours, 1, 24, 4), wbLimit: typeof o.wbLimit === 'number' ? o.wbLimit : 20000 };
    }
  } catch (e) {}
  function saveSec() {
    try { pwin.localStorage.setItem(SEC_LS_KEY, JSON.stringify({ url: SEC.url, key: btoa(SEC.key), model: SEC.model, autoReset: SEC.autoReset, resetHours: SEC.resetHours, wbLimit: SEC.wbLimit })); } catch (e) {}
  }
  /* Công tắc và prompt tự điền: lưu theo từng thẻ nhân vật */
  let CS = { link: false, story: false, userPrompt: '' };
  function loadCharState() {
    try {
      const cn = charName();
      const key = 'cs_' + cn;
      const o = (extension_settings[extensionName] || {})[key] || {};
      CS = { link: !!o.link, story: !!o.story, userPrompt: o.userPrompt || '' };
    } catch (e) { CS = { link: false, story: false, userPrompt: '' }; }
  }
  function saveCharState() {
    try {
      const cn = charName();
      const key = 'cs_' + cn;
      if (!extension_settings[extensionName]) extension_settings[extensionName] = {};
      extension_settings[extensionName][key] = { link: CS.link, story: CS.story, userPrompt: CS.userPrompt };
      if (saveSettingsDebounced) saveSettingsDebounced();
    } catch (e) {}
  }
  loadCharState();
  function charName() {
    try {
      const ctx = (window.SillyTavern && window.SillyTavern.getContext) ? window.SillyTavern.getContext() : {};
      return ctx.name2 || String(ctx.characterId || '');
    } catch (e) { return ''; }
  }
  /* #17: vòng đời sự kiện do bộ đếm mốc neo quản lý —— lastEventAt + resetHours quyết định hết hạn, tách rời khỏi lịch trong game */
  const eventFresh = () => S.dayEvent && S.dayEvent.who === charName() &&
    (!SEC.autoReset || now() - (S.dayEvent.at || 0) < SEC.resetHours * 60 * 60 * 1000);
  const todayEvent = () => (CS.link && eventFresh()) ? S.dayEvent.ev : null;

  /* Trích world book: chỉ đọc, ưu tiên đèn xanh dương, thiếu thì bù đèn xanh lá, cắt còn 2000 chữ */
  async function collectWorldbook() {
    try {
      let blue = '', green = '';
      let entries = [];
      
      const ctx = (window.SillyTavern && window.SillyTavern.getContext) ? window.SillyTavern.getContext() : {};
      
      // 0. Use native ST ES Module and Backend API (Kaiz-Agent Method)
      try {
          const ST_WorldInfo = await new Function("return import('/scripts/world-info.js')")().catch(()=>null);
          const activeNames = new Set();
          try {
              const charId = ctx.characterId !== undefined ? ctx.characterId : window.this_character;
              const charData = ctx.characters?.[charId]?.data || window.characters?.[charId]?.data;
              console.log('[FARM DEBUG] Character Data:', charData ? 'Found' : 'Null', 'charId:', charId);
              if (charData) {
                  if (charData.extensions?.world) activeNames.add(charData.extensions.world);
                  if (charData.world) activeNames.add(charData.world);
              }
              const wiKey = ST_WorldInfo?.METADATA_KEY || window.WI_METADATA_KEY || 'world_info';
              const chatWorldName = ctx.chatMetadata?.[wiKey];
              console.log('[FARM DEBUG] Chat World Name:', chatWorldName);
              if (chatWorldName && typeof chatWorldName === 'string') activeNames.add(chatWorldName);
          } catch(e) { console.log('[FARM DEBUG] Error getting active names:', e); }
          
          console.log('[FARM DEBUG] Active Worldbook Names to Fetch:', Array.from(activeNames));

          for (const name of activeNames) {
              try {
                  console.log('[FARM DEBUG] Fetching API for:', name);
                  const res = await fetch('/api/worldinfo/get', {
                      method: 'POST',
                      headers: {
                          'Content-Type': 'application/json',
                          ...(typeof ctx.getRequestHeaders === 'function' ? ctx.getRequestHeaders() : {})
                      },
                      body: JSON.stringify({ name })
                  });
                  if (res.ok) {
                      const data = await res.json();
                      console.log('[FARM DEBUG] Fetched API data entries length:', Array.isArray(data.entries) ? data.entries.length : 'Not Array');
                      if (data && Array.isArray(data.entries)) entries = entries.concat(data.entries);
                  } else {
                      console.log('[FARM DEBUG] API Failed, status:', res.status);
                      const book = ST_WorldInfo?.world_info?.[name];
                      if (book && Array.isArray(book.entries)) entries = entries.concat(book.entries);
                  }
              } catch(e) {
                  console.log('[FARM DEBUG] Fetch Exception:', e);
                  const book = ST_WorldInfo?.world_info?.[name];
                  if (book && Array.isArray(book.entries)) entries = entries.concat(book.entries);
              }
          }
      } catch (e) { console.log('[FARM DEBUG] Outer Exception:', e); }

      // 1. Try ctx.worldInfo
      if (ctx.worldInfo && Array.isArray(ctx.worldInfo.entries)) {
        entries = entries.concat(ctx.worldInfo.entries);
      } 
      else if (ctx.worldInfo && typeof ctx.worldInfo === 'object') {
         Object.values(ctx.worldInfo).forEach(book => {
           if (book && Array.isArray(book.entries)) entries = entries.concat(book.entries);
         });
      }

      // 2. Try window.world_info (make sure it's NOT an HTML element)
      if (window.world_info && typeof window.world_info === 'object' && !(window.world_info instanceof HTMLElement)) {
         Object.values(window.world_info).forEach(book => {
           if (book && Array.isArray(book.entries)) entries = entries.concat(book.entries);
           else if (book && typeof book === 'object' && !Array.isArray(book) && !(book instanceof HTMLElement)) {
               if (book.content || book.text) entries.push(book);
           }
         });
      }

      // 2b. Try window.world_info_data
      if (window.world_info_data && typeof window.world_info_data === 'object') {
         Object.values(window.world_info_data).forEach(book => {
           if (book && Array.isArray(book.entries)) entries = entries.concat(book.entries);
         });
      }

      // 3. Try embedded character_book
      try {
        const charId = ctx.characterId !== undefined ? ctx.characterId : window.this_character;
        if (typeof charId !== 'undefined') {
          const charData = ctx.characters?.[charId]?.data || window.characters?.[charId]?.data;
          if (charData && charData.character_book && Array.isArray(charData.character_book.entries)) {
             entries = entries.concat(charData.character_book.entries);
          }
        }
      } catch(e) { console.log('[FARM DEBUG] Embedded Book Exception:', e); }
      
      if (!entries || entries.length === 0) return '';
      
      const seen = new Set();
      for (const en of entries) {
        if (en.enabled === false) continue;
        const content = (en.content || en.text || '').trim();
        if (!content || seen.has(content)) continue;
        seen.add(content);
        
        const isConstant = (en.strategy && en.strategy.type === 'constant') || en.constant === true || en.position === 'before_char';
        if (isConstant) blue += content + '\n';
        else green += content + '\n';
      }
      
      const txt = blue.length >= 400 ? blue : blue + '\n' + green;
      const limit = SEC.wbLimit !== undefined ? SEC.wbLimit : 20000;
      return limit > 0 ? txt.slice(0, limit) : txt;
    } catch (e) { 
      return ''; 
    }
  }

  /* Prompt cài sẵn (lớp khoá, phương án thi công §3); TENDENCY random ở phía code: tích cực 60 / trung tính 30 / tiêu cực 10 */
  function buildEventPrompt(worldbook) {
    let roll = Math.random() * 100;
    const tendency = roll < 60 ? 'tích cực (hướng bội thu / tăng tốc / thời tiết đẹp)' : roll < 90 ? 'trung tính (kỳ quan / chuyện lạ / chuyện vặt không quan trọng)' : 'hơi tiêu cực (giảm sản lượng / chậm lại, mức độ phải nhẹ)';
    const themes = ['có thể liên quan tới thời tiết', 'có thể liên quan tới đất đai hoặc nguồn nước', 'có thể liên quan tới động vật nhỏ hoặc côn trùng', 'có thể liên quan tới yếu tố siêu nhiên của thế giới này', 'có thể liên quan tới phong tục địa phương hoặc chợ phiên'];
    const theme = themes[Math.floor(Math.random() * themes.length)];
    /* v1.1 (wen chốt, thay cho danh sách điều kiện #19/#34/#61): roll một lần cho cả 24 loại cây (chỉ trừ bản thân hạt giống) ——
       không xét mở khoá, không xét đang sở hữu, mô tả chuẩn bị sẵn hết ở nền; giữa chừng mua vé / mở hộp mù ra họ mới đều không bị dính vạch trắng "ngoài danh sách nên không có mô tả".
       Tính chi phí: mỗi 4h tạo tối đa một lần, phần tăng thêm không đáng kể, timeout 90s là thừa dư */
    const cropList = Object.entries(CROPS)
      .filter(([id, c]) => !c.seedOnly)
      .map(([id, c]) => c.name).join(', ');
    return ('Bạn là "trình tạo sự kiện thế giới quan" cho một game nông trại nhỏ. Người chơi đang trồng một mảnh vườn rau nhỏ trong một thế giới nhập vai nào đó, và bạn sẽ nhận được phần trích world book của thế giới đó. Hãy tạo 1 sự kiện nhỏ ngẫu nhiên xảy ra ở vườn rau hôm nay.\n\nQuy tắc:\n' +
      '1. Sự kiện bắt buộc mang hương vị của thế giới này —— các danh từ về thời tiết, sản vật, yếu tố siêu nhiên… hãy cố lấy chất liệu từ world book; nhưng sự kiện chỉ ảnh hưởng việc trồng trọt, không đẩy cốt truyện. Có thể nhắc tên nhân vật trong thế giới ở phần flavor cho sinh động, nhưng tuyệt đối không được để nhân vật nói chuyện, hành động hay xảy ra tình tiết nào.\n' +
      '2. Xu hướng sự kiện hôm nay: ' + tendency + '; chủ đề tham khảo: ' + theme + '.\n' +
      '3. Trường hiệu ứng chỉ được dùng time_mult (0.7~1.1, hệ số nhân thời gian sinh trưởng) / mutate_on_fert (0~0.5), có thể chỉ dùng một hoặc bỏ cả hai. **Tuyệt đối đừng viết ngược ngữ nghĩa của time_mult: <1 = mọc nhanh hơn = sự kiện tích cực; >1 = mọc chậm hơn = sự kiện tiêu cực**. Ngoài ra có trường hiếm double_yield:true (số quả thu hoạch hôm nay ×2, phúc lợi cho dân may mắn) —— chỉ nên xuất hiện khoảng 8% số ngày, khi xuất hiện thì sự kiện phải viết theo chủ đề bội thu lớn / kỳ tích, type bắt buộc là buff. Có thể thêm favored_crop: điền một tên cây trồng (bắt buộc lấy từ danh sách cây trồng), khi đó hiệu ứng chỉ tác dụng lên cây đó; không điền thì cả ruộng đều chịu tác dụng.\n' +
      '4. Nếu sự kiện làm cây bị đột biến (mutate_on_fert>0, là xác suất đột biến cơ bản của cây chín hôm nay, bón phân sẽ khuếch đại), thì cho thêm: mutate_prefix (tiền tố đột biến mang hương vị của thế giới này, trong 5 chữ, ví dụ "linh hoá", "siêu to", "ăn thịt", "cứng ngắc", "phát sáng") và mutate_desc (một đối tượng, **viết riêng cho từng loại cây được liệt kê bên dưới** về **hiệu ứng hoặc công dụng** của thể đột biến đó trong thế giới này, mỗi mục trong 20 chữ —— hãy viết "nó làm được gì / sẽ gây ra chuyện gì", bắt buộc là hiệu ứng **khi cầm giữ, ăn hoặc sử dụng** (nó sẽ được mang khỏi vườn rau để dùng trong câu chuyện, nghiêm cấm viết kiểu "khi thu hoạch / khi nhổ lên" vì rời vườn là mất hiệu lực), phải mơ hồ để chừa chỗ tưởng tượng, nghiêm cấm mô tả kiểu ngoại hình lấp lánh; hiệu ứng của các cây khác nhau phải khác nhau). Khi không đột biến thì bỏ cả hai trường.\n' +
      '   Các loại cây hiện có trong vườn này (tổng cộng {{CROPCOUNT}} loại, mutate_desc bắt buộc phủ hết từng loại một, nghiêm cấm bỏ sót hay chỉ viết vài loại): {{CROPLIST}}\n' +
      '5. flavor là một câu cho người chơi đọc, trong 30 chữ, ưu tiên hương vị, có thể hóm hỉnh.\n' +
      '6. Chỉ được xuất đúng một dòng JSON, cấm xuất giải thích, tiền tố hậu tố hay dấu khối code:\n' +
      '{"name":"tên sự kiện 2~6 chữ","type":"buff|debuff|neutral","time_mult":1,"double_yield":false,"mutate_on_fert":0,"mutate_prefix":"","mutate_desc":{"tên cây trồng":"mô tả hiệu ứng"},"favored_crop":"","flavor":"một câu"}\n\n' +
      'Ví dụ định dạng (lấy từ thế giới khác, chỉ để tham khảo định dạng và hướng hương vị, cấm chép nguyên):\n' +
      '- {"name":"Mưa linh","type":"buff","time_mult":0.8,"flavor":"Linh khí đọng thành mưa, mầm rau lén vươn đốt nghe rõ tiếng."}\n' +
      '- {"name":"Mưa axit","type":"debuff","time_mult":1.1,"mutate_on_fert":0.3,"mutate_prefix":"biến chủng","flavor":"Mưa axit gõ mái, rau ỉu xìu mọc chậm, cây đã bón phân e là mọc méo mất."}\n' +
      '- {"name":"Rò rỉ phân nano","type":"neutral","mutate_on_fert":0.4,"mutate_prefix":"siêu to","mutate_desc":{"Bí ngô":"Bổ ra thì không gian bên trong rộng hơn bên ngoài","Cà chua":"Người ăn nhớ mọi thứ trong chốc lát"},"flavor":"Cây bón phân hôm nay có thể mọc ra hình thù khó tin."}\n' +
      (CS.userPrompt ? '\n[Sở thích tuỳ chỉnh của người chơi, ưu tiên đáp ứng, nhưng không được vượt ra ngoài phạm vi các trường]:\n' + CS.userPrompt + '\n' : '') +
      '\nTrích world book:\n' + (worldbook || '(Thế giới này tạm chưa có world book, hãy tạo một sự kiện đồng quê chung chung)')).replace('{{CROPLIST}}', cropList).replace('{{CROPCOUNT}}', String(cropList.split(', ').length));
  }

  function sanitizeEvent(o) {
    if (!o || typeof o !== 'object') return null;
    const ev = {
      name: String(o.name || 'Chuyện lạ').slice(0, 40),
      type: ['buff', 'debuff', 'neutral'].indexOf(o.type) >= 0 ? o.type : 'neutral',
      time_mult: clampN(o.time_mult != null ? o.time_mult : (o.growth_mult && o.growth_mult !== 1 ? 1 / o.growth_mult : 1), 0.7, 1.1, 1),   // growth_mult cũ (tốc độ) tự động quy đổi (yield_mult đã nghỉ hưu, bỏ qua thẳng)
      double_yield: o.double_yield === true,               // v1.1: phúc lợi dân may, số quả ×2 (kiểu boolean, nghiêm cấm số thập phân)
      mutate_on_fert: clampN(o.mutate_on_fert, 0, 0.5, 0),
      mutate_prefix: String(o.mutate_prefix || 'đột biến').slice(0, 20),
      mutate_desc: (o.mutate_desc && typeof o.mutate_desc === 'object')
        ? Object.keys(o.mutate_desc).slice(0, 30).reduce((a, k) => { a[String(k).slice(0, 30)] = String(o.mutate_desc[k]).slice(0, 100); return a; }, {})
        : (typeof o.mutate_desc === 'string' && o.mutate_desc ? { '*': String(o.mutate_desc).slice(0, 100) } : {}),
      favored_crop: (() => {                              // #20: sự kiện có thể chỉ ưu ái một loại cây
        const f = String(o.favored_crop || '');
        return Object.values(CROPS).some(c => c.name === f) ? f : '';
      })(),
      flavor: String(o.flavor || ''),
    };
    // Danh sách trắng các trường đã thu về còn time_mult + mutate_on_fert, không cần cắt thêm   // Danh sách trắng: tối đa hai trường số
    return ev;
  }
  function extractJson(raw) {                             // Móc đối tượng JSON hoàn chỉnh đầu tiên ra khỏi văn bản bất kỳ (ghép cặp theo độ sâu, bỏ qua ngoặc nằm trong chuỗi)
    const s = raw.indexOf('{');
    if (s < 0) return null;
    let depth = 0, inStr = false, escd = false;
    for (let i = s; i < raw.length; i++) {
      const ch = raw[i];
      if (inStr) {
        if (escd) escd = false;
        else if (ch === '\\') escd = true;
        else if (ch === '"') inStr = false;
      } else {
        if (ch === '"') inStr = true;
        else if (ch === '{') depth++;
        else if (ch === '}') { depth--; if (depth === 0) return raw.slice(s, i + 1); }
      }
    }
    return null;
  }
  function fallbackEvent() {
    const w = weatherOf(gameDay());
    return sanitizeEvent(w === 'Mưa nhỏ'
      ? { name: 'Mưa nhỏ', type: 'buff', time_mult: 0.9, flavor: 'Mưa nhỏ rồi, mấy cây rau uống nước vui lắm.' }
      : w === 'Nhiều mây'
        ? { name: 'Nhiều mây', type: 'neutral', flavor: 'Mây che bớt nắng, rau và bạn đều thong thả.' }
        : { name: 'Nắng', type: 'neutral', flavor: 'Nắng đẹp lắm, hợp để trồng gì đó.' });
  }

  let eventPending = false;
  async function requestDayEvent(force) {
    if (eventPending || !CS.link) return;
    if (!force && todayEvent()) return;                        // Mỗi ngày trong game tối đa một lần
    if (!SEC.url || !SEC.model) { applyDayEvent(fallbackEvent(), 'fallback', 'Chưa cấu hình API phụ (điền xong trong cài đặt thì nhớ bấm "Lưu cấu hình")'); return; }
    eventPending = true; renderBanner();
    try {
      const wb = await collectWorldbook();
      console.log('====== [FARM DEBUG] WORLDBOOK EXTRACTED ======');
      console.log(wb);
      console.log('================================================');
      const prompt = buildEventPrompt(wb);
      const reqBody = {
        model: SEC.model,
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: 'Hãy tạo sự kiện vườn rau cho hôm nay.' }
        ],
        max_tokens: 2000 + Object.keys(CROPS).length * 100
      };
      const resPromise = fetch(SEC.url.replace(/\/+$/, '') + '/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(SEC.key ? { Authorization: 'Bearer ' + SEC.key } : {}) },
        body: JSON.stringify(reqBody)
      }).then(r => r.json());

      const data = await Promise.race([
        resPromise,
        new Promise((_, rej) => pwin.setTimeout(() => rej(new Error('timeout')), 90000)),   // v0.8: 15 mô tả nên lượng sinh ra lớn, 30s→90s
      ]);
      
      if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));
      const raw = data.choices && data.choices[0] && data.choices[0].message ? String(data.choices[0].message.content) : '';
      const jtxt = extractJson(raw);                      // Trích theo cặp ngoặc (hỗ trợ đối tượng lồng nhau, regex không tham lam sẽ cắt cụt mutate_desc)
      if (!jtxt) throw new Error(raw.trim() ? 'Không có JSON, model trả về: ' + raw.trim().slice(0, 40) : 'Model trả về rỗng (có thể max_tokens bị phần suy nghĩ ăn hết / API không xuất gì)');
      const ev = sanitizeEvent(JSON.parse(jtxt));
      if (!ev) throw new Error('Trường JSON bất thường');
      applyDayEvent(ev, 'ai');
    } catch (e) {
      applyDayEvent(fallbackEvent(), 'fallback', ((e && e.message) || String(e)).slice(0, 60));
    } finally { eventPending = false; renderBanner(); }
  }
  function applyDayEvent(ev, source, reason) {
    const d = gameDay();
    S.dayEvent = { day: d, at: now(), who: charName(), ev, source, reason: reason || '' };   // at = mốc neo tính giờ, gieo lại thủ công cũng dời theo
    if (ev.time_mult !== 1) {
      eachPage(plots => plots.forEach(p => {              // v0.8: sự kiện dùng chung cho ba trang
        const c = p.crop;
        if (!c || now() >= c.matureAt || c.evDay === d) return;
        if (ev.favored_crop && CROPS[c.id].name !== ev.favored_crop) return;   // #20: giới hạn theo cây được ưu ái
        c.matureAt = now() + Math.round((c.matureAt - now()) * ev.time_mult);   // Có hiệu lực một lần trong ngày (hệ số thời lượng, <1 = nhanh hơn)
        c.evDay = d;
      }));
    }
    save(); renderStatus(); renderPlots();
  }

  async function testSecApi() {
    if (!SEC.url || !SEC.model) return toast('Hãy điền địa chỉ API và tên model trước');
    toast('Đang kiểm tra kết nối…');
    try {
      const reqBody = {
        model: SEC.model,
        messages: [{ role: 'user', content: 'Chỉ trả lời đúng hai chữ: Có mặt' }],
        max_tokens: 16
      };
      const resPromise = fetch(SEC.url.replace(/\/+$/, '') + '/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(SEC.key ? { Authorization: 'Bearer ' + SEC.key } : {}) },
        body: JSON.stringify(reqBody)
      }).then(r => r.json());

      const data = await Promise.race([
        resPromise,
        new Promise((_, rej) => pwin.setTimeout(() => rej(new Error('Quá thời gian chờ (20s)')), 20000)),
      ]);
      
      if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));
      const raw = data.choices && data.choices[0] && data.choices[0].message ? String(data.choices[0].message.content) : '';
      toast('Kết nối thành công: ' + raw.trim().slice(0, 20));
    } catch (e) { toast('Kết nối thất bại: ' + ((e && e.message) || e)); }
  }

  /* #53: lấy danh sách model (API /models) —— dropdown nội tuyến, chọn xong điền thẳng vào ô model */
  async function fetchModelList() {
    const url = $id('secUrl').value.trim(), key = $id('secKey').value.trim();
    const drop = $id('modelDrop');
    if (!url) return toast('Hãy điền địa chỉ API trước');
    if (drop.style.display !== 'none') { drop.style.display = 'none'; return; }   // Bấm lần nữa = thu lại
    toast('Đang lấy danh sách model…');
    try {
      const ctrl = new AbortController();
      const to = pwin.setTimeout(() => ctrl.abort(), 15000);
      const r = await fetch(url.replace(/\/+$/, '') + '/models', { headers: key ? { Authorization: 'Bearer ' + key } : {}, signal: ctrl.signal });
      pwin.clearTimeout(to);
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const d = await r.json();
      const ids = ((d && (d.data || d.models)) || []).map(m => (m && (m.id || m.model || m.name)) || '').filter(Boolean);
      if (!ids.length) throw new Error('API không trả về danh sách model');
      drop.innerHTML = ids.map(id => `<span data-mpick="${esc(id)}">${esc(id)}</span>`).join('');
      drop.style.display = 'flex';
      drop.querySelectorAll('[data-mpick]').forEach(el => el.addEventListener('click', () => {
        $id('secModel').value = el.dataset.mpick;
        drop.style.display = 'none';
        toast('Đã chọn: ' + el.dataset.mpick + ', nhớ bấm lưu cấu hình');
      }));
    } catch (e) { toast('Lấy danh sách thất bại: ' + ((e && e.message) || e)); }
  }

  /* Công tắc ②: tiêm tóm tắt vườn rau (setExtensionPrompt ở dạng bộ nhớ, không ghi vào lịch sử chat) */
  const INJECT_ID = 'star_tavern_farm_summary';
  function setInjection(text) {
    try {
      const ctx = (SillyTavern.getContext && SillyTavern.getContext()) || SillyTavern;
      ctx.setExtensionPrompt(INJECT_ID, text || '', 1, 4);
    } catch (e) {}
  }
  function updateInjection() {
    if (!CS.link || !CS.story) { setInjection(''); return; }
    const counts = {}; let ripe = 0;
    eachPage(plots => plots.forEach(p => {                // v0.8: tóm tắt gộp cả ba trang
      const c = p.crop; if (!c) return;
      counts[c.id] = (counts[c.id] || 0) + 1;
      if (now() >= c.matureAt) ripe++;
    }));
    const field = Object.keys(counts).map(id => CROPS[id].name + '×' + counts[id]).join(', ') || 'đang để trống';
    const bagTxt = Object.keys(S.bag).map(k => {
      const d = mutDescOf(k);
      return bagName(k) + '×' + S.bag[k] + (d ? '(' + d + ')' : '');
    }).join('、');
    const ev = todayEvent();
    setInjection('【Vườn rau nhỏ của người chơi】Người chơi đang trồng một mảnh vườn rau thư giãn ngay trên giao diện SillyTavern (lối chơi tiện ích, tồn tại song song với cốt truyện). Hiện tại: trong ruộng đang trồng ' + field +
      (ripe ? ' (có ' + ripe + ' cây đã chín chờ thu)' : '') +
      (bagTxt ? '; nông sản đang tích trữ chờ bán: ' + bagTxt : '') +
      (ev && ev.flavor ? '; sự kiện vườn rau hôm nay: ' + ev.name + ' —— ' + ev.flavor : '') +
      (function () {
        takeoutNote = (takeoutNote || []).filter(t => now() < t.until);
        if (!takeoutNote.length) return '';
        return '; 【Quan trọng】Người chơi vừa lấy ' + takeoutNote.map(t => t.txt).join(', ') + ' ra khỏi balo vườn rau, hẳn là định dùng/tặng trong cốt truyện, hãy tiếp nhận một cách tự nhiên; phần trong ngoặc là hiệu ứng đã định của vật phẩm đó, hãy lấy đó làm chuẩn và có thể sáng tạo thêm trong chừng mực';
      })() +
      '. Nhân vật trong cốt truyện thỉnh thoảng có thể nhắc tới việc người chơi chăm vườn hay thu hoạch thế nào một cách tự nhiên, nhưng đừng thao tác vườn rau thay người chơi, cũng đừng biến vườn rau thành mạch chính của cốt truyện.');
  }

  /* #17+v0.6b: nhịp tim chạy nền —— cứ 60s chạy settle một lần (tính toán cục bộ, cỡ micro~mili giây): sự kiện tới hạn thì gieo lại, bé làm việc làm việc, kết toán tìm kho báu; mở hay không mở bảng đều có hiệu lực */
  const heartbeat = pwin.setInterval(() => {
    try { settle(); } catch (e) {}
  }, 60 * 1000);

  /* Đổi thẻ: nạp lại trạng thái phía nhân vật, sự kiện lấy lại theo thẻ */
  try {
    eventSource.on(event_types.CHAT_CHANGED, () => {
      loadCharState();
      renderChips(); renderBanner(); updateInjection();
      if (CS.link) requestDayEvent();
    });
  } catch (e) {}

  /* ---------- Bóng nổi: kéo / hít mép / phân xử cú bấm (C11 §4) ---------- */
  const orb = $id('orb'), win = $id('win');
  const disposers = [];
  let gesture = null, destroyed = false;
  function placeOrb() {
    const vw = pwin.innerWidth, vh = pwin.innerHeight;
    const x = Math.min(Math.max(S.orb.fx * vw, 4), vw - 56);
    const y = Math.min(Math.max(S.orb.fy * vh, 4), vh - 56);
    orb.style.left = x + 'px'; orb.style.top = y + 'px';
    orb.classList.toggle('dockL', S.orb.dock === 'L');   // Sửa #12: khôi phục trạng thái thu nửa
    orb.classList.toggle('dockR', S.orb.dock === 'R');
  }
  function onOrbDown(e) {
    if (!e.isPrimary || (e.pointerType === 'mouse' && e.button !== 0)) return;
    if (gesture) return;
    orb.setPointerCapture(e.pointerId);
    gesture = { id: e.pointerId, sx: e.clientX, sy: e.clientY, ox: orb.offsetLeft, oy: orb.offsetTop, drag: false };
  }
  function onOrbMove(e) {
    if (!gesture || e.pointerId !== gesture.id) return;
    if (Math.hypot(e.clientX - gesture.sx, e.clientY - gesture.sy) > 5) {
      gesture.drag = true;
      orb.classList.remove('dockL', 'dockR');   // Sửa #12: khi kéo thì hiện đầy đủ
    }
    if (gesture.drag) {
      orb.style.left = gesture.ox + e.clientX - gesture.sx + 'px';
      orb.style.top = gesture.oy + e.clientY - gesture.sy + 'px';
    }
  }
  function onOrbUp(e, cancelled) {
    if (!gesture || e.pointerId !== gesture.id) return;
    const wasDrag = gesture.drag;
    try { orb.releasePointerCapture(e.pointerId); } catch (er) {}
    gesture = null;
    if (cancelled) return;
    const vw = pwin.innerWidth, vh = pwin.innerHeight;
    if (wasDrag) {
      let nx = Math.min(Math.max(orb.offsetLeft, 4), vw - 56);    // Sửa #1: lại gần mép mới hít, còn lại đứng nguyên chỗ
      let dock = null;
      if (nx < SNAP_EDGE) { nx = 4; dock = 'L'; }
      else if (nx > vw - 56 - SNAP_EDGE) { nx = vw - 56; dock = 'R'; }
      orb.style.left = nx + 'px';
      S.orb = { fx: nx / vw, fy: Math.min(Math.max(orb.offsetTop, 4), vh - 56) / vh, dock };   // Sửa #12
      orb.classList.toggle('dockL', dock === 'L');
      orb.classList.toggle('dockR', dock === 'R');
      save();
    } else toggleWin();
  }
  orb.addEventListener('pointerdown', onOrbDown);
  orb.addEventListener('pointermove', onOrbMove);
  orb.addEventListener('pointerup', e => onOrbUp(e, false));
  orb.addEventListener('pointercancel', e => onOrbUp(e, true));
  let resizeTimer = null;
  const onResize = () => {
    if (resizeTimer) pwin.clearTimeout(resizeTimer);
    resizeTimer = pwin.setTimeout(() => {
      placeOrb();
      if (win.classList.contains('open')) { layout(); placeWin(); renderPlots(); }
    }, 150);
  };
  pwin.addEventListener('resize', onResize);
  disposers.push(() => pwin.removeEventListener('resize', onResize));
  placeOrb();

  /* ---------- Sửa #11: bố cục dọc thu nhỏ đồng loạt (ô tính theo chiều rộng màn hình, sprite lấy bội số của 16) ---------- */
  let SPRITE_PX = 64, DECO_PX = 56;
  function layout() {
    const vw = pwin.innerWidth;
    let plot = 74;
    if (vw <= 640) plot = Math.max(52, Math.min(74, Math.floor((Math.min(vw * 0.96, 760) - 92) / 4)));
    win.style.setProperty('--plot', plot + 'px');
    SPRITE_PX = 48;                                       // v0.9: 64→48 (thu 3 lần), hình chi tiết không bị thô (vẫn giữ luật sắt bội số nguyên của 16)
    DECO_PX = plot >= 70 ? 56 : 40;
  }

  /* ---------- Bật tắt / kéo cửa sổ nổi ---------- */
  let tick = null;
  function placeWin() {
    const vw = pwin.innerWidth, vh = pwin.innerHeight;
    const w = Math.min(760, vw * 0.96);
    let x = S.win ? S.win.fx * vw : (vw - w) / 2;
    let y = S.win ? S.win.fy * vh : vh * 0.04;
    win.style.left = Math.min(Math.max(x, 0), Math.max(vw - w, 0)) + 'px';
    win.style.top = Math.min(Math.max(y, 0), vh - 60) + 'px';
  }
  function toggleWin() {
    if (win.classList.contains('open')) { closeWin(); return; }
    win.classList.add('open');
    layout(); placeWin(); settle(); renderAll();
    tick = pwin.setInterval(() => { renderDynamic(); }, 1000);
  }
  function closeWin() {
    win.classList.remove('open');
    if (tick) { pwin.clearInterval(tick); tick = null; }
    save(true);
  }
  $id('close').addEventListener('click', closeWin);
  let wg = null;
  const dragBar = $id('drag');
  dragBar.addEventListener('pointerdown', e => {
    if (e.target.id === 'close') return;
    dragBar.setPointerCapture(e.pointerId);
    wg = { id: e.pointerId, sx: e.clientX, sy: e.clientY, ox: win.offsetLeft, oy: win.offsetTop };
  });
  dragBar.addEventListener('pointermove', e => {
    if (!wg || e.pointerId !== wg.id) return;
    win.style.left = wg.ox + e.clientX - wg.sx + 'px';
    win.style.top = wg.oy + e.clientY - wg.sy + 'px';
  });
  dragBar.addEventListener('pointerup', e => {
    if (!wg || e.pointerId !== wg.id) return;
    try { dragBar.releasePointerCapture(e.pointerId); } catch (er) {}
    wg = null;
    S.win = { fx: win.offsetLeft / pwin.innerWidth, fy: win.offsetTop / pwin.innerHeight };
    save();
  });

  /* ---------- Logic game ---------- */
  const fmtDur = m => m < 60 ? m + ' phút' : (m % 60 === 0 ? (m / 60) + ' giờ' : (m / 60).toFixed(1) + ' giờ');
  function growMs(cropId) { return TEST_MODE ? GROW : CROPS[cropId].grow * MIN; }   // v1.0: tra bảng A
  function regrowMs(cropId) { const c = CROPS[cropId]; return TEST_MODE ? REGROW : (c.regrowM || Math.round(c.grow * 0.6)) * MIN; }
  function plant(pi, cropId) {
    if ((S.seeds[cropId] || 0) <= 0) return toast('Hết hạt giống này rồi');
    let realId = cropId;
    if (cropId === 'mystery') {                           // #29/#49: hộp mù hai lớp —— random ra họ × biến hình theo khu
      const fam = ['dream', 'key', 'fang'][Math.floor(Math.random() * 3)];
      realId = fam + (S.page === 2 ? 'W' : S.page === 3 ? 'M' : 'G');
    }
    else {
      const z = CROPS[cropId].zone || 1;                  // v0.8: cây kén đất
      if (z !== S.page) return toast(CROPS[cropId].name + ' phải trồng ở ' + ZONE_NAME[z] + ' (trang ' + z + ')');
    }
    S.seeds[cropId]--;
    const g = growMs(realId);
    const c = { id: realId, matureAt: now() + g, yieldBonus: 0, wateredUntil: 0, fertUsed: {} };
    if (CROPS[realId].regrow) c.left = REGROW_MAX;
    if (isRain()) { c.matureAt = now() + g * 0.9; c.rainDay = gameDay(); }   // Sửa #10: trồng vào ngày mưa được giảm thẳng 10%
    const ev = todayEvent();                                                  // Sự kiện thế giới quan: trồng trong ngày cũng được hưởng
    if (ev && ev.time_mult !== 1 && (!ev.favored_crop || CROPS[realId].name === ev.favored_crop)) {
      c.matureAt = now() + Math.round((c.matureAt - now()) * ev.time_mult);   // Sự kiện thế giới quan: hệ số thời gian sinh trưởng (<1 = nhanh hơn = tích cực)
      c.evDay = gameDay();
    }
    curPlots()[pi].crop = c;
    save(); renderPlots();
    return true;
  }
  function water(pi) {
    const c = curPlots()[pi].crop;
    if (!c) return toast('Ô này chưa trồng gì');
    if (now() >= c.matureAt) return toast('Chín rồi, thu nhanh đi!');
    if (now() < c.wateredUntil) return toast('Vừa tưới xong mà');
    c.matureAt = now() + (c.matureAt - now()) * 0.75;
    c.wateredUntil = now() + WATER_CD;
    save(); renderPlots(); toast('Tưới nước xong, cây mọc nhanh hơn!');
  }
  function fertilize(pi, fid, quiet) {
    const c = curPlots()[pi].crop;
    if (!c) return toast('Ô này chưa trồng gì');
    if ((S.ferts[fid] || 0) <= 0) return toast('Hết loại phân này rồi');
    if (!c.fertUsed) c.fertUsed = {};
    if (c.fertUsed[fid]) return toast('Vụ này đã bón ' + FERTS[fid].name + ' rồi');   // Sửa #3
    if (fid === 'compost') {
      if (now() >= c.matureAt) return toast('Chín rồi, khỏi bón phân');
      c.matureAt = now() + (c.matureAt - now()) * 0.75;
    } else c.shiny = true;                             // v1.0 B′: khi thu hoạch kết toán 25% giá bán thành vàng (thay cho cơ chế +1 sản lượng cũ)
    c.fertUsed[fid] = true;
    S.ferts[fid]--;
    save(); renderPlots();
    if (!quiet) plotEmote(pi, fid === 'compost' ? (Math.random() < 0.5 ? 'emLeaf' : 'emNote') : (Math.random() < 0.5 ? 'emHeart' : 'emStar'));   // Sửa #15
    return true;
  }
  function rollMutation(c, pi) {                          // Mỗi vụ gieo một lần; nhịp tim settle và cửa thu hoạch dùng chung (chặn tranh chấp tốc độ tay giữa lúc chín và lúc tung xúc xắc)
    if (c.mutRolled) return;
    c.mutRolled = true;
    const ev = todayEvent();
    if (!ev || !(ev.mutate_on_fert > 0)) return;
    const fertN = (c.fertUsed && c.fertUsed.compost ? 1 : 0) + (c.fertUsed && c.fertUsed.shiny ? 1 : 0);
    if (Math.random() < ev.mutate_on_fert * (0.3 + 0.35 * fertN)) {
      c.mut = (ev.mutate_prefix || 'đột biến').slice(0, 20);
      if (!S.mutDesc) S.mutDesc = {};
      const cname = CROPS[c.id].name;                     // #19: mô tả chức năng lưu theo cây (tiền tố@cây)
      const dsc = ev.mutate_desc && (ev.mutate_desc[cname] || ev.mutate_desc['*']);
      if (dsc) S.mutDesc[c.mut + '@' + cname] = dsc;
      if (pi != null) { try { plotEmote(pi, 'emStar'); } catch (e) {} }
    }
  }
  function bagName(key) {
    const parts = key.split('@');
    return (parts[1] ? parts[1] + '·' : '') + (CROPS[parts[0]] || { name: '?' }).name;   // Dự phòng: id lạ cũng không làm nổ balo
  }
  function bagPrice(key) {
    const parts = key.split('@');
    return Math.round((CROPS[parts[0]] || { sell: 0 }).sell * (parts[1] ? 1.25 : 1));   // Hàng đột biến bán được ×1.25
  }
  function mutDescOf(bagKey) {                            // #19: lấy mô tả chức năng (tương thích khoá chỉ có tiền tố của save cũ)
    const parts = bagKey.split('@');
    if (!parts[1] || !S.mutDesc) return '';
    return S.mutDesc[parts[1] + '@' + (CROPS[parts[0]] || { name: '' }).name] || S.mutDesc[parts[1]] || '';
  }
  function harvest(pi, quiet) {
    const c = curPlots()[pi].crop;
    if (!c || now() < c.matureAt) return null;
    rollMutation(c, pi);                                  // Cửa thu hoạch gieo bù (chống việc bấm quá nhanh trong 1 giây sau khi chín làm bỏ qua bước xét)
    const def = CROPS[c.id];
    let n = 1 + (c.yieldBonus || 0);                      // v1.1: hệ số sản lượng nghỉ hưu (sự kiện chỉ ảnh hưởng thời gian sinh trưởng)
    const dev = todayEvent();
    if (dev && dev.double_yield && (!dev.favored_crop || def.name === dev.favored_crop)) n *= 2;   // v1.1: ngày bội thu gấp đôi (phúc lợi dân may)
    const key = c.mut ? c.id + '@' + c.mut : c.id;
    const shownName = (c.mut ? c.mut + '·' : '') + def.name;
    S.bag[key] = (S.bag[key] || 0) + n;
    let shinyGain = 0;                                    // Phân lấp lánh v1.0 B′: khi thu hoạch kết toán 25% giá bán thành vàng
    if (c.shiny) { shinyGain = Math.ceil(def.sell * 0.25) * n; S.coins += shinyGain; delete c.shiny; }
    c.yieldBonus = 0;
    if (c.left == null && def.regrow) c.left = REGROW_MAX;
    if (def.regrow && c.left - 1 > 0) {                 // Sửa #4: tối đa 3 vụ
      c.left--;
      c.matureAt = now() + regrowMs(c.id);
      c.fertUsed = {};                                   // Vụ mới: phân bón và đột biến đều đặt lại
      delete c.rainDay; delete c.mut; delete c.mutRolled;
      save(); renderPlots(); if (!quiet) toast('Thu hoạch ' + shownName + ' ×' + n + ' (còn thu được ' + c.left + ' vụ nữa)' + (shinyGain ? ' ✨+' + shinyGain + 'G' : ''));
    } else {
      curPlots()[pi].crop = null;
      save(); renderPlots(); if (!quiet) toast('Thu hoạch ' + shownName + ' ×' + n + (def.regrow ? ' (cây này công thành thân thoái rồi)' : '') + (shinyGain ? ' ✨+' + shinyGain + 'G' : ''));
    }
    return { name: shownName, n };
  }
  function shovel(pi) {
    if (!curPlots()[pi].crop) return;
    curPlots()[pi].crop = null;
    save(); renderPlots(); toast('Đã xới bỏ');
  }
  function buyBlock(bi) {
    const price = blockPrice(bi);
    if (S.coins < price) return toast('Không đủ vàng');
    if (bi !== curBlocks()) return;
    S.coins -= price; addBlock();
    save(); renderAll(); toast('Khai hoang thành công! Có ruộng mới rồi');
  }
  function sell(key, n) {
    const have = S.bag[key] || 0;
    n = Math.min(n, have);
    if (n <= 0) return;
    const gain = bagPrice(key) * n;
    S.bag[key] = have - n;
    if (S.bag[key] === 0) delete S.bag[key];
    S.coins += gain; S.totalSales += gain;
    save(); renderStatus(); openPanel('bag'); toast('Bán được ' + gain + ' G');
  }

  /* ---------- Thanh công cụ và các chế độ ---------- */
  let mode = null;         // null | {t:'seed',id} | {t:'water'} | {t:'fert',id} | {t:'harvest'} | {t:'shovel', confirmPi}
  let buyConfirm = { b: -1, until: 0 };   // Xác nhận lần hai khi khai hoang (trạng thái render, tránh bị vẽ lại mỗi giây xoá mất)
  const TOOLS = [
    { key: 'seed', sp: 'toolSeed', tip: 'Gieo hạt' },
    { key: 'water', sp: 'toolWater', tip: 'Tưới nước' },
    { key: 'fert', sp: 'toolFert', tip: 'Bón phân' },
    { key: 'harvest', sp: 'toolHarvest', tip: 'Thu hoạch' },
    { key: 'shovel', sp: 'toolShovel', tip: 'Xới bỏ' },
  ];
  let toolbarOpen = false;
  function renderToolbar() {
    const tb = $id('toolbar');
    tb.classList.toggle('open', toolbarOpen);
    if (!toolbarOpen) {
      tb.innerHTML = `<div class="tool" data-tool="expand" title="Công cụ" style="width:34px;height:34px">${spriteSVG('toolSeed', 22)}</div>`;
    } else {
      tb.innerHTML = TOOLS.map(t =>
        `<div class="tool${mode && mode.t === t.key ? ' selected' : ''}" data-tool="${t.key}" title="${t.tip}">${spriteSVG(t.sp, 30)}</div>`
      ).join('') + `<div class="tool mini" data-tool="collapse">✕</div>`;
    }
    const tip = $id('modetip');
    if (mode) {
      const names = { seed: 'Gieo hạt', water: 'Tưới nước', fert: 'Bón phân', harvest: 'Thu hoạch', shovel: 'Xới bỏ' };
      let txt = 'Chế độ ' + names[mode.t];
      if (mode.t === 'seed') txt += ' · ' + CROPS[mode.id].name;
      if (mode.t === 'fert') txt += ' · ' + FERTS[mode.id].name;
      if (mode.t === 'shovel') txt += ' · bấm hai lần để xác nhận';
      tip.textContent = txt + ' · bấm vào ô ruộng để thực hiện';
      tip.style.display = 'block';
    } else tip.style.display = 'none';
  }
  $id('toolbar').addEventListener('click', e => {
    const el = e.target.closest('[data-tool]'); if (!el) return;
    const k = el.dataset.tool;
    if (k === 'expand') { toolbarOpen = true; renderToolbar(); return; }
    if (k === 'collapse') { toolbarOpen = false; mode = null; renderToolbar(); return; }
    if (mode && mode.t === k) { mode = null; renderToolbar(); return; }
    if (k === 'seed') return pickFrom('Chọn hạt giống để gieo', S.seeds, id => CROPS[id].name, id => { mode = { t: 'seed', id }; renderToolbar(); });
    if (k === 'fert') return pickFrom('Chọn phân bón', S.ferts, id => FERTS[id].name, id => { mode = { t: 'fert', id }; renderToolbar(); });
    mode = { t: k };
    renderToolbar();
  });
  let pendingPick = null;   // Chỉ uỷ quyền một listener, tránh chồng chất trùng lặp
  function pickFrom(title, obj, nameFn, cb) {
    const ids = Object.keys(obj).filter(k => obj[k] > 0);
    if (!ids.length) return toast('Trong balo không có, ra cửa hàng mua đã');
    openModal(title, `<div class="picker">${ids.map(id =>
      `<span class="pick" data-pick="${id}">${nameFn(id)} ×${obj[id]}</span>`).join('')}</div>`);
    pendingPick = cb;
  }

  /* ---------- Render ---------- */
  function renderStatus() {
    $id('coins').textContent = S.coins.toLocaleString();
    const w = weatherOf(gameDay());
    $id('wicon').innerHTML = spriteSVG(w === 'Nắng' ? 'sun' : w === 'Mưa nhỏ' ? 'raincloud' : 'cloud', 22);   // Sửa #10
    $id('daytxt').textContent = 'Ngày ' + gameDay() + ' · ' + w + (w === 'Mưa nhỏ' ? ' (sinh trưởng +10%)' : '');
    $id('blocktxt').textContent = ZONE_NAME[S.page] + ' ' + curBlocks() + '/6';
  }
  function plotHTML(pi) {
    const c = curPlots()[pi].crop;
    if (!c) return '';
    const left = c.matureAt - now();
    const chip = CROPS[c.id].regrow && c.left != null ? `<span class="cnt2">${c.left}/${REGROW_MAX}</span>` : '';   // Sửa #4: số góc hiển thị số vụ
    const fdot = c.fertUsed && (c.fertUsed.compost || c.fertUsed.shiny) ? '<span class="fdot" title="Đã bón phân"></span>' : '';   // Dấu shiny ghi theo fertUsed, logic số góc không đổi   // Sửa #15: số góc bón phân hiển thị thường trực
    const mut = c.mut ? `<span class="cnt2" style="left:3px;right:auto;background:#ead9f7;border-color:#9a6ad8;color:#6a4a9a" title="${c.mut}·đột biến">✦</span>` : '';
    if (left <= 0) return spriteSVG(CROPS[c.id].sp, SPRITE_PX) + `<span class="ripe">!</span>` + chip + fdot + mut;
    const total = growMs(c.id);
    const prog = Math.min(0.99, 1 - left / total);
    return spriteSVG('seedling', SPRITE_PX) + `<div class="bar"><i style="width:${(prog * 100) | 0}%"></i></div>` + chip + fdot + mut;
  }
  /* v1.1 (wen chốt): bỏ hết trang trí ở ô khoá —— 24 ô đầy cỏ dại / hoa sen / pha lê thì rối mắt quá, để hoạ tiết nền đất tự tạo không khí */
  function renderPlots() {
    const wrap = $id('blocks');
    const pg = S.page, plots = curPlots(), nb = curBlocks();
    
    // 1. Dựng khung tĩnh (Skeleton) nếu chưa có hoặc chuyển trang
    if (wrap.children.length !== 6 || wrap.dataset.pg !== String(pg)) {
      wrap.dataset.pg = pg;
      let html = '';
      for (let b = 0; b < 6; b++) {
        html += `<div class="block" data-block="${b}">`;
        for (let j = 0; j < 4; j++) {
          html += `<div class="plot" data-pi="${b * 4 + j}"></div>`;
        }
        html += `</div>`;
      }
      wrap.innerHTML = html;
    }

    const groundKind = pg === 2 ? 'water' : pg === 3 ? 'mine' : 'grass';
    const plotKind = pg === 2 ? 'wplot' : pg === 3 ? 'mplot' : 'soil';
    const wetKind = pg === 2 ? 'wplotwet' : pg === 3 ? 'mplotwet' : 'wet';

    // 2. Surgical Update: Chỉ thay đổi những chỗ cần thiết
    for (let b = 0; b < 6; b++) {
      const blockEl = wrap.children[b];
      const locked = b >= nb;
      if (locked !== blockEl.classList.contains('locked')) {
        blockEl.classList.toggle('locked', locked);
      }
      
      let signEl = blockEl.lastElementChild;
      const hasSign = signEl && signEl.classList.contains('sign');
      
      if (locked) {
        const next = b === nb;
        const confirming = buyConfirm.b === b && now() < buyConfirm.until;
        const poor = S.coins < blockPrice(b);
        
        const sclassName = next ? (confirming ? "sign confirm" : (poor ? "sign poor" : "sign")) : "sign";
        const shtml = next
          ? (confirming
            ? `Bấm lần nữa<small>xác nhận chi ${blockPrice(b).toLocaleString()} G</small>`
            : `Khai hoang<small>${spriteSVG('coin', 13)}${blockPrice(b).toLocaleString()} G</small>`)
          : `Chưa mở<small>khai hoang ô trước đã</small>`;
          
        if (!hasSign) {
          signEl = document.createElement('div');
          signEl.className = sclassName;
          if (!next) signEl.style.opacity = '0.55';
          if (next) signEl.dataset.buy = String(b);
          signEl.innerHTML = shtml;
          blockEl.appendChild(signEl); console.log('[Farm] Added sign to block', b);
        } else {
          if (signEl.className !== sclassName) signEl.className = sclassName;
          if (!next && signEl.style.opacity !== '0.55') signEl.style.opacity = '0.55';
          if (next && signEl.style.opacity === '0.55') signEl.style.opacity = '';
          
          if (next && signEl.dataset.buy !== String(b)) signEl.dataset.buy = String(b);
          if (!next && signEl.dataset.buy !== undefined) delete signEl.dataset.buy;
          
          if (signEl.innerHTML !== shtml) signEl.innerHTML = shtml;
        }
      } else {
        if (hasSign) signEl.remove();
      }

      for (let j = 0; j < 4; j++) {
        const pi = b * 4 + j;
        const pEl = blockEl.children[j];
        
        if (locked) {
          if (pEl.dataset.deco !== 'lock') {
             pEl.dataset.deco = 'lock';
             pEl.innerHTML = '';
          }
        } else {
          if (pEl.dataset.deco === 'lock') delete pEl.dataset.deco;
          
          const c = plots[pi].crop;
          const wet = c && now() < c.wateredUntil;
          if (wet !== pEl.classList.contains('watered')) {
             pEl.classList.toggle('watered', wet);
          }
          
          if (!c) {
             if (pEl.dataset.state !== 'empty') {
               pEl.innerHTML = '';
               pEl.dataset.state = 'empty';
             }
          } else {
             const left = c.matureAt - now();
             const stateStr = `${c.id}|${c.left}|${c.mut}|${c.fertUsed ? Object.keys(c.fertUsed).join(',') : ''}|${left <= 0 ? 'ripe' : 'grow'}`;
             
             if (pEl.dataset.state !== stateStr) {
               pEl.innerHTML = plotHTML(pi);
               pEl.dataset.state = stateStr;
             } else {
               // Đang lớn và không có thay đổi về phân bón/đột biến -> Chỉ kéo dài thanh progress (O(1) reflow)
               if (left > 0) {
                 const prog = Math.min(0.99, 1 - left / growMs(c.id));
                 const w = ((prog * 100) | 0) + '%';
                 const barI = pEl.querySelector('.bar i');
                 if (barI && barI.style.width !== w) barI.style.width = w;
               }
             }
          }
        }
        
        const isLocked = pi >= nb * 4;
        const bg = isLocked ? tileURI(groundKind, pi * 31 + 5)
          : pEl.classList.contains('watered') ? tileURI(wetKind, pi * 31 + 5) : tileURI(plotKind, pi * 31 + 5);
        if (pEl.style.backgroundImage !== bg) pEl.style.backgroundImage = bg;
        const bgSz = isLocked ? '144px 144px' : '100% 100%';
        if (pEl.style.backgroundSize !== bgSz) pEl.style.backgroundSize = bgSz;
      }
    }
  }
  function renderChips() {
    const cl = $id('chipLink'), cs2 = $id('chipStory');
    cl.classList.toggle('on', CS.link);
    cl.textContent = 'Liên kết thẻ nhân vật: ' + (CS.link ? 'Bật' : 'Tắt');
    cs2.style.display = CS.link ? '' : 'none';
    cs2.classList.toggle('on', CS.story);
    cs2.textContent = 'Ảnh hưởng cốt truyện: ' + (CS.story ? 'Bật' : 'Tắt');
    $id('chipRegen').style.display = CS.link ? '' : 'none';   // Nút gieo lại chỉ hiện khi đã bật liên kết
  }
  function renderBanner() {
    const b = $id('banner');
    if (!CS.link) { b.classList.remove('show'); return; }
    if (eventPending) {
      b.classList.add('show');
      $id('btag').textContent = 'Sự kiện hôm nay';
      $id('btxt').textContent = 'Phù thuỷ tròn đang ngắm sao bói toán…';
      return;
    }
    const ev = todayEvent();
    if (!ev) { b.classList.remove('show'); return; }
    b.classList.add('show');
    $id('btag').textContent = 'Sự kiện hôm nay · ' + ev.name;
    const fx = [];
    if (ev.double_yield) fx.push('✨Thu hoạch hôm nay ×2!');
    if (ev.time_mult !== 1) fx.push(ev.time_mult < 1 ? 'Sinh trưởng nhanh hơn (thời lượng ×' + ev.time_mult + ')' : 'Sinh trưởng chậm lại (thời lượng ×' + ev.time_mult + ')');
    if (ev.mutate_on_fert > 0) fx.push('Cây hôm nay có thể đột biến');
    if (ev.favored_crop) fx.unshift('Chỉ ' + ev.favored_crop + ' chịu ảnh hưởng');
    const fb = S.dayEvent && S.dayEvent.source === 'fallback';
    $id('btxt').textContent = (ev.flavor || '') + (fx.length ? '(' + fx.join(' · ') + ')' : '') +
      (fb ? '〔Sự kiện ngoại tuyến' + (S.dayEvent.reason ? ': ' + S.dayEvent.reason : '') + '〕' : '');
  }
  function renderDynamic() { settle(); renderStatus(); renderPlots(); }
  function renderAll() { applyPageSkin(); renderPager(); renderStatus(); renderPlots(); renderToolbar(); renderChips(); renderBanner(); renderPets(); try { renderWitch(); } catch (e) {} }
  $id('chipLink').addEventListener('click', () => {
    CS.link = !CS.link;
    if (!CS.link) { CS.story = false; setInjection(''); }
    saveCharState(); renderChips(); renderBanner(); updateInjection();
    if (CS.link) { requestDayEvent(); toast('Đã bật liên kết, đang gieo quẻ sự kiện hôm nay theo thế giới quan'); }
    else toast('Đã về lại vườn rau chơi một mình');
  });
  $id('banner').addEventListener('click', () => $id('banner').classList.toggle('expand'));   // Banner: bấm một cái để mở / thu toàn văn
  $id('chipRegen').addEventListener('click', () => {      // Nút gieo lại dọn nhà: từ trang cài đặt chuyển ra hàng điều khiển (wen chốt, tiện tay với tới)
    S.dayEvent = null; save();
    requestDayEvent(true); toast('Đang gieo quẻ lại…');
  });
  $id('chipStory').addEventListener('click', () => {
    CS.story = !CS.story;
    saveCharState(); renderChips(); updateInjection();
    toast(CS.story ? 'Tình hình vườn rau sẽ được thì thầm cho những người trong cốt truyện' : 'Vườn rau lại giữ bí mật');
  });

  $id('blocks').addEventListener('click', e => {
    const sign = e.target.closest('[data-buy]');
    if (sign) {
      const b = +sign.dataset.buy;
      if (S.coins < blockPrice(b)) { toast('Còn thiếu ' + (blockPrice(b) - S.coins).toLocaleString() + ' G'); return; }   // Sửa #8
      if (buyConfirm.b === b && now() < buyConfirm.until) { buyConfirm = { b: -1, until: 0 }; buyBlock(b); }
      else { buyConfirm = { b, until: now() + 4000 }; renderPlots(); }
      return;
    }
    const p = e.target.closest('.plot'); if (!p || p.dataset.deco) return;
    const pi = +p.dataset.pi;
    const c = curPlots()[pi].crop;
    if (c && now() >= c.matureAt && (!mode || mode.t !== 'shovel')) { harvest(pi); return; }   // Sửa #6: rau chín bấm thẳng là thu ngay
    if (!mode) { if (c) toast(CROPS[c.id].name + ' · còn ' + fmtLeft(c.matureAt - now())); return; }
    if (mode.t === 'seed') { if (c) return toast('Ô này trồng rồi'); plant(pi, mode.id); if ((S.seeds[mode.id] || 0) <= 0) { mode = null; renderToolbar(); } return; }
    if (mode.t === 'water') return water(pi);
    if (mode.t === 'fert') { fertilize(pi, mode.id); if ((S.ferts[mode.id] || 0) <= 0) { mode = null; renderToolbar(); } return; }
    if (mode.t === 'harvest') return harvest(pi);
    if (mode.t === 'shovel') {
      if (!c) return;
      if (mode.confirmPi === pi) { shovel(pi); mode.confirmPi = null; }
      else { mode.confirmPi = pi; toast('Bấm lần nữa để xác nhận xới bỏ ' + CROPS[c.id].name); }
    }
  });

  /* ---------- Bảng ---------- */
  function openModal(title, bodyHTML) {
    $id('mtitle-text').textContent = title;
    $id('mbody').innerHTML = bodyHTML;
    $id('modal').classList.add('open');
  }
  function closeModal() { $id('modal').classList.remove('open'); pendingPick = null; bagSellMode = false; }   // Tự kiểm: đóng cửa sổ thì thoát chế độ tick chọn
  $id('mclose').addEventListener('click', closeModal);
  $id('mbody').addEventListener('click', e => {
    const el = e.target.closest('[data-pick]');
    if (!el || !pendingPick) return;
    const cb = pendingPick; pendingPick = null;
    closeModal(); cb(el.dataset.pick);
  });
  $id('modal').addEventListener('click', e => { if (e.target === $id('modal')) closeModal(); });

  let shopTab = 'seed';
  let bagTab = 'crop';
  let bagSellMode = false, bagSel = {};              // Bán một chạm: chế độ tick chọn (mặc định chọn hết)
  function openPanel(kind) {
    if (kind === 'shop') {
      const tabs = [['seed', 'Hạt giống'], ['fert', 'Phân bón'], ['pet', 'Thú cưng'], ['pass', 'Vé']];
      let items = '';
      if (shopTab === 'seed') {
        items = [1, 2, 3].map(z => {                      // v0.8: chia nhóm theo khu, họ hidden không bày bán
          const list = Object.entries(CROPS).filter(([id, c]) => !c.hidden && (c.zone || 1) === z);
          if (!list.length) return '';
          const un = pageUnlocked(z);
          const head = `<div class="note" style="margin:8px 0 6px">Cây ${ZONE_NAME[z]} (trang ${z})${un ? '' : ' · 🔒 cần vé ' + (z === 2 ? 'vùng nước' : 'khu mỏ')}</div>`;
          return head + list.map(([id, c]) => `
          <div class="item${un ? '' : ' locked'}"><span class="icon">${spriteSVG(c.sp, 32)}</span>
            <span class="info"><div class="name">Hạt ${c.name}${c.regrow ? ' <span style="font-size:10px;color:#6a4a9a">tái sinh</span>' : ''}</div>
            <div class="meta">Chín sau ${fmtDur(c.grow)}${c.regrow ? ' (tái sinh ' + fmtDur(c.regrowM || Math.round(c.grow * 0.6)) + ')' : ''} · Giá bán ${c.sell} G · Đang có ${S.seeds[id] || 0}</div></span>
            ${un ? `<span class="price">${spriteSVG('coin', 16)}${c.seed}</span>
            <span class="buy${S.coins < c.seed ? ' off' : ''}" data-buyseed="${id}">Mua</span>` : '<span class="buy off">Chưa mở khoá</span>'}</div>`).join('');
        }).join('');
      } else if (shopTab === 'fert') {
        items = Object.entries(FERTS).map(([id, f]) => `
          <div class="item"><span class="icon">${spriteSVG('toolFert', 32)}</span>
            <span class="info"><div class="name">${f.name}</div><div class="meta">${f.desc} · Đang có ${S.ferts[id] || 0}</div></span>
            <span class="price">${spriteSVG('coin', 16)}${f.price}</span>
            <span class="buy${S.coins < f.price ? ' off' : ''}" data-buyfert="${id}">Mua</span></div>`).join('');
      } else if (shopTab === 'pet') {
        items = Object.keys(PETS).map(id => {
          const pd = PETS[id];
          const owned = S.pets.indexOf(id) >= 0;
          const unlocked = pageUnlocked(pd.page);
          const poor = S.coins < pd.price;
          const btn = owned ? '<span class="buy off">Đã ở nhà</span>'
            : !unlocked ? '<span class="buy off">Chưa mở khoá</span>'
              : `<span class="buy${poor ? ' off' : ''}" data-buypet="${id}">Đón về nhà</span>`;
          const priceHtml = owned || !unlocked ? '' : `<span class="price">${spriteSVG('coin', 16)}${pd.price.toLocaleString()}</span>`;
          const lockNote = !unlocked ? ' · cần vé ' + (pd.page === 2 ? 'vùng nước' : 'khu mỏ') : '';
          return `
          <div class="item${!unlocked && !owned ? ' locked' : ''}"><span class="icon">${petSVG(id, 34)}</span>
            <span class="info"><div class="name">${pd.name}</div>
            <div class="meta">${pd.desc}${lockNote}</div></span>
            ${priceHtml}${btn}</div>`;
        }).join('');
      } else {
        items = Object.keys(PASSES).map(k => {
          const ps = PASSES[k];
          const owned = !!S.passes[k];
          return `
          <div class="item"><span class="icon">${spriteSVG(k === 'water' ? 'lotus' : 'gem', 32)}</span>
            <span class="info"><div class="name">${ps.name}</div><div class="meta">${ps.desc}</div></span>
            ${owned ? '' : `<span class="price">${spriteSVG('coin', 16)}${ps.price.toLocaleString()}</span>`}
            <span class="buy${owned ? ' plain' : ''}" data-passdlg="${k}">${owned ? 'Xem vé' : 'Mua'}</span></div>`;
        }).join('');
      }
      openModal('Cửa hàng', `
        <div style="display:flex;justify-content:flex-end;align-items:center;gap:4px;font-size:12px;font-weight:bold;color:#7a5c38;margin-bottom:6px">${spriteSVG('coin', 16)}${S.coins.toLocaleString()}</div>
        <div class="tabs">${tabs.map(([k, n]) => `<span class="tab${shopTab === k ? ' active' : ''}" data-tab="${k}">${n}</span>`).join('')}</div>
        <div class="items">${items}</div>`);
      $id('mbody').querySelectorAll('[data-tab]').forEach(t => t.addEventListener('click', () => { shopTab = t.dataset.tab; openPanel('shop'); }));
      $id('mbody').querySelectorAll('[data-buyseed]').forEach(b => b.addEventListener('click', () => openBuyDlg('seed', b.dataset.buyseed)));
      $id('mbody').querySelectorAll('[data-buyfert]').forEach(b => b.addEventListener('click', () => openBuyDlg('fert', b.dataset.buyfert)));
      $id('mbody').querySelectorAll('[data-buypet]').forEach(b => b.addEventListener('click', () => {
        const id = b.dataset.buypet, pd = PETS[id];
        if (S.pets.indexOf(id) >= 0) return;
        if (S.coins < pd.price) return toast('Còn thiếu ' + (pd.price - S.coins).toLocaleString() + ' G');
        S.coins -= pd.price; S.pets.push(id);
        if (S.petsOut.length < PETS_OUT_MAX) { S.petsOut.push(id); toast(pd.name + ' đã dọn ra bờ ruộng nhà bạn!'); }
        else toast(pd.name + ' đã về nhà! Bờ ruộng chật rồi, bé đang nghỉ ở trang Balo · Bé tròn');
        save(); renderStatus(); renderPets(); openPanel('shop');
      }));
      $id('mbody').querySelectorAll('[data-passdlg]').forEach(b => b.addEventListener('click', () => openPassDlg(b.dataset.passdlg)));
    } else if (kind === 'bag') {
      const btabs = `<div class="tabs"><span class="tab${bagTab === 'crop' ? ' active' : ''}" data-btab="crop">Nông sản</span><span class="tab${bagTab === 'pet' ? ' active' : ''}" data-btab="pet">Bé tròn</span><span class="tab${bagTab === 'relic' ? ' active' : ''}" data-btab="relic">Quà của bé tròn</span></div>`;
      if (bagTab === 'relic') {                            // v1.0: quà của bé tròn —— quầy riêng cho mảnh vỡ và hạt giống bí ẩn
        const sh2 = S.shards || { prism: 0, star: 0 };
        const relicRows = (S.seeds.mystery > 0 ? `
        <div class="item"><span class="icon">${spriteSVG('seedLight', 30)}</span>
          <span class="info"><div class="name">Hạt giống bí ẩn ×${S.seeds.mystery}</div><div class="meta">Trồng xuống sẽ ra ngẫu nhiên một họ (chọn khi gieo hạt / khi chọc bé mầm sương)</div></span></div>` : '') +
          (sh2.prism > 0 ? `
        <div class="item"><span class="icon">${spriteSVG('shardPrism', 30)}</span>
          <span class="info"><div class="name">Mảnh lăng quang ×${sh2.prism}</div><div class="meta">Dùng để "đổi đơn khác" ở trang đơn hàng của phù thuỷ</div></span></div>` : '') +
          (sh2.star > 0 ? `
        <div class="item"><span class="icon">${spriteSVG('shardStar', 30)}</span>
          <span class="info"><div class="name">Mảnh ngôi sao ×${sh2.star}</div><div class="meta">Đập vỡ sẽ triệu hồi phù thuỷ tròn ghé thăm</div></span>
          <span class="buy" data-useshard="star">Triệu hồi</span></div>` : '');
        openModal('Balo', btabs + (relicRows || '<div class="note">Ngăn quà còn trống~ Hạt giống bí ẩn đến từ chuyến tìm kho báu của bé quỷ/bé thiên thần và từ đơn hàng của phù thuỷ; bé lăng quang / bé chuông sao đi tìm kho báu sẽ mang mảnh vỡ về</div>'));
        $id('mbody').querySelectorAll('[data-btab]').forEach(t => t.addEventListener('click', () => { bagTab = t.dataset.btab; openPanel('bag'); }));
        $id('mbody').querySelectorAll('[data-useshard]').forEach(b => b.addEventListener('click', useStarShard));
        return;
      }
      if (bagTab === 'pet') {
        const prow = S.pets.map(id => {
          const pd = PETS[id]; if (!pd) return '';
          const out = S.petsOut.indexOf(id) >= 0;
          const cfg = '', cfgBtn = '';                    // #42: bỏ ghi nhớ cấu hình, gieo hạt / bón phân mỗi lần chọc là chọn lại
          return `
          <div class="item"><span class="icon">${petSVG(id, 34)}</span>
            <span class="info"><div class="name">${pd.name}${out ? ' <span style="font-size:10px;color:#4d7a26">đang ra sân</span>' : ''}</div>
            <div class="meta">${pd.desc}${cfg}</div></span>
            ${cfgBtn}
            <span class="buy${out ? ' plain' : ''}" data-petout="${id}">${out ? 'Thu về' : 'Ra sân'}</span></div>`;
        }).join('') || '<div class="note">Chưa có bé tròn nào, ra cửa hàng ngắm thử đi</div>';
        openModal('Balo', btabs + `<div class="note" style="margin-bottom:8px">Bờ ruộng cùng lúc đứng được tối đa ${PETS_OUT_MAX} bé; bé được thu về sẽ nghỉ ở đây, không làm việc cũng không tìm kho báu</div>` + prow);
        $id('mbody').querySelectorAll('[data-btab]').forEach(t => t.addEventListener('click', () => { bagTab = t.dataset.btab; openPanel('bag'); }));
        $id('mbody').querySelectorAll('[data-petout]').forEach(b => b.addEventListener('click', () => {
          const id = b.dataset.petout;
          const i = S.petsOut.indexOf(id);
          if (i >= 0) S.petsOut.splice(i, 1);
          else {
            if (S.petsOut.length >= PETS_OUT_MAX) return toast('Bờ ruộng chỉ đứng được ' + PETS_OUT_MAX + ' bé, thu một bé về đã');
            S.petsOut.push(id);
          }
          save(); renderPets(); openPanel('bag');
        }));
        return;
      }
      const rows = Object.entries(S.bag).map(([key, n]) => {
        const id = key.split('@')[0], mut = key.indexOf('@') > 0;
        const d0 = mutDescOf(key);
        const mdesc = d0 ? ' · ' + d0 : '';
        if (bagSellMode) {
          const on = !!bagSel[key];
          return `
        <div class="item selrow${on ? ' selon' : ''}" data-selkey="${key}"><span class="icon">${spriteSVG(CROPS[id].sp, 32)}</span>
          <span class="info"><div class="name">${bagName(key)} ×${n}${mut ? ' <span style="font-size:11px;color:#8a5cc0">✦</span>' : ''}</div><div class="meta">${bagPrice(key)} G/cái${esc(mdesc)}</div></span>
          <span class="selmark">${on ? '✓' : ''}</span></div>`;
        }
        return `
        <div class="item"><span class="icon">${spriteSVG(CROPS[id].sp, 32)}</span>
          <span class="info"><div class="name">${bagName(key)} ×${n}${mut ? ' <span style="font-size:11px;color:#8a5cc0">✦</span>' : ''}</div><div class="meta">${bagPrice(key)} G/cái${esc(mdesc)}</div></span>
          <span class="acts">
            <span class="ibtn" data-takeout="${key}" title="Lấy ra (mang vào cốt truyện, không quy ra tiền)">${spriteSVG('emBang', 16)}</span>
            <span class="ibtn" data-selldlg="${key}" title="Bán (tự chọn số lượng)">${spriteSVG('coin', 16)}</span>
          </span></div>`;
      }).join('');
      let sellBar = '';
      if (Object.keys(S.bag).length) {                     // Thanh bán một chạm ở trên cùng (tổng tiền tính theo bagPrice, cùng nguồn với đơn giá trong mô tả)
        if (bagSellMode) {
          const total = Object.keys(bagSel).filter(k => bagSel[k] && S.bag[k]).reduce((s, k) => s + bagPrice(k) * S.bag[k], 0);
          sellBar = `<div class="note" style="display:flex;align-items:center;gap:6px;flex-wrap:nowrap;margin-bottom:8px;white-space:nowrap;overflow:hidden">
            <b style="overflow:hidden;text-overflow:ellipsis">${total > 0 ? 'Tổng ' + total.toLocaleString() + ' G' : 'Bấm vào từng mục để tick chọn thứ muốn bán'}</b><span style="flex:1"></span>
            <span class="buy" id="sellSelGo" style="padding:4px 10px;font-size:11px;flex:none">Bán</span>
            <span class="buy plain" id="sellSelNo" style="padding:4px 10px;font-size:11px;flex:none">Huỷ</span></div>`;
        } else {
          sellBar = `<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
            <div class="note" style="flex:1">Bấm «!» để lấy nông sản ra mang vào cốt truyện</div>
            <span class="buy" id="sellModeGo" style="flex:none">Bán một chạm</span></div>`;
        }
      }
      openModal('Balo', btabs + sellBar + (rows || '<div class="note">Balo trống trơn, đi thu ít rau đi nào</div>'));
      $id('mbody').querySelectorAll('[data-btab]').forEach(t => t.addEventListener('click', () => { bagTab = t.dataset.btab; openPanel('bag'); }));
      $id('mbody').querySelectorAll('[data-selldlg]').forEach(b => b.addEventListener('click', () => openSellDlg(b.dataset.selldlg)));
      $id('mbody').querySelectorAll('[data-takeout]').forEach(b => b.addEventListener('click', () => openTakeout(b.dataset.takeout)));
      const smGo = $id('sellModeGo');
      if (smGo) smGo.addEventListener('click', () => {
        bagSellMode = true; bagSel = {};                   // Mặc định không chọn gì (wen chốt: tránh lỡ tay bán mất hàng đột biến sưu tầm)
        openPanel('bag');
      });
      $id('mbody').querySelectorAll('[data-selkey]').forEach(el => el.addEventListener('click', () => {
        bagSel[el.dataset.selkey] = !bagSel[el.dataset.selkey];
        openPanel('bag');
      }));
      const ssNo = $id('sellSelNo');
      if (ssNo) ssNo.addEventListener('click', () => { bagSellMode = false; openPanel('bag'); });
      const ssGo = $id('sellSelGo');
      if (ssGo) ssGo.addEventListener('click', () => {
        const keys = Object.keys(bagSel).filter(k => bagSel[k] && S.bag[k]);
        if (!keys.length) return toast('Chưa tick cái nào cả');
        let gain = 0;
        keys.forEach(k => { gain += bagPrice(k) * S.bag[k]; delete S.bag[k]; });
        S.coins += gain; S.totalSales += gain;
        bagSellMode = false;
        save(); renderStatus();
        toast('Bán một mẻ nông sản: +' + gain.toLocaleString() + ' G');
        openPanel('bag');
      });
    } else {
      openModal('Cài đặt', `
        <div class="shead" style="margin-top:0">Chủ đề giao diện</div>
        <div class="picker" style="margin-bottom:4px">
          <span class="pick${S.theme !== 'sky' ? ' active' : ''}" data-settheme="sakura">🌸 Hồng anh đào</span>
          <span class="pick${S.theme === 'sky' ? ' active' : ''}" data-settheme="sky">☁️ Trời quang</span>
        </div>
        <div class="shead">API phụ (dùng cho sự kiện thế giới quan)</div>
        <div style="display:flex;flex-direction:column;gap:6px">
          <input class="inp" id="secUrl" placeholder="Địa chỉ API, ví dụ https://xx.com/v1" value="${esc(SEC.url)}">
          <input class="inp" id="secKey" type="password" placeholder="API Key (chỉ lưu trong trình duyệt máy này, không vào save)" value="${esc(SEC.key)}">
          <input class="inp" id="secModel" placeholder="Tên model, ví dụ gemini-2.5-flash" value="${esc(SEC.model)}">
          <div class="mdrop" id="modelDrop" style="display:none"></div>
          <label style="display:flex;align-items:center;gap:6px;font-size:12px;color:#7a5c38;font-weight:bold;cursor:pointer">
            <input type="checkbox" id="secAuto" ${SEC.autoReset ? 'checked' : ''}> Tự động đặt lại sự kiện, mỗi
            <input class="inp" id="secHours" type="number" min="1" max="24" value="${SEC.resetHours}" style="width:60px;padding:3px 6px"> giờ một lần (1~24; tắt thì sự kiện giữ nguyên, chỉ gieo lại thủ công)
          </label>
          <label style="display:flex;align-items:center;gap:6px;font-size:12px;color:#7a5c38;font-weight:bold;cursor:pointer;margin-top:2px">
            Giới hạn chữ Lorebook gửi cho AI:
            <input class="inp" id="secWbLimit" type="number" min="0" max="1000000" value="${SEC.wbLimit !== undefined ? SEC.wbLimit : 20000}" style="width:80px;padding:3px 6px"> (0 = Không cắt, gửi toàn bộ)
          </label>
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:6px">
            <span class="buy" id="secSave">Lưu cấu hình</span>
            <span class="buy plain" id="secModels">Lấy model</span>
            <span class="buy plain" id="secTest">Kiểm tra kết nối</span>
          </div>
        </div>
        <div class="shead">Sự kiện thế giới quan · prompt tuỳ chỉnh (chỉ lưu ở thẻ nhân vật hiện tại)</div>
        <textarea class="inp" id="csPrompt" placeholder="Ví dụ: thế giới này linh khí mỏng, bớt sự kiện tích cực đi; lời văn sự kiện viết theo lối cổ.">${esc(CS.userPrompt)}</textarea>
        <div style="display:flex;gap:8px;margin-top:6px"><span class="buy" id="csPromptSave">Lưu (chỉ thẻ này)</span></div>
        <div class="note" style="margin:12px 0 8px">
          <b>Hướng dẫn chơi</b><br>· Liên kết thẻ nhân vật: bật lên sẽ tạo sự kiện dựa theo thẻ nhân vật hiện tại<br>
          · Ảnh hưởng cốt truyện: bật lên có thể tác động ngược vào cốt truyện hiện tại<br>
          · Sau khi bật liên kết, cây trồng có tỉ lệ <b>đột biến</b> theo thế giới quan (chỉ sự kiện có nội dung "đột biến" mới sinh ra cây đột biến); cây đột biến có thể "Lấy ra" trong balo để mang vào cốt truyện làm đạo cụ<br>
          · Hạt giống bí ẩn: trồng ra cây ngẫu nhiên. Nguồn: đơn hàng của phù thuỷ tròn (cần vé vùng nước mới mở); bé quỷ nhỏ / bé thiên thần đi tìm kho báu<br>
          · Save nằm trong chính SillyTavern, cập nhật phiên bản cứ nhập script mới, save không mất; API Key phụ chỉ nằm trong trình duyệt máy này<br>
          · Các bản SillyTavern khác nhau <b>không dùng chung</b> (cài thêm một bản trên điện thoại = một vườn rau khác); trước khi cài lại SillyTavern nhớ sao lưu thư mục data</div>
        <span class="buy" id="resetSave">Đặt lại save (cẩn thận, bấm hai lần)</span>`);
      $id('secSave').addEventListener('click', () => {
        SEC = {
          url: $id('secUrl').value.trim(), key: $id('secKey').value.trim(), model: $id('secModel').value.trim(),
          autoReset: $id('secAuto').checked, resetHours: clampN($id('secHours').value, 1, 24, 4),
          wbLimit: parseInt($id('secWbLimit').value, 10) || 0,
        };
        saveSec(); toast('Đã lưu cấu hình API phụ');
      });
      $id('secTest').addEventListener('click', () => testSecApi());
      $id('secModels').addEventListener('click', () => fetchModelList());
      $id('mbody').querySelectorAll('[data-settheme]').forEach(b => b.addEventListener('click', () => {
        S.theme = b.dataset.settheme; save(); applyTheme(); openPanel('cfg');
        toast(S.theme === 'sky' ? 'Đổi sang giao diện trời quang~' : 'Về lại giao diện hồng anh đào~');
      }));
      $id('csPromptSave').addEventListener('click', () => {
        CS.userPrompt = $id('csPrompt').value.slice(0, 3000);
        saveCharState(); toast('Đã lưu vào thẻ nhân vật hiện tại');
      });
      let armed = false;
      $id('resetSave').addEventListener('click', () => {
        if (!armed) { armed = true; $id('resetSave').textContent = 'Bấm lần nữa để xác nhận đặt lại!'; return; }
        S = freshState(); save(true); closeModal(); renderAll(); toast('Đã đặt lại');
      });
    }
  }
  sh.querySelectorAll('[data-open]').forEach(b => b.addEventListener('click', () => openPanel(b.dataset.open)));

  /* ---------- Thú cưng: render động + chọc chọc (uỷ quyền listener, bong bóng trên đầu, đủ 10 phút mới thật sự rơi tiền) ---------- */
  function petBubble(el, txt) {
    el.querySelector('.pbubble')?.remove();
    const b = pdoc.createElement('span');
    b.className = 'pbubble'; b.textContent = txt;
    el.appendChild(b);
    pwin.setTimeout(() => b.remove(), 1700);
  }
  /* #26 (sửa lần 2): hàng dưới cùng (cao bằng một ô ruộng) = tầng đi lại riêng cho loại làm việc, không chạy lên trên; các bé khác đi lang thang tự do trong toàn khu ruộng phía trên hàng dưới, có thể băng ngang qua ruộng
     v0.7①: di chuyển kiểu nhảy —— bé không thuộc nhóm bay sẽ nhích tới điểm đích bằng từng cú nhảy nhỏ (mỗi cú = xê dịch ngang tuyến tính một bước + thân bay lên hạ xuống theo parabol), mây/ma thì trượt */
  const petPos = {}, petTgt = {}, petHopT = {};            // Toạ độ / điểm đến / bộ đếm nhảy liên tiếp lúc chạy, không ghi vào save
  const WORK_BAND = 74;                                    // Chiều cao hàng dưới ≈ một ô ruộng (dành cho loại làm việc, loại đi dạo tính từ phía trên nó)
  const FLOATY = { cloudMallow: 1, ghostBlob: 1, bunny: 1 };   // Danh sách bay: không nhảy, trượt đều (#43: bé sứa xoăn nhập hội, thành bộ ba bay lơ lửng)
  const GAITS = {                                          // Dáng đi: len = độ dài một bước nhảy, dur = chu kỳ một cú nhảy (ms), hy = độ cao nhảy
    octo:      { len: 8,  dur: 260, hy: -4 },              // Bạch tuộc: bước lắt nhắt bò sát đất
    octoCream: { len: 8,  dur: 290, hy: -4 },              // Bạch tuộc kem: bò còn chậm rì hơn nữa
    _:         { len: 14, dur: 330, hy: -9 },              // Mặc định: kiểu nảy chuẩn của dòng slime
  };
  const gaitOf = id => GAITS[id] || GAITS._;
  const stopHop = id => { if (petHopT[id]) { pwin.clearTimeout(petHopT[id]); delete petHopT[id]; } };
  function petSpot(id) {
    const ov = $id('mascots'), W = ov.clientWidth, H = ov.clientHeight;
    if (PETS[id] && PETS[id].job) {                        // Loại làm việc (sửa lần 3): đứng cố định thành hàng ở góc dưới phải, nhún nhảy tại chỗ chứ không đi
      const workers = S.petsOut.filter(p => PETS[p] && PETS[p].job);
      const anchor = W - 64 - Math.max(0, workers.indexOf(id)) * 62;
      return { x: Math.max(4, anchor - 10 + Math.random() * 20), y: Math.random() * 4 };
    }
    const x = 4 + Math.random() * Math.max(20, W - 64);
    return { x, y: WORK_BAND + 6 + Math.random() * Math.max(20, H - WORK_BAND - 70) };
  }
  function placePet(el, p, instant) {                      // Đặt vị trí: instant = dịch chuyển tức thì; nếu không thì trượt đều (dành riêng cho bé bay)
    if (instant) el.style.transitionProperty = 'transform';
    else {
      const old = petPos[el.dataset.pet] || p;
      const dist = Math.hypot(p.x - old.x, p.y - old.y);
      const dur = dist < 40 ? .5 : Math.min(11, Math.max(3, dist / 18));
      el.style.transitionProperty = 'transform, left, bottom';
      el.style.transitionDuration = '.12s, ' + dur + 's, ' + dur + 's';
      el.style.transitionTimingFunction = 'ease, linear, ease';
      el.classList.toggle('flip', p.x < old.x);
    }
    el.style.left = p.x + 'px'; el.style.bottom = p.y + 'px';
    petPos[el.dataset.pet] = p;
  }
  function hopStep(el) {                                   // Một cú nhảy: nhích một bước về phía đích, tới nơi thì nghỉ
    const id = el.dataset.pet;
    if (!el.isConnected) { stopHop(id); return; }
    const cur = petPos[id], tgt = petTgt[id], g = gaitOf(id);
    if (!cur || !tgt || Math.hypot(tgt.x - cur.x, tgt.y - cur.y) < 3) {
      delete petTgt[id]; el.classList.remove('walk'); stopHop(id);
      const cb = petArrive[id]; delete petArrive[id]; if (cb) cb();   // v0.7③: callback khi tới nơi (dùng cho việc dàn cảnh tiểu phẩm)
      return;
    }
    const dx = tgt.x - cur.x, dy = tgt.y - cur.y, dist = Math.hypot(dx, dy);
    const len = Math.min(g.len, dist);
    const p = { x: cur.x + dx / dist * len, y: cur.y + dy / dist * len };
    el.classList.toggle('flip', dx < 0);
    el.classList.add('walk');
    el.style.setProperty('--hopd', g.dur + 'ms');
    el.style.setProperty('--hy', g.hy + 'px');
    el.style.transitionProperty = 'transform, left, bottom';
    el.style.transitionDuration = '.12s, ' + g.dur + 'ms, ' + g.dur + 'ms';
    el.style.transitionTimingFunction = 'ease, linear, linear';
    el.style.left = p.x + 'px'; el.style.bottom = p.y + 'px';
    petPos[id] = p;
    petHopT[id] = pwin.setTimeout(() => hopStep(el), g.dur);
  }
  function moveTo(el, p) {                                 // Lên đường tới p: bé bay thì trượt, còn lại thì nhảy liên tiếp
    const id = el.dataset.pet;
    if (FLOATY[id]) return placePet(el, p, false);
    petTgt[id] = p;
    if (!petHopT[id]) hopStep(el);
  }
  /* v0.7②: ngủ —— bé đi dạo rảnh mãi rồi nằm bẹp xuống thả chữ Z (bé làm việc đang trong ca thì không ngủ); chọc = giật mình tỉnh dậy kêu "?!", không ai chọc thì cũng tự tỉnh */
  const petSleepT = {};
  function sleepPet(el) {
    const id = el.dataset.pet;
    el.classList.add('sleep');
    el.insertAdjacentHTML('beforeend', '<span class="zzz">Z</span><span class="zzz z2">z</span>');
    petSleepT[id] = pwin.setTimeout(() => wakePet(el, false), 40000 + Math.random() * 40000);
  }
  function wakePet(el, startled) {
    const id = el.dataset.pet;
    if (petSleepT[id]) { pwin.clearTimeout(petSleepT[id]); delete petSleepT[id]; }
    el.classList.remove('sleep');
    el.querySelectorAll('.zzz').forEach(z => z.remove());
    const mate = pileWith[id];                             // Bạn ngủ chung: một bé bị đánh thức thì bé kia cũng bật dậy theo
    delete pileWith[id];
    if (mate) {
      delete pileWith[mate];
      const me = petEl(mate);
      if (startled && me && me.classList.contains('sleep')) pwin.setTimeout(() => wakePet(me, true), 260);
    }
    if (startled) petBubble(el, '?!');
  }
  /* v0.7③: kho tương tác trứng phục sinh —— tiểu phẩm ngẫu nhiên tần suất thấp (đụng đầu nảy ra / lây ngáp / ngủ chồng đống / rượt đuổi):
     chọn diễn viên rồi khoá lại (tuần tra không giành người), diễn xong ai về nhà nấy; render lại bảng = tắt đèn giải tán; cùng một vở không diễn liên tiếp */
  const petArrive = {};                                    // Callback khi nhảy tới nơi
  const pileWith = {};                                     // Bảng ghép cặp bạn ngủ chung
  const petTouch = {}, touchBase = now();                  // Thời điểm bị chọc gần nhất (bé làm việc 5 phút không ai đoái hoài → cho phép ngủ gật)
  let scene = null, lastScene = '';
  let nextSceneAt = now() + (TEST_MODE ? 30 * 1000 : 45 * MIN);
  const sceneBusy = id => !!(scene && scene.ids.indexOf(id) >= 0);
  const sceneTimer = (fn, ms) => { if (scene) scene.timers.push(pwin.setTimeout(fn, ms)); };
  function endScene() { if (!scene) return; scene.timers.forEach(t => pwin.clearTimeout(t)); scene = null; }
  function petEl(id) { return sh.querySelector('#mascots .pet[data-pet="' + id + '"]'); }
  function walkTo(el, p, cb) {                             // Dàn vị trí: tới nơi thì gọi cb (bé bay thì ước lượng theo thời gian trượt)
    const id = el.dataset.pet;
    if (FLOATY[id]) {
      const old = petPos[id] || p;
      const dur = Math.min(11, Math.max(3, Math.hypot(p.x - old.x, p.y - old.y) / 18));
      placePet(el, p, false);
      if (cb) sceneTimer(cb, dur * 1000 + 80);
      return;
    }
    petTgt[id] = p;
    if (cb) petArrive[id] = cb;
    if (!petHopT[id]) hopStep(el);
  }
  function tryScene() {
    const idle = [], asleep = [], workIdle = [];
    sh.querySelectorAll('#mascots .pet').forEach(el => {
      const id = el.dataset.pet;
      if (petTgt[id]) return;                              // Bé đang trên đường thì không kéo vào đoàn kịch
      if (PETS[id].job) { if (!el.classList.contains('sleep')) workIdle.push(id); return; }   // Bé làm việc chỉ vào kho ngáp (đang trong ca thì ngáp tại chỗ chứ không đi)
      (el.classList.contains('sleep') ? asleep : idle).push(id);
    });
    const pool = [];
    if (idle.length >= 2) pool.push('bump');
    if (idle.length + workIdle.length >= 2) pool.push('yawn');
    if (idle.filter(i => !FLOATY[i]).length >= 2) pool.push('chase');
    if (idle.length >= 1 && asleep.length >= 1) pool.push('pile');
    const picks = pool.filter(a => a !== lastScene);
    if (!picks.length) return;                             // Không gom đủ diễn viên, nhịp sau thử lại (không tốn hồi chiêu)
    const act = picks[Math.floor(Math.random() * picks.length)];
    lastScene = act;
    nextSceneAt = now() + (TEST_MODE ? 45 * 1000 + Math.random() * 90 * 1000 : 60 * MIN + Math.random() * 120 * MIN);
    const shuffle = a => a.sort(() => Math.random() - .5);
    const ov = $id('mascots'), W = ov.clientWidth, H = ov.clientHeight;
    const clampX = x => Math.max(4, Math.min(W - 60, x));
    const midY = () => WORK_BAND + 20 + Math.random() * Math.max(20, H - WORK_BAND - 100);
    if (act === 'bump') {                                  // Đụng đầu nảy ra: đâm sầm vào nhau, cả hai bật ra, mỗi bé kêu một tiếng
      const [a, b] = shuffle(idle.slice());
      const ea = petEl(a), eb = petEl(b);
      const mx = clampX(60 + Math.random() * Math.max(40, W - 180)), my = midY();
      scene = { ids: [a, b], timers: [] };
      let met = 0;
      const meet = () => {
        if (++met < 2 || !scene) return;
        petBubble(ea, PETS[a].cry[0]); petBubble(eb, PETS[b].cry[0]);
        walkTo(ea, { x: clampX(petPos[a].x - 32), y: petPos[a].y });
        walkTo(eb, { x: clampX(petPos[b].x + 32), y: petPos[b].y });
        sceneTimer(endScene, 1600);
      };
      walkTo(ea, { x: clampX(mx - 26), y: my }, meet);
      walkTo(eb, { x: clampX(mx + 26), y: my }, meet);
      sceneTimer(endScene, 30000);                         // Giải tán dự phòng
    } else if (act === 'yawn') {                           // Lây ngáp: một bé ngáp, bé kia ngáp theo, cả hai cùng ngủ (bé làm việc cũng bị lây)
      const [a, b] = shuffle(idle.concat(workIdle));
      const ea = petEl(a), eb = petEl(b);
      scene = { ids: [a, b], timers: [] };
      petBubble(ea, '(ngáp…)');
      sceneTimer(() => petBubble(eb, '(ngáp theo…)'), 1300);
      sceneTimer(() => sleepPet(ea), 2500);
      sceneTimer(() => { sleepPet(eb); pileWith[a] = b; pileWith[b] = a; endScene(); }, 3300);
    } else if (act === 'pile') {                           // Ngủ chồng đống: mò tới nằm cạnh bé đang ngủ để ngủ cùng, giật mình thì cùng dậy
      const b = asleep[Math.floor(Math.random() * asleep.length)];
      const a = idle[Math.floor(Math.random() * idle.length)];
      const ea = petEl(a), eb = petEl(b);
      scene = { ids: [a, b], timers: [] };
      const side = petPos[b].x > 70 ? -1 : 1;
      walkTo(ea, { x: clampX(petPos[b].x + side * 34), y: petPos[b].y }, () => {
        sleepPet(ea); pileWith[a] = b; pileWith[b] = a; endScene();
      });
      sceneTimer(endScene, 30000);
    } else if (act === 'chase') {                          // Rượt đuổi: ba chặng đi về, bé bị đuổi thỉnh thoảng ngoái lại, cuối cùng cắt đuôi được
      const hop = shuffle(idle.filter(i => !FLOATY[i]));
      const a = hop[0], b = hop[1];                        // a đuổi b
      const ea = petEl(a), eb = petEl(b);
      scene = { ids: [a, b], timers: [] };
      let leg = 0;
      const run = () => {
        if (!scene) return;
        if (++leg > 3) { petBubble(eb, '(phù… cắt đuôi rồi)'); return endScene(); }
        const p = { x: clampX(20 + Math.random() * Math.max(40, W - 100)), y: midY() };
        walkTo(eb, p);
        sceneTimer(() => walkTo(ea, { x: clampX(p.x - 22), y: p.y }, run), 380);
      };
      petBubble(ea, '(thình thịch thịch!)'); petBubble(eb, '(oaa!)');
      run();
      sceneTimer(endScene, 45000);
    }
  }
  function renderPets() {
    endScene();                                            // Dựng lại DOM = tắt đèn giải tán
    Object.keys(petHopT).forEach(stopHop);                 // Cắt các cú nhảy đang dở, tránh bộ đếm ma
    for (const k in petTgt) delete petTgt[k];
    for (const k in petArrive) delete petArrive[k];
    for (const k in pileWith) delete pileWith[k];
    Object.keys(petSleepT).forEach(k => { pwin.clearTimeout(petSleepT[k]); delete petSleepT[k]; });
    $id('mascots').innerHTML = S.petsOut.map(id => PETS[id]
      ? `<span class="pet" data-pet="${id}" title="Chọc chọc ${PETS[id].name}"><span class="pbody" style="animation-delay:-${(Math.random() * 1.8).toFixed(2)}s">${petSVG(id, 48)}</span></span>` : '').join('');
    sh.querySelectorAll('#mascots .pet').forEach(el => {
      const id = el.dataset.pet;
      placePet(el, petPos[id] || petSpot(id), true);
    });
  }
  const wander = pwin.setInterval(() => {                  // Nhịp tuần tra: cứ 7s lại giao điểm đến / ru ngủ / mở tiểu phẩm cho các bé đang rảnh
    if (!win.classList.contains('open')) return;           // Tối ưu: Dừng tuần tra và tính toán vị trí khi bảng bị ẩn
    if (!scene && now() >= nextSceneAt) tryScene();
    sh.querySelectorAll('#mascots .pet').forEach(el => {
      const id = el.dataset.pet;
      if (sceneBusy(id) || petTgt[id] || el.classList.contains('sleep')) return;   // Đang diễn / đang đi / đang ngủ thì đừng làm phiền
      if (!PETS[id].job && Math.random() < 0.08) return sleepPet(el);   // Rảnh lâu quá thì chợp mắt một giấc
      if (PETS[id].job && now() - (petTouch[id] || touchBase) > 5 * MIN && Math.random() < 0.08) return sleepPet(el);   // Bé làm việc 5 phút không ai đoái hoài thì đứng ngủ (tưới tự động không bị ảnh hưởng, mây ngủ vẫn mưa nhé)
      if (Math.random() < 0.35) moveTo(el, petSpot(id));
    });
  }, 7000);
  $id('mascots').addEventListener('click', e => {
    const el = e.target.closest('.pet'); if (!el) return;
    const id = el.dataset.pet, def = PETS[id];
    if (!def) return;
    petTouch[id] = now();                                  // Ghi lại một lần "được để ý" (dùng để xét ngủ gật của bé làm việc)
    if (el.classList.contains('sleep')) return wakePet(el, true);   // Bé đang ngủ: chọc = giật mình tỉnh, cú này không tính là chọc chọc
    const cry = def.cry[Math.floor(Math.random() * def.cry.length)];
    if (def.job === 'plant') return petPlant(el, cry);    // Nghề tốn tiền: chọc để kích hoạt làm hàng loạt
    if (def.job === 'fert') return petFert(el, cry);
    if (def.job === 'harvest') return petHarvest(el, cry);// #27: thu hoạch cũng đổi sang chọc mới chạy, khỏi quay lại mà ngơ ngác
    if (def.job) return petBubble(el, cry);               // Loại tưới nước: bị động trong ca, chọc = chào hỏi
    let txt = cry;                                        // Loại tìm kho báu: chọc chọc là rơi tiền
    if (now() - (S.petPoke[id] || 0) >= POKE_CD) {
      S.petPoke[id] = now();
      const gain = 1 + Math.floor(Math.random() * 5);
      S.coins += gain;
      txt += id === 'prismBlob' ? ' rũ ra ' + gain + ' G ánh vụn!'
        : id === 'starBell' ? ' lắc ra ' + gain + ' G bụi sao!'
        : ' rơi ra ' + gain + ' G!';                        // Loại sản xuất có lời thoại riêng khi bị chọc (mảnh vỡ vẫn theo vòng tìm kho báu 2h, chọc không ra đâu nhé)
      save(); renderStatus();
    }
    petBubble(el, txt);
  });
  function petPlant(el, cry) {                            // Bé mầm sương: chọc một cái là gieo khắp ruộng (#42: mỗi lần đều chọn lại, chỉ liệt kê thứ trồng được ở trang này)
    const empty = [];
    for (let pi = 0; pi < curBlocks() * 4; pi++) if (!curPlots()[pi].crop) empty.push(pi);
    if (!empty.length) return petBubble(el, cry + ' hết chỗ trống rồi');
    const usable = {};
    Object.keys(S.seeds).forEach(id => {
      if (!(S.seeds[id] > 0) || !CROPS[id]) return;
      if (id === 'mystery' || (CROPS[id].zone || 1) === S.page) usable[id] = S.seeds[id];
    });
    if (!Object.keys(usable).length) return petBubble(el, cry + ' không có hạt nào trồng được ở ' + ZONE_NAME[S.page] + '…');
    pickFrom('Bé mầm sương: lần này trồng gì đây?', usable, x => CROPS[x].name, sid => {
      let k = 0;
      for (const pi of empty) { if (!(S.seeds[sid] > 0)) break; if (plant(pi, sid)) k++; }
      const pe = sh.querySelector('.pet[data-pet="dewSprout"]') || el;
      petBubble(pe, cry + ' đã trồng ' + k + ' ô ' + CROPS[sid].name + (k < empty.length ? ' (hết hạt giống rồi)' : '!'));
    });
  }
  function petHarvest(el, cry) {                          // Bé sứa xoăn: chọc một cái là xúc tu cuộn rau chín vào balo (#27; v0.8 chỉ thu ở trang hiện tại)
    const got = {};
    curPlots().forEach((p, pi) => {
      const c = p.crop;
      if (!c || now() < c.matureAt) return;
      const r = harvest(pi, true);
      if (r) got[r.name] = (got[r.name] || 0) + r.n;
    });
    const ks = Object.keys(got);
    if (!ks.length) return petBubble(el, cry + ' chưa có rau nào chín');
    petBubble(el, cry + ' cuộn về được: ' + ks.map(k => k + '×' + got[k]).join(', '));
  }
  function petFert(el, cry) {                             // Bé bí ẩn: chọc một cái là bón phân hàng loạt (#42: mỗi lần đều chọn lại)
    pickFrom('Bé bí ẩn: dùng loại phân nào?', S.ferts, x => FERTS[x].name, fid => {
      let k = 0;
      for (let pi = 0; pi < curBlocks() * 4 && S.ferts[fid] > 0; pi++) {
        const c = curPlots()[pi].crop;
        if (!c || now() >= c.matureAt || (c.fertUsed && c.fertUsed[fid])) continue;
        if (fertilize(pi, fid, true)) k++;
      }
      const pe = sh.querySelector('.pet[data-pet="batBlob"]') || el;
      petBubble(pe, cry + (k ? ' đã bón ' + k + ' ô ' + FERTS[fid].name + '!' : ' không có ô nào cần bón phân'));
    });
  }

  /* ---------- v0.8b: phù thuỷ tròn · hệ thống đơn hàng (§2.65 chốt: thù lao = hạt giống bí ẩn, trang đơn hàng quỹ đạo sao A) ---------- */
  const WITCH_CRY = ['Cúc cu, có ai không?', '◆✦∴…?', '(dưới vành mũ vọng ra tiếng lật sách)', '☽⁂◇!', '✶◇∴✦…', 'Tinh tượng hôm nay đẹp đấy.'];
  function witchArrive() {
    const wz = S.witch;
    wz.leaveAt = now() + WITCH_STAY;
    wz.missed = 0;
    wz.order = makeWitchOrder();
    save(); renderWitch();
    toast('Phù thuỷ tròn tới rồi! Quầy hàng ngôi sao ở góc dưới trái bờ ruộng đã sáng đèn');
  }
  function makeWitchOrder() {
    const pool = Object.entries(CROPS).filter(([id, c]) => !c.hidden && pageUnlocked(c.zone || 1));
    const pick = () => pool[Math.floor(Math.random() * pool.length)][0];
    const lines = [{ id: pick(), n: 2 + Math.floor(Math.random() * 3), mut: false, reward: 1, done: false }];
    if (CS.link && Math.random() < 0.5) {                 // Đơn đột biến: chỉ có thể xuất hiện khi đã bật liên kết (§2.65 ô ①, tắt liên kết thì tự hạ cấp)
      lines.push({ id: pick(), n: 1 + Math.floor(Math.random() * 2), mut: true, reward: 2, done: false });
    }
    return { lines, done: false };
  }
  function mutKeysOf(cropId) { return Object.keys(S.bag).filter(k => k.split('@')[0] === cropId && k.indexOf('@') > 0); }
  function mutCountOf(cropId) { return mutKeysOf(cropId).reduce((s, k) => s + S.bag[k], 0); }
  function witchDeliver(li) {
    const wz = S.witch; if (!wz || !wz.order) return;
    const line = wz.order.lines[li]; if (!line || line.done) return;
    if (!line.mut) {
      if ((S.bag[line.id] || 0) < line.n) return toast('Còn thiếu ' + (line.n - (S.bag[line.id] || 0)) + ' quả ' + CROPS[line.id].name);
      S.bag[line.id] -= line.n; if (!S.bag[line.id]) delete S.bag[line.id];
    } else {
      if (mutCountOf(line.id) < line.n) return toast('Loại ' + CROPS[line.id].name + ' có tiền tố còn thiếu ' + (line.n - mutCountOf(line.id)) + ' quả');
      let need = line.n;
      for (const k of mutKeysOf(line.id)) {
        const take = Math.min(need, S.bag[k]);
        S.bag[k] -= take; if (!S.bag[k]) delete S.bag[k];
        need -= take; if (!need) break;
      }
    }
    S.seeds.mystery = (S.seeds.mystery || 0) + line.reward;
    line.done = true;
    if (wz.order.lines.every(l => l.done)) {              // Giao đủ hết: cô ấy hài lòng ngồi thêm một phút rồi đi
      wz.order.done = true;
      wz.leaveAt = Math.min(wz.leaveAt, now() + 60 * 1000);
    }
    save(); renderStatus();
    toast('Giao hàng xong! Nhận được hạt giống bí ẩn ×' + line.reward);
    openWitchDlg();
  }
  function openWitchDlg() {
    const wz = S.witch;
    if (!wz || !wz.leaveAt || now() > wz.leaveAt || !wz.order) return;
    const rows = wz.order.lines.map((l, i) => {
      const nm = CROPS[l.id].name;
      const have = l.mut ? mutCountOf(l.id) : (S.bag[l.id] || 0);
      const btn = l.done ? '<span class="wzbtn done">Đã giao</span>'
        : have >= l.n ? `<span class="wzbtn" data-wdeliver="${i}">Giao</span>` : '<span class="wzbtn off">Chưa đủ</span>';
      return `<div class="wzord"><span class="star">✦</span>
        <div class="wzwant">Thu thập <em>${l.mut ? '<span class="mutq">loại có tiền tố</span>' : ''}${nm} ×${l.n}</em>${btn}</div>
        <div class="wzgive">Thù lao: hạt giống bí ẩn ×${l.reward}${l.mut ? ' ✦ (đơn đột biến)' : ''} · bạn đang có ${have}</div></div>`;
    }).join('');
    const reroll = (!wz.order.done && S.shards && S.shards.prism > 0)
      ? `<div style="text-align:center;margin-top:6px"><span class="wzbtn" data-wreroll="1" style="float:none">✦ Đổi đơn khác (mảnh lăng quang ×${S.shards.prism})</span></div>` : '';
    openModal('Đơn hàng của phù thuỷ', `<div class="wzwrap">
      <div class="wzhead">Đơn hàng của phù thuỷ</div>
      <div class="wzsub">✦ ｡ﾟ☽ ∴ ✧ ∴ ☽ﾟ｡ ✦</div>${rows}${reroll}
      <div class="wzleave">☽ ${wz.order.done ? '"✶◇…!" (trông cô ấy hài lòng lắm)' : 'Cô ấy còn nán lại khoảng ' + fmtLeft(wz.leaveAt - now())}</div>
    </div>`);
    $id('mbody').querySelectorAll('[data-wdeliver]').forEach(b => b.addEventListener('click', () => witchDeliver(+b.dataset.wdeliver)));
    $id('mbody').querySelectorAll('[data-wreroll]').forEach(b => b.addEventListener('click', () => {   // v1.0: dùng mảnh lăng quang đổi đơn
      if (!(S.shards && S.shards.prism > 0)) return;
      S.shards.prism--;
      S.witch.order = makeWitchOrder();
      save(); toast('Lăng quang loé lên, đơn hàng đã đổi một loạt');
      openWitchDlg();
    }));
  }
  function useStarShard() {                               // v1.0: mảnh ngôi sao = triệu hồi phù thuỷ
    if (!(S.shards && S.shards.star > 0)) return;
    if (!S.passes.water) return toast('Phù thuỷ chỉ chịu ghé những nông trại có vé vùng nước');
    if (S.witch.leaveAt > now()) return toast('Phù thuỷ tròn đang ở quầy rồi mà');
    S.shards.star--;
    closeModal();
    witchArrive();                                        // Bên trong đã có save + toast
  }
  function renderWitch() {
    const el = $id('witch');
    const active = S.witch && S.witch.leaveAt > now() && S.passes.water;
    el.classList.toggle('show', !!active);
    if (active && !el.innerHTML) el.innerHTML = `<span class="wtag">✦ Đơn hàng</span><span class="wbody">${petSVG('witchBlob', 48)}</span>`;
    if (!active) el.innerHTML = '';
  }
  $id('witch').addEventListener('click', e => {
    if (e.target.closest('.wtag')) return openWitchDlg();
    const el = $id('witch');                              // Chọc vào chính cô ấy = chào hỏi (tiếng phù thuỷ, người nghe không hiểu là bình thường nhé)
    el.querySelector('.pbubble')?.remove();
    const b = pdoc.createElement('span');
    b.className = 'pbubble wb';
    b.textContent = WITCH_CRY[Math.floor(Math.random() * WITCH_CRY.length)];
    el.appendChild(b);
    pwin.setTimeout(() => b.remove(), 1900);
  });

  /* ---------- Mẹo nhỏ ---------- */
  /* #18: lấy ra —— bỏ khỏi balo để mang vào cốt truyện, không quy ra tiền, không thể hoàn tác; trong 10 phút sau khi lấy ra, phần tiêm sẽ kèm một câu nhắc */
  let takeoutNote = null;
  function openTakeout(key) {
    const have = S.bag[key] || 0;
    if (have <= 0) return;
    openModal('Lấy ra · ' + bagName(key), `
      <div class="note" style="margin-bottom:8px">Lấy ra = mang khỏi balo để dùng trong cốt truyện. <b style="color:var(--accFg)">Không quy ra tiền, lấy ra rồi không bỏ lại balo được!</b></div>
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
        <input class="inp" id="takeN" type="number" min="1" max="${have}" value="1" style="width:90px">
        <span style="font-size:12px;color:#7a5c38">/ đang có ${have}</span>
        <span class="buy" id="takeGo">Xác nhận lấy ra</span>
      </div>`);
    $id('takeGo').addEventListener('click', () => {
      const n = clampN($id('takeN').value, 1, have, 1) | 0;
      S.bag[key] = have - n;
      if (S.bag[key] <= 0) delete S.bag[key];
      const d = mutDescOf(key);
      takeoutNote = ((takeoutNote || []).filter(t => now() < t.until))
        .concat({ txt: n + ' ' + bagName(key) + (d ? ' (hiệu ứng đã định: ' + d + ')' : ''), until: now() + 10 * MIN })
        .slice(-3);
      save(); renderStatus();
      toast('Đã lấy ra ' + n + ' ' + bagName(key));
      openPanel('bag');
    });
  }

  /* #21: bán cũng dùng popup chọn số lượng */
  function openSellDlg(key) {
    const have = S.bag[key] || 0;
    if (have <= 0) return;
    const price = bagPrice(key);
    openModal('Bán · ' + bagName(key), `
      <div class="note" style="margin-bottom:8px">Đơn giá ${price} G · đang có ${have} cái</div>
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
        <input class="inp" id="sellN" type="number" min="1" max="${have}" value="1" style="width:90px">
        <span style="font-size:12px;color:#7a5c38">/ ${have}</span>
        <span class="buy" id="sellGo">Xác nhận bán</span>
      </div>`);
    $id('sellGo').addEventListener('click', () => {
      sell(key, clampN($id('sellN').value, 1, have, 1) | 0);
    });
  }

  /* Vé: popup hiện trọn mặt vé (tấm vé cũng là đồ sưu tầm) */
  function buildTicket(k) {
    const water = k === 'water';
    return `
    <div class="tk ${water ? 'water' : 'mine'}">
      <div class="stub">${spriteSVG(water ? 'lotus' : 'gem', 52)}<span class="no">${water ? 'Vùng nước · Trang II' : 'Khu mỏ · Trang III'}</span></div>
      <div class="perf"></div>
      <div class="tmain">
        <div class="inner">
          <div class="eyebrow">Ai mà thèm làm nông dân chứ! · Giấy phép thông hành</div>
          <div class="tname">${water ? 'V É   V Ù N G   N Ư Ớ C' : 'V É   K H U   M Ỏ'}</div>
          <div class="tsub">${water ? 'Cầm vé này để mở ruộng vùng nước ở trang hai · trồng được cây thuỷ sinh<br>Củ sen đang đợi bạn, rong biển cũng vậy.' : 'Cầm vé này để vào ruộng bảo thạch ở trang ba · ươm được cây tinh thạch<br>Coi chừng dưới chân, thứ gì phát sáng thì đừng giẫm.'}</div>
          <div class="trow">
            <span class="serial">${water ? 'N⁰ 000002' : 'N⁰ 000003'}</span>
            <span class="valid">${water ? 'Có giá trị vĩnh viễn · không chuyển nhượng (rau thì được)' : 'Có giá trị vĩnh viễn · chứa một lượng nhỏ ma lực'}</span>
          </div>
        </div>
        <div class="stamp">${water ? 'Bé tròn<br>đã duyệt' : 'Phù thuỷ<br>đặc duyệt'}</div>
        <div class="curl"></div>
      </div>
    </div>`;
  }
  function openPassDlg(k) {
    const ps = PASSES[k];
    const owned = !!S.passes[k];
    const poor = S.coins < ps.price;
    openModal(ps.name, buildTicket(k) + (owned
      ? '<div class="note">Đã sở hữu · cất trong kẹp giấy tờ của bạn. Các bé tròn ở trang tương ứng luôn hoan nghênh bạn ghé mua.</div>'
      : `<div style="display:flex;gap:8px;align-items:center">
          <span class="buy${poor ? ' off' : ''}" id="passGo">Mua ${ps.price.toLocaleString()} G</span>
          <span class="buy plain" id="passNo">Để nghĩ thêm</span>
        </div>`));
    if (!owned) {
      $id('passGo').addEventListener('click', () => {
        if (S.coins < ps.price) return toast('Còn thiếu ' + (ps.price - S.coins).toLocaleString() + ' G');
        S.coins -= ps.price; S.passes[k] = true;
        save(); renderStatus(); renderPager(); openPanel('shop');
        toast(ps.name + ' đã vào tay! ' + (k === 'water' ? 'Ruộng vùng nước đã mở, lật trang qua xem thử đi' : 'Ruộng khu mỏ đã mở, lật trang qua xem thử đi'));
      });
      $id('passNo').addEventListener('click', () => openPanel('shop'));
    }
  }

  /* v0.9 (#47): popup mua hàng loạt —— bấm mua hạt giống/phân bón → nhập số lượng → xác nhận, cảm giác giống hệt lúc bán (thời 72 ô thì đây là nhu cầu thiết yếu) */
  function openBuyDlg(kind, id) {
    const def = kind === 'seed' ? CROPS[id] : FERTS[id];
    const price = kind === 'seed' ? def.seed : def.price;
    const name = kind === 'seed' ? 'Hạt ' + def.name : def.name;
    if (S.coins < price) return toast('Còn thiếu ' + (price - S.coins).toLocaleString() + ' G');
    const maxN = Math.max(1, Math.floor(S.coins / Math.max(1, price)));
    openModal('Mua · ' + name, `
      <div class="note" style="margin-bottom:8px">Đơn giá ${price} G · vàng hiện có ${S.coins.toLocaleString()} · mua được tối đa ${maxN}</div>
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
        <input class="inp" id="buyN" type="number" min="1" max="${maxN}" value="1" style="width:90px">
        <span id="buyTotal" style="font-size:12px;color:#7a5c38;font-weight:bold">Tổng ${price} G</span>
        <span class="buy" id="buyGo">Xác nhận mua</span>
      </div>`);
    const upd = () => { const n = clampN($id('buyN').value, 1, maxN, 1) | 0; $id('buyTotal').textContent = 'Tổng ' + (n * price).toLocaleString() + ' G'; return n; };
    $id('buyN').addEventListener('input', upd);
    $id('buyGo').addEventListener('click', () => {
      const n = upd(), cost = n * price;
      if (S.coins < cost) return toast('Không đủ vàng rồi');
      S.coins -= cost;
      if (kind === 'seed') S.seeds[id] = (S.seeds[id] || 0) + n;
      else S.ferts[id] = (S.ferts[id] || 0) + n;
      save(); renderStatus();
      toast('Đã mua ' + name + ' ×' + n);
      openPanel('shop');
    });
  }


  let toastTimer = null;
  function toast(msg) {
    const t = $id('toast');
    t.textContent = msg; t.style.display = 'block';
    if (toastTimer) pwin.clearTimeout(toastTimer);
    toastTimer = pwin.setTimeout(() => { t.style.display = 'none'; }, 1800);
  }

  /* ---------- Huỷ (C11 §8) ---------- */
  function destroy() {
    if (destroyed) return; destroyed = true;
    try { if (tick) pwin.clearInterval(tick); } catch (e) {}
    try { pwin.clearInterval(heartbeat); } catch (e) {}
    try { pwin.clearInterval(wander); } catch (e) {}
    try { Object.keys(petHopT).forEach(k => pwin.clearTimeout(petHopT[k])); } catch (e) {}
    try { Object.keys(petSleepT).forEach(k => pwin.clearTimeout(petSleepT[k])); } catch (e) {}
    try { endScene(); } catch (e) {}
    try { if (saveTimer) { clearTimeout(saveTimer); updateVariablesWith(v => { v[NS] = S; return v; }, { type: 'global' }); } } catch (e) {}
    try { if (toastTimer) pwin.clearTimeout(toastTimer); } catch (e) {}
    while (disposers.length) { try { disposers.pop()(); } catch (e) {} }
    try { setInjection(''); } catch (e) {}
    try { root.remove(); } catch (e) {}
    try { if (pwin[RUNTIME_KEY] === api) delete pwin[RUNTIME_KEY]; } catch (e) {}
  }
  const api = { destroy };
  pwin[RUNTIME_KEY] = api;
  renderToolbar();
  renderChips(); renderBanner(); renderPets(); updateInjection();
  if (CS.link) requestDayEvent();                          // Không mở bảng cũng phải có sự kiện trong ngày (để phục vụ phần tiêm)
}


// ST Extension Hook
export async function init() {
  // Thay vì import phức tạp dễ gây lỗi 404, chúng ta dùng chuẩn SillyTavern.getContext()
  // Đây là cách chính thống và an toàn nhất để lấy các biến toàn cục của ST.
  try {
    const ctx = window.SillyTavern && window.SillyTavern.getContext ? window.SillyTavern.getContext() : {};
    
    // Gán các hàm/biến từ context
    extension_settings    = ctx.extensionSettings || window.extension_settings || {};
    saveSettingsDebounced = ctx.saveSettingsDebounced || window.saveSettingsDebounced || (() => {});
    eventSource           = ctx.eventSource || window.eventSource;
    event_types           = ctx.eventTypes || window.event_types;
    generateRaw           = ctx.generateRaw || window.generateRaw;
    
    console.log('[Farm] Đã kết nối ST Context thành công!');
  } catch (e) {
    console.error('[Farm] Lỗi khi kết nối ST Context:', e);
  }

  // Khởi tạo game
  initFarm();
}
