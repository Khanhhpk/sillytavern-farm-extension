import { now, save } from './state.js';
import { ctx } from './store.js';
import * as All from './all.js';
import { CROPS, FERTS } from './data.js';
import { spriteSVG, petSVG } from './graphics.js';
import { toast } from './witch.js';
import { renderStatus } from './render.js';
import { openModal } from './shop.js';
import { charName, CS } from './events.js';

export const GACHA_NORM_PITY = 100;
export const GACHA_SPEC_PITY = 50;
export const GACHA_NORM_PRICE = 1000;
export const GACHA_SPEC_PRICE = 5000;

export function initGachaState() {
  if (!ctx.S.tickets) ctx.S.tickets = { norm: 0, spec: 0 };
  if (!ctx.S.gachaPity) ctx.S.gachaPity = { norm: 0, spec: 0 };
  if (!ctx.S.uniques) ctx.S.uniques = {};
}

// Hệ thống tạo Vật Phẩm Độc Nhất (Rare -> Legendary) kết hợp thông tin thẻ nhân vật
export function generateUniqueItem(isSpecial) {
  initGachaState();
  const roll = Math.random() * 100;
  let rarity = 'Hiếm';
  let color = '#4a90e2';
  let sellPrice = 2500;

  if (isSpecial) {
    if (roll < 20) { rarity = 'Huyền thoại'; color = '#ff8000'; sellPrice = 20000; }
    else if (roll < 65) { rarity = 'Sử thi'; color = '#a335ee'; sellPrice = 8000; }
  } else {
    if (roll < 5) { rarity = 'Huyền thoại'; color = '#ff8000'; sellPrice = 20000; }
    else if (roll < 30) { rarity = 'Sử thi'; color = '#a335ee'; sellPrice = 8000; }
  }

  const prefixes = [
    'Thánh quang', 'Huyễn mộng', 'Băng giá', 'Thần thoại', 'Vũ trụ', 'Hư không',
    'Cổ đại', 'Linh khí', 'Ma pháp', 'Tinh tú', 'Vĩnh hằng', 'Huyền bí', 'Lăng quang'
  ];
  const items = [
    'Vương miện', 'Nhẫn báu', 'Quyền gậy', 'Bùa hộ mệnh', 'Tinh thể', 'Hộp nhạc',
    'Chén thánh', 'Đồng hồ cát', 'Gương ảo ảnh', 'Viên ngọc', 'Sách phép', 'Ấn hiệu'
  ];

  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const itemType = items[Math.floor(Math.random() * items.length)];

  let cName = charName();
  let name = `${prefix} ${itemType}`;
  if (cName && CS.link && Math.random() < 0.6) {
    name = `${itemType} của ${cName}`;
  }

  const desc = `Vật phẩm độc nhất [${rarity}] mang theo năng lượng huyền bí. Có thể "Lấy ra" trong Balo để dùng trong cốt truyện!`;
  const key = `unique@${now()}_${Math.floor(Math.random() * 10000)}`;

  ctx.S.uniques[key] = {
    key,
    name,
    rarity,
    color,
    desc,
    sell: sellPrice,
    sp: 'strawhat'
  };

  return { key, name, rarity, color, desc, sell: sellPrice };
}

