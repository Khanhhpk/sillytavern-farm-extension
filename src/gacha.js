import { now, save } from './state.js';
import { ctx } from './store.js';
import * as All from './all.js';
import { CROPS, FERTS } from './data.js';
import { spriteSVG, petSVG, registerDynamicSprite, P, GACHA_P } from './graphics.js';
import { toast, openBuyDlg } from './witch.js';
import { renderStatus } from './render.js';
import { openModal } from './shop.js';
import { charName, CS, SEC, extractJson, collectWorldbook } from './events.js';
import { GACHA_PROMPT } from './prompt.js';

export const GACHA_SPEC_PITY = 100;
export const GACHA_SUPER_PITY = 200;
export const GACHA_NORM_PRICE = 1000;
export const GACHA_SPEC_PRICE = 5000;

export function initGachaState() {
  if (!ctx.S.tickets) ctx.S.tickets = { norm: 0, spec: 0, super: 0 };
  if (ctx.S.tickets.super === undefined) ctx.S.tickets.super = 0;
  
  if (!ctx.S.gachaPity) ctx.S.gachaPity = { spec: 0, super: 0 };
  if (ctx.S.gachaPity.super === undefined) ctx.S.gachaPity.super = 0;
  
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
  const mainChar = rarity === 'Huyền thoại' ? 'C' : rarity === 'Sử thi' ? 'V' : rarity === 'Hiếm' ? 'B' : rarity === 'Thường' ? 'G' : 'D';
  const subChar = rarity === 'Huyền thoại' ? 'Y' : rarity === 'Sử thi' ? 'v' : rarity === 'Hiếm' ? 'b' : rarity === 'Thường' ? 'g' : 'd';
  const highlightChar = 'W';
  const accentChar = rarity === 'Huyền thoại' ? 'R' : rarity === 'Sử thi' ? 'F' : rarity === 'Hiếm' ? 'E' : rarity === 'Thường' ? 'L' : 'D';

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
    const simpleColors = Object.entries(GACHA_P).filter(e => typeof e[1] === 'string');
    const paletteStr = simpleColors.map(([k, v]) => `${k}: ${v}`).join(', ');

    let contextStr = '';
    let thinkingInstructions = '';
    
    if (CS.link) {
      const worldbook = await collectWorldbook();
      contextStr = `Trích xuất bối cảnh thế giới (Worldbook) & Lịch sử trò chuyện gần nhất:
${worldbook ? worldbook : '(Không có dữ liệu thế giới cụ thể)'}
Nếu thấy phù hợp, hãy thiết kế kỳ vật liên kết với bối cảnh này, nếu không thì tự do sáng tạo. Tuy nhiên, KHÔNG ĐƯỢC tùy chỉnh kết quả thành "đáp án giải quyết khủng hoảng trước mắt". Kỳ vật phải duy trì tính độc lập ngẫu nhiên.`;
      
      thinkingInstructions = `1. TÌM Ý TƯỞNG: Đọc kỹ bối cảnh thế giới được cung cấp. Xác định Vực đề tài và Vực lối chơi.
2. CƠ CHẾ: Căn cứ vào độ hiếm [${rarity}] để thiết lập cơ chế. Thao tác cụ thể, cực kỳ thú vị và phá vỡ sáo rỗng (anti-cliché).
3. VẼ PIXEL: Khung pixel tối thiểu là 32x32. Bạn có thể mở rộng kích thước lớn hơn (ví dụ 40x40, 48x48), nhưng BẮT BUỘC phải là lưới HÌNH VUÔNG n x n (số dòng và số ký tự mỗi dòng phải bằng nhau).`;
    } else {
      contextStr = `KHÔNG CÓ CHỦ ĐỀ CỐ ĐỊNH. Để đảm bảo tính ngẫu nhiên tuyệt đối, bạn PHẢI tự bốc thăm Vực đề tài và Vực lối chơi bất kỳ. Mọi thứ trong vũ trụ đều có thể trở thành kỳ vật.`;
      
      thinkingInstructions = `1. BỐC THĂM CHỦ ĐỀ: Bốc thăm ngẫu nhiên Vực đề tài (Khí vật, sinh mệnh, quy tắc, không gian...) và Vực lối chơi (Xử lý thông tin, cải tạo bối cảnh, giao dịch đánh cược...).
2. CƠ CHẾ: Căn cứ vào độ hiếm [${rarity}] để thiết lập cơ chế. Thao tác cụ thể, cực kỳ thú vị và phá vỡ sáo rỗng (anti-cliché).
3. VẼ PIXEL: Khung pixel tối thiểu là 32x32. Bạn có thể mở rộng kích thước lớn hơn (ví dụ 40x40, 48x48), nhưng BẮT BUỘC phải là lưới HÌNH VUÔNG n x n (số dòng và số ký tự mỗi dòng phải bằng nhau).`;
    }

    const rarityGuidance = rarity === 'Huyền thoại' 
      ? "[Đột phá Quy tắc] Vật phẩm độc nhất vô nhị với khả năng bẻ cong hoặc viết lại một quy tắc cụ thể của trò chơi/thế giới. Sức mạnh vĩ mô, hiệu ứng hình ảnh hoành tráng. Dù cực mạnh, nó vẫn phải tuân theo logic của thế giới, không biến người chơi thành thần toàn năng nhàm chán."
      : rarity === 'Sử thi' 
      ? "[Tài sản Chiến lược] Đồ vật mang tính thay đổi lối chơi (Game-changer). Có sức mạnh lớn, đa dụng, hoặc tự động hóa một quy trình phức tạp. Tuy nhiên, để phát huy tối đa cần có sự tính toán của người chơi."
      : rarity === 'Hiếm'
      ? "[Cơ chế Đặc biệt] Vật phẩm bắt đầu có 'cơ chế hoạt động' riêng biệt. Có thể thay đổi một phần nhỏ cục diện, mang lại lợi ích rõ rệt nhưng sẽ có thời gian hồi chiêu (cooldown) hoặc điều kiện kích hoạt."
      : rarity === 'Thường'
      ? "[Công cụ Cơ bản] Vật phẩm có ích nhưng công năng đơn giản, giới hạn rõ ràng. Thường là đồ tiêu hao, công cụ hỗ trợ canh tác, sinh hoạt hoặc tăng chỉ số nhẹ."
      : "[Vật phẩm Tấu hài/Vô dụng] Những món đồ kỳ cục, hỏng hóc hoặc có công dụng cực kỳ vô thưởng vô phạt. Chúng tồn tại chủ yếu để gây cười, tạo tình huống trớ trêu trong tương tác đời thường.";

    const basePrice = rarity === 'Huyền thoại' ? 20000 : rarity === 'Sử thi' ? 8000 : rarity === 'Hiếm' ? 2500 : rarity === 'Thường' ? 500 : 100;

    const sysPrompt = `Bạn là một AI thiết kế "Kỳ vật dị giới" (Otherworldly Artifact) và chuyên gia Pixel Art (n x n, tối thiểu 32x32).
Hãy sáng tạo 1 KỲ VẬT ĐỘC NHẤT phẩm chất [${rarity}].
${contextStr}

--- QUY TẮC CỐT LÕI TỪ VẠN HỮU ĐẠO NGUYÊN ---
${GACHA_PROMPT}
--- KẾT THÚC QUY TẮC CỐT LÕI ---

BẢNG MÀU PIXEL CHO PHÉP (Ký tự: Mã màu Hex):
${paletteStr}

QUY TẮC BỔ SUNG:
1. Cấp độ sức mạnh hiện tại: Phẩm chất [${rarity}] - ${rarityGuidance}
2. Định giá hợp lý: Không được phá giá kinh tế game.

HƯỚNG DẪN TƯ DUY (Bắt buộc phải có thẻ <thinking> trước khi xuất mã):
${thinkingInstructions}

QUY TẮC ĐẦU RA BẮT BUỘC:
Sau khi đóng thẻ </thinking>, chỉ xuất đúng 1 khối mã \`\`\`json chứa cấu trúc:
{
  "name": "Tên kỳ vật (2~7 chữ, ấn tượng, gợi sự tò mò)",
  "desc": "Mô tả ngắn gọn CƠ CHẾ và CÁCH SỬ DỤNG của kỳ vật (dưới 100 chữ). Phải rõ ràng, thú vị, độc lạ.",
  "price": Số nguyên định giá. Giá tối thiểu: ${basePrice}G. NGHIÊM CẤM LẠM PHÁT, giá trị tối đa tuyệt đối KHÔNG ĐƯỢC VƯỢT QUÁ ${basePrice * 5}G,
  "spriteMap": [ mảng các chuỗi. Nếu chọn kích thước n x n, mảng PHẢI CÓ ĐÚNG n chuỗi, và mỗi chuỗi DÀI CHÍNH XÁC n ký tự. Phải là hình vuông (min 32x32). Chỉ dùng ký tự Bảng màu và dấu '.' cho điểm trong suốt ]
}`;

    const userPrompt = `Hãy sáng tạo 1 vật phẩm đặc biệt ngẫu nhiên phẩm chất ${rarity}.`;

    console.groupCollapsed(`=== GACHA AI DEBUG: Bắt đầu tạo [${rarity}] ===`);
    console.log('[System Prompt]:\n', sysPrompt);
    console.log('[User Prompt]:\n', userPrompt);
    console.groupEnd();

    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), 150000); // Tăng timeout lên 150 giây để AI thoải mái viết thẻ <thinking>
    const res = await fetch(SEC.url.replace(/\/+$/, '') + '/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(SEC.key ? { Authorization: 'Bearer ' + SEC.key } : {}) },
      body: JSON.stringify({
        model: SEC.model,
        messages: [
          { role: 'system', content: sysPrompt },
          { role: 'user', content: userPrompt }
        ]
      }),
      signal: ctrl.signal
    });
    clearTimeout(to);
    if (!res.ok) return null;
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    console.groupCollapsed(`=== GACHA AI DEBUG: Phản hồi [${rarity}] ===`);
    console.log('[Raw Content]:\n', content);
    console.groupEnd();

    let jsonStr = content;
    const match = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match) jsonStr = match[1];

    let jtxt = extractJson(jsonStr) || extractJson(content);
    if (jtxt) {
      const o = JSON.parse(jtxt);
      if (o && o.name && o.desc && Array.isArray(o.spriteMap)) {
        // Tự động sửa lỗi AI vẽ nhầm kích thước (cắt hoặc bù thêm '.')
        const fixedMap = [];
        const size = Math.max(32, o.spriteMap.length);
        for (let i = 0; i < size; i++) {
          let row = typeof o.spriteMap[i] === 'string' ? o.spriteMap[i] : '';
          if (row.length < size) row = row.padEnd(size, '.');
          if (row.length > size) row = row.substring(0, size);
          fixedMap.push(row);
        }
        o.spriteMap = fixedMap;
        
        // Đảm bảo có giá để hiển thị, nếu AI thiếu thì fallback
        if (typeof o.price !== 'number') {
           o.price = rarity === 'Sử thi' ? 8000 : (rarity === 'Huyền thoại' ? 20000 : (rarity === 'Hiếm' ? 2500 : (rarity === 'Thường' ? 500 : 100)));
        }
        return o;
      }
    }
  } catch(e) {}
  return null;
}

