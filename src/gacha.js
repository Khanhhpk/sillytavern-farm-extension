import { now, save } from './state.js';
import { ctx } from './store.js';
import * as All from './all.js';
import { CROPS, FERTS } from './data.js';
import { spriteSVG, petSVG, registerDynamicSprite, P } from './graphics.js';
import { toast } from './witch.js';
import { renderStatus } from './render.js';
import { openModal } from './shop.js';
import { charName, CS, SEC, extractJson, collectWorldbook } from './events.js';

export const GACHA_NORM_PITY = 100;
export const GACHA_SPEC_PITY = 50;
export const GACHA_NORM_PRICE = 1000;
export const GACHA_SPEC_PRICE = 5000;

export function initGachaState() {
  if (!ctx.S.tickets) ctx.S.tickets = { norm: 0, spec: 0 };
  if (!ctx.S.gachaPity) ctx.S.gachaPity = { norm: 0, spec: 0 };
  if (!ctx.S.uniques) ctx.S.uniques = {};
}

// Hàm hỗ trợ giới hạn concurrency (parallel)
async function pMap(array, asyncFn, concurrency) {
  const results = [];
  const executing = [];
  for (const item of array) {
    const p = Promise.resolve().then(() => asyncFn(item));
    results.push(p);
    if (concurrency <= array.length) {
      const e = p.then(() => executing.splice(executing.indexOf(e), 1));
      executing.push(e);
      if (executing.length >= concurrency) {
        await Promise.race(executing);
      }
    }
  }
  return Promise.all(results);
}

// Máy phát Procedural Sprite 32x32 dự phòng (khi AI chưa bật / offline / lỗi)
export function generateProcedural32x32Sprite(rarity) {
  const map = [];
  const borderChar = 'K';
  const mainChar = rarity === 'Huyền thoại' ? 'C' : rarity === 'Sử thi' ? 'V' : 'B';
  const subChar = rarity === 'Huyền thoại' ? 'Y' : rarity === 'Sử thi' ? 'v' : 'b';
  const highlightChar = 'W';
  const accentChar = rarity === 'Huyền thoại' ? 'R' : rarity === 'Sử thi' ? 'F' : 'E';

  const type = Math.floor(Math.random() * 4); 

  for (let y = 0; y < 32; y++) {
    let row = '';
    for (let x = 0; x < 32; x++) {
      const distFromCenter = Math.hypot(x - 15.5, y - 15.5);
      const isLeft = x < 16;
      const mirrorX = isLeft ? x : 31 - x;

      let ch = '.';

      if (type === 0) {
        if (y >= 10 && y <= 22) {
          const w = 12 - Math.floor(Math.abs(y - 16) * 0.4);
          if (mirrorX >= 16 - w && mirrorX <= 15) {
            if (mirrorX === 16 - w || y === 10 || y === 22) ch = borderChar;
            else if (y === 11 || mirrorX === 16 - w + 1) ch = highlightChar;
            else if ((x + y) % 3 === 0) ch = accentChar;
            else ch = (x % 2 === 0) ? mainChar : subChar;
          }
        }
      } else if (type === 1) {
        if (distFromCenter <= 11) {
          if (distFromCenter >= 10.2) ch = borderChar;
          else if (x <= 13 && y <= 13 && distFromCenter < 8) ch = highlightChar;
          else if (distFromCenter < 5) ch = accentChar;
          else ch = (x + y) % 2 === 0 ? mainChar : subChar;
        }
      } else if (type === 2) {
        const line = Math.abs(x - y);
        if (line <= 3 && x >= 4 && x <= 27 && y >= 4 && y <= 27) {
          if (line === 3) ch = borderChar;
          else if (line === 0) ch = highlightChar;
          else ch = (x + y) % 2 === 0 ? mainChar : subChar;
        }
      } else {
        const dx = Math.abs(x - 15.5), dy = Math.abs(y - 15.5);
        if (dx + dy <= 12 && dx + dy >= 2) {
          if (dx + dy >= 11) ch = borderChar;
          else if (dx <= 2 || dy <= 2) ch = highlightChar;
          else ch = (x % 2 === 0) ? mainChar : subChar;
        }
      }
      row += ch;
    }
    map.push(row);
  }
  return map;
}

