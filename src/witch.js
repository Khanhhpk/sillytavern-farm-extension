import { now } from './state.js';
import { ctx } from './store.js';
import * as All from './all.js';
import { BLOCK_PRICE_PG, WEATHERS, TEST_MODE, DAY_MS, CROPS, GROW, MIN, REGROW, FERTS, WATER_CD, REGROW_MAX, POKE_CD, TREASURE_CD, PETS_OUT_MAX, WITCH_STAY, witchGap, SNAP_EDGE, ZONE_NAME } from './data.js';
import { mulberry32, petSVG, spriteSVG, tileURI, warmUpCache, PETS, PASSES, P, LP, PET_P } from './graphics.js';
import { save } from './state.js';
import { CS, clampN } from './events.js';
import { renderStatus } from './render.js';
import { openModal, closeModal, openPanel } from './shop.js';
import { fmtLeft } from './utils.js';
import { bagName, mutDescOf, bagPrice, sell, sellSeed } from './logic.js';
import { renderPager } from './ui.js';
import { pageUnlocked } from './utils.js';

/* ---------- v0.8b: phù thuỷ tròn · hệ thống đơn hàng (§2.65 chốt: thù lao = hạt giống bí ẩn, trang đơn hàng quỹ đạo sao A) ---------- */
export const WITCH_CRY = ['Cúc cu, có ai không?', '◆✦∴…?', '(dưới vành mũ vọng ra tiếng lật sách)', '☽⁂◇!', '✶◇∴✦…', 'Tinh tượng hôm nay đẹp đấy.'];
export function witchArrive() {
  const wz = ctx.S.witch;
  wz.leaveAt = now() + WITCH_STAY;
  wz.missed = 0;
  wz.order = makeWitchOrder();
  save(); renderWitch();
  toast('Phù thuỷ tròn tới rồi! Quầy hàng ngôi sao ở góc dưới trái bờ ruộng đã sáng đèn');
}
export function makeWitchOrder() {
  const pool = Object.entries(CROPS).filter(([id, c]) => !c.hidden && pageUnlocked(c.zone || 1));
  const pick = () => pool[Math.floor(Math.random() * pool.length)][0];
  const lines = [{ id: pick(), n: 2 + Math.floor(Math.random() * 3), mut: false, reward: 1, done: false }];
  if (CS.link && Math.random() < 0.5) {                 // Đơn đột biến: chỉ có thể xuất hiện khi đã bật liên kết (§2.65 ô ①, tắt liên kết thì tự hạ cấp)
    lines.push({ id: pick(), n: 1 + Math.floor(Math.random() * 2), mut: true, reward: 2, done: false });
  }
  return { lines, done: false };
}
export function mutKeysOf(cropId) { return Object.keys(ctx.S.bag).filter(k => k.split('@')[0] === cropId && k.indexOf('@') > 0); }
export function mutCountOf(cropId) { return mutKeysOf(cropId).reduce((s, k) => s + ctx.S.bag[k], 0); }
export function witchDeliver(li) {
  const wz = ctx.S.witch; if (!wz || !wz.order) return;
  const line = wz.order.lines[li]; if (!line || line.done) return;
  if (!line.mut) {
    if ((ctx.S.bag[line.id] || 0) < line.n) return toast('Còn thiếu ' + (line.n - (ctx.S.bag[line.id] || 0)) + ' quả ' + CROPS[line.id].name);
    ctx.S.bag[line.id] -= line.n; if (!ctx.S.bag[line.id]) delete ctx.S.bag[line.id];
  } else {
    if (mutCountOf(line.id) < line.n) return toast('Loại ' + CROPS[line.id].name + ' có tiền tố còn thiếu ' + (line.n - mutCountOf(line.id)) + ' quả');
    let need = line.n;
    for (const k of mutKeysOf(line.id)) {
      const take = Math.min(need, ctx.S.bag[k]);
      ctx.S.bag[k] -= take; if (!ctx.S.bag[k]) delete ctx.S.bag[k];
      need -= take; if (!need) break;
    }
  }
  ctx.S.seeds.mystery = (ctx.S.seeds.mystery || 0) + line.reward;
  line.done = true;
  if (wz.order.lines.every(l => l.done)) {              // Giao đủ hết: cô ấy hài lòng ngồi thêm một phút rồi đi
    wz.order.done = true;
    wz.leaveAt = Math.min(wz.leaveAt, now() + 60 * 1000);
  }
  save(); renderStatus();
  toast('Giao hàng xong! Nhận được hạt giống bí ẩn ×' + line.reward);
  openWitchDlg();
}
export function openWitchDlg() {
  const wz = ctx.S.witch;
  if (!wz || !wz.leaveAt || now() > wz.leaveAt || !wz.order) return;
  const rows = wz.order.lines.map((l, i) => {
    const nm = CROPS[l.id].name;
    const have = l.mut ? mutCountOf(l.id) : (ctx.S.bag[l.id] || 0);
    const btn = l.done ? '<span class="wzbtn done">Đã giao</span>'
      : have >= l.n ? `<span class="wzbtn" data-wdeliver="${i}">Giao</span>` : '<span class="wzbtn off">Chưa đủ</span>';
    return `<div class="wzord"><span class="star">✦</span>
      <div class="wzwant">Thu thập <em>${l.mut ? '<span class="mutq">loại có tiền tố</span>' : ''}${nm} ×${l.n}</em>${btn}</div>
      <div class="wzgive">Thù lao: hạt giống bí ẩn ×${l.reward}${l.mut ? ' ✦ (đơn đột biến)' : ''} · bạn đang có ${have}</div></div>`;
  }).join('');
  const reroll = (!wz.order.done && ctx.S.shards && ctx.S.shards.prism > 0)
    ? `<div style="text-align:center;margin-top:6px"><span class="wzbtn" data-wreroll="1" style="float:none">✦ Đổi đơn khác (mảnh lăng quang ×${ctx.S.shards.prism})</span></div>` : '';
  openModal('Đơn hàng của phù thuỷ', `<div class="wzwrap">
    <div class="wzhead">Đơn hàng của phù thuỷ</div>
    <div class="wzsub">✦ ｡ﾟ☽ ∴ ✧ ∴ ☽ﾟ｡ ✦</div>${rows}${reroll}
    <div class="wzleave">☽ ${wz.order.done ? '"✶◇…!" (trông cô ấy hài lòng lắm)' : 'Cô ấy còn nán lại khoảng ' + fmtLeft(wz.leaveAt - now())}</div>
  </div>`);
  // @ts-ignore
  All.$id('mbody').querySelectorAll('[data-wdeliver]').forEach(b => b.addEventListener('click', () => witchDeliver(+b.dataset.wdeliver)));
  All.$id('mbody').querySelectorAll('[data-wreroll]').forEach(b => b.addEventListener('click', () => {   // v1.0: dùng mảnh lăng quang đổi đơn
    if (!(ctx.S.shards && ctx.S.shards.prism > 0)) return;
    ctx.S.shards.prism--;
    ctx.S.witch.order = makeWitchOrder();
    save(); toast('Lăng quang loé lên, đơn hàng đã đổi một loạt');
    openWitchDlg();
  }));
}
export function useStarShard() {                               // v1.0: mảnh ngôi sao = triệu hồi phù thuỷ
  if (!(ctx.S.shards && ctx.S.shards.star > 0)) return;
  if (!ctx.S.passes.water) return toast('Phù thuỷ chỉ chịu ghé những nông trại có vé vùng nước');
  if (ctx.S.witch.leaveAt > now()) return toast('Phù thuỷ tròn đang ở quầy rồi mà');
  ctx.S.shards.star--;
  closeModal();
  witchArrive();                                        // Bên trong đã có save + toast
}
export function renderWitch() {
  const el = All.$id('witch');
  const active = ctx.S.witch && ctx.S.witch.leaveAt > now() && ctx.S.passes.water;
  el.classList.toggle('show', !!active);
  if (active && !el.innerHTML) el.innerHTML = `<span class="wtag">✦ Đơn hàng</span><span class="wbody">${petSVG('witchBlob', 48)}</span>`;
  if (!active) el.innerHTML = '';
}