export async function generateUniqueItem({ rarity, color, sellPrice, ticketType }) {
  initGachaState();

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

  let bonusDesc = '';
  if (rarity === 'Sử thi' && (ticketType === 'norm' || ticketType === 'spec')) {
    if (!ctx.S.shards) ctx.S.shards = { prism: 0, star: 0, legend: 0 };
    if (ctx.S.shards.legend === undefined) ctx.S.shards.legend = 0;
    ctx.S.shards.legend++;
    bonusDesc = '<br><span style="color:#ff8000; font-size:11px; font-weight:bold;">+1 Mảnh Huyền Thoại (Thưởng mở Sử thi)</span>';
  }

  ctx.S.uniques[key] = {
    key,
    name: finalName,
    rarity,
    color,
    desc: finalDesc + bonusDesc,
    sell: sellPrice,
    sp: spKey,
    spriteMap: finalSpriteMap
  };
  
  // Lưu trực tiếp vào balo khi tỉnh thức xong
  ctx.S.bag[key] = (ctx.S.bag[key] || 0) + 1;
  save();

  return { key, name: finalName, rarity, color, desc: finalDesc + bonusDesc, sell: sellPrice, sp: spKey };
}

// Thực hiện quay Gacha Bất đồng bộ
export async function executeGachaRoll(ticketType, count, updateLoadingText) {
  initGachaState();
  const ticketKey = ticketType;

  const haveTickets = ctx.S.tickets[ticketKey] || 0;
  if (haveTickets < count) {
    const tName = ticketType === 'super' ? 'Siêu cường' : (ticketType === 'spec' ? 'Đặc biệt' : 'Thường');
    toast(`Bạn cần ${count} Vé quay ${tName}!`);
    return null;
  }

  ctx.S.tickets[ticketKey] -= count;
  
  const seedIds = Object.keys(CROPS).filter(k => !CROPS[k].hidden && k !== 'mystery');
  const fertIds = Object.keys(FERTS);
  const rollsPlan = [];

  for (let i = 0; i < count; i++) {
    let rewardType = '';
    let isPity = false;
    let preRolledRarity = 'Rác';
    let preRolledColor = '#9e9e9e';
    let preRolledPrice = 100;

    // TẦNG 1: Loại vật phẩm
    if (ticketType === 'super') {
      rewardType = 'unique';
    } else if (ticketType === 'spec') {
      ctx.S.gachaPity.spec++;
      const p = ctx.S.gachaPity.spec;
      let uniqueRate = 10;
      if (p >= 71) uniqueRate = 10 + (p - 70) * 3;
      if (p >= GACHA_SPEC_PITY) uniqueRate = 100;

      const roll = Math.random() * 100;
      if (roll < uniqueRate) {
        rewardType = 'unique';
        if (p >= GACHA_SPEC_PITY) isPity = true;
      } else {
        const roll2 = Math.random() * 100;
        if (roll2 < 44.4) rewardType = 'seed';
        else if (roll2 < 88.8) rewardType = 'fert';
        else rewardType = 'shard';
      }
    } else { // norm
      const roll = Math.random() * 100;
      if (roll < 5) rewardType = 'unique';
      else if (roll < 47.5) rewardType = 'seed';
      else if (roll < 90) rewardType = 'fert';
      else rewardType = 'shard';
    }

    // TẦNG 2: Phẩm chất
    if (rewardType === 'unique') {
      const roll = Math.random() * 100;
      if (ticketType === 'super') {
        ctx.S.gachaPity.super++;
        const p = ctx.S.gachaPity.super;
        let legRate = 5;
        if (p > 100) legRate = 5 + (p - 100) * 0.95;
        if (p >= GACHA_SUPER_PITY) legRate = 100;

        if (roll < legRate) { preRolledRarity = 'Huyền thoại'; preRolledColor = '#ff8000'; preRolledPrice = 20000; }
        else if (roll < legRate + 50) { preRolledRarity = 'Sử thi'; preRolledColor = '#a335ee'; preRolledPrice = 8000; }
        else { preRolledRarity = 'Hiếm'; preRolledColor = '#4a90e2'; preRolledPrice = 2500; }
        
        if (preRolledRarity === 'Huyền thoại') {
          ctx.S.gachaPity.super = 0;
          if (p >= GACHA_SUPER_PITY) isPity = true;
        }
      } else if (ticketType === 'spec') {
        if (roll < 10) { preRolledRarity = 'Huyền thoại'; preRolledColor = '#ff8000'; preRolledPrice = 20000; }
        else if (roll < 40) { preRolledRarity = 'Sử thi'; preRolledColor = '#a335ee'; preRolledPrice = 8000; }
        else if (roll < 80) { preRolledRarity = 'Hiếm'; preRolledColor = '#4a90e2'; preRolledPrice = 2500; }
        else { preRolledRarity = 'Thường'; preRolledColor = '#b0bec5'; preRolledPrice = 500; }
        ctx.S.gachaPity.spec = 0; 
      } else {
        if (roll < 1) { preRolledRarity = 'Huyền thoại'; preRolledColor = '#ff8000'; preRolledPrice = 20000; }
        else if (roll < 5) { preRolledRarity = 'Sử thi'; preRolledColor = '#a335ee'; preRolledPrice = 8000; }
        else if (roll < 25) { preRolledRarity = 'Hiếm'; preRolledColor = '#4a90e2'; preRolledPrice = 2500; }
        else if (roll < 60) { preRolledRarity = 'Thường'; preRolledColor = '#b0bec5'; preRolledPrice = 500; }
        else { preRolledRarity = 'Rác'; preRolledColor = '#9e9e9e'; preRolledPrice = 100; }
      }
    }

    rollsPlan.push({ type: rewardType, isPity, preRolledRarity, preRolledColor, preRolledPrice, ticketType });
  }

  // Thu thập các unique items để chạy AI song song (Max concurrency 3)
  const uniquePlans = rollsPlan.filter(r => r.type === 'unique');
  let uniqueCount = 0;

  const uniqueResults = await pMap(uniquePlans, async (plan) => {
    uniqueCount++;
    if (updateLoadingText) {
      updateLoadingText(uniquePlans.length > 1 ? `Đang tỉnh thức bảo vật... (${uniqueCount}/${uniquePlans.length})` : 'Đang tỉnh thức bảo vật...');
    }
    const item = await generateUniqueItem({ rarity: plan.preRolledRarity, color: plan.preRolledColor, sellPrice: plan.preRolledPrice, ticketType: plan.ticketType });
    return {
      type: 'unique',
      name: item.name,
      rarity: item.rarity,
      color: item.color,
      icon: spriteSVG(item.sp, 48),
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
      const amount = (ticketType === 'spec') ? 5 : 2;
      ctx.S.seeds[sid] = (ctx.S.seeds[sid] || 0) + amount;
      finalResults.push({ type: 'seed', name: `Hạt ${CROPS[sid].name} ×${amount}`, rarity: 'Thường', color: '#6cb457', icon: spriteSVG(CROPS[sid].sp, 32) });
    } else if (plan.type === 'fert') {
      const fid = fertIds[Math.floor(Math.random() * fertIds.length)];
      const amount = (ticketType === 'spec') ? 3 : 1;
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
  const superTicket = ctx.S.tickets?.super || 0;
  const specPity = ctx.S.gachaPity?.spec || 0;
  const superPity = ctx.S.gachaPity?.super || 0;

  let specRate = 10;
  if (specPity >= 71) specRate = 10 + (specPity - 70) * 3;
  if (specPity >= GACHA_SPEC_PITY) specRate = 100;
  
  let superRate = 5;
  if (superPity > 100) superRate = 5 + (superPity - 100) * 0.95;
  if (superPity >= GACHA_SUPER_PITY) superRate = 100;

  const bodyHTML = `
    <div class="gacha-wrap" style="text-align:center; position:relative; overflow:hidden; padding:4px 0;">
      <!-- Header Thông tin vé & Mua nhanh -->
      <div style="display:flex; flex-direction:column; align-items:center; background:rgba(0,0,0,0.04); padding:8px 12px; border-radius:8px; margin-bottom:12px; gap:8px;">
        <div style="font-weight:bold; font-size:13px; color:#3a2c22; text-align:center; display:flex; flex-wrap:wrap; justify-content:center; gap:6px;">
          <span>Thường: <span id="gachaNormCount" style="color:#4a7a26;">${normTicket}</span></span> <span style="color:#ccc;">|</span>
          <span>Đặc Biệt: <span id="gachaSpecCount" style="color:#8a2acc;">${specTicket}</span></span> <span style="color:#ccc;">|</span>
          <span>Siêu Cường: <span id="gachaSuperCount" style="color:#ff4500;">${superTicket}</span></span>
        </div>
        <div style="display:flex; gap:6px; flex-wrap:wrap; justify-content:center;">
          <span class="buy" id="gachaBuyNormBtn" style="padding:4px 8px; font-size:11px;">+ Vé Thường (1000G)</span>
          <span class="buy" id="gachaBuySpecBtn" style="padding:4px 8px; font-size:11px; background:#8a5cc0; border:1px solid #6a4a9a; color:#fff; text-shadow:0 1px 1px rgba(0,0,0,0.3);">+ Vé Đặc biệt (5000G)</span>
          <span class="buy" id="gachaBuySuperBtn" style="padding:4px 8px; font-size:11px; background:#ff4500; border:1px solid #cc3700; color:#fff; text-shadow:0 1px 1px rgba(0,0,0,0.3);">+ Vé Siêu cường (250KG)</span>
        </div>
        <div style="margin-top:4px;">
          <span class="buy" id="gachaRatesBtn" style="padding:4px 12px; font-size:12px; background:#4a8098; border:1px solid #2a6078; color:#fff; display:inline-flex; align-items:center; justify-content:center; gap:6px;">${spriteSVG('gachaRatesIcon', 18)} Xem Tỉ Lệ Gachapon</span>
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
          <div style="display:flex; justify-content:space-between; font-size:11px; font-weight:bold; color:#ff4500; margin-bottom:3px;">
            <span>Bảo hiểm Siêu Cường <span style="font-weight:normal; color:#d86020;">(Tỉ lệ nổ Huyền thoại: <span id="gachaSuperRateTxt">${superRate % 1 === 0 ? superRate : superRate.toFixed(2)}</span>%)</span></span>
            <span><span id="gachaSuperPityTxt">${superPity}</span>/${GACHA_SUPER_PITY}</span>
          </div>
          <div style="background:#e0e0e0; height:8px; border-radius:4px; overflow:hidden;">
            <div id="gachaSuperPityBar" style="background:linear-gradient(90deg, #ff8000, #ff4500); height:100%; width:${Math.min(100, (superPity / GACHA_SUPER_PITY) * 100)}%; transition:width 0.3s;"></div>
          </div>
        </div>

        <div>
          <div style="display:flex; justify-content:space-between; font-size:11px; font-weight:bold; color:#8a2acc; margin-bottom:3px;">
            <span>Bảo hiểm Quay Đặc Biệt <span style="font-weight:normal; color:#8e60b8;">(Tỉ lệ nổ Bảo vật: <span id="gachaSpecRateTxt">${specRate}</span>%)</span></span>
            <span><span id="gachaSpecPityTxt">${specPity}</span>/${GACHA_SPEC_PITY}</span>
          </div>
          <div style="background:#e0e0e0; height:8px; border-radius:4px; overflow:hidden;">
            <div id="gachaSpecPityBar" style="background:linear-gradient(90deg, #a335ee, #ff8000); height:100%; width:${Math.min(100, (specPity / GACHA_SPEC_PITY) * 100)}%; transition:width 0.3s;"></div>
          </div>
        </div>

        <!-- Mảnh Huyền Thoại -->
        <div style="display:flex; align-items:center; justify-content:space-between; background:rgba(255,128,0,0.1); padding:6px 8px; border-radius:6px; border:1px solid rgba(255,128,0,0.3); margin-top:4px;">
          <div style="display:flex; align-items:center; gap:6px; font-size:12px; font-weight:bold; color:#cc5200;">
            ${spriteSVG('legendShard', 16)} Mảnh Huyền Thoại: <span id="gachaLegendCount">${ctx.S.shards?.legend || 0}</span>/10
          </div>
          <span class="buy" id="gachaExchangeLegendBtn" style="padding:4px 10px; font-size:11px; background:${(ctx.S.shards?.legend || 0) >= 10 ? 'linear-gradient(90deg, #ff8000, #ff4500)' : '#ccc'}; border:1px solid ${(ctx.S.shards?.legend || 0) >= 10 ? '#cc3700' : '#aaa'}; color:#fff; pointer-events:${(ctx.S.shards?.legend || 0) >= 10 ? 'auto' : 'none'};">Đổi Bảo Vật</span>
        </div>
      </div>

      <!-- Các Nút Quay -->
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
        <span class="buy" id="gachaRollNorm1" style="padding:10px 0; font-size:13px; font-weight:bold; background:#6cb457; border:1px solid #4e903a; color:#fff; text-shadow:0 1px 2px rgba(0,0,0,0.3); text-align:center; border-radius:6px;">Quay Thường ×1</span>
        <span class="buy" id="gachaRollNorm10" style="padding:10px 0; font-size:13px; font-weight:bold; background:#4e903a; border:1px solid #3c702c; color:#fff; text-shadow:0 1px 2px rgba(0,0,0,0.3); text-align:center; border-radius:6px;">Quay Thường ×10</span>
        <span class="buy" id="gachaRollSpec1" style="padding:10px 0; font-size:13px; font-weight:bold; background:#a335ee; border:1px solid #8a2acc; color:#fff; text-shadow:0 1px 2px rgba(0,0,0,0.3); text-align:center; border-radius:6px;">Quay Đặc Biệt ×1</span>
        <span class="buy" id="gachaRollSpec10" style="padding:10px 0; font-size:13px; font-weight:bold; background:#8a2acc; border:1px solid #6a1aa3; color:#fff; text-shadow:0 1px 2px rgba(0,0,0,0.3); text-align:center; border-radius:6px;">Quay Đặc Biệt ×10</span>
        <span class="buy" id="gachaRollSuper1" style="padding:10px 0; font-size:13px; font-weight:bold; background:linear-gradient(90deg, #ff8000, #ff4500); border:1px solid #cc3700; color:#fff; text-shadow:0 1px 2px rgba(0,0,0,0.3); text-align:center; border-radius:6px;">Quay Siêu Cường ×1</span>
        <span class="buy" id="gachaRollSuper10" style="padding:10px 0; font-size:13px; font-weight:bold; background:linear-gradient(90deg, #cc3700, #9e2a00); border:1px solid #731e00; color:#fff; text-shadow:0 1px 2px rgba(0,0,0,0.3); text-align:center; border-radius:6px;">Quay Siêu Cường ×10</span>
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
        <div id="gachaShowcaseCard" style="background:#fff; border-radius:12px; padding:20px; box-shadow:0 0 20px rgba(255,128,0,0.5); width:100%; max-width:300px; max-height:85vh; display:flex; flex-direction:column; position:relative; overflow:hidden;">
          <div id="gachaShowcaseRarity" style="font-size:12px; font-weight:bold; margin-bottom:10px; text-transform:uppercase; flex:none;"></div>
          <div id="gachaShowcaseIcon" style="margin:10px auto; display:flex; justify-content:center; flex:none;"></div>
          <div id="gachaShowcaseName" style="font-size:18px; font-weight:bold; margin:15px 0 8px; color:#3a2c22; flex:none;"></div>
          <div id="gachaShowcaseDesc" style="font-size:12px; color:#555; overflow-y:auto; flex:1; padding-right:4px;"></div>
          <span class="buy" id="gachaShowcaseNextBtn" style="margin-top:20px; padding:8px 24px; font-size:13px; background:#a335ee; border-color:#8a2acc; color:#fff; flex:none; align-self:center;">Tiếp tục</span>
        </div>
      </div>

      <!-- Loading Overlay (Chờ AI Tỉnh thức) -->
      <div id="gachaLoadingOverlay" style="display:none; position:absolute; inset:0; background:rgba(255,255,255,0.85); z-index:30; flex-direction:column; justify-content:center; align-items:center; border-radius:8px;">
        <div style="width:48px; height:48px; animation: gachaShake 0.5s infinite alternate;">${spriteSVG('gachapon', 48)}</div>
        <div id="gachaLoadingText" style="margin-top:12px; font-size:13px; font-weight:bold; color:#5a3f78;">Đang quay...</div>
      </div>
    </div>
  `;

  openModal('Máy Gachapon', bodyHTML);

  const updateCounts = () => {
    initGachaState();
    const elN = All.$id('gachaNormCount'); if (elN) elN.textContent = String(ctx.S.tickets.norm);
    const elS = All.$id('gachaSpecCount'); if (elS) elS.textContent = String(ctx.S.tickets.spec);
    const elSup = All.$id('gachaSuperCount'); if (elSup) elSup.textContent = String(ctx.S.tickets.super);
    const pS = ctx.S.gachaPity.spec, pSup = ctx.S.gachaPity.super;
    const txtSup = All.$id('gachaSuperPityTxt'); if (txtSup) txtSup.textContent = String(pSup);
    const txtS = All.$id('gachaSpecPityTxt'); if (txtS) txtS.textContent = String(pS);
    const barSup = All.$id('gachaSuperPityBar'); if (barSup) barSup.style.width = Math.min(100, (pSup / GACHA_SUPER_PITY) * 100) + '%';
    const barS = All.$id('gachaSpecPityBar'); if (barS) barS.style.width = Math.min(100, (pS / GACHA_SPEC_PITY) * 100) + '%';

    let sR = 10;
    if (pS >= 71) sR = 10 + (pS - 70) * 3;
    if (pS >= GACHA_SPEC_PITY) sR = 100;
    const elSpecR = All.$id('gachaSpecRateTxt'); if (elSpecR) elSpecR.textContent = String(sR);

    let supR = 5;
    if (pSup > 100) supR = 5 + (pSup - 100) * 0.95;
    if (pSup >= GACHA_SUPER_PITY) supR = 100;
    const elSupR = All.$id('gachaSuperRateTxt'); if (elSupR) elSupR.textContent = String(supR % 1 === 0 ? supR : supR.toFixed(2));
    
    const legendCount = ctx.S.shards?.legend || 0;
    const elLegCount = All.$id('gachaLegendCount'); if (elLegCount) elLegCount.textContent = String(legendCount);
    const btnExLeg = All.$id('gachaExchangeLegendBtn');
    if (btnExLeg) {
      if (legendCount >= 10) {
        btnExLeg.style.background = 'linear-gradient(90deg, #ff8000, #ff4500)';
        btnExLeg.style.borderColor = '#cc3700';
        btnExLeg.style.pointerEvents = 'auto';
      } else {
        btnExLeg.style.background = '#ccc';
        btnExLeg.style.borderColor = '#aaa';
        btnExLeg.style.pointerEvents = 'none';
      }
    }
  };

  All.$id('gachaBuyNormBtn')?.addEventListener('click', () => {
    openBuyDlg('ticket', 'norm', 'gacha');
  });

  All.$id('gachaBuySpecBtn')?.addEventListener('click', () => {
    openBuyDlg('ticket', 'spec', 'gacha');
  });

  All.$id('gachaBuySuperBtn')?.addEventListener('click', () => {
    openBuyDlg('ticket', 'super', 'gacha');
  });

  All.$id('gachaRatesBtn')?.addEventListener('click', () => {
    openGachaRatesModal();
  });

  const triggerGridResult = (ticketType, count, results) => {
    const overlay = All.$id('gachaResultOverlay');
    const animSlot = All.$id('gachaCapsuleAnim');
    const title = All.$id('gachaResultTitle');
    const grid = All.$id('gachaResultGrid');

    if (!overlay || !animSlot || !title || !grid) return;
    const capsuleIcon = ticketType === 'super' ? spriteSVG('gachaCapsuleSpec', 48) : (ticketType === 'spec' ? spriteSVG('gachaCapsuleSpec', 48) : spriteSVG('gachaCapsuleNorm', 48));
    animSlot.innerHTML = capsuleIcon;
    animSlot.style.animation = 'gachaDrop 0.5s ease-out';

    const tName = ticketType === 'super' ? 'Siêu cường' : (ticketType === 'spec' ? 'Đặc biệt' : 'Thường');
    title.textContent = `Kết quả Quay ${tName} ×${count}`;

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

  const doRoll = async (ticketType, count) => {
    const machine = All.$id('gachaMachineSprite');
    const loadOverlay = All.$id('gachaLoadingOverlay');
    const loadText = All.$id('gachaLoadingText');

    initGachaState();
    const haveTickets = ctx.S.tickets?.[ticketType] || 0;
    
    if (haveTickets < count) {
      const missing = count - haveTickets;
      const priceMap = { norm: 1000, spec: 5000, super: 250000 };
      const ticketPrice = priceMap[ticketType] || 0;
      const cost = missing * ticketPrice;
      const tName = ticketType === 'super' ? 'Siêu cường' : (ticketType === 'spec' ? 'Đặc biệt' : 'Thường');
      
      if (ctx.S.coins >= cost) {
        const confirmHTML = `
          <div style="text-align: center; padding: 20px;">
            <div style="font-size: 18px; font-weight: bold; color: #8a5cc0; margin-bottom: 10px;">Không đủ vé</div>
            <div style="font-size: 14px; margin-bottom: 15px; color: #3a2c22;">Bạn có muốn dùng <b>${cost.toLocaleString()} G</b> để quay ${tName} ×${count} không?</div>
            <div style="font-size: 12px; color: #7a5c38; margin-bottom: 20px;">Mua bù ${missing} vé ${tName} (${ticketPrice.toLocaleString()} G/vé) · vàng hiện có ${ctx.S.coins.toLocaleString()} G</div>
            <div style="display: flex; justify-content: center; gap: 10px;">
              <span class="buy" id="btnCancelRoll" style="background: #e3d5c8; color: #3a2c22; min-width: 80px; text-align: center;">Thôi</span>
              <span class="buy" id="btnConfirmRoll" style="min-width: 140px; text-align: center;">Dùng vàng & quay</span>
            </div>
          </div>
        `;
        openModal('Máy Gachapon', confirmHTML);
        
        All.$id('btnCancelRoll').addEventListener('click', () => {
          openGachaModal();
        });
        
        All.$id('btnConfirmRoll').addEventListener('click', () => {
          if (ctx.S.coins < cost) return toast('Không đủ vàng');
          ctx.S.coins -= cost;
          ctx.S.tickets[ticketType] = (ctx.S.tickets[ticketType] || 0) + missing;
          save();
          renderStatus();
          openGachaModal();
          setTimeout(() => doRoll(ticketType, count), 50);
        });
        return;
      } else {
        toast(`Cần ${count} Vé ${tName} (thiếu ${missing} vé, mua mất ${cost.toLocaleString()} G nhưng bạn không đủ tiền)!`);
        return;
      }
    }

    if (machine) machine.style.animation = 'gachaShake 0.2s ease infinite';
    if (loadOverlay) loadOverlay.style.display = 'flex';
    if (loadText) loadText.textContent = 'Đang quay...';

    const results = await executeGachaRoll(ticketType, count, (txt) => {
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
            triggerGridResult(ticketType, count, results);
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
        triggerGridResult(ticketType, count, results);
      }
    }
  };

  All.$id('gachaRollNorm1')?.addEventListener('click', () => doRoll('norm', 1));
  All.$id('gachaRollNorm10')?.addEventListener('click', () => doRoll('norm', 10));
  All.$id('gachaRollSpec1')?.addEventListener('click', () => doRoll('spec', 1));
  All.$id('gachaRollSpec10')?.addEventListener('click', () => doRoll('spec', 10));
  All.$id('gachaRollSuper1')?.addEventListener('click', () => doRoll('super', 1));
  All.$id('gachaRollSuper10')?.addEventListener('click', () => doRoll('super', 10));
  All.$id('gachaExchangeLegendBtn')?.addEventListener('click', () => doExchangeLegend());
}

async function doExchangeLegend() {
  if (!ctx.S.shards || !ctx.S.shards.legend || ctx.S.shards.legend < 10) return;
  
  ctx.S.shards.legend -= 10;
  save();
  
  All.$id('gachaLegendCount').innerText = ctx.S.shards.legend;
  if (ctx.S.shards.legend < 10) {
    const btn = All.$id('gachaExchangeLegendBtn');
    if (btn) {
      btn.style.background = '#ccc';
      btn.style.borderColor = '#aaa';
      btn.style.pointerEvents = 'none';
    }
  }
  
  if (updateLoadingText) updateLoadingText('Đang đổi Mảnh Huyền Thoại...');
  const item = await generateUniqueItem({ rarity: 'Huyền thoại', color: '#ff8000', sellPrice: 20000, ticketType: 'exchange' });
  
  const results = [{ type: 'unique', name: item.name, rarity: item.rarity, color: item.color, sp: item.sp, count: 1 }];
  showGachaResult(results);
}


export function openGachaRatesModal() {
  const bodyHTML = `
    <div style='padding:4px; text-align:center;'>
      <h3 style='margin-top:0; color:#3a2c22; font-size:14px; margin-bottom:12px;'>Bảng Tỉ Lệ Rơi Đồ Gachapon</h3>
      
      <div style='font-size:12px; font-weight:bold; color:#5a3f78; margin-bottom:4px; text-align:left;'>1. Tỉ lệ Loại Vật Phẩm</div>
      <table style='width:100%; border-collapse:collapse; font-size:11px; margin-bottom:12px; background:#fff; border-radius:4px; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,0.1); color:#3a2c22;'>
        <thead>
          <tr style='background:#f0e6d2; color:#3a2c22; text-align:center;'>
            <th style='padding:6px; border-bottom:1px solid #dfd3c3;'>Loại</th>
            <th style='padding:6px; border-bottom:1px solid #dfd3c3;'>Vé Thường</th>
            <th style='padding:6px; border-bottom:1px solid #dfd3c3;'>Vé Đặc Biệt</th>
            <th style='padding:6px; border-bottom:1px solid #dfd3c3;'>Vé Siêu Cấp</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style='padding:6px; border-bottom:1px solid #f0e6d2; font-weight:bold; color:#4a7a26;'>Hạt giống</td>
            <td style='padding:6px; border-bottom:1px solid #f0e6d2;'>42.5%</td>
            <td style='padding:6px; border-bottom:1px solid #f0e6d2;'>40% <span style="color:#777;">(x5)</span></td>
            <td style='padding:6px; border-bottom:1px solid #f0e6d2;'>0%</td>
          </tr>
          <tr>
            <td style='padding:6px; border-bottom:1px solid #f0e6d2; font-weight:bold; color:#e8963a;'>Phân bón</td>
            <td style='padding:6px; border-bottom:1px solid #f0e6d2;'>42.5%</td>
            <td style='padding:6px; border-bottom:1px solid #f0e6d2;'>40% <span style="color:#777;">(x3)</span></td>
            <td style='padding:6px; border-bottom:1px solid #f0e6d2;'>0%</td>
          </tr>
          <tr>
            <td style='padding:6px; border-bottom:1px solid #f0e6d2; font-weight:bold; color:#4a8098;'>Mảnh vỡ (Sao/Lăng quang)</td>
            <td style='padding:6px; border-bottom:1px solid #f0e6d2;'>10%</td>
            <td style='padding:6px; border-bottom:1px solid #f0e6d2;'>10%</td>
            <td style='padding:6px; border-bottom:1px solid #f0e6d2;'>0%</td>
          </tr>
          <tr>
            <td style='padding:6px; border-bottom:1px solid #f0e6d2; font-weight:bold; color:#ff4500;'>Bảo vật Độc nhất (AI)</td>
            <td style='padding:6px; border-bottom:1px solid #f0e6d2;'>5%</td>
            <td style='padding:6px; border-bottom:1px solid #f0e6d2;'>10%</td>
            <td style='padding:6px; border-bottom:1px solid #f0e6d2;'>100%</td>
          </tr>
        </tbody>
      </table>

      <div style='font-size:12px; font-weight:bold; color:#5a3f78; margin-bottom:4px; text-align:left;'>2. Phẩm chất (khi trúng Bảo Vật Độc Nhất)</div>
      <table style='width:100%; border-collapse:collapse; font-size:11px; margin-bottom:12px; background:#fff; border-radius:4px; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,0.1); color:#3a2c22;'>
        <thead>
          <tr style='background:#f0e6d2; color:#3a2c22; text-align:center;'>
            <th style='padding:6px; border-bottom:1px solid #dfd3c3;'>Độ hiếm</th>
            <th style='padding:6px; border-bottom:1px solid #dfd3c3;'>Vé Thường</th>
            <th style='padding:6px; border-bottom:1px solid #dfd3c3;'>Vé Đặc Biệt</th>
            <th style='padding:6px; border-bottom:1px solid #dfd3c3;'>Vé Siêu Cấp</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style='padding:6px; border-bottom:1px solid #f0e6d2; font-weight:bold; color:#ff8000;'>Huyền thoại</td>
            <td style='padding:6px; border-bottom:1px solid #f0e6d2;'>1%</td>
            <td style='padding:6px; border-bottom:1px solid #f0e6d2;'>10%</td>
            <td style='padding:6px; border-bottom:1px solid #f0e6d2;'>5%</td>
          </tr>
          <tr>
            <td style='padding:6px; border-bottom:1px solid #f0e6d2; font-weight:bold; color:#a335ee;'>Sử thi</td>
            <td style='padding:6px; border-bottom:1px solid #f0e6d2;'>4%</td>
            <td style='padding:6px; border-bottom:1px solid #f0e6d2;'>30%</td>
            <td style='padding:6px; border-bottom:1px solid #f0e6d2;'>50%</td>
          </tr>
          <tr>
            <td style='padding:6px; border-bottom:1px solid #f0e6d2; font-weight:bold; color:#4a90e2;'>Hiếm</td>
            <td style='padding:6px; border-bottom:1px solid #f0e6d2;'>20%</td>
            <td style='padding:6px; border-bottom:1px solid #f0e6d2;'>40%</td>
            <td style='padding:6px; border-bottom:1px solid #f0e6d2;'>45%</td>
          </tr>
          <tr>
            <td style='padding:6px; border-bottom:1px solid #f0e6d2; font-weight:bold; color:#b0bec5;'>Thường</td>
            <td style='padding:6px; border-bottom:1px solid #f0e6d2;'>35%</td>
            <td style='padding:6px; border-bottom:1px solid #f0e6d2;'>20%</td>
            <td style='padding:6px; border-bottom:1px solid #f0e6d2;'>0%</td>
          </tr>
          <tr>
            <td style='padding:6px; font-weight:bold; color:#9e9e9e;'>Rác</td>
            <td style='padding:6px;'>40%</td>
            <td style='padding:6px;'>0%</td>
            <td style='padding:6px;'>0%</td>
          </tr>
        </tbody>
      </table>
      
      <div style='font-size:11px; color:#555; text-align:left; background:#fafafa; padding:8px; border-radius:4px; border:1px dashed #ccc; margin-bottom:12px;'>
        <div style='margin-bottom:4px;'><b>Cơ chế Soft-Pity (Tăng dần):</b></div>
        <div style='margin-bottom:2px;'>- Vé Đặc Biệt: Từ mốc <b>71</b>, mỗi vé tăng 3% tỉ lệ ra Bảo Vật. Đến <b>${GACHA_SPEC_PITY}</b> chắc chắn ra Bảo Vật.</div>
        <div>- Vé Siêu Cấp: Từ mốc <b>101</b>, mỗi vé tăng 0.95% tỉ lệ ra <b>Huyền Thoại</b>. Đến <b>${GACHA_SUPER_PITY}</b> chắc chắn ra Huyền Thoại.</div>
      </div>

      <span class="buy" id="gachaRatesBackBtn" style="padding:6px 16px; font-size:12px; background:#4a7a26; color:#fff; cursor:pointer;">Quay Lại Gacha</span>
    </div>
  `;
  openModal('Tỉ Lệ Gachapon', bodyHTML);
  
  All.$id('gachaRatesBackBtn')?.addEventListener('click', () => {
    openGachaModal();
  });
}