// Gọi AI tạo Vật phẩm Độc nhất
export async function generateAIUniqueItemData(rarity) {
  if (!SEC.url || !SEC.model) return null;
  try {
    const simpleColors = Object.entries(P).filter(e => typeof e[1] === 'string');
    const paletteStr = simpleColors.map(([k, v]) => `${k}: ${v}`).join(', ');

    let contextStr = '';
    if (CS.link) {
      const worldbook = await collectWorldbook();
      contextStr = `Trích xuất bối cảnh thế giới (Worldbook) & Lịch sử trò chuyện gần nhất:
${worldbook ? worldbook : '(Không có dữ liệu thế giới cụ thể, hãy tự do sáng tạo)'}
Nếu thấy phù hợp, hãy thiết kế vật phẩm liên kết với bối cảnh này, nếu không thì tự do sáng tạo.`;
    } else {
      contextStr = `Hãy tự do tưởng tượng một chủ đề ngẫu nhiên bất kỳ (kỳ ảo, viễn tưởng, cổ đại, ma thuật, vũ trụ, thủy cung, phong ấn...) không giới hạn.`;
    }

    const sysPrompt = `Bạn là một AI thiết kế vật phẩm game nhập vai và chuyên gia Pixel Art (32x32).
Hãy sáng tạo 1 VẬT PHẨM ĐỘC NHẤT phẩm chất [${rarity}].
${contextStr}

BẢNG MÀU PIXEL 32x32 CHO PHÉP (Ký tự: Mã màu Hex):
${paletteStr}

HƯỚNG DẪN TƯ DUY (Bắt buộc phải có thẻ <thinking> trước khi xuất mã):
Để vẽ pixel art chuẩn 32x32:
1. Phân tích màu sắc và hình dáng vật thể phù hợp với mô tả. Vật thể nên được cách điệu thú vị, không cần bó buộc vào nông nghiệp.
2. Đếm chính xác số lượng ký tự trên mỗi dòng. Khung canvas là 32x32, mỗi dòng bắt buộc dài đúng 32 ký tự, tổng cộng 32 dòng. Nếu thiếu/thừa ký tự, hình sẽ bị cắt méo!

QUY TẮC ĐẦU RA BẮT BUỘC:
Sau khi đóng thẻ </thinking>, chỉ xuất đúng 1 khối mã \`\`\`json chứa cấu trúc:
{
  "name": "Tên vật phẩm (2~5 chữ, ấn tượng, sáng tạo)",
  "desc": "Mô tả 1 câu về công dụng/hiệu ứng khi dùng trong cốt truyện (dưới 35 chữ)",
  "price": Một số nguyên định giá G của vật phẩm (Gợi ý: quanh mức ${rarity === 'Huyền thoại' ? 20000 : rarity === 'Sử thi' ? 8000 : 2500}G, có thể tự do tăng giảm tuỳ ý),
  "spriteMap": [ mảng gồm ĐÚNG 32 chuỗi, mỗi chuỗi DÀI CHÍNH XÁC 32 ký tự chỉ dùng ký tự Bảng màu và dấu '.' cho điểm trong suốt ]
}`;

    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), 15000);
    const res = await fetch(SEC.url.replace(/\/+$/, '') + '/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(SEC.key ? { Authorization: 'Bearer ' + SEC.key } : {}) },
      body: JSON.stringify({
        model: SEC.model,
        messages: [
          { role: 'system', content: sysPrompt },
          { role: 'user', content: `Hãy sáng tạo 1 vật phẩm đặc biệt ngẫu nhiên phẩm chất ${rarity}.` }
        ]
      }),
      signal: ctrl.signal
    });
    clearTimeout(to);
    if (!res.ok) return null;
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || '';
    const jtxt = extractJson(content);
    if (jtxt) {
      const o = JSON.parse(jtxt);
      if (o && o.name && o.desc && Array.isArray(o.spriteMap) && o.spriteMap.length === 32 && o.spriteMap.every(s => typeof s === 'string' && s.length === 32)) {
        return o;
      }
    }
  } catch(e) {}
  return null;
}