// Thực hiện quay Gacha
export function executeGachaRoll(isSpecial, count) {
  initGachaState();
  const ticketKey = isSpecial ? 'spec' : 'norm';
  const pityKey = isSpecial ? 'spec' : 'norm';
  const maxPity = isSpecial ? GACHA_SPEC_PITY : GACHA_NORM_PITY;

  const haveTickets = ctx.S.tickets[ticketKey] || 0;
  if (haveTickets < count) {
    toast(`Bạn cần ${count} Vé quay ${isSpecial ? 'Đặc biệt' : 'Thường'}!`);
    return null;
  }

  ctx.S.tickets[ticketKey] -= count;
  const results = [];

  const seedIds = Object.keys(CROPS).filter(k => !CROPS[k].hidden && k !== 'mystery');
  const fertIds = Object.keys(FERTS);

  for (let i = 0; i < count; i++) {
    ctx.S.gachaPity[pityKey]++;
    const isPity = ctx.S.gachaPity[pityKey] >= maxPity;

    let rewardType = '';
    if (isPity) {
      rewardType = 'unique';
    } else {
      const roll = Math.random() * 100;
      if (roll < 40) rewardType = 'seed';       // 40% Hạt giống
      else if (roll < 70) rewardType = 'fert';  // 30% Phân bón
      else if (roll < 90) rewardType = 'shard'; // 20% Mảnh vỡ
      else rewardType = 'unique';               // 10% Vật phẩm đặc biệt
    }

    if (rewardType === 'unique') {
      ctx.S.gachaPity[pityKey] = 0; // Reset Pity
      const item = generateUniqueItem(isSpecial);
      ctx.S.bag[item.key] = 1;
      results.push({
        type: 'unique',
        name: item.name,
        rarity: item.rarity,
        color: item.color,
        icon: spriteSVG('strawhat', 32),
        desc: item.desc,
        isPity
      });
    } else if (rewardType === 'seed') {
      const sid = seedIds[Math.floor(Math.random() * seedIds.length)];
      const amount = isSpecial ? 5 : 2;
      ctx.S.seeds[sid] = (ctx.S.seeds[sid] || 0) + amount;
      results.push({
        type: 'seed',
        name: `Hạt ${CROPS[sid].name} ×${amount}`,
        rarity: 'Thường',
        color: '#6cb457',
        icon: spriteSVG(CROPS[sid].sp, 32)
      });
    } else if (rewardType === 'fert') {
      const fid = fertIds[Math.floor(Math.random() * fertIds.length)];
      const amount = isSpecial ? 3 : 1;
      ctx.S.ferts[fid] = (ctx.S.ferts[fid] || 0) + amount;
      results.push({
        type: 'fert',
        name: `${FERTS[fid].name} ×${amount}`,
        rarity: 'Thường',
        color: '#e8963a',
        icon: spriteSVG('toolFert', 32)
      });
    } else {
      // Shard (Mảnh lăng quang hoặc Mảnh ngôi sao)
      const isStar = Math.random() < 0.5;
      if (!ctx.S.shards) ctx.S.shards = { prism: 0, star: 0 };
      if (isStar) {
        ctx.S.shards.star++;
        results.push({
          type: 'shard',
          name: 'Mảnh ngôi sao ×1',
          rarity: 'Hiếm',
          color: '#b094e0',
          icon: spriteSVG('shardStar', 32)
        });
      } else {
        ctx.S.shards.prism++;
        results.push({
          type: 'shard',
          name: 'Mảnh lăng quang ×1',
          rarity: 'Hiếm',
          color: '#4a8098',
          icon: spriteSVG('shardPrism', 32)
        });
      }
    }
  }

  save();
  renderStatus();
  return results;
}

