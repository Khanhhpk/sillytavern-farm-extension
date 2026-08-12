import { now } from './state.js';
import { ctx } from './store.js';
import * as All from './all.js';
import { BLOCK_PRICE_PG, WEATHERS, TEST_MODE, DAY_MS, CROPS, GROW, MIN, REGROW, FERTS, WATER_CD, REGROW_MAX, POKE_CD, TREASURE_CD, PETS_OUT_MAX, WITCH_STAY, witchGap, SNAP_EDGE, ZONE_NAME } from './data.js';
import { mulberry32, petSVG, spriteSVG, tileURI, warmUpCache, PETS, PASSES, P, LP, PET_P } from './graphics.js';
import { toast, renderWitch } from './witch.js';
import { openModal } from './shop.js';
import { gameDay, settle, fmtLeft } from './utils.js';
import { curBlocks, curPlots, blockPrice, save } from './state.js';
import { SPRITE_PX } from './orb.js';
import { CS, eventPending, todayEvent, setInjection, saveCharState, updateInjection, requestDayEvent } from './events.js';
import { applyPageSkin, renderPager, sh } from './ui.js';
import { buyBlock, harvest, plant, water, fertilize, shovel, rollMutation } from './logic.js';
import { weatherOf } from './utils.js';
import { growMs } from './logic.js';
import { esc } from './events.js';
import { renderPets } from './pets.js';

