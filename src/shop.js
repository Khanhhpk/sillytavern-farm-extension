
import { ctx, extensionName, NS } from './store.js';
import * as All from './all.js';
import { BLOCK_PRICE_PG, WEATHERS, TEST_MODE, DAY_MS, CROPS, GROW, MIN, REGROW, FERTS, WATER_CD, REGROW_MAX, POKE_CD, TREASURE_CD, PETS_OUT_MAX, WITCH_STAY, witchGap, SNAP_EDGE, ZONE_NAME } from './data.js';
import { mulberry32, petSVG, spriteSVG, tileURI, warmUpCache, PETS, PASSES, P, LP, PET_P } from './graphics.js';
import { pendingPick, renderStatus, renderAll, setPendingPick } from './render.js';
import { fmtDur, mutDescOf, bagName, bagPrice } from './logic.js';
import { openBuyDlg, toast, openPassDlg, useStarShard, openSellDlg, openSellSeedDlg, openTakeout } from './witch.js';
import { save, freshState, testMode, setTestMode, loadState } from './state.js';
import { renderPets } from './pets.js';
import { esc, SEC, CS, clampN, saveSec, openSandbox, saveCharState, fetchModelList, testSecApi } from './events.js';
import { applyTheme, sh } from './ui.js';
import { pageUnlocked } from './utils.js';
import { openGachaModal } from './gacha.js';
import { openBetModal } from './bet.js';

/* ---------- Bảng ---------- */
export function openModal(title, bodyHTML, keepBetTable) {
  if (!keepBetTable && All.cashOut) All.cashOut();                     // Mở bảng khác = rời bàn cược, rút tiền về trước đã
  All.$id('mtitle-text').textContent = title;
  All.$id('mbody').innerHTML = bodyHTML;
  All.$id('modal').classList.add('open');
}
export function closeModal() { 
  if (All.cashOut) All.cashOut();                                        // Đóng bảng = tự động rút, không bao giờ mất tiền vì lỡ tay
  All.$id('modal').classList.remove('open'); 
  All.$id('mbody').innerHTML = ''; // Dọn dẹp rác DOM và event listeners bên trong
  setPendingPick(null); 
  bagSellMode = false; 
}   // Tự kiểm: đóng cửa sổ thì thoát chế độ tick chọn