export let takeoutNote = null;
export function setTakeoutNote(val) { takeoutNote = val; }
export function openTakeout(key) {
  const have = ctx.S.bag[key] || 0;
  if (have <= 0) return;
  openModal('Lấy ra · ' + bagName(key), `
    <div class="note" style="margin-bottom:8px">Lấy ra = mang khỏi balo để dùng trong cốt truyện. <b style="color:var(--accFg)">Không quy ra tiền, lấy ra rồi không bỏ lại balo được!</b></div>
    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
      <input class="inp" id="takeN" type="number" min="1" max="${have}" value="1" style="width:90px">
      <span style="font-size:12px;color:#7a5c38">/ đang có ${have}</span>
      <span class="buy" id="takeGo">Xác nhận lấy ra</span>
    </div>`);
  All.$id('takeGo').addEventListener('click', () => {
    // @ts-ignore
    const n = clampN(All.$id('takeN').value, 1, have, 1) | 0;
    ctx.S.bag[key] = have - n;
    if (ctx.S.bag[key] <= 0) delete ctx.S.bag[key];
    const d = mutDescOf(key);
    takeoutNote = ((takeoutNote || []).filter(t => now() < t.until))
      .concat({ txt: n + ' ' + bagName(key) + (d ? ' (hiệu ứng đã định: ' + d + ')' : ''), until: now() + 10 * MIN });
    save(); renderStatus();
    toast('Đã lấy ra ' + n + ' ' + bagName(key));
    openPanel('bag');
  });
}

