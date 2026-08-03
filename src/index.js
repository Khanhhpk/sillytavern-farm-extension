// Dynamically access ST variables to avoid ES module import path issues
const getContext = () => window.getContext ? window.getContext() : ((typeof window.SillyTavern !== 'undefined' && window.SillyTavern.getContext) ? window.SillyTavern.getContext() : {});
const ST_context = getContext();

const extension_settings = window.extension_settings || ST_context.extension_settings || {};
const eventSource = window.eventSource || ST_context.eventSource;
const event_types = window.event_types || ST_context.event_types;
const saveSettingsDebounced = window.saveSettingsDebounced || ST_context.saveSettingsDebounced;
const generateRaw = window.generateRaw || ST_context.generateRaw;

import './style.css';

/* ============================================================
 * Ai mà thèm làm nông dân trong SillyTavern chứ! · Bản chính thức v1.1
 * Script toàn cục cho Tavern Helper. Nút bóng nổi → cửa sổ nông trại → hộp mù thế giới quan.
 * Lưu game: biến toàn cục star_tavern_farm của Tavern Helper (không dùng localStorage/world book; tên khoá không bao giờ đổi, cập nhật hay nhập lại đều không mất dữ liệu)
 * Giữ lại công tắc TEST_MODE (true = số liệu test nhanh), bản chính thức luôn là false
 * ============================================================ */