export let shopTab = 'seed';
export let bagTab = 'crop';
export let bagSellMode = false, bagSel = {};              // Bán một chạm: chế độ tick chọn (mặc định chọn hết)
export let gachaSortMode = 'default';
export function openPanel(kind) {
  if (kind === 'gacha') {
    return openGachaModal();
  }
  if (kind === 'dungeon') {
    return All.openDungeonView();
  }
  if (kind === 'bet') {
    return openBetModal();
  }
  if (kind === 'trade') {
    return All.openTradeModal();
  }
  if (kind === 'shop') {
    const tabs = [['seed', 'Hạt giống'], ['fert', 'Phân bón'], ['pet', 'Thú cưng'], ['pass', 'Vé'], ['ticket', 'Vé Gacha']];
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
          <div class="meta">Chín sau ${fmtDur(c.grow)}${c.regrow ? ' (tái sinh ' + fmtDur(c.regrowM || Math.round(c.grow * 0.6)) + ')' : ''} · Giá bán ${c.sell} G · Đang có ${ctx.S.seeds[id] || 0}</div></span>
          ${un ? `<span class="price">${spriteSVG('coin', 16)}${c.seed}</span>
          <span class="buy${ctx.S.coins < c.seed ? ' off' : ''}" data-buyseed="${id}">Mua</span>` : '<span class="buy off">Chưa mở khoá</span>'}</div>`).join('');
      }).join('');
    } else if (shopTab === 'fert') {
      items = Object.entries(FERTS).map(([id, f]) => `
        <div class="item"><span class="icon">${spriteSVG('toolFert', 32)}</span>
          <span class="info"><div class="name">${f.name}</div><div class="meta">${f.desc} · Đang có ${ctx.S.ferts[id] || 0}</div></span>
          <span class="price">${spriteSVG('coin', 16)}${f.price}</span>
          <span class="buy${ctx.S.coins < f.price ? ' off' : ''}" data-buyfert="${id}">Mua</span></div>`).join('');
    } else if (shopTab === 'pet') {
      items = Object.keys(PETS).map(id => {
        const pd = PETS[id];
        const owned = ctx.S.pets.indexOf(id) >= 0;
        const unlocked = pageUnlocked(pd.page);
        const poor = ctx.S.coins < pd.price;
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
    } else if (shopTab === 'ticket') {
      items = `
        <div class="item"><span class="icon">${spriteSVG('ticketNorm', 32)}</span>
          <span class="info"><div class="name">Vé Quay Thường</div><div class="meta">Dùng quay máy Gachapon nhận quà ngẫu nhiên · Đang có ${ctx.S.tickets?.norm || 0}</div></span>
          <span class="price">${spriteSVG('coin', 16)}1,000</span>
          <span class="buy${ctx.S.coins < 1000 ? ' off' : ''}" data-buyticket="norm">Mua</span></div>
        <div class="item"><span class="icon">${spriteSVG('ticketSpec', 32)}</span>
          <span class="info"><div class="name">Vé Quay Đặc Biệt</div><div class="meta">Dùng quay Gachapon Đặc Biệt tăng tỷ lệ ra đồ độc nhất · Đang có ${ctx.S.tickets?.spec || 0}</div></span>
          <span class="price">${spriteSVG('coin', 16)}5,000</span>
          <span class="buy${ctx.S.coins < 5000 ? ' off' : ''}" data-buyticket="spec">Mua</span></div>
        <div class="item"><span class="icon">${spriteSVG('ticketSuper', 32)}</span>
          <span class="info"><div class="name" style="color:#ff4500;">Vé Quay Siêu Cường</div><div class="meta">Dùng quay 1 phát 100% ra bảo vật AI (từ Hiếm đến Huyền Thoại) · Đang có ${ctx.S.tickets?.super || 0}</div></span>
          <span class="price">${spriteSVG('coin', 16)}250,000</span>
          <span class="buy${ctx.S.coins < 250000 ? ' off' : ''}" data-buyticket="super" style="background:#ff4500; border:1px solid #cc3700; color:#fff;">Mua</span></div>`;
    } else {
      items = Object.keys(PASSES).map(k => {
        const ps = PASSES[k];
        const owned = !!ctx.S.passes[k];
        return `
        <div class="item"><span class="icon">${spriteSVG(k === 'water' ? 'lotus' : 'gem', 32)}</span>
          <span class="info"><div class="name">${ps.name}</div><div class="meta">${ps.desc}</div></span>
          ${owned ? '' : `<span class="price">${spriteSVG('coin', 16)}${ps.price.toLocaleString()}</span>`}
          <span class="buy${owned ? ' plain' : ''}" data-passdlg="${k}">${owned ? 'Xem vé' : 'Mua'}</span></div>`;
      }).join('');
    }
    openModal('Cửa hàng', `
      <div style="display:flex;justify-content:flex-end;align-items:center;gap:4px;font-size:12px;font-weight:bold;color:#7a5c38;margin-bottom:6px">${spriteSVG('coin', 16)}${ctx.S.coins.toLocaleString()}</div>
      <div class="tabs">${tabs.map(([k, n]) => `<span class="tab${shopTab === k ? ' active' : ''}" data-tab="${k}">${n}</span>`).join('')}</div>
      <div class="items">${items}</div>`);
    // @ts-ignore
    All.$id('mbody').querySelectorAll('[data-tab]').forEach(t => t.addEventListener('click', () => { shopTab = t.dataset.tab; openPanel('shop'); }));
    // @ts-ignore
    All.$id('mbody').querySelectorAll('[data-buyseed]').forEach(b => b.addEventListener('click', () => openBuyDlg('seed', b.dataset.buyseed)));
    // @ts-ignore
    All.$id('mbody').querySelectorAll('[data-buyfert]').forEach(b => b.addEventListener('click', () => openBuyDlg('fert', b.dataset.buyfert)));
    All.$id('mbody').querySelectorAll('[data-buyticket]').forEach(b => b.addEventListener('click', () => {
      // @ts-ignore
      openBuyDlg('ticket', b.dataset.buyticket, 'shop');
    }));
    All.$id('mbody').querySelectorAll('[data-buypet]').forEach(b => b.addEventListener('click', () => {
      // @ts-ignore
      const id = b.dataset.buypet, pd = PETS[id];
      if (ctx.S.pets.indexOf(id) >= 0) return;
      if (ctx.S.coins < pd.price) return toast('Còn thiếu ' + (pd.price - ctx.S.coins).toLocaleString() + ' G');
      ctx.S.coins -= pd.price; ctx.S.pets.push(id);
      if (ctx.S.petsOut.length < PETS_OUT_MAX) { ctx.S.petsOut.push(id); toast(pd.name + ' đã dọn ra bờ ruộng nhà bạn!'); }
      else toast(pd.name + ' đã về nhà! Bờ ruộng chật rồi, bé đang nghỉ ở trang Balo · Bé tròn');
      save(); renderStatus(); renderPets(); openPanel('shop');
    }));
    // @ts-ignore
    All.$id('mbody').querySelectorAll('[data-passdlg]').forEach(b => b.addEventListener('click', () => openPassDlg(b.dataset.passdlg)));
  } else if (kind === 'bag') {
    const btabs = `<div class="tabs"><span class="tab${bagTab === 'crop' ? ' active' : ''}" data-btab="crop">Nông sản</span><span class="tab${bagTab === 'seed' ? ' active' : ''}" data-btab="seed">Hạt giống</span><span class="tab${bagTab === 'gacha' ? ' active' : ''}" data-btab="gacha">Đồ Gacha</span><span class="tab${bagTab === 'pet' ? ' active' : ''}" data-btab="pet">Bé tròn</span><span class="tab${bagTab === 'relic' ? ' active' : ''}" data-btab="relic">Quà của bé tròn</span></div>`;
    if (bagTab === 'seed') {
      const seedKeys = Object.keys(ctx.S.seeds || {}).filter(k => k !== 'mystery');
      const rows = seedKeys.map(key => {
        const n = ctx.S.seeds[key];
        if (n <= 0) return '';
        const def = CROPS[key];
        if (!def) return ''; // fallback for unknown keys
        const price = Math.floor((def.seed || 100) * 0.5);
        if (bagSellMode) {
          const on = !!bagSel[key];
          return `
        <div class="item selrow${on ? ' selon' : ''}" data-selkey="${key}"><span class="icon">${spriteSVG(def.sp, 32)}</span>
          <span class="info"><div class="name">Hạt ${def.name} ×${n}</div><div class="meta">Giá thu mua: ${price} G/hạt</div></span>
          <span class="selmark">${on ? '✓' : ''}</span></div>`;
        }
        return `
        <div class="item"><span class="icon">${spriteSVG(def.sp, 32)}</span>
          <span class="info"><div class="name">Hạt ${def.name} ×${n}</div><div class="meta">Giá thu mua: ${price} G/hạt</div></span>
          <span class="acts">
            <span class="ibtn" data-sellseeddlg="${key}" title="Bán (tự chọn số lượng)">${spriteSVG('coin', 16)}</span>
          </span></div>`;
      }).join('');
      let sellBar = '';
      if (seedKeys.length) {
        if (bagSellMode) {
          const total = Object.keys(bagSel).filter(k => bagSel[k] && ctx.S.seeds[k]).reduce((s, k) => {
            const def = CROPS[k];
            if (!def) return s;
            const p = Math.floor((def.seed || 100) * 0.5);
            return s + p * ctx.S.seeds[k];
          }, 0);
          sellBar = `<div class="note" style="display:flex;align-items:center;gap:6px;flex-wrap:nowrap;margin-bottom:8px;white-space:nowrap;overflow:hidden">
            <b style="overflow:hidden;text-overflow:ellipsis">${total > 0 ? 'Tổng ' + total.toLocaleString() + ' G' : 'Bấm vào từng mục để tick chọn thứ muốn bán'}</b><span style="flex:1"></span>
            <span class="buy" id="sellSelGo" style="padding:4px 10px;font-size:11px;flex:none">Bán</span>
            <span class="buy plain" id="sellSelNo" style="padding:4px 10px;font-size:11px;flex:none">Huỷ</span></div>`;
        } else {
          sellBar = `<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
            <div class="note" style="flex:1"></div>
            <span class="buy" id="sellModeGo" style="flex:none">Bán một chạm</span></div>`;
        }
      }
      openModal('Balo', btabs + sellBar + (rows || '<div class="note">Bạn chưa có hạt giống nào, ra cửa hàng mua thêm đi!</div>'));
      // @ts-ignore
      All.$id('mbody').querySelectorAll('[data-btab]').forEach(t => t.addEventListener('click', () => { bagTab = t.dataset.btab; openPanel('bag'); }));
      // @ts-ignore
      All.$id('mbody').querySelectorAll('[data-sellseeddlg]').forEach(b => b.addEventListener('click', () => openSellSeedDlg(b.dataset.sellseeddlg)));
      const smGo = All.$id('sellModeGo');
      if (smGo) smGo.addEventListener('click', () => { bagSellMode = true; bagSel = {}; openPanel('bag'); });
      All.$id('mbody').querySelectorAll('[data-selkey]').forEach(el => el.addEventListener('click', () => {
        // @ts-ignore
        bagSel[el.dataset.selkey] = !bagSel[el.dataset.selkey];
        openPanel('bag');
      }));
      const ssNo = All.$id('sellSelNo');
      if (ssNo) ssNo.addEventListener('click', () => { bagSellMode = false; openPanel('bag'); });
      const ssGo = All.$id('sellSelGo');
      if (ssGo) ssGo.addEventListener('click', () => {
        const keys = Object.keys(bagSel).filter(k => bagSel[k] && ctx.S.seeds[k]);
        if (!keys.length) return toast('Chưa tick cái nào cả');
        let gain = 0;
        keys.forEach(k => { 
          const def = CROPS[k];
          if (def) {
            const p = Math.floor((def.seed || 100) * 0.5);
            gain += p * ctx.S.seeds[k]; 
          }
          delete ctx.S.seeds[k]; 
        });
        ctx.S.coins += gain; ctx.S.totalSales += gain;
        bagSellMode = false; save(); renderStatus();
        toast('Bán một mẻ hạt giống: +' + gain.toLocaleString() + ' G');
        openPanel('bag');
      });
      return;
    }
    if (bagTab === 'gacha') {
      const gachaKeys = Object.keys(ctx.S.bag || {}).filter(k => k.startsWith('unique@'));
      const rarityVal = { 'Rác': 0, 'Thường': 1, 'Hiếm': 2, 'Sử thi': 3, 'Huyền thoại': 4 };
      if (gachaSortMode === 'desc') {
        gachaKeys.sort((a, b) => {
          const rA = ctx.S.uniques?.[a]?.rarity || 'Thường';
          const rB = ctx.S.uniques?.[b]?.rarity || 'Thường';
          return (rarityVal[rB] || 0) - (rarityVal[rA] || 0);
        });
      } else if (gachaSortMode === 'asc') {
        gachaKeys.sort((a, b) => {
          const rA = ctx.S.uniques?.[a]?.rarity || 'Thường';
          const rB = ctx.S.uniques?.[b]?.rarity || 'Thường';
          return (rarityVal[rA] || 0) - (rarityVal[rB] || 0);
        });
      }
      const rows = gachaKeys.map(key => {
        const n = ctx.S.bag[key];
        const item = ctx.S.uniques?.[key] || { name: 'Vật phẩm Gacha', rarity: 'Đặc biệt', desc: '', color: '#4a90e2', sell: 2500, sp: 'strawhat' };
        const d0 = mutDescOf(key);
        const mdesc = d0 ? ' · ' + d0 : '';
        if (bagSellMode) {
          const on = !!bagSel[key];
          return `
        <div class="item selrow${on ? ' selon' : ''}" data-selkey="${key}"><span class="icon">${spriteSVG(item.sp, 32)}</span>
          <span class="info"><div class="name" style="color:${item.color}">${item.name} ×${n} <span style="display:inline-block; font-size:10px; padding:1px 4px; border-radius:3px; background:${item.color}; color:#fff; white-space:nowrap;">${item.rarity}</span></div><div class="meta">${bagPrice(key)} G/cái${esc(mdesc)}</div></span>
          <span class="selmark">${on ? '✓' : ''}</span></div>`;
        }
        return `
        <div class="item"><span class="icon">${spriteSVG(item.sp, 32)}</span>
          <span class="info"><div class="name" style="color:${item.color}">${item.name} ×${n} <span style="display:inline-block; font-size:10px; padding:1px 4px; border-radius:3px; background:${item.color}; color:#fff; white-space:nowrap;">${item.rarity}</span></div><div class="meta">${bagPrice(key)} G/cái · ${esc(item.desc || 'Vật phẩm độc nhất')}</div></span>
          <span class="acts">
            <span class="ibtn" data-takeout="${key}" title="Lấy ra (mang vào cốt truyện, không quy ra tiền)">${spriteSVG('emBang', 16)}</span>
            <span class="ibtn" data-selldlg="${key}" title="Bán (tự chọn số lượng)">${spriteSVG('coin', 16)}</span>
          </span></div>`;
      }).join('');
      let sellBar = '';
      if (gachaKeys.length) {
        const sortLabel = gachaSortMode === 'default' ? 'Lọc: Mới nhất' : (gachaSortMode === 'desc' ? 'Lọc: Hiếm giảm dần' : 'Lọc: Hiếm tăng dần');
        if (bagSellMode) {
          const total = Object.keys(bagSel).filter(k => bagSel[k] && ctx.S.bag[k]).reduce((s, k) => s + bagPrice(k) * ctx.S.bag[k], 0);
          sellBar = `<div class="note" style="display:flex;align-items:center;gap:6px;flex-wrap:nowrap;margin-bottom:8px;white-space:nowrap;overflow:hidden">
            <b style="overflow:hidden;text-overflow:ellipsis">${total > 0 ? 'Tổng ' + total.toLocaleString() + ' G' : 'Bấm vào từng mục để tick chọn thứ muốn bán'}</b><span style="flex:1"></span>
            <span class="buy plain" id="sortGachaBtn" style="padding:4px 8px;font-size:11px;flex:none">${sortLabel}</span>
            <span class="buy" id="sellSelGo" style="padding:4px 10px;font-size:11px;flex:none">Bán</span>
            <span class="buy plain" id="sellSelNo" style="padding:4px 10px;font-size:11px;flex:none">Huỷ</span></div>`;
        } else {
          sellBar = `<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
            <div class="note" style="flex:1">Bấm «!» để lấy đồ Gacha ra mang vào cốt truyện</div>
            <span class="buy plain" id="sortGachaBtn" style="padding:4px 8px;font-size:11px;flex:none">${sortLabel}</span>
            <span class="buy" id="sellModeGo" style="flex:none">Bán một chạm</span></div>`;
        }
      }
      openModal('Balo', btabs + sellBar + (rows || '<div class="note">Chưa có vật phẩm Gacha nào, sang máy Gachapon quay thử đi!</div>'));
      // @ts-ignore
      All.$id('mbody').querySelectorAll('[data-btab]').forEach(t => t.addEventListener('click', () => { bagTab = t.dataset.btab; openPanel('bag'); }));
      // @ts-ignore
      All.$id('mbody').querySelectorAll('[data-selldlg]').forEach(b => b.addEventListener('click', () => openSellDlg(b.dataset.selldlg)));
      // @ts-ignore
      All.$id('mbody').querySelectorAll('[data-takeout]').forEach(b => b.addEventListener('click', () => openTakeout(b.dataset.takeout)));
      const smGo = All.$id('sellModeGo');
      if (smGo) smGo.addEventListener('click', () => { bagSellMode = true; bagSel = {}; openPanel('bag'); });
      const sortBtn = All.$id('sortGachaBtn');
      if (sortBtn) sortBtn.addEventListener('click', () => {
        gachaSortMode = gachaSortMode === 'default' ? 'desc' : (gachaSortMode === 'desc' ? 'asc' : 'default');
        openPanel('bag');
      });
      All.$id('mbody').querySelectorAll('[data-selkey]').forEach(el => el.addEventListener('click', () => {
        // @ts-ignore
        bagSel[el.dataset.selkey] = !bagSel[el.dataset.selkey];
        openPanel('bag');
      }));
      const ssNo = All.$id('sellSelNo');
      if (ssNo) ssNo.addEventListener('click', () => { bagSellMode = false; openPanel('bag'); });
      const ssGo = All.$id('sellSelGo');
      if (ssGo) ssGo.addEventListener('click', () => {
        const keys = Object.keys(bagSel).filter(k => bagSel[k] && ctx.S.bag[k]);
        if (!keys.length) return toast('Chưa tick cái nào cả');
        let gain = 0;
        keys.forEach(k => { gain += bagPrice(k) * ctx.S.bag[k]; delete ctx.S.bag[k]; });
        ctx.S.coins += gain; ctx.S.totalSales += gain;
        bagSellMode = false; save(); renderStatus();
        toast('Bán một mẻ đồ Gacha: +' + gain.toLocaleString() + ' G');
        openPanel('bag');
      });
      return;
    }
    if (bagTab === 'relic') {                            // v1.0: quà của bé tròn —— quầy riêng cho mảnh vỡ và hạt giống bí ẩn
      const sh2 = ctx.S.shards || { prism: 0, star: 0, legend: 0 };
      const normTk = ctx.S.tickets?.norm || 0;
      const specTk = ctx.S.tickets?.spec || 0;
      const ticketRows = (normTk > 0 ? `
      <div class="item"><span class="icon">${spriteSVG('ticketNorm', 30)}</span>
        <span class="info"><div class="name">Vé Quay Thường ×${normTk}</div><div class="meta">Dùng ở máy Gachapon</div></span></div>` : '') +
        (specTk > 0 ? `
      <div class="item"><span class="icon">${spriteSVG('ticketSpec', 30)}</span>
        <span class="info"><div class="name">Vé Quay Đặc Biệt ×${specTk}</div><div class="meta">Dùng ở máy Gachapon</div></span></div>` : '');
      const relicRows = ticketRows + (ctx.S.seeds.mystery > 0 ? `
      <div class="item"><span class="icon">${spriteSVG('seedLight', 30)}</span>
        <span class="info"><div class="name">Hạt giống bí ẩn ×${ctx.S.seeds.mystery}</div><div class="meta">Trồng xuống sẽ ra ngẫu nhiên một họ (chọn khi gieo hạt / khi chọc bé mầm sương)</div></span></div>` : '') +
        (sh2.prism > 0 ? `
      <div class="item"><span class="icon">${spriteSVG('shardPrism', 30)}</span>
        <span class="info"><div class="name">Mảnh lăng quang ×${sh2.prism}</div><div class="meta">Dùng để "đổi đơn khác" ở trang đơn hàng của phù thuỷ</div></span></div>` : '') +
        (sh2.star > 0 ? `
      <div class="item"><span class="icon">${spriteSVG('shardStar', 30)}</span>
        <span class="info"><div class="name">Mảnh ngôi sao ×${sh2.star}</div><div class="meta">Đập vỡ sẽ triệu hồi phù thuỷ tròn ghé thăm</div></span>
        <span class="buy" data-useshard="star">Triệu hồi</span></div>` : '');
      openModal('Balo', btabs + (relicRows || '<div class="note">Ngăn quà còn trống~ Hạt giống bí ẩn đến từ chuyến tìm kho báu của bé quỷ/bé thiên thần và từ đơn hàng của phù thuỷ; bé lăng quang / bé chuông sao đi tìm kho báu sẽ mang mảnh vỡ về</div>'));
      // @ts-ignore
      All.$id('mbody').querySelectorAll('[data-btab]').forEach(t => t.addEventListener('click', () => { bagTab = t.dataset.btab; openPanel('bag'); }));
      All.$id('mbody').querySelectorAll('[data-useshard]').forEach(b => b.addEventListener('click', useStarShard));
      All.$id('mbody').querySelectorAll('[data-takeout]').forEach(b => b.addEventListener('click', () => openTakeout(b.dataset.takeout)));
      return;
    }
    if (bagTab === 'pet') {
      const prow = ctx.S.pets.map(id => {
        const pd = PETS[id]; if (!pd) return '';
        const out = ctx.S.petsOut.indexOf(id) >= 0;
        const cfg = '', cfgBtn = '';                    // #42: bỏ ghi nhớ cấu hình, gieo hạt / bón phân mỗi lần chọc là chọn lại
        return `
        <div class="item"><span class="icon">${petSVG(id, 34)}</span>
          <span class="info"><div class="name">${pd.name}${out ? ' <span style="font-size:10px;color:#4d7a26">đang ra sân</span>' : ''}</div>
          <div class="meta">${pd.desc}${cfg}</div></span>
          ${cfgBtn}
          <span class="buy${out ? ' plain' : ''}" data-petout="${id}">${out ? 'Thu về' : 'Ra sân'}</span></div>`;
      }).join('') || '<div class="note">Chưa có bé tròn nào, ra cửa hàng ngắm thử đi</div>';
      openModal('Balo', btabs + `<div class="note" style="margin-bottom:8px">Bờ ruộng cùng lúc đứng được tối đa ${PETS_OUT_MAX} bé; bé được thu về sẽ nghỉ ở đây, không làm việc cũng không tìm kho báu</div>` + prow);
      // @ts-ignore
      All.$id('mbody').querySelectorAll('[data-btab]').forEach(t => t.addEventListener('click', () => { bagTab = t.dataset.btab; openPanel('bag'); }));
      All.$id('mbody').querySelectorAll('[data-petout]').forEach(b => b.addEventListener('click', () => {
        // @ts-ignore
        const id = b.dataset.petout;
        const i = ctx.S.petsOut.indexOf(id);
        if (i >= 0) ctx.S.petsOut.splice(i, 1);
        else {
          if (ctx.S.petsOut.length >= PETS_OUT_MAX) return toast('Bờ ruộng chỉ đứng được ' + PETS_OUT_MAX + ' bé, thu một bé về đã');
          ctx.S.petsOut.push(id);
        }
        save(); renderPets(); openPanel('bag');
      }));
      return;
    }
    const rows = Object.keys(ctx.S.bag).filter(k => !k.startsWith('unique@')).map(key => {
      const n = ctx.S.bag[key];
      const id = key.split('@')[0], mut = key.indexOf('@') > 0;
      const def = CROPS[id] || { sp: 'seedLight', name: 'Nông sản lạ' };
      const d0 = mutDescOf(key);
      const mdesc = d0 ? ' · ' + d0 : '';
      if (bagSellMode) {
        const on = !!bagSel[key];
        return `
      <div class="item selrow${on ? ' selon' : ''}" data-selkey="${key}"><span class="icon">${spriteSVG(def.sp, 32)}</span>
        <span class="info"><div class="name">${bagName(key)} ×${n}${mut ? ' <span style="font-size:11px;color:#8a5cc0">✦</span>' : ''}</div><div class="meta">${bagPrice(key)} G/cái${esc(mdesc)}</div></span>
        <span class="selmark">${on ? '✓' : ''}</span></div>`;
      }
      return `
      <div class="item"><span class="icon">${spriteSVG(def.sp, 32)}</span>
        <span class="info"><div class="name">${bagName(key)} ×${n}${mut ? ' <span style="font-size:11px;color:#8a5cc0">✦</span>' : ''}</div><div class="meta">${bagPrice(key)} G/cái${esc(mdesc)}</div></span>
        <span class="acts">
          <span class="ibtn" data-takeout="${key}" title="Lấy ra (mang vào cốt truyện, không quy ra tiền)">${spriteSVG('emBang', 16)}</span>
          <span class="ibtn" data-selldlg="${key}" title="Bán (tự chọn số lượng)">${spriteSVG('coin', 16)}</span>
        </span></div>`;
    }).join('');
    let sellBar = '';
    if (Object.keys(ctx.S.bag).length) {                     // Thanh bán một chạm ở trên cùng (tổng tiền tính theo bagPrice, cùng nguồn với đơn giá trong mô tả)
      if (bagSellMode) {
        const total = Object.keys(bagSel).filter(k => bagSel[k] && ctx.S.bag[k]).reduce((s, k) => s + bagPrice(k) * ctx.S.bag[k], 0);
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
    // @ts-ignore
    All.$id('mbody').querySelectorAll('[data-btab]').forEach(t => t.addEventListener('click', () => { bagTab = t.dataset.btab; openPanel('bag'); }));
    // @ts-ignore
    All.$id('mbody').querySelectorAll('[data-selldlg]').forEach(b => b.addEventListener('click', () => openSellDlg(b.dataset.selldlg)));
    // @ts-ignore
    All.$id('mbody').querySelectorAll('[data-takeout]').forEach(b => b.addEventListener('click', () => openTakeout(b.dataset.takeout)));
    const smGo = All.$id('sellModeGo');
    if (smGo) smGo.addEventListener('click', () => {
      bagSellMode = true; bagSel = {};                   // Mặc định không chọn gì (wen chốt: tránh lỡ tay bán mất hàng đột biến sưu tầm)
      openPanel('bag');
    });
    All.$id('mbody').querySelectorAll('[data-selkey]').forEach(el => el.addEventListener('click', () => {
      // @ts-ignore
      bagSel[el.dataset.selkey] = !bagSel[el.dataset.selkey];
      openPanel('bag');
    }));
    const ssNo = All.$id('sellSelNo');
    if (ssNo) ssNo.addEventListener('click', () => { bagSellMode = false; openPanel('bag'); });
    const ssGo = All.$id('sellSelGo');
    if (ssGo) ssGo.addEventListener('click', () => {
      const keys = Object.keys(bagSel).filter(k => bagSel[k] && ctx.S.bag[k]);
      if (!keys.length) return toast('Chưa tick cái nào cả');
      let gain = 0;
      keys.forEach(k => { gain += bagPrice(k) * ctx.S.bag[k]; delete ctx.S.bag[k]; });
      ctx.S.coins += gain; ctx.S.totalSales += gain;
      bagSellMode = false;
      save(); renderStatus();
      toast('Bán một mẻ nông sản: +' + gain.toLocaleString() + ' G');
      openPanel('bag');
    });
  } else {
    openModal('Cài đặt', `
      <div style="font-size:11px; color:#a3763d; text-align:center; margin-bottom: 12px; font-weight: bold; background: rgba(0,0,0,0.05); padding: 4px; border-radius: 4px; user-select: text;">ID Người Chơi: ${ctx.S.playerId}</div>
      <div class="shead" style="margin-top:0">Tên người chơi (để giao dịch)</div>
      <div style="display:flex;gap:8px;margin-bottom:12px;">
        <input class="inp" id="cfgUsername" placeholder="Nhập tên của bạn..." value="${esc(ctx.S.username || '')}" style="flex:1;">
        <span class="buy" id="cfgSaveUsername">Lưu tên</span>
      </div>
      <div class="shead" style="margin-top:0">Chủ đề giao diện</div>
      <div class="picker" style="margin-bottom:4px">
        <span class="pick${ctx.S.theme !== 'sky' ? ' active' : ''}" data-settheme="sakura">🌸 Hồng anh đào</span>
        <span class="pick${ctx.S.theme === 'sky' ? ' active' : ''}" data-settheme="sky">☁️ Trời quang</span>
      </div>
      <div class="shead">Đồng bộ hóa (Sync Save) qua mã (P2P)</div>
      <div style="display:flex;gap:8px;margin-top:6px;flex-wrap:wrap;">
        <span class="buy" onclick="FarmAll.openSyncHostModal()">Cấp Mã (Gửi Save)</span>
        <span class="buy plain" onclick="FarmAll.openSyncJoinModal()">Nhập Mã (Nhận Save)</span>
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
        <label style="display:flex;align-items:center;gap:6px;font-size:12px;color:#7a5c38;font-weight:bold;cursor:pointer;margin-top:10px">
          Giới hạn tin nhắn Chat gửi lên Context:
          <input class="inp" id="secChatDepth" type="number" min="0" max="200" value="${SEC.chatDepth !== undefined ? SEC.chatDepth : 15}" style="width:80px;padding:3px 6px"> (0 = Tắt)
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
      <div class="shead">Tương tác thú cưng</div>
      <label style="display:flex;align-items:center;gap:6px;font-size:12px;color:#7a5c38;font-weight:bold;cursor:pointer;margin-top:6px">
        <input type="checkbox" id="cfgDragPet" ${ctx.S.dragPet ? 'checked' : ''}> Bật tính năng nhéo và kéo thú cưng
      </label>
      <label style="display:flex;align-items:center;gap:6px;font-size:12px;color:#7a5c38;font-weight:bold;cursor:pointer;margin-top:6px">
        Tần suất tiểu phẩm ngẫu nhiên (giây):
        <input class="inp" id="cfgSkitFreq" type="number" min="5" max="7200" value="${ctx.S.skitFreq !== undefined ? ctx.S.skitFreq : 300}" style="width:60px;padding:3px 6px"> (Mặc định 300s = 5 phút)
      </label>
      <div class="shead">Công cụ dành cho Giám đốc Đồ hoạ / Dev</div>
      <div style="display:flex;gap:8px;margin-top:6px;align-items:center;flex-wrap:wrap;">
        <span class="buy plain" id="openSandboxBtn">🎨 Mở Xưởng Chế Tác AI</span>
        <input class="inp" type="password" id="testCode" placeholder="Mã ẩn..." style="width:100px;padding:3px 6px">
        <span class="buy" id="testBtn">Test Mode</span>
      </div>
      <div class="shead">Thông tin & Tác giả</div>
      <div style="display:flex;gap:8px;margin-top:6px">
        <span class="buy plain" id="openCreditBtn">📜 Xem Credit (Lời cảm ơn)</span>
      </div>
      <div class="note" style="margin:12px 0 8px">
        <b>Hướng dẫn chơi</b><br>· Liên kết thẻ nhân vật: bật lên sẽ tạo sự kiện dựa theo thẻ nhân vật hiện tại<br>
        · Ảnh hưởng cốt truyện: bật lên có thể tác động ngược vào cốt truyện hiện tại<br>
        · Sau khi bật liên kết, cây trồng có tỉ lệ <b>đột biến</b> theo thế giới quan (chỉ sự kiện có nội dung "đột biến" mới sinh ra cây đột biến); cây đột biến có thể "Lấy ra" trong balo để mang vào cốt truyện làm đạo cụ<br>
        · Hạt giống bí ẩn: trồng ra cây ngẫu nhiên. Nguồn: đơn hàng của phù thuỷ tròn (cần vé vùng nước mới mở); bé quỷ nhỏ / bé thiên thần đi tìm kho báu<br>
        · Save nằm trong chính SillyTavern, cập nhật phiên bản cứ nhập script mới, save không mất; API Key phụ chỉ nằm trong trình duyệt máy này<br>
        · Các bản SillyTavern khác nhau <b>không dùng chung</b> (cài thêm một bản trên điện thoại = một vườn rau khác); trước khi cài lại SillyTavern nhớ sao lưu thư mục data</div>
      <span class="buy" id="resetSave">Đặt lại save (cẩn thận, bấm hai lần)</span>`);
    All.$id('secSave').addEventListener('click', () => {
      Object.assign(SEC, {
        // @ts-ignore
        url: All.$id('secUrl').value.trim(), key: All.$id('secKey').value.trim(), model: All.$id('secModel').value.trim(),
        // @ts-ignore
        autoReset: All.$id('secAuto').checked, resetHours: clampN(All.$id('secHours').value, 1, 24, 4),
        // @ts-ignore
        wbLimit: parseInt(All.$id('secWbLimit').value, 10) || 0,
        chatDepth: parseInt(All.$id('secChatDepth').value, 10) || 0,
      });
      saveSec(); toast('Đã lưu cấu hình API phụ');
    });
    All.$id('secTest').addEventListener('click', () => testSecApi());
    All.$id('secModels').addEventListener('click', () => fetchModelList());
    All.$id('cfgSaveUsername')?.addEventListener('click', () => {
      const uname = All.$id('cfgUsername').value.trim();
      if (!uname) return toast('Tên không được để trống!');
      ctx.S.username = uname;
      save();
      toast('Đã lưu tên người chơi');
    });
    if (All.$id('openSandboxBtn')) All.$id('openSandboxBtn').addEventListener('click', openSandbox);

    const testBtn = All.$id('testBtn');
    if (testBtn) testBtn.addEventListener('click', () => {
      // @ts-ignore
      const code = All.$id('testCode')?.value;
      if (code === '0209') {
        if (!testMode) {
          setTestMode(true);
          Object.keys(PETS).forEach(id => {
            if (!ctx.S.hero) ctx.S.hero = {};
            if (!ctx.S.hero.roster) ctx.S.hero.roster = {};
            const h = ctx.S.hero.roster[id] || { level: 30, exp: 0, enhHp: 0, enhAtk: 0, enhSpd: 0 };
            h.level = 30;
            h.a1_unlocked = true;
            h.a2_unlocked = true;
            h.p1_unlocked = true;
            h.p2_unlocked = true;
            ctx.S.hero.roster[id] = h;
          });
          if (ctx.S.hero) ctx.S.hero.gold = 999999;
          toast('✅ TEST MODE BẬT! (Sẽ không lưu vào save chính). Để thoát, vui lòng F5 lại trang.');
          closeModal();
          renderAll();
        } else {
          toast('⚠️ TEST MODE ĐANG BẬT RỒI! (F5 để tắt)');
        }
      } else {
        toast('❌ Sai mã!');
      }
    });
    if (All.$id('openCreditBtn')) {
      All.$id('openCreditBtn').addEventListener('click', () => {
        openModal('Credit & Lời cảm ơn', `
          <div style="line-height:1.6; color:#4a3219; font-size:13px; text-align:left; padding:8px;">
            <b style="color:#a83a52;">Tên sản phẩm gốc (原真名):</b><br>
            【谁要在酒馆当农民啊！v1.1】<br><br>
            
            <b style="color:#a83a52;">Tên tiếng Việt (越南语译名):</b><br>
            【Ai thèm làm nông dân trong tửu quán chứ! v1.1】 Script Trợ thủ Tửu quán<br><br>

            <b style="color:#a83a52;">Tác giả gốc (原作者):</b><br>
            满身猫毛՞••՞ - Tranh thủ lén meo<br><br>

            <b style="color:#a83a52;">Mod và update game hiện tại credit từ:</b><br>
            Dev: Kaiz
          </div>
          <div style="margin-top:16px;text-align:center;">
            <span class="buy plain" id="closeCreditBtn">Quay lại Cài đặt</span>
          </div>
        `);
        All.$id('closeCreditBtn')?.addEventListener('click', () => openPanel('cfg'));
      });
    }
    All.$id('mbody').querySelectorAll('[data-settheme]').forEach(b => b.addEventListener('click', () => {
      // @ts-ignore
      ctx.S.theme = b.dataset.settheme; save(); applyTheme(); openPanel('cfg');
      toast(ctx.S.theme === 'sky' ? 'Đổi sang giao diện trời quang~' : 'Về lại giao diện hồng anh đào~');
    }));
    
    const cfgDragPet = All.$id('cfgDragPet');
    if (cfgDragPet) cfgDragPet.addEventListener('change', () => {
      ctx.S.dragPet = cfgDragPet.checked;
      save();
      const mas = All.$id('mascots');
      if (mas) mas.dataset.drag = ctx.S.dragPet ? '1' : '0';
      toast(ctx.S.dragPet ? 'Đã bật tính năng kéo thả thú cưng' : 'Đã tắt tính năng kéo thả thú cưng');
    });

    const cfgSkitFreq = All.$id('cfgSkitFreq');
    if (cfgSkitFreq) cfgSkitFreq.addEventListener('change', () => {
      let v = parseInt(cfgSkitFreq.value);
      if (isNaN(v) || v < 5) v = 5;
      ctx.S.skitFreq = v;
      save();
      toast('Đã cập nhật tần suất: ' + v + ' giây');
      // Update the current timer slightly so it takes effect quickly
      const nowMs = Date.now();
      import('./pets.js').then(m => {
        if (m.nextSceneAt > nowMs + v * 1000) m.updateNextScene(nowMs + v * 1000);
      });
    });

    All.$id('csPromptSave').addEventListener('click', () => {
      // @ts-ignore
      CS.userPrompt = All.$id('csPrompt').value.slice(0, 3000);
      saveCharState(); toast('Đã lưu vào thẻ nhân vật hiện tại');
    });
    let armed = false;
    All.$id('resetSave').addEventListener('click', () => {
      if (!armed) { armed = true; All.$id('resetSave').textContent = 'Bấm lần nữa để xác nhận đặt lại!'; return; }
      if (ctx.extension_settings[extensionName]) ctx.extension_settings[extensionName][NS] = null;
      loadState(); save(true); closeModal(); renderAll(); toast('Đã đặt lại');
    });
  }
}



export function initShop() {
All.$id('mclose').addEventListener('click', closeModal);
All.$id('mbody').addEventListener('click', e => {
  // @ts-ignore
  const el = e.target.closest('[data-pick]');
  if (!el || !pendingPick) return;
  const cb = pendingPick; setPendingPick(null);
  closeModal(); cb(el.dataset.pick);
});
All.$id('modal').addEventListener('click', e => { if (e.target === All.$id('modal')) closeModal(); });
// @ts-ignore
sh.querySelectorAll('[data-open]').forEach(b => b.addEventListener('click', () => openPanel(b.dataset.open)));
}