export function openGachaModal() {
  initGachaState();
  const normTicket = ctx.S.tickets?.norm || 0;
  const specTicket = ctx.S.tickets?.spec || 0;
  const normPity = ctx.S.gachaPity?.norm || 0;
  const specPity = ctx.S.gachaPity?.spec || 0;

  const bodyHTML = `
    <div class="gacha-wrap" style="text-align:center; position:relative; overflow:hidden; padding:4px 0;">
      <!-- Header Thông tin vé & Mua nhanh -->
      <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.04); padding:8px 12px; border-radius:8px; margin-bottom:12px;">
        <div style="font-size:12px; font-weight:bold; color:#5a3f78; text-align:left;">
          Vé thường: <span id="gachaNormCount" style="color:#2e6a50; font-size:13px;">${normTicket}</span> | 
          Vé đặc biệt: <span id="gachaSpecCount" style="color:#8a2acc; font-size:13px;">${specTicket}</span>
        </div>
        <div style="display:flex; gap:6px;">
          <span class="buy" id="gachaBuyNormBtn" style="padding:4px 8px; font-size:11px;">+ Vé Thường (1000G)</span>
          <span class="buy" id="gachaBuySpecBtn" style="padding:4px 8px; font-size:11px; background:#8a5cc0; border-color:#6a4a9a;">+ Vé Đặc biệt (5000G)</span>
        </div>
      </div>

      <!-- Máy Gachapon & Slot -->
      <div class="gacha-machine-box" style="position:relative; width:130px; height:130px; margin:0 auto 10px; display:flex; justify-content:center; align-items:center;">
        <div id="gachaMachineSprite" style="display:inline-block; transition:transform 0.15s ease;">
          ${spriteSVG('gachapon', 120)}
        </div>
        <div id="gachaSlot" style="position:absolute; bottom:0; left:50%; transform:translateX(-50%);"></div>
      </div>

      <!-- Thanh Bảo Hiểm (Pity Bars) -->
      <div style="display:flex; flex-direction:column; gap:8px; background:rgba(0,0,0,0.03); padding:10px 12px; border-radius:8px; margin-bottom:14px;">
        <div>
          <div style="display:flex; justify-content:space-between; font-size:11px; font-weight:bold; color:#4a7a26; margin-bottom:3px;">
            <span>Bảo hiểm Quay Thường</span>
            <span><span id="gachaNormPityTxt">${normPity}</span>/${GACHA_NORM_PITY}</span>
          </div>
          <div style="background:#e0e0e0; height:8px; border-radius:4px; overflow:hidden;">
            <div id="gachaNormPityBar" style="background:linear-gradient(90deg, #6cb457, #4e903a); height:100%; width:${Math.min(100, (normPity / GACHA_NORM_PITY) * 100)}%; transition:width 0.3s;"></div>
          </div>
        </div>

        <div>
          <div style="display:flex; justify-content:space-between; font-size:11px; font-weight:bold; color:#8a2acc; margin-bottom:3px;">
            <span>Bảo hiểm Quay Đặc Biệt</span>
            <span><span id="gachaSpecPityTxt">${specPity}</span>/${GACHA_SPEC_PITY}</span>
          </div>
          <div style="background:#e0e0e0; height:8px; border-radius:4px; overflow:hidden;">
            <div id="gachaSpecPityBar" style="background:linear-gradient(90deg, #a335ee, #ff8000); height:100%; width:${Math.min(100, (specPity / GACHA_SPEC_PITY) * 100)}%; transition:width 0.3s;"></div>
          </div>
        </div>
      </div>

      <!-- Các Nút Quay -->
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
        <span class="buy" id="gachaRollNorm1" style="padding:9px 0; font-size:12px; background:#6cb457; text-align:center;">Quay Thường ×1</span>
        <span class="buy" id="gachaRollNorm10" style="padding:9px 0; font-size:12px; background:#4e903a; text-align:center;">Quay Thường ×10</span>
        <span class="buy" id="gachaRollSpec1" style="padding:9px 0; font-size:12px; background:#a335ee; border-color:#8a2acc; text-align:center;">Quay Đặc Biệt ×1</span>
        <span class="buy" id="gachaRollSpec10" style="padding:9px 0; font-size:12px; background:#8a2acc; border-color:#6a1aa3; text-align:center;">Quay Đặc Biệt ×10</span>
      </div>

      <!-- Result Overlay Animation -->
      <div id="gachaResultOverlay" style="display:none; position:absolute; inset:0; background:rgba(255,255,255,0.97); z-index:20; border-radius:8px; padding:12px; flex-direction:column; justify-content:center; align-items:center; box-shadow:0 4px 20px rgba(0,0,0,0.3);">
        <div id="gachaCapsuleAnim" style="position:relative; width:48px; height:48px; margin-bottom:10px;"></div>
        <div id="gachaResultTitle" style="font-weight:bold; font-size:16px; margin:4px 0 8px; color:#5a3f78;"></div>
        <div id="gachaResultGrid" style="display:flex; flex-wrap:wrap; gap:8px; justify-content:center; max-height:220px; overflow-y:auto; margin-bottom:14px; width:100%; padding:4px;"></div>
        <span class="buy" id="gachaCloseResultBtn" style="padding:6px 20px; font-size:12px;">Xác nhận nhận thưởng</span>
      </div>
    </div>
  `;

  openModal('Máy Gachapon Vườn Rau', bodyHTML);

  const updateCounts = () => {
    initGachaState();
    const elN = All.$id('gachaNormCount'); if (elN) elN.textContent = String(ctx.S.tickets.norm);
    const elS = All.$id('gachaSpecCount'); if (elS) elS.textContent = String(ctx.S.tickets.spec);
    const pN = ctx.S.gachaPity.norm, pS = ctx.S.gachaPity.spec;
    const txtN = All.$id('gachaNormPityTxt'); if (txtN) txtN.textContent = String(pN);
    const txtS = All.$id('gachaSpecPityTxt'); if (txtS) txtS.textContent = String(pS);
    const barN = All.$id('gachaNormPityBar'); if (barN) barN.style.width = Math.min(100, (pN / GACHA_NORM_PITY) * 100) + '%';
    const barS = All.$id('gachaSpecPityBar'); if (barS) barS.style.width = Math.min(100, (pS / GACHA_SPEC_PITY) * 100) + '%';
  };

  All.$id('gachaBuyNormBtn')?.addEventListener('click', () => {
    if (ctx.S.coins < GACHA_NORM_PRICE) return toast(`Còn thiếu ${GACHA_NORM_PRICE - ctx.S.coins} G!`);
    ctx.S.coins -= GACHA_NORM_PRICE;
    ctx.S.tickets.norm = (ctx.S.tickets.norm || 0) + 1;
    save(); renderStatus(); updateCounts();
    toast('Đã mua 1 Vé Quay Thường!');
  });

  All.$id('gachaBuySpecBtn')?.addEventListener('click', () => {
    if (ctx.S.coins < GACHA_SPEC_PRICE) return toast(`Còn thiếu ${GACHA_SPEC_PRICE - ctx.S.coins} G!`);
    ctx.S.coins -= GACHA_SPEC_PRICE;
    ctx.S.tickets.spec = (ctx.S.tickets.spec || 0) + 1;
    save(); renderStatus(); updateCounts();
    toast('Đã mua 1 Vé Quay Đặc Biệt!');
  });

  const triggerAnimationAndShow = (isSpecial, count, results) => {
    const machine = All.$id('gachaMachineSprite');
    const overlay = All.$id('gachaResultOverlay');
    const animSlot = All.$id('gachaCapsuleAnim');
    const title = All.$id('gachaResultTitle');
    const grid = All.$id('gachaResultGrid');

    if (machine) {
      machine.style.animation = 'gachaShake 0.4s ease';
      setTimeout(() => { machine.style.animation = ''; }, 450);
    }

    setTimeout(() => {
      if (!overlay || !animSlot || !title || !grid) return;
      const capsuleIcon = isSpecial ? spriteSVG('gachaCapsuleSpec', 48) : spriteSVG('gachaCapsuleNorm', 48);
      animSlot.innerHTML = capsuleIcon;
      animSlot.style.animation = 'gachaDrop 0.5s ease-out';

      title.textContent = `Kết quả Quay ${isSpecial ? 'Đặc biệt' : 'Thường'} ×${count}`;

      grid.innerHTML = results.map(r => `
        <div class="gacha-item-card rarity-${r.rarity.replace(/\s+/g, '-')}" style="border:2px solid ${r.color}; border-radius:8px; padding:6px 8px; background:#fff; display:flex; flex-direction:column; align-items:center; width:100px; text-align:center; box-shadow:0 2px 6px rgba(0,0,0,0.15);">
          <div style="font-size:10px; font-weight:bold; color:${r.color}; margin-bottom:2px;">${r.rarity}${r.isPity ? ' ★Bảo hiểm' : ''}</div>
          <div style="margin:2px 0;">${r.icon}</div>
          <div style="font-size:11px; font-weight:bold; color:#3a2c22; margin-top:2px;">${r.name}</div>
        </div>
      `).join('');

      overlay.style.display = 'flex';
      updateCounts();
    }, 400);
  };

  All.$id('gachaCloseResultBtn')?.addEventListener('click', () => {
    const overlay = All.$id('gachaResultOverlay');
    if (overlay) overlay.style.display = 'none';
  });

  const doRoll = (isSpecial, count) => {
    const results = executeGachaRoll(isSpecial, count);
    if (results) {
      triggerAnimationAndShow(isSpecial, count, results);
    }
  };

  All.$id('gachaRollNorm1')?.addEventListener('click', () => doRoll(false, 1));
  All.$id('gachaRollNorm10')?.addEventListener('click', () => doRoll(false, 10));
  All.$id('gachaRollSpec1')?.addEventListener('click', () => doRoll(true, 1));
  All.$id('gachaRollSpec10')?.addEventListener('click', () => doRoll(true, 10));
}