/* #21: bán cũng dùng popup chọn số lượng */
export function openSellDlg(key) {
  const have = ctx.S.bag[key] || 0;
  if (have <= 0) return;
  const price = bagPrice(key);
  openModal('Bán · ' + bagName(key), `
    <div class="note" style="margin-bottom:8px">Đơn giá ${price} G · đang có ${have} cái</div>
    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
      <input class="inp" id="sellN" type="number" min="1" max="${have}" value="1" style="width:90px">
      <span style="font-size:12px;color:#7a5c38">/ ${have}</span>
      <span class="buy" id="sellGo">Xác nhận bán</span>
    </div>`);
  All.$id('sellGo').addEventListener('click', () => {
    // @ts-ignore
    sell(key, clampN(All.$id('sellN').value, 1, have, 1) | 0);
  });
}

export function openSellSeedDlg(id) {
  const have = ctx.S.seeds[id] || 0;
  if (have <= 0) return;
  const def = CROPS[id];
  if (!def) return;
  const price = Math.floor((def.seed || 100) * 0.5);
  const name = 'Hạt ' + def.name;
  openModal('Bán · ' + name, `
    <div class="note" style="margin-bottom:8px">Giá thu mua ${price} G · đang có ${have} hạt</div>
    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
      <input class="inp" id="sellSeedN" type="number" min="1" max="${have}" value="1" style="width:90px">
      <span style="font-size:12px;color:#7a5c38">/ ${have}</span>
      <span class="buy" id="sellSeedGo">Xác nhận bán</span>
    </div>`);
  All.$id('sellSeedGo').addEventListener('click', () => {
    // @ts-ignore
    sellSeed(id, clampN(All.$id('sellSeedN').value, 1, have, 1) | 0);
  });
}