/* ---------- Thanh công cụ và các chế độ ---------- */
export let mode = null;
export function setMode(val) { mode = val; }
export let buyConfirm = { b: -1, until: 0 };   // Xác nhận lần hai khi khai hoang (trạng thái render, tránh bị vẽ lại mỗi giây xoá mất)
export const TOOLS = [
  { key: 'seed', sp: 'toolSeed', tip: 'Gieo hạt' },
  { key: 'water', sp: 'toolWater', tip: 'Tưới nước' },
  { key: 'fert', sp: 'toolFert', tip: 'Bón phân' },
  { key: 'harvest', sp: 'toolHarvest', tip: 'Thu hoạch' },
  { key: 'shovel', sp: 'toolShovel', tip: 'Xới bỏ' },
];
export let toolbarOpen = false;
export function renderToolbar() {
  const tb = All.$id('toolbar');
  if (ctx.S && (ctx.S.view === 'explore' || ctx.S.view === 'casino')) {
    tb.style.display = 'none';
    const tip = All.$id('modetip');
    if (tip) tip.style.display = 'none';
    return;
  }
  tb.style.display = 'flex';
  
  tb.classList.toggle('open', toolbarOpen);
  if (!toolbarOpen) {
    tb.innerHTML = `<div class="tool" data-tool="expand" title="Công cụ" style="width:34px;height:34px">${spriteSVG('toolSeed', 22)}</div>`;
  } else {
    tb.innerHTML = TOOLS.map(t =>
      `<div class="tool${mode && mode.t === t.key ? ' selected' : ''}" data-tool="${t.key}" title="${t.tip}">${spriteSVG(t.sp, 30)}</div>`
    ).join('') + `<div class="tool mini" data-tool="collapse">✕</div>`;
  }
  const tip = All.$id('modetip');
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

export let pendingPick = null;
export function setPendingPick(val) { pendingPick = val; }
export function pickFrom(title, obj, nameFn, cb) {
  const ids = Object.keys(obj).filter(k => obj[k] > 0);
  if (!ids.length) return toast('Trong balo không có, ra cửa hàng mua đã');
  openModal(title, `<div class="picker">${ids.map(id =>
    `<span class="pick" data-pick="${id}">${nameFn(id)} ×${obj[id]}</span>`).join('')}</div>`);
  pendingPick = cb;
}

/* ---------- Render ---------- */
export let cacheWicon = '', cacheCoins = -1, cacheDayTxt = '', cacheBlockTxt = '';
export function renderStatus() {
  if (ctx.S.coins !== cacheCoins) {
    All.$id('coins').textContent = ctx.S.coins.toLocaleString();
    cacheCoins = ctx.S.coins;
  }
  const w = weatherOf(gameDay());
  const wiconHtml = spriteSVG(w === 'Nắng' ? 'sun' : w === 'Mưa nhỏ' ? 'raincloud' : 'cloud', 22);
  if (cacheWicon !== wiconHtml) {
    All.$id('wicon').innerHTML = wiconHtml;
    cacheWicon = wiconHtml;
  }
  const dayStr = 'Ngày ' + gameDay() + ' · ' + w + (w === 'Mưa nhỏ' ? ' (sinh trưởng +10%)' : '');
  if (cacheDayTxt !== dayStr) {
    All.$id('daytxt').textContent = dayStr;
    cacheDayTxt = dayStr;
  }
  const blockStr = ZONE_NAME[ctx.S.page] + ' ' + curBlocks() + '/6';
  if (cacheBlockTxt !== blockStr) {
    All.$id('blocktxt').textContent = blockStr;
    cacheBlockTxt = blockStr;
  }
}
export function plotHTML(pi) {
  const c = curPlots()[pi].crop;
  if (!c) return '';
  const left = c.matureAt - now();
  const chip = CROPS[c.id].regrow && c.left != null ? `<span class="cnt2">${c.left}/${REGROW_MAX}</span>` : '';   // Sửa #4: số góc hiển thị số vụ
  const fdot = c.fertUsed && (c.fertUsed.compost || c.fertUsed.shiny) ? '<span class="fdot" title="Đã bón phân"></span>' : '';   // Dấu shiny ghi theo fertUsed, logic số góc không đổi   // Sửa #15: số góc bón phân hiển thị thường trực
  const mutPrefix = c.mut ? c.mut.split('@')[0] : '';
  const mut = c.mut ? `<span class="cnt2" style="left:3px;right:auto;background:#ead9f7;border-color:#9a6ad8;color:#6a4a9a" title="${mutPrefix}·đột biến">✦</span>` : '';
  if (left <= 0) return spriteSVG(CROPS[c.id].sp, SPRITE_PX) + `<span class="ripe">!</span>` + chip + fdot + mut;
  const total = growMs(c.id);
  const prog = Math.min(0.99, 1 - left / total);
  return spriteSVG('seedling', SPRITE_PX) + `<div class="bar"><i style="width:${(prog * 100) | 0}%"></i></div>` + chip + fdot + mut;
}
/* v1.1 (wen chốt): bỏ hết trang trí ở ô khoá —— 24 ô đầy cỏ dại / hoa sen / pha lê thì rối mắt quá, để hoạ tiết nền đất tự tạo không khí */
export function renderPlots() {
  const wrap = All.$id('blocks');
  const expWrap = All.$id('explore-blocks');
  
  if (ctx.S && ctx.S.view === 'explore') {
    if (wrap) wrap.style.display = 'none';
    const casWrap = All.$id('casino-blocks');
    if (casWrap) casWrap.style.display = 'none';
    if (expWrap && !All.isDungeonOpen) {
      expWrap.style.display = 'flex';
      if (!expWrap.hasChildNodes()) {
        expWrap.innerHTML = `
          <div class="explore-slot" id="eslot-dungeon">
            ${spriteSVG('dungeonGate', 48)}
            <div class="feature-name">Hầm ngục</div>
          </div>
          <div class="explore-slot" id="eslot-hero">
            ${spriteSVG('threeSlimesWalking', 64)}
            <div class="feature-name">Thám Hiểm</div>
          </div>
          <div class="explore-slot" id="eslot-flea" style="border-color: #64b5f6; box-shadow: 0 4px 0 #1976d2, inset 0 0 0 3px rgba(100,181,246,0.4);">
            ${spriteSVG('fleaIcon', 48) || '🛒'}
            <div class="feature-name" style="color: #e3f2fd; text-shadow: 0 1px 2px #000;">Chợ Trời</div>
          </div>
          <div class="explore-slot" id="eslot-achiv" style="border-color: #f2c231; box-shadow: 0 4px 0 #8a6a1c, inset 0 0 0 3px rgba(242,194,49,0.4);">
            ${spriteSVG('achivStar', 48)}
            <div class="feature-name" style="color: #fcd34d; text-shadow: 0 1px 2px #000;">Thành Tựu</div>
          </div>
          <div class="explore-slot" id="eslot-lixi" style="border-color: #dc2626; box-shadow: 0 4px 0 #991b1b, inset 0 0 0 3px rgba(220,38,38,0.4);">
            <div style="font-size:48px; line-height:48px; margin-top:8px;">🧧</div>
            <div class="feature-name" style="color: #fef08a; text-shadow: 0 1px 2px #000;">Lì Xì</div>
          </div>
          <div class="explore-slot" id="eslot-casino" style="border-color: #ffd94d; box-shadow: 0 4px 0 #b08a5c, inset 0 0 0 3px rgba(255,217,77,0.4);">
            <div style="width:64px;height:64px;position:relative;">${spriteSVG('casinoNeonGoldMap', 64)}</div>
            <div class="feature-name" style="color: #ffd94d; text-shadow: 0 1px 2px #000;">Casino</div>
          </div>
          <div class="explore-slot" id="eslot-bank" style="border-color: #71b87a; box-shadow: 0 4px 0 #4a8251, inset 0 0 0 3px rgba(113,184,122,0.4);">
            <div style="width:48px;height:48px;position:relative;margin:8px auto 0;">${spriteSVG('coin', 48)}</div>
            <div class="feature-name" style="color: #c8f5cc; text-shadow: 0 1px 2px #000;">Ngân Hàng</div>
          </div>
        `;
        const cBtn = All.$id('eslot-casino');
        if (cBtn) cBtn.addEventListener('click', () => {
          ctx.S.view = 'casino';
          All.save();
          All.applyPageSkin();
          All.applyViewState();
          All.renderToolbar();
          All.renderPager();
          All.renderPlots();
        });
        const dBtn = All.$id('eslot-dungeon');
        if (dBtn) dBtn.addEventListener('click', () => All.openPanel('dungeon'));
        const hBtn = All.$id('eslot-hero');
        if (hBtn) hBtn.addEventListener('click', () => All.openHeroPanel());
        const fBtn = All.$id('eslot-flea');
        if (fBtn) fBtn.addEventListener('click', () => {
            const ui = All.$id('trade-win');
            if (ui) ui.classList.add('open');
            All.openFleaMarket();
        });
        const lixiBtn = All.$id('eslot-lixi');
        if (lixiBtn) lixiBtn.addEventListener('click', () => {
            All.openLixiModal();
        });
        const bBtn = All.$id('eslot-bank');
        if (bBtn) bBtn.addEventListener('click', () => All.openPanel('bank'));
        const aBtn = All.$id('eslot-achiv');
        if (aBtn) aBtn.addEventListener('click', () => All.openAchivModal());
      }
    }
    return;
  }
  
  if (ctx.S && ctx.S.view === 'casino') {
    if (wrap) wrap.style.display = 'none';
    if (expWrap) expWrap.style.display = 'none';
    let casWrap = All.$id('casino-blocks');
    if (!casWrap) {
      casWrap = document.createElement('div');
      casWrap.id = 'casino-blocks';
      casWrap.className = 'casino-blocks';
      All.fieldEl.appendChild(casWrap);
    }
    casWrap.style.display = 'flex';
    casWrap.style.flexWrap = 'wrap';
    casWrap.style.alignContent = 'flex-start';
    casWrap.style.justifyContent = 'center';
    casWrap.innerHTML = `
      <div style="width:100%; display:flex; gap:16px; justify-content:center; margin-bottom:40px;">
        <div class="explore-slot" id="cslot-bet">
          ${spriteSVG('hiloIcon', 48)}
          <div class="feature-name">Hi-Lo</div>
        </div>
        <div class="explore-slot" id="cslot-bj">
          ${spriteSVG('spadeIcon', 48)}
          <div class="feature-name">Blackjack</div>
        </div>
        <div class="explore-slot" id="cslot-race">
          ${spriteSVG('raceGate', 48)}
          <div class="feature-name">Trường Đua</div>
        </div>
      </div>
    `;
    const bBtn = All.$id('cslot-bet');
    if (bBtn) bBtn.addEventListener('click', () => All.openPanel('bet'));
    const bjBtn = All.$id('cslot-bj');
    if (bjBtn) bjBtn.addEventListener('click', () => All.openBlackjackPicker());
    const raceBtn = All.$id('cslot-race');
    if (raceBtn) raceBtn.addEventListener('click', () => All.openRaceView());
    return;
  }

  if (expWrap) expWrap.style.display = 'none';
  const casWrap = All.$id('casino-blocks');
  if (casWrap) casWrap.style.display = 'none';
  if (wrap) wrap.style.display = '';

  const pg = ctx.S.page, plots = curPlots(), nb = curBlocks();
  
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
      const poor = ctx.S.coins < blockPrice(b);
      
      const sclassName = next ? (confirming ? "sign confirm" : (poor ? "sign poor" : "sign")) : "sign";
      const shtml = next
        ? (confirming
          ? `Bấm lần nữa<small>xác nhận chi ${blockPrice(b).toLocaleString()} G</small>`
          : `Khai hoang<small>${spriteSVG('coin', 13)}${blockPrice(b).toLocaleString()} G</small>`)
        : `Chưa mở<small>khai hoang ô trước đã</small>`;
        
      if (!hasSign) {
        signEl = document.createElement('div');
        signEl.className = sclassName;
        // @ts-ignore
        if (!next) signEl.style.opacity = '0.55';
        // @ts-ignore
        if (next) signEl.dataset.buy = String(b);
        signEl.innerHTML = shtml;
        blockEl.appendChild(signEl);
      } else {
        if (signEl.className !== sclassName) signEl.className = sclassName;
        // @ts-ignore
        if (!next && signEl.style.opacity !== '0.55') signEl.style.opacity = '0.55';
        // @ts-ignore
        if (next && signEl.style.opacity === '0.55') signEl.style.opacity = '';
        
        // @ts-ignore
        if (next && signEl.dataset.buy !== String(b)) signEl.dataset.buy = String(b);
        // @ts-ignore
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
        // @ts-ignore
        if (pEl.dataset.deco !== 'lock') {
           // @ts-ignore
           pEl.dataset.deco = 'lock';
           if (pEl.innerHTML !== '') pEl.innerHTML = '';
        }
      } else {
        // @ts-ignore
        if (pEl.dataset.deco === 'lock') delete pEl.dataset.deco;
        
        const c = plots[pi].crop;
        const wet = c && now() < c.wateredUntil;
        if (wet !== pEl.classList.contains('watered')) {
           pEl.classList.toggle('watered', wet);
        }
        
        if (!c) {
           // @ts-ignore
           if (pEl.dataset.state !== 'empty') {
             if (pEl.innerHTML !== '') pEl.innerHTML = '';
             // @ts-ignore
             pEl.dataset.state = 'empty';
           }
        } else {
           const left = c.matureAt - now();
           if (left <= 0 && !c.mutRolled) {
             rollMutation(c, pi);
             save();
           }
           const stateStr = `${c.id}|${c.left}|${c.mut}|${c.fertUsed ? Object.keys(c.fertUsed).join(',') : ''}|${left <= 0 ? 'ripe' : 'grow'}`;
           
           // @ts-ignore
           if (pEl.dataset.state !== stateStr) {
             const expected = plotHTML(pi); if (pEl.innerHTML !== expected) pEl.innerHTML = expected;
             // @ts-ignore
             pEl.dataset.state = stateStr;
           } else {
             // Đang lớn và không có thay đổi về phân bón/đột biến -> Chỉ kéo dài thanh progress (O(1) reflow)
             if (left > 0) {
               const prog = Math.min(0.99, 1 - left / growMs(c.id));
               const w = ((prog * 100) | 0) + '%';
               const barI = pEl.querySelector('.bar i');
               // @ts-ignore
               if (barI && barI.style.width !== w) barI.style.width = w;
             }
           }
        }
      }
      
      const isLocked = pi >= nb * 4;
      const bg = isLocked ? tileURI(groundKind, pi * 31 + 5)
        : pEl.classList.contains('watered') ? tileURI(wetKind, pi * 31 + 5) : tileURI(plotKind, pi * 31 + 5);
      // @ts-ignore
      if (pEl.dataset.bg !== bg) { pEl.style.backgroundImage = bg; pEl.dataset.bg = bg; }
      const bgSz = isLocked ? '144px 144px' : '100% 100%';
      // @ts-ignore
      if (pEl.style.backgroundSize !== bgSz) pEl.style.backgroundSize = bgSz;
    }
  }
}
export function renderChips() {
  const cl = All.$id('chipLink'), cs2 = All.$id('chipStory');
  cl.classList.toggle('on', CS.link);
  cl.textContent = 'Liên kết thẻ nhân vật: ' + (CS.link ? 'Bật' : 'Tắt');
  cs2.style.display = CS.link ? '' : 'none';
  cs2.classList.toggle('on', CS.story);
  cs2.textContent = 'Ảnh hưởng cốt truyện: ' + (CS.story ? 'Bật' : 'Tắt');
  All.$id('chipRegen').style.display = CS.link ? '' : 'none';   // Nút gieo lại chỉ hiện khi đã bật liên kết
}
export function renderBanner() {
  const b = All.$id('banner');
  const bmut = All.$id('bmut');
  const mutPopup = All.$id('mutPopup');
  if (!CS.link) { b.classList.remove('show'); bmut.style.display = 'none'; mutPopup.classList.remove('open'); return; }
  if (eventPending) {
    b.classList.add('show');
    All.$id('btag').textContent = 'Sự kiện hôm nay';
    All.$id('btxt').textContent = 'Phù thuỷ tròn đang ngắm sao bói toán…';
    bmut.style.display = 'none'; mutPopup.classList.remove('open');
    return;
  }
  const ev = todayEvent();
  if (!ev) { b.classList.remove('show'); bmut.style.display = 'none'; mutPopup.classList.remove('open'); return; }
  b.classList.add('show');
  All.$id('btag').textContent = 'Sự kiện hôm nay · ' + ev.name;
  const fx = [];
  if (ev.double_yield) fx.push('✨Thu hoạch hôm nay ×2!');
  if (ev.time_mult !== 1) fx.push(ev.time_mult < 1 ? 'Sinh trưởng nhanh hơn (thời lượng ×' + ev.time_mult + ')' : 'Sinh trưởng chậm lại (thời lượng ×' + ev.time_mult + ')');
  if (ev.mutate_on_fert > 0) fx.push('Cây hôm nay có thể đột biến');
  if (ev.favored_crop) fx.unshift('Chỉ ' + ev.favored_crop + ' chịu ảnh hưởng');
  const fb = ctx.S.dayEvent && ctx.S.dayEvent.source === 'fallback';
  All.$id('btxt').textContent = (ev.flavor || '') + (fx.length ? '(' + fx.join(' · ') + ')' : '') +
    (fb ? '〔Sự kiện ngoại tuyến' + (ctx.S.dayEvent.reason ? ': ' + ctx.S.dayEvent.reason : '') + '〕' : '');
  /* Nút xem đột biến: chỉ hiện khi sự kiện có mutate_on_fert > 0 và có mutate_desc */
  const hasMut = ev.mutate_on_fert > 0 && ev.mutate_desc && Object.keys(ev.mutate_desc).length > 0;
  bmut.style.display = hasMut ? 'flex' : 'none';
  if (hasMut) {
    const prefix = ev.mutate_prefix || 'đột biến';
    const chance = Math.round(ev.mutate_on_fert * 100);
    let html = '<div class="mut-header">✦ ' + esc(prefix) + ' <span class="mut-chance">(cơ bản ' + chance + '%, bón phân tăng)</span></div>';
    const desc = ev.mutate_desc;
    const entries = Object.entries(desc).filter(([k]) => k !== '*');
    const wildcard = desc['*'] || '';
    if (entries.length > 0) {
      html += '<div class="mut-list">';
      entries.forEach(([crop, effect]) => {
        html += '<div class="mut-row"><span class="mut-crop">' + esc(crop) + '</span><span class="mut-effect">' + esc(effect) + '</span></div>';
      });
      html += '</div>';
    } else if (wildcard) {
      html += '<div class="mut-list"><div class="mut-row"><span class="mut-crop">Tất cả</span><span class="mut-effect">' + esc(wildcard) + '</span></div></div>';
    }
    mutPopup.innerHTML = html;
  } else {
    mutPopup.classList.remove('open');
  }
}
export function renderDynamic() { 
  if (ctx.win.classList.contains('open')) {
    settle();
    renderStatus(); 
    renderPlots(); 
  }
}
export function renderAll() { applyPageSkin(); All.applyViewState(); renderPager(); renderStatus(); renderPlots(); renderToolbar(); renderChips(); renderBanner(); renderPets(); try { renderWitch(); } catch (e) {} }