// Hệ thống tạo Vật Phẩm Độc Nhất Async với Retry Logic
export async function generateUniqueItem(isSpecial) {
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

  const timestamp = now();
  const randId = Math.floor(Math.random() * 10000);
  const key = `unique@${timestamp}_${randId}`;
  const spKey = `gacha_sp_${timestamp}_${randId}`;

  let finalName = `Bảo vật ✦ ${randId}`;
  let finalDesc = `Vật phẩm độc nhất [${rarity}] mang theo ma lực kỳ diệu. Có thể "Lấy ra" trong Balo để dùng trong cốt truyện!`;
  let finalSpriteMap = null;

  if (SEC.url && SEC.model) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      const aiData = await generateAIUniqueItemData(rarity);
      if (aiData) {
        finalName = aiData.name;
        finalDesc = aiData.desc;
        if (aiData.price !== undefined) sellPrice = parseInt(aiData.price) || sellPrice;
        finalSpriteMap = aiData.spriteMap;
        break;
      }
    }
  }

  if (!finalSpriteMap) {
    finalSpriteMap = generateProcedural32x32Sprite(rarity);
  }

  registerDynamicSprite(spKey, finalSpriteMap);

  ctx.S.uniques[key] = {
    key,
    name: finalName,
    rarity,
    color,
    desc: finalDesc,
    sell: sellPrice,
    sp: spKey,
    spriteMap: finalSpriteMap
  };
  
  // Lưu trực tiếp vào balo khi tỉnh thức xong
  ctx.S.bag[key] = (ctx.S.bag[key] || 0) + 1;
  save();

  return { key, name: finalName, rarity, color, desc: finalDesc, sell: sellPrice, sp: spKey };
}