/* Vé: popup hiện trọn mặt vé (tấm vé cũng là đồ sưu tầm) */
export function buildTicket(k) {
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
export function openPassDlg(k) {
  const ps = PASSES[k];
  const owned = !!ctx.S.passes[k];
  const poor = ctx.S.coins < ps.price;
  openModal(ps.name, buildTicket(k) + (owned
    ? '<div class="note">Đã sở hữu · cất trong kẹp giấy tờ của bạn. Các bé tròn ở trang tương ứng luôn hoan nghênh bạn ghé mua.</div>'
    : `<div style="display:flex;gap:8px;align-items:center">
        <span class="buy${poor ? ' off' : ''}" id="passGo">Mua ${ps.price.toLocaleString()} G</span>
        <span class="buy plain" id="passNo">Để nghĩ thêm</span>
      </div>`));
  if (!owned) {
    All.$id('passGo').addEventListener('click', () => {
      if (ctx.S.coins < ps.price) return toast('Còn thiếu ' + (ps.price - ctx.S.coins).toLocaleString() + ' G');
      ctx.S.coins -= ps.price; ctx.S.passes[k] = true;
      save(); renderStatus(); renderPager(); openPanel('shop');
      toast(ps.name + ' đã vào tay! ' + (k === 'water' ? 'Ruộng vùng nước đã mở, lật trang qua xem thử đi' : 'Ruộng khu mỏ đã mở, lật trang qua xem thử đi'));
    });
    All.$id('passNo').addEventListener('click', () => openPanel('shop'));
  }
}

/* v0.9 (#47): popup mua hàng loạt —— bấm mua hạt giống/phân bón → nhập số lượng → xác nhận, cảm giác giống hệt lúc bán (thời 72 ô thì đây là nhu cầu thiết yếu) */
export function openBuyDlg(kind, id, returnTo = 'shop') {
  let def, price, name;
  if (kind === 'ticket') {
    price = id === 'super' ? 250000 : (id === 'norm' ? 1000 : 5000);
    name = id === 'super' ? 'Vé Quay Siêu Cường' : (id === 'norm' ? 'Vé Quay Thường' : 'Vé Quay Đặc Biệt');
  } else {
    def = kind === 'seed' ? CROPS[id] : FERTS[id];
    price = kind === 'seed' ? def.seed : def.price;
    name = kind === 'seed' ? 'Hạt ' + def.name : def.name;
  }
  if (ctx.S.coins < price) return toast('Còn thiếu ' + (price - ctx.S.coins).toLocaleString() + ' G');
  const maxN = Math.max(1, Math.floor(ctx.S.coins / Math.max(1, price)));
  openModal('Mua · ' + name, `
    <div class="note" style="margin-bottom:8px">Đơn giá ${price} G · vàng hiện có ${ctx.S.coins.toLocaleString()} · mua được tối đa ${maxN}</div>
    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
      <input class="inp" id="buyN" type="number" min="1" max="${maxN}" value="1" style="width:90px">
      <span id="buyTotal" style="font-size:12px;color:#7a5c38;font-weight:bold">Tổng ${price} G</span>
      <span class="buy" id="buyGo">Xác nhận mua</span>
    </div>`);
  // @ts-ignore
  const upd = () => { const n = clampN(All.$id('buyN').value, 1, maxN, 1) | 0; All.$id('buyTotal').textContent = 'Tổng ' + (n * price).toLocaleString() + ' G'; return n; };
  All.$id('buyN').addEventListener('input', upd);
  All.$id('buyGo').addEventListener('click', () => {
    const n = upd(), cost = n * price;
    if (ctx.S.coins < cost) return toast('Không đủ vàng rồi');
    ctx.S.coins -= cost;
    if (kind === 'seed') ctx.S.seeds[id] = (ctx.S.seeds[id] || 0) + n;
    else if (kind === 'fert') ctx.S.ferts[id] = (ctx.S.ferts[id] || 0) + n;
    else if (kind === 'ticket') {
      if (!ctx.S.tickets) ctx.S.tickets = { norm: 0, spec: 0, super: 0 };
      ctx.S.tickets[id] = (ctx.S.tickets[id] || 0) + n;
    }
    save(); renderStatus();
    toast('Đã mua ' + name + ' ×' + n);
    openPanel(returnTo);
  });
}


export let toastTimer = null;
export function toast(msg) {
  const t = All.$id('toast');
  if (!t) return;
  t.textContent = msg; 
  t.style.display = 'block';
  // Use a small timeout to allow the browser to process display:block before applying opacity transition
  window.setTimeout(() => t.classList.add('show'), 10);
  if (toastTimer) window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => { 
    t.classList.remove('show'); 
    window.setTimeout(() => { t.style.display = 'none'; }, 300);
  }, 1800);
}


export function initWitch() {
  All.$id('witch').addEventListener('click', e => {
  // @ts-ignore
  if (e.target.closest('.wtag')) return openWitchDlg();
  const el = All.$id('witch');                              // Chọc vào chính cô ấy = chào hỏi (tiếng phù thuỷ, người nghe không hiểu là bình thường nhé)
  el.querySelector('.pbubble')?.remove();
  const b = document.createElement('span');
  b.className = 'pbubble wb';
  b.textContent = WITCH_CRY[Math.floor(Math.random() * WITCH_CRY.length)];
  el.appendChild(b);
  window.setTimeout(() => b.remove(), 1900);
});

/* ---------- Mẹo nhỏ ---------- */
/* #18: lấy ra —— bỏ khỏi balo để mang vào cốt truyện, không quy ra tiền, không thể hoàn tác; trong 10 phút sau khi lấy ra, phần tiêm sẽ kèm một câu nhắc */
}