function initFarm() {
  const TEST_MODE = false;   // v1.0: bản chính thức
  const NS = "star_tavern_farm";
  const extensionName = "sillytavern-farm-extension";
  const RUNTIME_KEY = '__STAR_TAVERN_FARM__';
  const pwin = window, pdoc = document;

  /* ---------- Đơn thể: diệt bản cũ trước ---------- */
  try { pwin[RUNTIME_KEY]?.destroy?.(); } catch (e) {}
  pdoc.getElementById('star-tavern-farm-root')?.remove();

  /* ---------- Số liệu (TEST_MODE là chỗ giữ chỗ) ---------- */
  const MIN = 60 * 1000;
  const GROW = TEST_MODE ? 5 * MIN : null;
  const REGROW = TEST_MODE ? 2 * MIN : null;
  const DAY_MS = 4 * 60 * 60 * 1000;                 // Một ngày trong game = 4 giờ thực (hằng số nội bộ)
  const WATER_CD = TEST_MODE ? 10 * MIN : 2 * 60 * 60 * 1000;   // Sửa #3: hồi chiêu tưới nước 10 phút
  const REGROW_MAX = 3;                                          // Sửa #4: tái sinh tối đa 3 vụ
  const POKE_CD = 10 * MIN;                                      // Sửa #9: hồi chiêu chọc thú cưng rơi tiền
  const TREASURE_CD = TEST_MODE ? 10 * MIN : 2 * 60 * 60 * 1000; // v0.6b: chu kỳ tìm kho báu
  const PETS_OUT_MAX = 8;                                        // Giới hạn số thú ra sân (#25: bỏ điều phái, ra sân = có hiệu lực trên mọi trang)
  const WITCH_STAY = TEST_MODE ? 10 * MIN : 20 * MIN;            // Phù thuỷ ở lại 20 phút (do wen chốt, định vị trứng phục sinh)
  const witchGap = () => TEST_MODE ? 15 * MIN + Math.random() * 20 * MIN : 100 * MIN + Math.random() * 80 * MIN;   // Bản chính thức ≈ mỗi chu kỳ 4h có 1~2 lần
  const SNAP_EDGE = 48;                                          // Sửa #1: lại gần mép mới hít vào
  /* zone: 1 đồng cỏ, 2 vùng nước, 3 khu mỏ (mặc định = 1); hidden: cửa hàng không bán / tìm kho báu không rơi (#34); họ mystery xem plant() */
  const CROPS = {
    /* Số liệu chính thức v1.0 (chốt theo "Bảng số liệu chính thức - chờ duyệt.md"): grow/regrowM tính bằng phút thực */
    douya:     { name: 'Giá đỗ',        grow: 5,   seed: 5,    sell: 12,   sp: 'sprout' },
    radish:    { name: 'Củ cải cherry', grow: 10,  seed: 25,   sell: 45,   sp: 'radish' },
    tomato:    { name: 'Cà chua',       grow: 20,  regrowM: 15, seed: 100, sell: 90,   sp: 'tomato', regrow: true },
    moonberry: { name: 'Dâu tây',       grow: 90,  seed: 350,  sell: 800,  sp: 'mysbG' },
    pumpkin:   { name: 'Bí ngô',        grow: 120, seed: 500,  sell: 1300, sp: 'pumpkin' },
    /* —— Vùng nước (trang 2) —— */
    chuncai:   { name: 'Rau thuần',     grow: 10,  seed: 40,   sell: 60,   sp: 'chuncai',  zone: 2 },
    biqi:      { name: 'Củ năng',       grow: 30,  seed: 120,  sell: 220,  sp: 'biqi',     zone: 2 },
    lingjiao:  { name: 'Củ ấu',         grow: 60,  seed: 220,  sell: 520,  sp: 'lingjiao', zone: 2 },
    jiaobai:   { name: 'Củ niễng',      grow: 60,  seed: 450,  sell: 1150, sp: 'jiaobai',  zone: 2 },
    lianou:    { name: 'Củ sen',        grow: 180, seed: 900,  sell: 3200, sp: 'lianou',   zone: 2 },
    /* —— Khu mỏ (trang 3) —— */
    wujing:    { name: 'Cỏ ô tinh',     grow: 30,  seed: 150,  sell: 340,  sp: 'wujing',   zone: 3 },
    starbush:  { name: 'Bụi sao',       grow: 60,  seed: 400,  sell: 1150, sp: 'starbush', zone: 3 },
    gemflower: { name: 'Hoa bảo thạch', grow: 120, seed: 700,  sell: 2300, sp: 'gemflower', zone: 3 },
    opalvine:  { name: 'Dây leo opal',  grow: 180, regrowM: 120, seed: 1200, sell: 2300, sp: 'opalvine', zone: 3, regrow: true },
    dragoncry: { name: 'Quả long tinh', grow: 360, seed: 2500, sell: 8000, sp: 'dragoncry', zone: 3 },
    /* —— Họ bí ẩn (#29/#34/#49): hạt giống duy nhất, hộp mù hai lớp; không bán; đồng loạt 30 phút —— */
    mystery:   { name: 'Hạt giống bí ẩn', grow: 30, seed: 0, sell: 0,    sp: 'seedLight', hidden: true, zone: 0, seedOnly: true },
    dreamG:    { name: 'Kén mộng',      grow: 30, seed: 0, sell: 300,  sp: 'dreamG', hidden: true, zone: 1 },
    dreamW:    { name: 'Kén trầm mộng', grow: 30, seed: 0, sell: 600,  sp: 'dreamW', hidden: true, zone: 2 },
    dreamM:    { name: 'Kén thạch mộng', grow: 30, seed: 0, sell: 900,  sp: 'dreamM', hidden: true, zone: 3 },
    keyG:      { name: 'Cỏ chìa đồng',  grow: 30, seed: 0, sell: 350,  sp: 'keyG', hidden: true, zone: 1 },
    keyW:      { name: 'Cỏ chìa gỉ',    grow: 30, seed: 0, sell: 700,  sp: 'keyW', hidden: true, zone: 2 },
    keyM:      { name: 'Cỏ chìa bí ẩn', grow: 30, seed: 0, sell: 1050, sp: 'keyM', hidden: true, zone: 3 },
    fangG:     { name: 'Cây bắt ruồi',  grow: 30, seed: 0, sell: 400,  sp: 'fangG', hidden: true, zone: 1 },
    fangW:     { name: 'Hoa bá vương',  grow: 30, seed: 0, sell: 800,  sp: 'fangW', hidden: true, zone: 2 },
    fangM:     { name: 'Hoa nanh rồng', grow: 30, seed: 0, sell: 1200, sp: 'fangM', hidden: true, zone: 3 },
  };
  const ZONE_NAME = { 1: 'Đồng cỏ', 2: 'Vùng nước', 3: 'Khu mỏ' };
  const FERTS = {
    compost: { name: 'Phân ủ',       price: 50,  desc: 'Thời gian còn lại của vụ này ×0.75' },
    shiny:   { name: 'Phân lấp lánh', price: 100, desc: 'Khi thu hoạch vụ này rơi thêm số vàng bằng 25% giá bán' },
  };
  const BLOCK_PRICE_PG = {   // v1.0: giá khai hoang riêng cho từng trang (chốt theo bảng B)
    1: [0, 0, 800, 3000, 12000, 30000],
    2: [0, 2000, 6000, 18000, 45000, 90000],
    3: [0, 5000, 15000, 40000, 90000, 180000],
  };
  const blockPrice = bi => BLOCK_PRICE_PG[S.page][bi];
  const WEATHERS = ['Nắng', 'Nắng', 'Nắng', 'Nhiều mây', 'Mưa nhỏ'];

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
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
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
  const fmtLeft = ms => {
    if (ms <= 0) return 'Thu hoạch được';
    const m = Math.ceil(ms / MIN);
    return m >= 60 ? Math.floor(m / 60) + 'g' + (m % 60) + 'p' : m + 'p';
  };

  /* ---------- Tài nguyên pixel (cùng nguồn với bản xem trước) ---------- */
  const P = {
    G:'#6cb457', D:'#3e7d3a', E:'#a4dc8c', R:'#dd5548', x:'#a33528',
    F:'#e06578', f:'#a83a52', p:'#ffb8c4', O:'#e89a4e', Q:'#c9772e',
    q:'#96551f', S:'#8a6844', h:'#f7c07a', B:'#9ed8f2', b:'#5fa8cc',
    u:'#3f7ea6', T:'#8a6a52', Y:'#c2b878', y:'#9a915c', L:'#b8b0a2',
    M:'#8a8274', C:'#f2c231', U:'#bf8a1a', W:'#fffdf4', K:'#3a2c22',
    n:'#ffb0bc', V:'#b48ae0', v:'#8a5cc0',
    '1':'#aecb87', '2':'#a0bd77', '3':'#c6dfa0', '4':'#8dab68',
    a:'#b99b84', c:'#9c7d66', d:'#cbb096', e:'#8a6a52',
    w:'#9d7458', g:'#b08a6d', m:'#7d5a42', s:'#684a36',
  };
  const SPR = {
    sprout:["................","................","................","................","...DD......DD...","..DEED....DEED..",".DEGGGD..DGGGED.",".DGGGGD..DGGGGD.","..DGGGGDDGGGGD..","...DGGGDDGGGD...","....DGGGGGGD....","......DGGD......","...TTTDGGDTTT...","..TTTTTTTTTTTT..","................","................"],
    seedling:["................","................","................","................","................","................","................","......EE........",".....DGE........","......DG........","......GD........","......GG........","....TTGGTT......","...TTTTTTTT.....","................","................"],
    radish:["....DD...DD.....","...DGED.DEGD....","...DGGEDEGGD....","....DGGDGGD.....",".....DGGGD......","......DGD.......","....fDDGDDf.....","...fFppFFFFf....","..fFpppFFFFFf...","..fFppFFFFFFf...","..fFpFFFFFFFf...",".TfFFFFFFFFFfT..",".TTfFFFFFFFfTT..","..TTfFFFFFfTT...","...TTTfffTTT....","................"],
    tomato:["................","......DDDD......","....DDGEEGDD....","...DGEGGGGEGD...","..DGEGGGGGGEGD..","..DGpRRGGRRpGD..","..DGRRxGGxRRGD..","..DGGGGGGGGGGD..","...DGGGpRGGGD...","...DGGGRxGGGD...","....DGGGGGGD....",".....DGGGGD.....","....TTDGGDTT....","...TTTTTTTTTT...","................","................"],
    pumpkin:["................","................",".......SS.S.....","......DSSDS.....","...qqq.SS.qqq...","..qOOOqqqqOOOq..",".qOhhOQOOQOOOOq.",".qOhOOQOOQOOOOq.",".qOOOOQOOQOOOOq.",".qOOOOQOOQOOOOq.",".qOOOOQOOQOOOOq.","..qOOOQOOQOOOq..","...qqOOOOOOqq...","..TTqqqqqqqqTT..","...TTTTTTTTTT...","................"],
    moonberry:["....W......W....","................","......DDDD......","....DDGEEGDD....","...DGEGGGGEGD...","..DGWBBGGBBWGD..","..DGBBuGGuBBGD..","..DGGGGGGGGGGD..","...DGGGWBGGGD...","...DGGGBuGGGD...","....DGGGGGGD....",".....DGGGGD.....","....TTDGGDTT....","...TTTTTTTTTT...",".......W........","................"],
    weed:["................","................","................","................","................","................","....Y....Y......","....Y..Y.Y..Y...",".....y.Y.y.Y....","..Y...yYYy......","...y..YY...Y....","....yYYY..y.....",".....YY.Yy......",".....yYYY.......","................","................"],
    stone:["................","................","................","................","................","................","......LLL.......","....LLLLLLL.....","...LLWLLLLLL....","...LLLLLLLMLL...","..LLLLLLLLLML...","..MLLLLLLLLLL...","..MMLLLLLLLLM...","...MMMMMMMMM....","................","................"],
    slime:["................","................","................","................",".....BBBBBB.....","....BBBBBBBB....","...BBWWBBBBBB...","..BBWWBBBBBBBB..","..BBBBBBBBBBBB..","..BB33BBBB33BB..",".BBBBBBBBBBBBBB.",".BnBBBB33BBBBnB.",".BBBBBBBBBBBBBB.",".bBBBBBBBBBBBBb.","..bbbbbbbbbbbb..","................"],
    octo:["................","................","................",".....VVVVVV.....","....VVVVVVVV....","...VVWWVVVVVV...","...VWWVVVVVVV...","..VVVVVVVVVVVV..","..VVKKVVVVKKVV..","..VVVVVVVVVVVV..","..VnVVVKKVVVnV..","..VVVVVVVVVVVV..","..VVVVVVVVVVVV..","..VV.VV..VV.VV..","..vv.vv..vv.vv..","................"],
    coin:["................","................","................",".....UUUUU......","....UCCCCCU.....","...UCCWWCCCU....","...UCWCCCCCU....","...UCWCCCCCU....","...UCCCCCCCU....","...UCCCCCCCU....","....UCCCCCU.....",".....UUUUU......","................","................","................","................"],
    sun:["................",".......C........","...C...C...C....","....C.....C.....","......CCC.......",".....CCCCC......","..CC.CCWCC.CC...",".....CCCCC......","......CCC.......","....C.....C.....","...C...C...C....",".......C........","................","................","................","................"],
    flower:["................","................","................","....nnn.nnn.....","...npppnpppn....","...nppnCnppn....","....nnCCCnn.....","...nppnCnppn....","...npppnpppn....","....nnn.nnn.....","................","................","................","................","................","................"],
    shopIcon:["................","................","................","....fpf.fpf.....","....fppffppf....",".....ffFFff.....","..qddddFFddddq..","..qqqqqFFqqqqq..","...qdddFFdddq...","...qFFFFFFFFq...","...qdddFFdddq...","...qdddFFdddq...","...qqqqqqqqqq...","................","................","................"],
    bagIcon:["................","................",".....ffff.......","....f....f......","...ffffffffff...","..fddddddddddf..","..fddddddddddf..","..fFFFFFFFFFFf..","..fFFFFCCFFFFf..","..fFpFFCCFFFFf..","..fFpFFFFFFFFf..","..fFFFFFFFFFFf..","...ffffffffff...","................","................","................"],
    gearIcon:["................","................","................","................","......MM........","....MLLLLM......","...MLLLLLLM.....","..MMLLMMLLMM....","..MMLLMMLLMM....","...MLLLLLLM.....","....MLLLLM......","......MM........","................","................","................","................"],
    toolSeed:["................","................","................","...qqqqqqqqqq...","...qccccccccq...","...qdddGGdddq...","...qddGGGGddq...","...qdddDDdddq...","...qdddDDdddq...","...qddeeeeddq...","...qddddddddq...","...qqqqqqqqqq...","................","................","................","................"],
    toolWater:["................","................","................","..........uu....",".........u..u...","..u..uuuuu...u..","..uu.ukkbbu..u..",".B.uuubbbbu.u...","....ubbbbbbuu...","....ubbbbbbu....","....ubbbbbbu....","....uibbbbiu....",".....uuuuuu.....","................","................","................"],
    toolFert:["................","................","................","......qq........",".....q..q.......","....qaaaaq......","...qaaaaaaq.....","..qaaGGaaaaq....","..qaaGGaaaaq....","..qaaaaaeaaq....","..qaeaaaaaaq....","...qaaaaaaq.....","....qqqqqq......","................","................","................"],
    toolHarvest:["................","................","................","................","................","................","...FF.OO.GG.....","..qqqqqqqqqq....","...qacacacaq....","...qcacacacq....","....qacacaq.....","....qcacacq.....",".....qqqqq......","................","................","................"],
    toolShovel:["................","................","................","......SSSS......",".......SS.......",".......SS.......",".......SS.......",".......SS.......",".....MLLLLM.....","....MLLWLLLM....","....MLLLLLLM....",".....MLLLLM.....","......MMMM......","................","................","................"],
    cloud:["................","................","................","................","......LLLL......",".....LWWWWL.....","...LLWWWWWWL....","..LWWWWWWWWWL...","..LWWWWWWWWWL...","...LLLLLLLLLL...","................","................","................","................","................","................"],
    raincloud:["................","................","................","......LLLL......",".....LWWWWL.....","...LLWWWWWWL....","..LWWWWWWWWWL...","..LWWWWWWWWWL...","...LLLLLLLLLL...","................","....B...B...B...","................","...B...B...B....","................","................","................"],
    bush:["................","................",".....DDDD.......","...DDGEEGDD.....","..DGEEGGWEGD....",".DGEGGEEGGGED...",".DGGEEGGGEGGD...",".DGGWGGEEGGGD...",".DGEGGGGGGEGD...",".DGGGEGGGWGGD...","..DGGGGGGGGD....","...DDGGGGDD.....",".....DDDD.......","................","................","................"],
    pinkgrass:["................","................","....W......W....",".....pp...pp....","....pnfp.pfnp...",".....pp...pp....","......f....f....",".....pp...pp....","....pfnp.pnfp...",".....pp...pp....","..W...f....f....","...BBbfBBBfbBB..","..BbBBbBbBBbBb..","...bbBBbbBBbb...","................","................"],
    emHeart:["................","................","................","................","....ff...ff.....","...fFpf.fFFf....","...fFFFfFFFf....","...fFFFFFFFf....","....fFFFFFf.....",".....fFFFf......","......fFf.......",".......f........","................","................","................","................"],
    emStar:["................","................","................",".......U........","......UCU.......","......UCU.......","...UUUCCCUUU....","....UCCCCCU.....",".....UCCCU......","....UCU.UCU.....","....U.....U.....","................","................","................","................","................"],
    emLeaf:["................","................","................","................","......DD........",".....DGGD.......","....DGEGGD......","....DGGGGD......",".....DGGD.......","......DD........",".......D........",".......D........","................","................","................","................"],
    emNote:["................","................","................",".....KKKKK......",".....K...K......",".....K...K......",".....K...K......","...KKK..KKK.....","...KKK..KKK.....","................","................","................","................","................","................","................"],
    lotus:["................","................","......Ff........",".....pFfp.......","....pFppFp......","....fpFFpf......",".....fppf.......","...DGGGGGGD.....","..DGGGGGGGGD....","...DDGGGGDD.....","................","..b..bbb...b....",".bBbbBBBbbBb....","..bb..b..bb.....","................","................"],
    gem:["................","................",".......v........","......vVv.......",".....vVWVv......",".....vVVVv......","....vVVWVVv.....","....vVVVVVv.....","...vVVWVVVVv....","..BbvVVVVVvBb...",".bBBvVVVVVvBBb..",".bbbvvvvvvvbbb..","..MMMMMMMMMMM...","...MMMMMMMMM....","................","................"],
    emBang:["................","................",".....ffff.......",".....fpFf.......",".....fFFf.......",".....fFFf.......",".....fFFf.......",".....fFFf.......","......ff........","................",".....ffff.......",".....fFFf.......",".....ffff.......","................","................","................"],
  };
  /* Nếu bảng màu thiếu màu xanh k/i trong toolWater thì bù vào */
  P.k = P.k || '#c4e3f0'; P.i = P.i || '#a9cede';

  /* ===== Chuyển bộ sưu tập bé tròn (14+1): namespace riêng, tránh đụng chữ cái với bảng màu của game ===== */
  const PET_P = {
    B:'#9ed8f2', b:'#5fa8cc', W:'#fffdf4', K:'#3a2c22', n:'#ffb0bc', '3':'#4a7ba6',   // '3' = ngũ quan của slime xanh (xanh xám, thay cho K nâu đen gốc)
    V:'#b48ae0', v:'#8a5cc0',
    p:'#ffb8c4', F:'#e06578', f:'#a83a52',
    o:'#e8963a', t:'#b0641e',
    A:'#f4e8d8', z:'#d9c5aa',
    N:'#5c5c6a', L:'#b8b0a2', M:'#8a8274',
    C:'#f2c231', U:'#bf8a1a',
    E:'#fff5dc', e:'#d9cfe5', I:'#cbeaf2',
    G:'#f6cf62', g:'#bd822d',
    D:'#49315f', d:'#6f4a89', J:'#9b70ad',
    R:'#9569a6', r:'#c198ca', X:'#fff2bd',
    T:'#8b5936', S:'#d99a43', Q:'#76545f',
    H:'#56649d', h:'#8492c7', Y:'#f5d76d', y:'#bd923b',
    O:'#fffaf0', q:'#cfc5df', Z:'#72d4c7', c:'#3fa6a5', a:'#bff3df',
    k:'#688f57', l:'#a6cb7d', i:'#c8d8f0', j:'#8296c9', x:'#8e6bad',
    m:'#d9bd6f', u:'#dcf3e7', s:'#92c4b0'
  };
  const PET_SPR = {
  slime:[
  "................","................","................","................",
  ".....BBBBBB.....","....BBBBBBBB....","...BBWWBBBBBB...","..BBWWBBBBBBBB..",
  "..BBBBBBBBBBBB..","..BB33BBBB33BB..",".BBBBBBBBBBBBBB.",".BnBBBB33BBBBnB.",
  ".BBBBBBBBBBBBBB.",".bBBBBBBBBBBBBb.","..bbbbbbbbbbbb..","................"],
  slimePink:[
  "................","................","................","................",
  ".....pppppp.....","....pppppppp....","...ppWWpppppp...","..ppWWpppppppp..",
  "..pppppppppppp..","..ppffppppffpp..",".pppppppppppppp.",".pFppppffppppFp.",
  ".pppppppppppppp.",".FppppppppppppF.","..FFFFFFFFFFFF..","................"],
  slimeNight:[
  ".......O........","......OOO.......",".......t........",".....TTTTTT.....",
  "....TTTTTTTT....","...TCTTTTTTTT...","..TCTTTTTTTTTT..",".TTTTDTTTTDTTTT.",
  ".TTPPTTDDTTPPTT.",".TTTTTTTTTTTTTT.","..tTTTTTTTTTTt..",".tTT.tTTTT.tTTt.",
  "tTt..tTTt..tTTt.",".t...tT.tT...tT.",".....t...t......","................"],
  octo:[
  "................","................","................",".....VVVVVV.....",
  "....VVVVVVVV....","...VVWWVVVVVV...","...VWWVVVVVVV...","..VVVVVVVVVVVV..",
  "..VVKKVVVVKKVV..","..VVVVVVVVVVVV..","..VnVVVKKVVVnV..","..VVVVVVVVVVVV..",
  "..VVVVVVVVVVVV..","..VV.VV..VV.VV..","..vv.vv..vv.vv..","................"],
  octoCream:[
  "................","................","................",".....AAAAAA.....",
  "....AAAAAAAA....","...AAWWAAAAAA...","...AWWAAAAAAA...","..AAAAAAAAAAAA..",
  "..AAAAAAAAAAAA..","..AAKKAAAAKKAA..","..AnAAAAAAAAnA..","..AAAAAAAAAAAA..",
  "..AAAAAAAAAAAA..","..AA.AA..AA.AA..","..zz.zz..zz.zz..","................"],
  bunny:[
  "......S.........",".....SSS........","......S.........",".....IIIIII.....",
  "....IIIIIIII....","...IIBIIIIIII...","..IIBIIIIIIIII..",".IIIIYIIIIYIIII.",
  ".IIPPIISSIIPPII.",".IIIIIIIIIIIIII.","..iIIIIIIIIIIi..","...iiiiiiiiii...",
  "...LL..LL..LL...","..LL...LL...LL..","..L....L....L...",".LL...LL...LL..."],
  batBlob:[
  "................","...oo......oo...","...ooo....ooo...","...oooo..oooo...",
  "....oooooooo....","...oooooooooo...","..oooooooooooo..","..ooKKooooKKoo..",
  "ttooooonnooooott",".toooooooooooot.",".onoooooooooono.",".oooooooooooooo.",
  ".oooooooooooooo.",".toooooooooooot.","..tttttttttttt..","................"],
  ghostBlob:[
  "................",".......uu.......","......uuuu......",".....uuuuuu.....",
  "....uuWuuuuu....","...uuWuuuuuuu...","..uuuuuuuuuuuu..",".uuuuQuuuuQuuuu.",
  ".unnuuuQQuuunnu.",".uuuuuuuuuuuuuu.","uuuuuuuuuuuuuuuu","suuuuuuuuuuuuuus",
  ".suuuuuuuuuuuus.","..suuuuuuuuuus..","...suus..suus...","................"],
  impBlob:[
  "................","................","....f......f....","....ff....ff....",
  ".....FFFFFF.....","....FFFFFFFF....","...FFWWFFFFFF...",".KFFWWFFFFFFFFK.",
  "KKFFFFFFFFFFFFKK","..FFKKFFFFKKFF..",".FFFFFFFFFFFFFF.",".FnFFFFKKFFFFnF.",
  ".FFFFFFFFFFFFFF.",".fFFFFFFFFFFFFf.","..ffffffffffff..","................"],
  angelBlob:[
  ".....gggggg.....","...gGG....GGg...",".....gggggg.....","................",
  ".....EEEEEE.....","....EEEEEEEE....","...EEWEEEEEEE...",".WEEWEEEEEEEEEW.",
  "WIEEEEEEEEEEEEEW","IEEEQQEEEEQQEEEI",".EnnEEEQQEEEnnE.",".EEEEEEEEEEEEEE.",
  ".eEEEEEEEEEEEEe.","..eEEEEEEEEEEe..","...eeeeeeeeee...","................"],
  witchBlob:[
  "...DDD..........","..DDDJ..........","...DDJDD........","...DDdDDDD......",
  "..DDdddDDDDD....",".DDDddGGdddDDD..","DDDDDDDDDDDDDDDD","...RRRRRRRRRR..T",
  "..RrRRRRRRRRRR.T",".RrRRRRRRRRRRRR.",".RRRXKRRRRDDRRR.",".RnRRRRRGDRRRnR.",
  ".RRRRRRRRRRRRR.T","..dRRRRRRRRRd.T.","...ddddddddd.SSS","...........SSSSS"],
  starBell:[
  "..Y....Y........",".......Y....Y...",".....YYYYY......",".Y....YYY.......",
  "......Y.Y.......",".....HHHHHH.....","....HHHHHHHH....","...HHhHHHHHHH...",
  "..HHhHHHHHHHHH..","..HHHHHHHHHHHH..",".HHHmmHHHHmmHHH.",".HYHHHHHHHHHHYH.",
  ".HHHHHHHHHHHHHH.",".hHHHHHHHHHHHHh.","..hHHHHHHHHHHh..","...hhhhhhhhhh..."],
  cloudMallow:[
  "................","................","......OOOO......","....OOOOOOOO....",
  "..OOOOOOOOOOOO..",".OOOWOOOOOOOOOO.","OOOOOOOOOOOOOOOO","OOOOQOOOOOOQOOOO",
  "OOnOOOOQQOOOOnOO","OOOOOOOOOOOOOOOO",".qOOOOOOOOOOOOq.","..qqOOqqqqOOqq..",
  "....I......I....","....II....II....",".....I....I.....","................"],
  dewSprout:[
  ".....kk..kk.....","....kllkkllk....","......kk........",".......ZZ.......",
  "......ZZZZ......",".....ZZZZZZ.....","....ZZaZZZZZ....","...ZZaZZZZZZZ...",
  "..ZZZZZZZZZZZZ..",".ZZZZQZZZZQZZZZ.",".ZnZZZZQZZZZZnZ.",".ZZZZZZZZZZZZZZ.",
  ".cZZZZZZZZZZZZc.","..cZZZZZZZZZZc..","...cccccccccc...","................"],
  prismBlob:[
  "..j..........j..",".jij........jij.","..j..........j..","......xxxx.....y",
  "y...xxiiiixx..yY","Yy.xiiiiiiiix..y","y.xiiiiiiiiiix..",".xiiiiiiiiiiiix.",
  ".xiiQQiiiiQQiix.",".xiriiiiQiiiirx.",".xiiiiiiiiiiiix.","..xiiiiiiiiix...",
  "...xiiiiiiix....","....xxxxxxxx....","......jjjj......","................"],
  };

  /* ===== v0.8c (#43): hệ thống da chuyển sắc (bộ sưu tập codex 0718) —— màu phủ theo từng sprite, giá trị có thể là màu đơn hoặc gradient tuyến tính ===== */
  const petLinear = (x1, y1, x2, y2, stops) => ({ type: 'linear', x1, y1, x2, y2, stops });
  const PET_FX = {
    batBlob: {                                            // Bé bí ẩn: bản cam dịu thứ hai (wen chốt: pha sữa giảm độ tinh khiết nhưng giữ dòng máu cam; bản oải hương để dành cho kho da DLC)
      o: petLinear(1, 2, 15, 14, [['0%', '#ffe0a6'], ['46%', '#f7b374'], ['100%', '#ea9060']]),
      t: petLinear(0, 7, 16, 15, [['0%', '#d18a58'], ['100%', '#b06a44']]),
      K: '#6b4548', n: '#ffcdd8',
    },
    slimeNight: {                                         // Bé soda đào (giữ id slimeNight để không hỏng save, #43)
      T: petLinear(1, 2, 15, 14, [['0%', '#ffe8a6'], ['35%', '#ffbdc9'], ['64%', '#ff94bf'], ['100%', '#c99bf5']]),
      t: petLinear(0, 4, 16, 15, [['0%', '#f28bc2'], ['100%', '#9b78de']]),
      C: '#effffb', D: '#5b4568', P: '#65e0cf',
      O: petLinear(0, 0, 15, 3, [['0%', '#b9fff3'], ['100%', '#9ba7ff']]),
    },
    bunny: {                                              // Bé sứa xoăn (giữ id bunny để không hỏng save, #43)
      I: petLinear(1, 2, 15, 14, [['0%', '#c8f4ff'], ['28%', '#8cddff'], ['62%', '#58b7f2'], ['100%', '#6576dc']]),
      i: petLinear(0, 7, 16, 15, [['0%', '#579dd1'], ['100%', '#5459aa']]),
      B: '#effcff', Y: '#fff0a6', P: '#ff8fca',
      S: petLinear(0, 0, 16, 4, [['0%', '#fff6aa'], ['100%', '#a8dbff']]),
      L: petLinear(0, 11, 16, 16, [['0%', '#bdeaff'], ['100%', '#8d90ee']]),
    },
  };
  const petCache = new Map();
  function petSVG(name, px) {
    const key = name + '@' + px;
    if (petCache.has(key)) return petCache.get(key);
    const map = PET_SPR[name]; if (!map) return '';
    const fx = PET_FX[name];
    let defs = '';
    const fills = {};
    if (fx) for (const ch in fx) {
      const v = fx[ch];
      if (v && typeof v === 'object') {
        const gid = 'pfx_' + name + '_' + ch.charCodeAt(0);
        defs += `<linearGradient id="${gid}" gradientUnits="userSpaceOnUse" x1="${v.x1}" y1="${v.y1}" x2="${v.x2}" y2="${v.y2}">` +
          v.stops.map(s => `<stop offset="${s[0]}" stop-color="${s[1]}"/>`).join('') + '</linearGradient>';
        fills[ch] = `url(#${gid})`;
      } else fills[ch] = v;
    }
    let r = '';
    map.forEach((row, y) => {
      for (let x = 0; x < row.length; x++) { const ch = row[x]; const c = fills[ch] || PET_P[ch]; if (c) r += `<rect x="${x}" y="${y}" width="1" height="1" fill="${c}"/>`; }
    });
    const out = `<svg width="${px}" height="${px}" viewBox="0 0 16 16" shape-rendering="crispEdges" style="display:block">${defs ? '<defs>' + defs + '</defs>' : ''}${r}</svg>`;
    petCache.set(key, out);
    return out;
  }

  /* ===== Bảng dữ liệu thú cưng (giá là chỗ giữ chỗ để test; page = trang mở khoá, 2/3 cần vé tương ứng) ===== */
  const PETS = {
    /* —— Trang 1 —— */
    slime:      { name: 'Slime xanh',    page: 1, price: 0,    starter: true, cry: ['Bụp bụp~', 'Bựppp!', 'Grù grù…', 'Bụp?', 'Nhảy nhảy!'], desc: 'Loại tìm kho báu · bé tròn tổ tiên, bạn đồng hành từ đầu' },
    octo:       { name: 'Bạch tuộc tím', page: 1, price: 500,  cry: ['Ục bốp?', 'Ục ực!', 'Chíu mi!', 'Bóp bóp…', 'Ục bốp bốp!'], desc: 'Loại tìm kho báu · thích chồng lên đầu người khác' },
    slimePink:  { name: 'Slime hồng',    page: 1, price: 600,  cry: ['Bụp hì~', 'Bụp bụp!', 'Hì hì…', 'Bụp chíu~'], desc: 'Loại tìm kho báu · vị dâu (nhưng không ăn được)' },
    octoCream:  { name: 'Bạch tuộc kem', page: 1, price: 700,  cry: ['Bốp…', 'Ục…', '(chậm rì rì) bóp~'], desc: 'Loại tìm kho báu · bậc thầy nguỵ trang, trùng màu với bảng điều khiển' },
    dewSprout:  { job: 'plant', name: 'Bé mầm sương', page: 1, price: 1200, cry: ['Tí tách~', 'Mầm!', '(đội lá lên)'], desc: 'Loại làm việc · chọc một cái là gieo khắp ruộng, hạt xuống đất là nảy mầm' },
    cloudMallow:{ job: 'water', name: 'Bé bông mây',  page: 1, price: 1500,  cry: ['Bông bông~', 'Vù——', '(bay lơ lửng)'], desc: 'Loại làm việc · ra sân là mây mưa nhỏ tự động tưới' },
    /* —— Trang 2 (vé vùng nước) —— */
    ghostBlob:  { name: 'Bé ma nhỏ',     page: 2, price: 1500, cry: ['Uuu~', 'Bay bay…', '(xuyên qua tay bạn)'], desc: 'Loại tìm kho báu · bay được vào những chỗ người khác không vào nổi' },
    batBlob:    { job: 'fert', name: 'Bé bí ẩn',      page: 2, price: 1800, cry: ['……?', '(nghiêng đầu)', '?!'], desc: 'Loại làm việc · chọc một cái là bón phân hàng loạt · phân của nó bón ra cái gì thì không ai đoán nổi' },
    bunny:      { job: 'harvest', name: 'Bé sứa xoăn', page: 2, price: 2200, cry: ['Ục grù~', '(cuộn cuộn xúc tu)', 'Bốp ục!'], desc: 'Loại làm việc · chọc một cái là xúc tu nhẹ nhàng cuộn rau chín vào balo' },   // #43: giữ id bunny để không hỏng save
    impBlob:    { name: 'Bé quỷ nhỏ',    page: 2, price: 3000, cry: ['Hì hì.', 'Hư!', '(giấu cái gì đó đi)'], desc: 'Loại tìm kho báu · khi tìm kho báu sẽ tha về hạt giống bí ẩn đen sì' },
    angelBlob:  { name: 'Bé thiên thần', page: 2, price: 3000, cry: ['Ting~', '(phát sáng dịu dàng)', 'Chúc phúc cho bạn.'], desc: 'Loại tìm kho báu · khi tìm kho báu sẽ ngậm về hạt giống bí ẩn ánh lấp lánh' },
    /* —— Trang 3 (vé khu mỏ) —— */
    prismBlob:  { name: 'Bé lăng quang', page: 3, price: 8000, cry: ['Keng~', '(khúc xạ ra một dải cầu vồng)', 'Kengg!'], desc: 'Loại sản xuất · tìm kho báu mang về mảnh lăng quang (đổi được một đơn ở trang đơn hàng phù thuỷ)' },
    starBell:   { name: 'Bé chuông sao', page: 3, price: 8000, cry: ['Leng keng~', '☆!', '(lắc lắc nhẹ)'], desc: 'Loại sản xuất · tìm kho báu rung rơi mảnh ngôi sao (triệu hồi được phù thuỷ tròn)' },
    /* —— Át chủ bài (#43: giữ id slimeNight để không hỏng save; page 1 = không cần vé, đủ tiền là mang về được, thuần tuý thuế dễ thương) —— */
    slimeNight: { name: 'Bé soda đào',   page: 1, price: 9999, cry: ['Bốp——!', '(nổi một bong bóng nhỏ)', 'Xì~', '(vị ngòn ngọt)'], desc: 'Loại tìm kho báu · tinh linh soda vị đào · dễ thương quá mức nên đắt nhất' },
  };
  const PASSES = {
    water: { name: 'Vé vùng nước', price: 6000,  desc: 'Mở khoá ruộng vùng nước (trang 2) + quyền mua bé tròn trang 2 và hạt giống thuỷ sinh, tặng kèm ô ruộng nổi đầu tiên' },
    mine:  { name: 'Vé khu mỏ',    price: 35000, desc: 'Mở khoá ruộng khu mỏ (trang 3) + quyền mua bé tròn trang 3 và hạt giống khu mỏ, tặng kèm luống ươm đầu tiên' },
  };
  /* ===== v0.8: cây trồng mới trang 2-3 + tinh linh hạt giống bí ẩn (chuyển từ bản thiết kế chốt; namespace riêng, mỗi hình mang bảng màu của mình) ===== */
  const C2 = {
    chuncai: { p: { g:'#2e6a50', G:'#4d9a6e', W:'#a8d8bc', o:'#8a5540' }, m: [
      '................','................','....gg....gg....','...gGGg..gGGWg..','...gGGGg.gGGg...','....gg....gg....','.......o........','..gg...o...gg...','.gGGWg.o.gGGg...','.gGGg..o.gGWGg..','..gg...o..gg....','................','................','................','................','................'] },
    biqi: { p: { t:'#4d7a26', T:'#79b544', m:'#3f2a20', M:'#6a4534', W:'#f2e8d8' }, m: [
      '....t..T..t.....','....t.T..t......','.....tT.tT......','....T.t.t.......','.....t.tT.......','......ttt.......','.......t........','.......t........','.......t........','......mmm.......','..mmmmMMMm.mmm..','.mMMWmMMMMmMMm..','.mMMMmMMMMmMWm..','..mmm.mmmm.mm...','................','................'] },
    lingjiao: { p: { g:'#2e6a50', G:'#4d9a6e', K:'#241b2e', P:'#5a3f66', W:'#b79ae0' }, m: [
      '................','.......gg.......','....ggGGGGgg....','...gGGgGGgGGg...','....ggGGGGgg....','.......gg.......','................','................','...KK......KK...','....KK....KK....','.....KKKKKK.....','....KPPKKPPK....','....KPPWPPPK....','.....KKKKKK.....','................','................'] },
    jiaobai: { p: { g:'#3f7a30', G:'#6aab44', W:'#f6f2e2', s:'#d9d0b8' }, m: [
      '....g....g......','...gG...gG.g....','...gG..gGG.Gg...','..gGG..gGG.Gg...','..gGG.gGGg.GG...','..gGGggGGggGG...','..gGGgGGGgGGG...','..gGGgGGGgGGg...','..sWWsWWWsWWs...','..sWWsWWWsWWs...','..sWWsWWWsWWs...','..sWWsWWWsWWs...','................','................','................','................'] },
    lianou: { p: { f:'#c25a78', P:'#f5aec2', W:'#fff0f5', g:'#2e6a50', G:'#4d9a6e', B:'#245a40', o:'#e8dcc2', O:'#c2b090' }, m: [
      '......ff........','.....fPPf.......','....fPWWPf......','..ffPPPPPPff....','.fPPfPWWPfPPf...','..fPPPPPPPPf....','...ffPPPPff.....','.....gGGg.......','...gGGGGGGg.....','..gGGGBGGGGg....','...gGGGGGGg.....','................','...OooOooO......','...OooOooO......','....OOOOO.......','................'] },
    wujing: { p: { K:'#3f2a58', V:'#8a64c0', W:'#dcc8f5' }, m: [
      '.......K........','......KVK.......','..K...KVK...K...','.KVK..KVK..KVK..','.KVK.KKVKK.KVK..','.KVWKKVWVKKVVK..','..KVKKVVVKKVK...','..KVVKVVVKVVK...','...KKKVVVKKK....','.....KVVVK......','......KKK.......','................','................','................','................','................'] },
    starbush: { p: { b:'#2e5a34', B:'#4f8a55', s:'#ffd94d', S:'#fff2b0', t:'#8a6244', y:'#ffd94d' }, m: [
      '..y..........y..','.....bbbbbb.....','...bbBBBBBBbb...','..bBBsBBBBBBBb..','..bBsSsBBBBBBb..','.bBBBsBBBBsBBBb.','.bBBBBBBBsSsBBb.','.bBBBBBsBBsBBBb.','..bBBBsSsBBBBb..','...bbBBsBBBbb...','.....bbbbbb.....','.y.....tt.....y.','.......tt.......','......t..t......','................','................'] },
    gemflower: { p: { K:'#5a4268', r:'#d95a6a', R:'#f090a0', b:'#4a7ac2', B:'#8fb8ec', g:'#38a06a', G:'#7cd4a4', p:'#8a5cc0', P:'#c0a0e8', y:'#c89a38', Y:'#ffd94d', W:'#fff2b0', t:'#4d7a26', T:'#79b544' }, m: [
      '................','......KrrK......','.....KrRRrK.....','.....KrRRrK.....','..KKK.KrrK.KKK..','.KbBBK.yy.KgGGK.','.KbBBKyYWYKgGGK.','..KKK.yYYy.KKK..','.......yy.......','.....KpPK.......','....KpPPpK......','....KpPPpK..T...','.....KppK..T....','......tt..T.....','......ttT.......','................'] },
    opalvine: { p: { t:'#3f5a5a', T:'#5c8080', K:'#8a7a9a', o:'#f2ecf5', P:'#f5b8d0', C:'#8adbe0' }, m: [
      '......t.........','...t..tt........','...tt..t...t....','....t..tt.tt....','.KK..t..tt......','KooK..t....KK...','KoPCK.tt..KooK..','.KK....t..KoCK..','.......t...KK...','....KK.t........','...KooKt........','...KoCPK........','....KK.t........','.......t........','................','................'] },
    dragoncry: { p: { K:'#8a2a26', T:'#e8604a', t:'#c23c34', W:'#ffe0a0', g:'#3f7a30', G:'#6aab44' }, m: [
      '.......gg.......','......gGGg......','.......KK.......','.....KKTTKK.....','....KTtTTtTK....','...KTTTTTTTTK...','...KTtTWWtTTK...','..KTTTWWWWTTTK..','..KTtTTWWTTtTK..','...KTTTTTTTTK...','...KTtTTTTtTK...','....KTTTTTTK....','.....KKTTKK.....','.......KK.......','................','................'] },
    seedDark: { p: { K:'#1c1420', k:'#33263d', v:'#8a2a4a', a:'#5a3f78' }, m: [
      '................','................','.....K...K......','.....KK.KK......','......KkK.......','.....KkkkK......','....KkKkkkK.....','....KkkkvkK.....','....KkkkkkK.....','.....KkkkK......','......KKK.......','................','...a...a...a....','................','................','................'] },
    seedLight: { p: { h:'#ffe89a', y:'#c8a94a', Y:'#f5dfa0', W:'#fff8e0', s:'#ffd94d' }, m: [
      '................','.....hh.hh......','....h.....h.....','................','......yy........','.....yYYy.......','....yYWYYy......','....yYYYYy......','....yYYYYy......','.....yYYy.......','......yy........','................','...s....s...s...','................','................','................'] },
    /* —— v0.9b (#49): ba họ bí ẩn · kén mộng / cỏ chìa khoá / cây ăn thịt (bản thiết kế chốt) —— */
    dreamG: { p: { K:'#b8a890', W:'#f8f4ea', w:'#e4dcc8', s:'#d9cfc0', p:'#f5b8d0', t:'#8a6844', g:'#4d7a26' }, m: [
      '........t.......','.......ts.......','......s.s.......','.....sKKs.......','....KWWWWK......','...KWwWWWWK.....','..KWWWWWWWWK....','..KWwWWWWwWK....','..KWWWWWWWWK....','..KWWwWWWWWK....','...KWWWWwWK.....','....KWWWWK......','.....KKKK.......','......p.........','.......p........','...g.......g....'] },
    dreamW: { p: { K:'#4a7a94', B:'#bcdde8', b:'#94c2d4', W:'#eef8fa', d:'#7a94b8', o:'#d8ecf2' }, m: [
      '................','......KKK.......','....KKBBBK......','...KBBWBBBK.....','..KBBBBBBBBK....','..KBBdddBBBK....','.KBBddBddBBBK...','.KBBdBBBdBBBK...','.KBBddBddBBbK...','..KBBdddBBbK....','..KBBBBBBbbK....','...KBBBBbbK.....','....KKbbbK......','......KKK.......','..o.........o...','......o.........'] },
    dreamM: { p: { K:'#3f3a50', S:'#8d8398', s:'#6d657c', c:'#241f2c', O:'#ffd94d', o:'#ffb060', d:'#575070' }, m: [
      '................','......KKK.......','....KKSSSK......','...KSSSSSSK.....','..KSSsSSSSSK....','..KSScSSSsSK....','.KSSScOcSSSSK...','.KSsScOOcSSSK...','.KSSSScOcSsSK...','..KSSSScSSSK....','..KsSSSSSsSK....','...KSSSSSSK.....','....KKSSSK......','......KKK.......','...d.......d....','................'] },
    keyG: { p: { t:'#4d7a26', T:'#79b544', c:'#a8681f', C:'#d99a43', W:'#ffe9b8', g:'#79b544' }, m: [
      '...tt...........','..t..tt.........','..t....tt.......','.tT......tt.....','.tT........t....','..t.......CCC...','..t.......CWC...','..t.......CCC...','.tTt.......c....','..t........c....','..t........cC...','..t........c....','..t........cC...','.gtg............','g.t..g..........','................'] },
    keyW: { p: { t:'#2e6a50', T:'#4d9a6e', c:'#3f7a5c', C:'#7cc4a4', W:'#c8ecd8', v:'#245a40', o:'#d8ecf2' }, m: [
      '...tt...........','..t..tt.........','..t....tt.......','.tT......tt.....','.tT........t....','..t.......CCC...','..t.......CWC...','..t.......CCC...','.tTt.......c....','..t....o...cv...','..t........cC...','..t........cv...','..t........cC...','..t.............','.o..............','................'] },
    keyM: { p: { t:'#b8862a', T:'#ffd94d', P:'#9a6ce0', p:'#c4a2e8', z:'#f0e4ff', s:'#ffd94d' }, m: [
      '...tt...........','..t..tt.........','..t....tt.......','.tT......tt.....','.tT........t....','..t.......PpP...','..t.......PzP...','..t.......PPP...','.tTt.......P....','..t........P....','..t........Pp...','..t........P....','..t........Pp...','.sts....z.......','..t.............','................'] },
    fangG: { p: { K:'#2e5a1e', G:'#6cb457', E:'#a4dc8c', R:'#c24a5a', W:'#fffdf4', t:'#4d7a26', g:'#79b544' }, m: [
      '....KKKK........','..KKGGGGKK......','.KGGEGGGGGK.....','.KGGGGGGGGK.....','..KGGGGGGK......','...KRRRRK.......','..W.W..W.W......','...KRRRRK.......','..KGGGGGGK......','.KGGGGGGGGK.....','.KGGEGGGGGK.....','..KKGGGGKK..g...','....KKKK.t.g....','......t.t.......','.......t........','....g..t...g....'] },
    fangW: { p: { K:'#6a2420', R:'#a83a35', r:'#c25a50', C:'#f2dfc0', D:'#2e1210', g:'#2e6a50', G:'#4d9a6e' }, m: [
      '.....KKKKK......','...KKRRRRRKK....','..KRRCRRRCRRK...','.KRRRRrRrRRRK...','.KRCRRKKKRRCK...','.KRRRKDDDKRRK...','.KRrKDDDDDKrK...','.KRRRKDDDKRRK...','.KRCRRKKKRRCK...','.KRRRRrRrRRRK...','..KRRCRRRCRRK...','...KKRRRRRKK....','.....KKKKK......','..Gg.......gG...','.GggG.....GggG..','................'] },
    fangM: { p: { K:'#1c1428', P:'#3a2a52', p:'#5a4278', F:'#8ae0ea', f:'#d8f8fc', O:'#ffb060', o:'#ffe0a0', t:'#2e2440' }, m: [
      '....KKKK........','..KKPPPPKK......','.KPPpPPPPPK.....','.KPPPPPPPPK.....','..KPPPPPPK......','...KOOOOK.......','..F.FoOF.F......','..f.KOOK.f......','..KPPPPPPK......','.KPPPPPPPPK.....','.KPPpPPPPPK.....','..KKPPPPKK......','....KKKK.t......','......t.t.......','.......t........','....F..t...F....'] },
    shardPrism: { p: { K:'#8ab8c8', k:'#4a8098', W:'#e8f8ff', w:'#c0e8f4', R:'#ff6060', G:'#60cc60', B:'#6090ff', Y:'#ffd940', P:'#c060e0', C:'#40d0d0' }, m: [
      '................','..........R.....','.....K..........','....KWK..G......','...KWwWK........','..KWwwwWK...B...','..KWwwwWK.......','...KwwWK....Y...','....KWK..P......','.....K..........','......C.........','...R............','........G.......','................','................','................'] },
    shardStar: { p: { K:'#6a4ab8', P:'#b094e0', p:'#d8c4ff', W:'#ffffff', o:'#ffd94d', y:'#fff4b0' }, m: [
      '................','........o.......','.......oyo......','......oyyo......','...ooooWooo.....','..oPPPpWpKK.....','..oKKKKK........','...oooo.........','................','..........oo....','.........oyo....','........oWyo....','.......oWpyo....','........oooo....','................','................'] },
    strawhat: { p: { K:'#a83a52', P:'#f7a6bd', p:'#ffd0dc', k:'#e07b96', Y:'#f5e0a8', y:'#e0be7a' }, m: [
      '................','................','................','......KKKK......',
      '.....KYyYYK.....','....KYYYYYYK....','....KYYYYYYK....','..KKKPPPPPPKKK..',
      '.KYYKPpPPPKYYYK.','KYyYYYYYYYYYYyYK','.KKKKKKKKKKKKKK.','.........kPk....',
      '..........kPk...','................','................','................'] },   // Huy hiệu mặt tiền: nón rơm ruy băng hồng (wen chốt, chỗ ký tên tác giả)
    mysbG: { p: { g:'#4d7a26', G:'#79b544', K:'#8a2a35', r:'#d94f5c', R:'#e8808e', y:'#ffe0a8' }, m: [
      '................','................','................','................','......G..g......','.....gGGGGg.....','.......GG.......','.....KrrrrK.....','....KrryrryK....','....KrrrrrrK....','....KryrrryK....','.....KrrrrK.....','......KrrK......','.......KK.......','................','................'] },
    mysbW: { p: { g:'#2e6a50', G:'#4d9a6e', K:'#2e6a80', r:'#7fd4dd', R:'#b8ecf0', W:'#f0fcff' }, m: [
      '.....G..g.......','....gGGGGg......','......GG........','....KrrrrK......','...KrrWrrrK.....','...KrRRrrrK.....','...KrrrrRrK.....','....KrrrrK......','.....KrrK.......','......KK........','.......W........','................','................','................','................','................'] },
    mysbM: { p: { g:'#5a3f78', G:'#8a5cc0', K:'#3a2258', r:'#9a6ac8', R:'#c4a2e8', W:'#e8d8f8' }, m: [
      '.....G..g.......','....gGGGGg......','......GG........','....KrrrrK......','...KrRrWrrK.....','...KrrRrrrK.....','...KRrrrRrK.....','....KrrRrK......','.....KrrK.......','......KK........','................','................','................','................','................','................'] },
  };
  const pageUnlocked = p => p === 1 || (p === 2 && S.passes.water) || (p === 3 && S.passes.mine);


  const spriteCache = new Map();
  function spriteSVG(name, px) {
    const key = name + '@' + px;
    if (spriteCache.has(key)) return spriteCache.get(key);
    const map = SPR[name] || (C2[name] && C2[name].m); if (!map) return '';
    const pal = SPR[name] ? P : C2[name].p;               // v0.8: cây trồng mới dùng bảng màu riêng của nó
    let r = '';
    map.forEach((row, y) => {
      for (let x = 0; x < row.length; x++) { const c = pal[row[x]]; if (c) r += `<rect x="${x}" y="${y}" width="1" height="1" fill="${c}"/>`; }
    });
    const out = `<svg width="${px}" height="${px}" viewBox="0 0 16 16" shape-rendering="crispEdges" style="display:block">${r}</svg>`;
    spriteCache.set(key, out);
    return out;
  }
  const tileCache = new Map();
  function tileURI(kind, seedNum) {
    const tkey = kind + '@' + seedNum;
    if (tileCache.has(tkey)) return tileCache.get(tkey);
    const out = buildTile(kind, seedNum);
    tileCache.set(tkey, out);
    return out;
  }
  /* v0.8: màu riêng cho nền đất trang 2-3 (W1 ruộng nổi đầm sen / M1 mạch quặng kim cương, bản thiết kế chốt) */
  /* v0.8: màu riêng cho nền đất trang 2-3 (W1 ruộng nổi đầm sen / M1 mạch quặng kim cương, bản thiết kế chốt; W3 ruộng bậc thang khe suối thử xong bị loại #71) */
  const LP = { '8':'#8ec8d8', '~':'#b8e0ea', '-':'#79b4c6', '_':'#6faabf', '9':'#3f7290', '!':'#35617d',
    '6':'#5f5870', '^':'#6d657c', '&':'#4e4860', '7':'#433c54', '5':'#8ae0ea', '*':'#e8fcff', '%':'#5fc8d8', '#':'#3a3450',
    'l':'#5aa06a', 'L':'#7cc48a',
    '=':'#b9d194', '0':'#ffe9b8', '+':'#fff2b0' };   // v1.0 G2: đốm cỏ nhạt (=, tránh h của bảng chính = cam bí ngô!) / cánh hoa vàng kem / nhuỵ vàng nhạt
  function buildTile(kind, seedNum) {
    const rnd = mulberry32(seedNum);
    const base = { grass:'1', wet:'w', soil:'a', water:'8', wplot:'9', wplotwet:'!', mine:'6', mplot:'7', mplotwet:'#' }[kind] || 'a';
    const SZ = (kind === 'water' || kind === 'mine' || kind === 'grass') ? 96 : 32;   // v0.9/v1.0: nền đất cả ba trang đều dùng khung vẽ lớn
    const g = [];
    for (let y = 0; y < SZ; y++) g.push(new Array(SZ).fill(base));
    const blot = (cx, cy, rad, ch) => {                   // Hoạ tiết vòng tròn đậm nhạt của bản thiết kế
      cx |= 0; cy |= 0; rad |= 0;                         // Sửa: làm tròn tâm/bán kính, chỉ số thập phân sẽ làm nổ mảng
      for (let j = -rad; j <= rad; j++) for (let i = -rad; i <= rad; i++) {
        if (i * i + j * j > rad * rad + rnd() * 2) continue;
        const x = ((cx + i) % SZ + SZ) % SZ, y = ((cy + j) % SZ + SZ) % SZ;   // Lấy dư kiểu vòng lại, lát nền không có đường ghép
        g[y][x] = ch;
      }
    };
    if (kind === 'grass') {                              // v1.0 G2 "thảm hoa dại": đốm cỏ dịu + lá cỏ + hoa dại nhỏ ba màu hồng/trắng/vàng
      for (let i = 0; i < 5; i++) blot(rnd() * SZ, rnd() * SZ, 4 + rnd() * 5, '=');
      for (let i = 0; i < 4; i++) blot(rnd() * SZ, rnd() * SZ, 3 + rnd() * 4, '2');
      for (let i = 0; i < 55; i++) { const x = (rnd() * SZ) | 0, y = (rnd() * (SZ - 1)) | 0; g[y][x] = '3'; g[y + 1][x] = '4'; }
      for (let i = 0; i < 30; i++) g[(rnd() * SZ) | 0][(rnd() * SZ) | 0] = '2';
      const combos = [['n', 'W'], ['W', '0'], ['C', '+']];
      for (let i = 0; i < 10; i++) {
        const fx = 2 + ((rnd() * (SZ - 4)) | 0), fy = 2 + ((rnd() * (SZ - 4)) | 0);
        const c = combos[(rnd() * 3) | 0];
        g[fy][fx] = c[0]; g[fy][fx + 1] = c[0]; g[fy + 1][fx] = c[0]; g[fy + 1][fx + 1] = c[1];
      }
    } else if (kind === 'water') {                        // W1 nước ngoài ruộng (khung vẽ lớn v0.9): đốm tròn đậm nhạt làm nền + ánh sóng + lá sen —— theo bản thiết kế
      for (let i = 0; i < 3; i++) blot(rnd() * SZ, rnd() * SZ, 6 + rnd() * 5, '-');   // Đốm nước lớn màu đậm (ít mà to)
      for (let i = 0; i < 4; i++) {                       // Vân nước nhạt: vòng tròn lớn khoét rỗng thành vành, trông như gợn sóng (tách biệt với đốm vụn đặc của khu mỏ)
        const cx = rnd() * SZ, cy = rnd() * SZ, r = 8 + ((rnd() * 5) | 0);
        blot(cx, cy, r, '~'); blot(cx, cy, r - 2, '8');
      }
      for (let i = 0; i < 55; i++) { const x = (rnd() * (SZ - 2)) | 0, y = (rnd() * SZ) | 0; g[y][x] = '~'; g[y][x + 1] = '~'; }
      for (let i = 0; i < 22; i++) g[(rnd() * SZ) | 0][(rnd() * SZ) | 0] = '_';
      for (let i = 0; i < 5; i++) { const x = 2 + ((rnd() * (SZ - 6)) | 0), y = 2 + ((rnd() * (SZ - 4)) | 0); g[y][x] = 'l'; g[y][x + 1] = 'L'; g[y][x + 2] = 'l'; g[y + 1][x] = 'l'; g[y + 1][x + 1] = 'l'; }
    } else if (kind === 'wplot' || kind === 'wplotwet') { // W1 nước sâu trong ruộng (đã tưới = sâu hơn)
      for (let i = 0; i < 6; i++) { const x = (rnd() * 30) | 0, y = (rnd() * 32) | 0; g[y][x] = kind === 'wplot' ? '!' : '9'; g[y][x + 1] = kind === 'wplot' ? '!' : '9'; }
      for (let i = 0; i < 3; i++) g[(rnd() * 32) | 0][(rnd() * 32) | 0] = '~';
    } else if (kind === 'mine') {                         // M1 đá phiến (khung vẽ lớn v0.9): đốm tròn đậm nhạt + đốm vụn + kim cương nhỏ khắp nơi —— theo bản thiết kế
      for (let i = 0; i < 7; i++) blot(rnd() * SZ, rnd() * SZ, 4 + rnd() * 5, '^');
      for (let i = 0; i < 6; i++) blot(rnd() * SZ, rnd() * SZ, 3 + rnd() * 4, '&');
      for (let i = 0; i < 55; i++) g[(rnd() * SZ) | 0][(rnd() * SZ) | 0] = '^';
      for (let i = 0; i < 28; i++) g[(rnd() * SZ) | 0][(rnd() * SZ) | 0] = '&';
      for (let i = 0; i < 9; i++) {
        const x = 2 + ((rnd() * (SZ - 4)) | 0), y = 2 + ((rnd() * (SZ - 4)) | 0);
        g[y - 1][x] = '5'; g[y][x - 1] = '5'; g[y][x + 1] = '5'; g[y + 1][x] = '5'; g[y][x] = '*';
      }
      for (let i = 0; i < 14; i++) g[(rnd() * SZ) | 0][(rnd() * SZ) | 0] = '*';
    } else if (kind === 'mplot' || kind === 'mplotwet') { // Lớp lót trong luống ươm pha lê M1 (đã tưới = ngả xanh)
      for (let i = 0; i < 5; i++) g[(rnd() * 32) | 0][(rnd() * 32) | 0] = '&';
      for (let i = 0; i < 3; i++) g[(rnd() * 32) | 0][(rnd() * 32) | 0] = '%';
    } else {
      const top = kind === 'wet' ? 'g' : 'd', dark = kind === 'wet' ? 'm' : 'c', speck = kind === 'wet' ? 's' : 'e';
      for (let y = 0; y < 32; y++) { if (y % 4 === 0) g[y].fill(top); if (y % 4 === 3) g[y].fill(dark); }
      for (let i = 0; i < 5; i++) { const y = 4 * ((rnd() * 8) | 0) + 1 + ((rnd() * 2) | 0); g[y][(rnd() * 32) | 0] = speck; }
    }
    let r = '';
    g.forEach((row, y) => row.forEach((ch, x) => { const c = P[ch] || LP[ch]; if (c) r += `<rect x="${x}" y="${y}" width="1" height="1" fill="${c}"/>`; }));
    return `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${SZ}" height="${SZ}" viewBox="0 0 ${SZ} ${SZ}" shape-rendering="crispEdges">${r}</svg>`)}")`;
  }

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
  let SEC = { url: '', key: '', model: '', autoReset: true, resetHours: 4 };
  try {
    const raw = pwin.localStorage.getItem(SEC_LS_KEY);
    if (raw) {
      const o = JSON.parse(raw);
      SEC = { url: o.url || '', key: o.key ? atob(o.key) : '', model: o.model || '',
        autoReset: o.autoReset !== false, resetHours: clampN(o.resetHours, 1, 24, 4) };
    }
  } catch (e) {}
  function saveSec() {
    try { pwin.localStorage.setItem(SEC_LS_KEY, JSON.stringify({ url: SEC.url, key: btoa(SEC.key), model: SEC.model, autoReset: SEC.autoReset, resetHours: SEC.resetHours })); } catch (e) {}
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
      
      // 1. Try ctx.worldInfo
      if (ctx.worldInfo && Array.isArray(ctx.worldInfo.entries)) {
        entries = entries.concat(ctx.worldInfo.entries);
      } 
      else if (ctx.worldInfo && typeof ctx.worldInfo === 'object') {
         Object.values(ctx.worldInfo).forEach(book => {
           if (book && Array.isArray(book.entries)) entries = entries.concat(book.entries);
         });
      }

      // 2. Try window.world_info
      if (window.world_info && typeof window.world_info === 'object') {
         Object.values(window.world_info).forEach(book => {
           if (book && Array.isArray(book.entries)) entries = entries.concat(book.entries);
           else if (book && typeof book === 'object' && !Array.isArray(book)) {
               // Sometimes book itself is just the entry or has an entries list
               if (book.content || book.text) entries.push(book);
           }
         });
      }

      // 3. Try embedded character_book
      try {
        if (window.characters && typeof window.this_character !== 'undefined') {
          const charData = window.characters[window.this_character]?.data;
          if (charData && charData.character_book && Array.isArray(charData.character_book.entries)) {
             entries = entries.concat(charData.character_book.entries);
          }
        }
      } catch(e) {}
      
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
      return txt.slice(0, 20000);
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
      const prompt = buildEventPrompt(await collectWorldbook());
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
  const onResize = () => {
    placeOrb();
    if (win.classList.contains('open')) { layout(); placeWin(); renderPlots(); }
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
    let html = '';
    for (let b = 0; b < 6; b++) {
      const locked = b >= nb;
      html += `<div class="block${locked ? ' locked' : ''}" data-block="${b}">`;
      for (let j = 0; j < 4; j++) {
        const pi = b * 4 + j;
        if (locked) {
          html += `<div class="plot" data-deco="lock" data-pi="${pi}"></div>`;   // data-deco chỉ dùng làm dấu chặn click, không render trang trí nữa
        } else {
          const c = plots[pi].crop;
          const wet = c && now() < c.wateredUntil;
          html += `<div class="plot${wet ? ' watered' : ''}" data-pi="${pi}">${plotHTML(pi)}</div>`;
        }
      }
      if (locked) {
        const next = b === nb;
        const confirming = buyConfirm.b === b && now() < buyConfirm.until;
        const poor = S.coins < blockPrice(b);
        html += next
          ? (confirming
            ? `<div class="sign confirm" data-buy="${b}">Bấm lần nữa<small>xác nhận chi ${blockPrice(b).toLocaleString()} G</small></div>`
            : `<div class="sign${poor ? ' poor' : ''}" data-buy="${b}">Khai hoang<small>${spriteSVG('coin', 13)}${blockPrice(b).toLocaleString()} G</small></div>`)
          : `<div class="sign" style="opacity:.55">Chưa mở<small>khai hoang ô trước đã</small></div>`;
      }
      html += '</div>';
    }
    wrap.innerHTML = html;
    const groundKind = pg === 2 ? 'water' : pg === 3 ? 'mine' : 'grass';
    const plotKind = pg === 2 ? 'wplot' : pg === 3 ? 'mplot' : 'soil';
    const wetKind = pg === 2 ? 'wplotwet' : pg === 3 ? 'mplotwet' : 'wet';
    wrap.querySelectorAll('.plot').forEach(p => {
      const pi = +p.dataset.pi;
      const locked = pi >= nb * 4;
      // Ô khoá không đặt sprite trang trí nữa (v1.1)
      p.style.backgroundImage = locked ? tileURI(groundKind, pi * 31 + 5)
        : p.classList.contains('watered') ? tileURI(wetKind, pi * 31 + 5) : tileURI(plotKind, pi * 31 + 5);
      p.style.backgroundSize = locked ? '144px 144px' : '100% 100%';   // Sửa #5: nền ô khoá lát đều chứ không kéo giãn (khung vẽ 96 ×1.5)
    });
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
          <div style="display:flex;gap:8px;flex-wrap:wrap">
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

export async function init() { initFarm(); }