// Thực hiện quay Gacha Bất đồng bộ
export async function executeGachaRoll(isSpecial, count, updateLoadingText) {
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
  
  const seedIds = Object.keys(CROPS).filter(k => !CROPS[k].hidden && k !== 'mystery');
  const fertIds = Object.keys(FERTS);
  const rollsPlan = [];

  for (let i = 0; i < count; i++) {
    ctx.S.gachaPity[pityKey]++;
    const isPity = ctx.S.gachaPity[pityKey] >= maxPity;

    let rewardType = '';
    if (isPity) {
      rewardType = 'unique';
    } else {
      const roll = Math.random() * 100;
      if (roll < 40) rewardType = 'seed';
      else if (roll < 70) rewardType = 'fert';
      else if (roll < 90) rewardType = 'shard';
      else rewardType = 'unique';
    }

    if (rewardType === 'unique') {
      ctx.S.gachaPity[pityKey] = 0; // Reset Pity ngay lập tức
    }
    rollsPlan.push({ type: rewardType, isPity });
  }

  // Thu thập các unique items để chạy AI song song (Max concurrency 3)
  const uniquePlans = rollsPlan.filter(r => r.type === 'unique');
  let uniqueCount = 0;

  const uniqueResults = await pMap(uniquePlans, async (plan) => {
    uniqueCount++;
    if (updateLoadingText) {
      updateLoadingText(uniquePlans.length > 1 ? `Đang tỉnh thức bảo vật... (${uniqueCount}/${uniquePlans.length})` : 'Đang tỉnh thức bảo vật...');
    }
    const item = await generateUniqueItem(isSpecial);
    return {
      type: 'unique',
      name: item.name,
      rarity: item.rarity,
      color: item.color,
      icon: spriteSVG(item.sp, 32),
      desc: item.desc,
      spKey: item.sp,
      isPity: plan.isPity
    };
  }, 3);

  // Ghép kết quả lại đúng thứ tự quay
  let uIndex = 0;
  const finalResults = [];

  for (const plan of rollsPlan) {
    if (plan.type === 'unique') {
      finalResults.push(uniqueResults[uIndex++]);
    } else if (plan.type === 'seed') {
      const sid = seedIds[Math.floor(Math.random() * seedIds.length)];
      const amount = isSpecial ? 5 : 2;
      ctx.S.seeds[sid] = (ctx.S.seeds[sid] || 0) + amount;
      finalResults.push({ type: 'seed', name: `Hạt ${CROPS[sid].name} ×${amount}`, rarity: 'Thường', color: '#6cb457', icon: spriteSVG(CROPS[sid].sp, 32) });
    } else if (plan.type === 'fert') {
      const fid = fertIds[Math.floor(Math.random() * fertIds.length)];
      const amount = isSpecial ? 3 : 1;
      ctx.S.ferts[fid] = (ctx.S.ferts[fid] || 0) + amount;
      finalResults.push({ type: 'fert', name: `${FERTS[fid].name} ×${amount}`, rarity: 'Thường', color: '#e8963a', icon: spriteSVG('toolFert', 32) });
    } else {
      const isStar = Math.random() < 0.5;
      if (!ctx.S.shards) ctx.S.shards = { prism: 0, star: 0 };
      if (isStar) {
        ctx.S.shards.star++;
        finalResults.push({ type: 'shard', name: 'Mảnh ngôi sao ×1', rarity: 'Hiếm', color: '#b094e0', icon: spriteSVG('shardStar', 32) });
      } else {
        ctx.S.shards.prism++;
        finalResults.push({ type: 'shard', name: 'Mảnh lăng quang ×1', rarity: 'Hiếm', color: '#4a8098', icon: spriteSVG('shardPrism', 32) });
      }
    }
  }

  save();
  renderStatus();
  return finalResults;
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
      <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.04); padding:8px 12px; border-radius:8px; margin-bottom:12px; flex-wrap:wrap; gap:8px;">
        <div style="font-size:13px; font-weight:bold; color:#5a3f78; text-align:left; flex:1; min-width:140px;">
          Vé thường: <span id="gachaNormCount" style="color:#2e6a50; font-size:14px;">${normTicket}</span> | 
          Đặc biệt: <span id="gachaSpecCount" style="color:#8a2acc; font-size:14px;">${specTicket}</span>
        </div>
        <div style="display:flex; gap:6px; flex:none;">
          <span class="buy" id="gachaBuyNormBtn" style="padding:4px 8px; font-size:11px;">+ Vé Thường (1000G)</span>
          <span class="buy" id="gachaBuySpecBtn" style="padding:4px 8px; font-size:11px; background:#8a5cc0; border:1px solid #6a4a9a; color:#fff; text-shadow:0 1px 1px rgba(0,0,0,0.3);">+ Vé Đặc biệt (5000G)</span>
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
        <span class="buy" id="gachaRollNorm1" style="padding:10px 0; font-size:13px; font-weight:bold; background:#6cb457; border:1px solid #4e903a; color:#fff; text-shadow:0 1px 2px rgba(0,0,0,0.3); text-align:center; border-radius:6px;">Quay Thường ×1</span>
        <span class="buy" id="gachaRollNorm10" style="padding:10px 0; font-size:13px; font-weight:bold; background:#4e903a; border:1px solid #3c702c; color:#fff; text-shadow:0 1px 2px rgba(0,0,0,0.3); text-align:center; border-radius:6px;">Quay Thường ×10</span>
        <span class="buy" id="gachaRollSpec1" style="padding:10px 0; font-size:13px; font-weight:bold; background:#a335ee; border:1px solid #8a2acc; color:#fff; text-shadow:0 1px 2px rgba(0,0,0,0.3); text-align:center; border-radius:6px;">Quay Đặc Biệt ×1</span>
        <span class="buy" id="gachaRollSpec10" style="padding:10px 0; font-size:13px; font-weight:bold; background:#8a2acc; border:1px solid #6a1aa3; color:#fff; text-shadow:0 1px 2px rgba(0,0,0,0.3); text-align:center; border-radius:6px;">Quay Đặc Biệt ×10</span>
      </div>

      <!-- Result Overlay Animation (Lưới kết quả) -->
      <div id="gachaResultOverlay" style="display:none; position:absolute; inset:0; background:rgba(255,255,255,0.97); z-index:20; border-radius:8px; padding:12px; flex-direction:column; justify-content:center; align-items:center; box-shadow:0 4px 20px rgba(0,0,0,0.3);">
        <div id="gachaCapsuleAnim" style="position:relative; width:48px; height:48px; margin-bottom:10px;"></div>
        <div id="gachaResultTitle" style="font-weight:bold; font-size:16px; margin:4px 0 8px; color:#5a3f78;"></div>
        <div id="gachaResultGrid" style="display:flex; flex-wrap:wrap; gap:8px; justify-content:center; max-height:220px; overflow-y:auto; margin-bottom:14px; width:100%; padding:4px;"></div>
        <span class="buy" id="gachaCloseResultBtn" style="padding:6px 20px; font-size:12px;">Xác nhận nhận thưởng</span>
      </div>

      <!-- Showcase Modal (Khoe từng món độc nhất) -->
      <div id="gachaShowcaseOverlay" style="display:none; position:absolute; inset:0; background:rgba(0,0,0,0.85); z-index:40; flex-direction:column; justify-content:center; align-items:center; border-radius:8px; padding:20px; text-align:center;">
        <div id="gachaShowcaseCard" style="background:#fff; border-radius:12px; padding:20px; box-shadow:0 0 20px rgba(255,128,0,0.5); width:100%; max-width:240px; position:relative; overflow:hidden;">
          <div id="gachaShowcaseRarity" style="font-size:12px; font-weight:bold; margin-bottom:10px; text-transform:uppercase;"></div>
          <div id="gachaShowcaseIcon" style="margin:10px auto; display:flex; justify-content:center;"></div>
          <div id="gachaShowcaseName" style="font-size:18px; font-weight:bold; margin:25px 0 8px; color:#3a2c22;"></div>
          <div id="gachaShowcaseDesc" style="font-size:12px; color:#555;"></div>
          <span class="buy" id="gachaShowcaseNextBtn" style="margin-top:20px; padding:6px 24px; font-size:13px; background:#a335ee; border-color:#8a2acc;">Tiếp tục</span>
        </div>
      </div>

      <!-- Loading Overlay (Chờ AI Tỉnh thức) -->
      <div id="gachaLoadingOverlay" style="display:none; position:absolute; inset:0; background:rgba(255,255,255,0.85); z-index:30; flex-direction:column; justify-content:center; align-items:center; border-radius:8px;">
        <div style="width:48px; height:48px; animation: gachaShake 0.5s infinite alternate;">${spriteSVG('gachapon', 48)}</div>
        <div id="gachaLoadingText" style="margin-top:12px; font-size:13px; font-weight:bold; color:#5a3f78;">Đang quay...</div>
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

  const triggerGridResult = (isSpecial, count, results) => {
    const overlay = All.$id('gachaResultOverlay');
    const animSlot = All.$id('gachaCapsuleAnim');
    const title = All.$id('gachaResultTitle');
    const grid = All.$id('gachaResultGrid');

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
  };

  All.$id('gachaCloseResultBtn')?.addEventListener('click', () => {
    const overlay = All.$id('gachaResultOverlay');
    if (overlay) overlay.style.display = 'none';
  });

  const doRoll = async (isSpecial, count) => {
    const machine = All.$id('gachaMachineSprite');
    const loadOverlay = All.$id('gachaLoadingOverlay');
    const loadText = All.$id('gachaLoadingText');

    if (machine) machine.style.animation = 'gachaShake 0.2s ease infinite';
    if (loadOverlay) loadOverlay.style.display = 'flex';
    if (loadText) loadText.textContent = 'Đang quay...';

    const results = await executeGachaRoll(isSpecial, count, (txt) => {
      if (loadText) loadText.textContent = txt;
    });

    if (machine) machine.style.animation = '';
    if (loadOverlay) loadOverlay.style.display = 'none';

    if (results) {
      const uniques = results.filter(r => r.type === 'unique');

      if (uniques.length > 0) {
        let currentShowcase = 0;
        const showcaseOverlay = All.$id('gachaShowcaseOverlay');
        const scRarity = All.$id('gachaShowcaseRarity');
        const scIcon = All.$id('gachaShowcaseIcon');
        const scName = All.$id('gachaShowcaseName');
        const scDesc = All.$id('gachaShowcaseDesc');
        const scCard = All.$id('gachaShowcaseCard');
        
        const showNextUnique = () => {
          if (currentShowcase >= uniques.length) {
            showcaseOverlay.style.display = 'none';
            triggerGridResult(isSpecial, count, results);
            return;
          }
          const u = uniques[currentShowcase];
          scRarity.textContent = u.rarity;
          scRarity.style.color = u.color;
          scCard.style.boxShadow = `0 0 30px ${u.color}80`;
          scIcon.innerHTML = spriteSVG(u.spKey, 64);
          scName.textContent = u.name;
          scDesc.textContent = u.desc;
          showcaseOverlay.style.display = 'flex';
          
          scCard.style.animation = 'none';
          void scCard.offsetWidth;
          scCard.style.animation = 'gachaDrop 0.5s ease-out';
        };
        
        All.$id('gachaShowcaseNextBtn').onclick = () => {
          currentShowcase++;
          showNextUnique();
        };
        
        showNextUnique();
      } else {
        triggerGridResult(isSpecial, count, results);
      }
    }
  };

  All.$id('gachaRollNorm1')?.addEventListener('click', () => doRoll(false, 1));
  All.$id('gachaRollNorm10')?.addEventListener('click', () => doRoll(false, 10));
  All.$id('gachaRollSpec1')?.addEventListener('click', () => doRoll(true, 1));
  All.$id('gachaRollSpec10')?.addEventListener('click', () => doRoll(true, 10));
}