export function initRender() {
  All.$id('toolbar').addEventListener('click', e => {
  // @ts-ignore
  const el = e.target.closest('[data-tool]'); if (!el) return;
  const k = el.dataset.tool;
  if (k === 'expand') { toolbarOpen = true; renderToolbar(); return; }
  if (k === 'collapse') { toolbarOpen = false; mode = null; renderToolbar(); return; }
  if (mode && mode.t === k) { mode = null; renderToolbar(); return; }
  if (k === 'seed') return pickFrom('Chọn hạt giống để gieo', ctx.S.seeds, id => CROPS[id]?.name || 'Hạt giống lạ', id => { mode = { t: 'seed', id }; renderToolbar(); });
  if (k === 'fert') return pickFrom('Chọn phân bón', ctx.S.ferts, id => FERTS[id]?.name || 'Phân bón lạ', id => { mode = { t: 'fert', id }; renderToolbar(); });
  mode = { t: k };
  renderToolbar();
});
  All.$id('chipLink').addEventListener('click', () => {
  CS.link = !CS.link;
  if (!CS.link) { CS.story = false; setInjection(''); }
  saveCharState(); renderChips(); renderBanner(); updateInjection();
  if (CS.link) { requestDayEvent(); toast('Đã bật liên kết, đang gieo quẻ sự kiện hôm nay theo thế giới quan'); }
  else toast('Đã về lại vườn rau chơi một mình');
});
All.$id('banner').addEventListener('click', (e) => {
  // @ts-ignore
  if (e.target.closest('.bmut') || e.target.closest('.mut-popup')) return;   // Không toggle expand khi bấm nút đột biến hoặc popup
  All.$id('banner').classList.toggle('expand');
  All.$id('mutPopup').classList.remove('open');   // Thu banner thì đóng popup
});
All.$id('bmut').addEventListener('click', (e) => {
  e.stopPropagation();
  All.$id('mutPopup').classList.toggle('open');
});
/* Bấm ngoài popup thì đóng */
sh.addEventListener('click', (e) => {
  const popup = All.$id('mutPopup');
  // @ts-ignore
  if (popup.classList.contains('open') && !e.target.closest('.mut-popup') && !e.target.closest('.bmut')) {
    popup.classList.remove('open');
  }
});
All.$id('chipRegen').addEventListener('click', () => {      // Nút gieo lại dọn nhà: từ trang cài đặt chuyển ra hàng điều khiển (wen chốt, tiện tay với tới)
  ctx.S.dayEvent = null; save();
  requestDayEvent(true); toast('Đang gieo quẻ lại…');
});
All.$id('chipStory').addEventListener('click', () => {
  CS.story = !CS.story;
  saveCharState(); renderChips(); updateInjection();
  toast(CS.story ? 'Tình hình vườn rau sẽ được thì thầm cho những người trong cốt truyện' : 'Vườn rau lại giữ bí mật');
});

All.$id('blocks').addEventListener('click', e => {
  // @ts-ignore
  const sign = e.target.closest('[data-buy]');
  if (sign) {
    const b = +sign.dataset.buy;
    if (ctx.S.coins < blockPrice(b)) { toast('Còn thiếu ' + (blockPrice(b) - ctx.S.coins).toLocaleString() + ' G'); return; }   // Sửa #8
    if (buyConfirm.b === b && now() < buyConfirm.until) { buyConfirm = { b: -1, until: 0 }; buyBlock(b); }
    else { buyConfirm = { b, until: now() + 4000 }; renderPlots(); }
    return;
  }
  // @ts-ignore
  const p = e.target.closest('.plot'); if (!p || p.dataset.deco) return;
  const pi = +p.dataset.pi;
  const c = curPlots()[pi].crop;
  if (c && now() >= c.matureAt && (!mode || mode.t !== 'shovel')) { harvest(pi); return; }   // Sửa #6: rau chín bấm thẳng là thu ngay
  if (!mode) { if (c) toast(CROPS[c.id].name + ' · còn ' + fmtLeft(c.matureAt - now())); return; }
  if (mode.t === 'seed') { if (c) return toast('Ô này trồng rồi'); plant(pi, mode.id); if ((ctx.S.seeds[mode.id] || 0) <= 0) { setMode(null); renderToolbar(); } return; }
  if (mode.t === 'water') return water(pi);
  if (mode.t === 'fert') { fertilize(pi, mode.id); if ((ctx.S.ferts[mode.id] || 0) <= 0) { setMode(null); renderToolbar(); } return; }
  if (mode.t === 'harvest') return harvest(pi);
  if (mode.t === 'shovel') {
    if (!c) return;
    if (mode.confirmPi === pi) { shovel(pi); mode.confirmPi = null; }
    else { mode.confirmPi = pi; toast('Bấm lần nữa để xác nhận xới bỏ ' + CROPS[c.id].name); }
  }
});
}
