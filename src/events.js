import { ctx, extensionName } from './store.js';
import * as All from './all.js';
import { BLOCK_PRICE_PG, WEATHERS, TEST_MODE, DAY_MS, CROPS, GROW, MIN, REGROW, FERTS, WATER_CD, REGROW_MAX, POKE_CD, TREASURE_CD, PETS_OUT_MAX, WITCH_STAY, witchGap, SNAP_EDGE, ZONE_NAME } from './data.js';
import { mulberry32, petSVG, spriteSVG, tileURI, warmUpCache, PETS, PASSES, P, LP, PET_P } from './graphics.js';

export const esc = s => String(s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
export const clampN = (x, lo, hi, dflt) => { x = Number(x); return isFinite(x) ? Math.min(hi, Math.max(lo, x)) : dflt; };
/* Cấu hình API phụ: lưu trong localStorage của host, khoá bị làm rối bằng base64, vĩnh viễn không vào cây biến (tránh rò rỉ khi xuất thẻ) */
export const SEC_LS_KEY = 'star_tavern_farm_sec';
export let SEC = { url: '', key: '', model: '', autoReset: true, resetHours: 4, wbLimit: 20000 };
try {
  const raw = window.localStorage.getItem(SEC_LS_KEY);
  if (raw) {
    const o = JSON.parse(raw);
    SEC = { url: o.url || '', key: o.key ? atob(o.key) : '', model: o.model || '',
      autoReset: o.autoReset !== false, resetHours: clampN(o.resetHours, 1, 24, 4), wbLimit: typeof o.wbLimit === 'number' ? o.wbLimit : 20000 };
  }
} catch (e) {}
export function saveSec() {
  try { window.localStorage.setItem(SEC_LS_KEY, JSON.stringify({ url: SEC.url, key: btoa(SEC.key), model: SEC.model, autoReset: SEC.autoReset, resetHours: SEC.resetHours, wbLimit: SEC.wbLimit })); } catch (e) {}
}
/* Công tắc và prompt tự điền: lưu theo từng thẻ nhân vật */
export let CS = { link: false, story: false, userPrompt: '' };
export function loadCharState() {
  try {
    const cn = charName();
    const key = 'cs_' + cn;
    const o = (ctx.extension_settings[extensionName] || {})[key] || {};
    CS = { link: !!o.link, story: !!o.story, userPrompt: o.userPrompt || '' };
  } catch (e) { CS = { link: false, story: false, userPrompt: '' }; }
}
export function saveCharState() {
  try {
    const cn = charName();
    const key = 'cs_' + cn;
    if (!ctx.extension_settings[extensionName]) ctx.extension_settings[extensionName] = {};
    ctx.extension_settings[extensionName][key] = { link: CS.link, story: CS.story, userPrompt: CS.userPrompt };
    if (ctx.saveSettingsDebounced) ctx.saveSettingsDebounced();
  } catch (e) {}
}
loadCharState();
export function charName() {
  try {
    const ctx = (window.SillyTavern && window.SillyTavern.getContext) ? window.SillyTavern.getContext() : {};
    return ctx.name2 || String(ctx.characterId || '');
  } catch (e) { return ''; }
}
/* #17: vòng đời sự kiện do bộ đếm mốc neo quản lý —— lastEventAt + resetHours quyết định hết hạn, tách rời khỏi lịch trong game */
export const eventFresh = () => ctx.S.dayEvent && ctx.S.dayEvent.who === charName() &&
  (!SEC.autoReset || now() - (ctx.S.dayEvent.at || 0) < SEC.resetHours * 60 * 60 * 1000);
export const todayEvent = () => (CS.link && eventFresh()) ? ctx.S.dayEvent.ev : null;

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
export function buildEventPrompt(worldbook) {
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
    '1. ctx.Sự kiện bắt buộc mang hương vị của thế giới này —— các danh từ về thời tiết, sản vật, yếu tố siêu nhiên… hãy cố lấy chất liệu từ world book; nhưng sự kiện chỉ ảnh hưởng việc trồng trọt, không đẩy cốt truyện. Có thể nhắc tên nhân vật trong thế giới ở phần flavor cho sinh động, nhưng tuyệt đối không được để nhân vật nói chuyện, hành động hay xảy ra tình tiết nào.\n' +
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
    (CS.userPrompt ? '\n[ctx.Sở thích tuỳ chỉnh của người chơi, ưu tiên đáp ứng, nhưng không được vượt ra ngoài phạm vi các trường]:\n' + CS.userPrompt + '\n' : '') +
    '\nTrích world book:\n' + (worldbook || '(Thế giới này tạm chưa có world book, hãy tạo một sự kiện đồng quê chung chung)')).replace('{{CROPLIST}}', cropList).replace('{{CROPCOUNT}}', String(cropList.split(', ').length));
}

export function sanitizeEvent(o) {
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
export function extractJson(raw) {                             // Móc đối tượng JSON hoàn chỉnh đầu tiên ra khỏi văn bản bất kỳ (ghép cặp theo độ sâu, bỏ qua ngoặc nằm trong chuỗi)
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
export function fallbackEvent() {
  const w = weatherOf(gameDay());
  return sanitizeEvent(w === 'Mưa nhỏ'
    ? { name: 'Mưa nhỏ', type: 'buff', time_mult: 0.9, flavor: 'Mưa nhỏ rồi, mấy cây rau uống nước vui lắm.' }
    : w === 'Nhiều mây'
      ? { name: 'Nhiều mây', type: 'neutral', flavor: 'Mây che bớt nắng, rau và bạn đều thong thả.' }
      : { name: 'Nắng', type: 'neutral', flavor: 'Nắng đẹp lắm, hợp để trồng gì đó.' });
}

export let eventPending = false;
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
      new Promise((_, rej) => window.setTimeout(() => rej(new Error('timeout')), 90000)),   // v0.8: 15 mô tả nên lượng sinh ra lớn, 30s→90s
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

async function secTest() {
  const p = All.$id('secTest');
  const ori = p.textContent;
  p.textContent = 'Đang gọi…'; p.style.pointerEvents = 'none';
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

    const res = await Promise.race([ resPromise, new Promise((_, rj) => window.setTimeout(() => rj(new Error('Timeout 10s')), 10000)) ]);
    if (res.error) throw new Error(res.error.message || JSON.stringify(res.error));
    const text = (res.choices?.[0]?.message?.content || '').trim();
    toast('Kết nối OK! AI đáp: ' + text);
  } catch (e) {
    toast('Lỗi kết nối API: ' + e.message);
  }
  p.textContent = ori; p.style.pointerEvents = '';
}

export function openSandbox() {
  const html = `
    <div style="display:flex;gap:12px;flex-wrap:wrap">
      <div style="flex:1;min-width:260px;display:flex;flex-direction:column;gap:8px">
        <div class="shead" style="margin-top:0">Tạo Sprite bằng AI</div>
        <div class="note">Nhập ý tưởng để AI xếp mã tự động. Dùng chung API ở phần cài đặt.</div>
        <div style="display:flex;gap:8px">
          <select class="inp" id="sbPalette" style="padding:6px;flex:1">
            <option value="SPRITES">Bảng màu Nông sản/Vật phẩm (P)</option>
            <option value="PETS">Bảng màu Thú cưng (PET_P)</option>
          </select>
          <select class="inp" id="sbSize" style="padding:6px;width:90px">
            <option value="16">16 x 16</option>
            <option value="24">24 x 24</option>
            <option value="32">32 x 32</option>
          </select>
        </div>
        <textarea class="inp" id="sbPrompt" placeholder="Nhập ý tưởng pixel art (gõ tiếng Việt cũng được)..." style="height:60px"></textarea>
        <div style="display:flex;gap:8px;align-items:center">
          <span class="buy" id="sbGenerate">✨ Tạo bằng AI</span>
          <span class="buy plain" id="sbPayloadBtn" style="display:none;padding:4px 8px;font-size:12px">🔍 Payload</span>
          <span id="sbStatus" style="font-size:12px;color:var(--accFg)"></span>
        </div>
        <textarea class="inp" id="sbPayloadOut" style="display:none;height:120px;font-size:11px;font-family:monospace;margin-top:4px" readonly></textarea>
        <div class="shead">Mã Pixel</div>
        <div class="note">Dấu . là trong suốt. Dán hoặc sửa mảng JSON vào đây để xem thử trên bảng vẽ.</div>
        <textarea class="inp" id="sbCode" style="height:200px;font-family:monospace;white-space:pre"></textarea>
      </div>
      <div style="width:256px;display:flex;flex-direction:column;gap:8px">
        <div class="shead" style="margin-top:0">Bản xem trước</div>
        <canvas id="sbCanvas" width="256" height="256" style="background: repeating-conic-gradient(#dfdfdf 0% 25%, #ffffff 0% 50%) 0 0 / 16px 16px; image-rendering:pixelated; border:2px solid var(--st-border-color); border-radius:4px; width:100%"></canvas>
      </div>
    </div>
  `;
  openModal('Xưởng Chế Tác', html);

  const ta = All.$id('sbCode');
  const sel = All.$id('sbPalette');
  const sizeSel = All.$id('sbSize');
  const ctx = All.$id('sbCanvas').getContext('2d');
  
  function render() {
    const isPet = sel.value === 'PETS';
    const palette = isPet ? PET_P : P;
    const size = parseInt(sizeSel.value) || 16;
    
    const canvasEl = All.$id('sbCanvas');
    if (canvasEl.width !== size) {
      canvasEl.width = size;
      canvasEl.height = size;
    }
    ctx.clearRect(0, 0, size, size);
    
    const lines = ta.value.split('\n').map(l => l.trim().replace(/['",\[\]]/g, '')).filter(l => l.length > 0);
    for (let y = 0; y < Math.min(size, lines.length); y++) {
      const row = lines[y];
      for (let x = 0; x < Math.min(size, row.length); x++) {
        const char = row[x];
        if (char !== '.') {
          const color = palette[char];
          if (color && typeof color === 'string') { // exclude gradients for now
            ctx.fillStyle = color;
            ctx.fillRect(x, y, 1, 1);
          }
        }
      }
    }
  }

  let renderTimeout;
  function debouncedRender() {
    clearTimeout(renderTimeout);
    renderTimeout = setTimeout(render, 150);
  }

  ta.addEventListener('input', debouncedRender);
  sel.addEventListener('change', render);
  sizeSel.addEventListener('change', render);

  All.$id('sbPayloadBtn').addEventListener('click', () => {
    const out = All.$id('sbPayloadOut');
    out.style.display = out.style.display === 'none' ? 'block' : 'none';
  });

  All.$id('sbGenerate').addEventListener('click', async () => {
    const p = All.$id('sbPrompt').value.trim();
    if (!p) return toast('Vui lòng nhập ý tưởng!');
    if (!SEC.url) return toast('Vui lòng cấu hình API trong Cài đặt trước!');
    
    All.$id('sbGenerate').style.pointerEvents = 'none';
    All.$id('sbGenerate').style.opacity = '0.5';
    All.$id('sbStatus').textContent = 'Đang gọi AI...';
    
    try {
      const isPet = sel.value === 'PETS';
      const palette = isPet ? PET_P : P;
      // Filter out gradient objects, only send simple colors
      const simpleColors = Object.entries(palette).filter(e => typeof e[1] === 'string');
      const paletteStr = simpleColors.map(([k, v]) => `${k}: ${v}`).join(', ');
      
      const size = parseInt(sizeSel.value) || 16;
      const sysPrompt = `Bạn là một chuyên gia thiết kế Pixel Art (${size}x${size}). Nhiệm vụ của bạn là vẽ một đồ vật dựa trên yêu cầu, và BẮT BUỘC chỉ được dùng các mã ký tự trong Bảng màu sau đây.

BẢNG MÀU CHO PHÉP (Ký tự: Mã màu Hex):
${paletteStr}

HƯỚNG DẪN TƯ DUY (Bắt buộc phải có thẻ <thinking> trước khi xuất mã):
Để vẽ pixel art hoàn hảo, sắc nét và không bị méo lệch, hãy tuân thủ nghiêm ngặt các bước sau:
1. Phân tích Bố cục & Hình khối: Lựa chọn góc độ đặt vật thể (vd: vũ khí nên đặt chéo). Nếu vẽ vật thể tròn/cân xứng, hãy tính toán sao cho nửa trái và nửa phải khớp nhau. Nhớ rằng khung ${size}x${size} không có tâm 1 pixel (tâm nằm giữa cột ${size/2 - 1} và ${size/2}).
2. Quy hoạch Màu sắc (Palette): Chọn ký tự làm màu Viền (bắt buộc bao quanh vật thể), màu Tối (Shadow) cho hướng khuất sáng, màu ctx.Sáng (Highlight) cho hướng đón sáng, và màu Nền (Base). TUYỆT ĐỐI KHÔNG chế ra ký tự ngoài Bảng màu.
3. Hình dáng (Shape & Texture): Tránh làm các khối màu bị vuông vức, thẳng đuột. ctx.Sử dụng các nét lượn để tạo hình dáng tự nhiên.
4. Ánh xạ & ĐẾM KÝ TỰ (Rất quan trọng): Khi phác thảo từng dòng (từ dòng 0 đến ${size - 1}), BẠN PHẢI ĐẾM CHÍNH XÁC số lượng ký tự. 
 - Khung canvas là ${size}x${size}. Do đó, một dòng CHỈ ĐƯỢC PHÉP dài đúng ${size} ký tự.
 - Ví dụ một dòng trống hợp lệ: "${'.'.repeat(size)}"
 - Nếu bạn tạo ra dòng có ${size + 1} hoặc ${size - 1} ký tự, hình sẽ bị cắt xén và méo mó.

QUY TẮC ĐẦU RA BẮT BUỘC:
- Sau khi đóng thẻ </thinking>, CHỈ ĐƯỢC XUẤT 1 khối mã \`\`\`json chứa mảng gồm ĐÚNG ${size} chuỗi.
- KIỂM TRA LẠI: Mỗi chuỗi đại diện cho 1 hàng và PHẢI DÀI CHÍNH XÁC ${size} KÝ TỰ. Không hơn không kém!
- Dùng dấu chấm '.' cho pixel trong suốt.
- TUYỆT ĐỐI không dùng ký tự lạ ngoài dấu '.' và các ký tự Bảng màu.`;

      const reqBody = {
        model: SEC.model,
        messages: [
          { role: 'system', content: sysPrompt },
          { role: 'user', content: 'Vẽ: ' + p }
        ]
      };

      All.$id('sbPayloadOut').value = JSON.stringify(reqBody, null, 2);
      All.$id('sbPayloadBtn').style.display = 'inline-block';

      const res = await fetch(SEC.url.replace(/\/+$/, '') + '/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(SEC.key ? { Authorization: 'Bearer ' + SEC.key } : {}) },
        body: JSON.stringify(reqBody)
      });
      
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content || '';
      
      // Trích xuất JSON mảng chuỗi mạnh mẽ hơn để tránh bắt nhầm ngoặc vuông trong phần thinking
      let jsonStr = '';
      const codeMatch = content.match(/```(?:json)?\s*(\[[\s\ctx.S]*?\])\s*```/i);
      if (codeMatch) {
        jsonStr = codeMatch[1];
      } else {
        const arrMatch = content.match(/\[\s*"(?:[^"\\]|\\.)*"(?:\s*,\s*"(?:[^"\\]|\\.)*")*\s*\]/);
        jsonStr = arrMatch ? arrMatch[0] : (content.match(/\[[\s\ctx.S]*?\]/) || [''])[0];
      }
      
      if (jsonStr) {
        ta.value = jsonStr.trim();
        render();
        All.$id('sbStatus').textContent = 'Hoàn tất!';
      } else {
        throw new Error('AI không trả về mảng JSON');
      }
    } catch (e) {
      console.error(e);
      All.$id('sbStatus').textContent = 'Lỗi!';
      toast('Lỗi AI: ' + e.message);
    } finally {
      All.$id('sbGenerate').style.pointerEvents = '';
      All.$id('sbGenerate').style.opacity = '1';
    }
  });
}

export function applyDayEvent(ev, source, reason) {
  const d = gameDay();
  ctx.S.dayEvent = { day: d, at: now(), who: charName(), ev, source, reason: reason || '' };   // at = mốc neo tính giờ, gieo lại thủ công cũng dời theo
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
      new Promise((_, rej) => window.setTimeout(() => rej(new Error('Quá thời gian chờ (20s)')), 20000)),
    ]);
    
    if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));
    const raw = data.choices && data.choices[0] && data.choices[0].message ? String(data.choices[0].message.content) : '';
    toast('Kết nối thành công: ' + raw.trim().slice(0, 20));
  } catch (e) { toast('Kết nối thất bại: ' + ((e && e.message) || e)); }
}

/* #53: lấy danh sách model (API /models) —— dropdown nội tuyến, chọn xong điền thẳng vào ô model */
async function fetchModelList() {
  const url = All.$id('secUrl').value.trim(), key = All.$id('secKey').value.trim();
  const drop = All.$id('modelDrop');
  if (!url) return toast('Hãy điền địa chỉ API trước');
  if (drop.style.display !== 'none') { drop.style.display = 'none'; return; }   // Bấm lần nữa = thu lại
  toast('Đang lấy danh sách model…');
  try {
    const ctrl = new AbortController();
    const to = window.setTimeout(() => ctrl.abort(), 15000);
    const r = await fetch(url.replace(/\/+$/, '') + '/models', { headers: key ? { Authorization: 'Bearer ' + key } : {}, signal: ctrl.signal });
    window.clearTimeout(to);
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const d = await r.json();
    const ids = ((d && (d.data || d.models)) || []).map(m => (m && (m.id || m.model || m.name)) || '').filter(Boolean);
    if (!ids.length) throw new Error('API không trả về danh sách model');
    drop.innerHTML = ids.map(id => `<span data-mpick="${esc(id)}">${esc(id)}</span>`).join('');
    drop.style.display = 'flex';
    drop.querySelectorAll('[data-mpick]').forEach(el => el.addEventListener('click', () => {
      All.$id('secModel').value = el.dataset.mpick;
      drop.style.display = 'none';
      toast('Đã chọn: ' + el.dataset.mpick + ', nhớ bấm lưu cấu hình');
    }));
  } catch (e) { toast('Lấy danh sách thất bại: ' + ((e && e.message) || e)); }
}

/* Công tắc ②: tiêm tóm tắt vườn rau (setExtensionPrompt ở dạng bộ nhớ, không ghi vào lịch sử chat) */
export const INJECT_ID = 'star_tavern_farm_summary';
export function setInjection(text) {
  try {
    const ctx = (window.SillyTavern?.getContext?.()) || {};
    if (ctx.setExtensionPrompt) ctx.setExtensionPrompt(INJECT_ID, text || '', 1, 4);
  } catch (e) {}
}
export function updateInjection() {
  if (!CS.link || !CS.story) { setInjection(''); return; }
  const counts = {}; let ripe = 0;
  eachPage(plots => plots.forEach(p => {                // v0.8: tóm tắt gộp cả ba trang
    const c = p.crop; if (!c) return;
    counts[c.id] = (counts[c.id] || 0) + 1;
    if (now() >= c.matureAt) ripe++;
  }));
  const field = Object.keys(counts).map(id => CROPS[id].name + '×' + counts[id]).join(', ') || 'đang để trống';
  const bagTxt = Object.keys(ctx.S.bag).map(k => {
    const d = mutDescOf(k);
    return '  + ' + bagName(k) + ' ×' + ctx.S.bag[k] + (d ? ' (' + d + ')' : '');
  }).join('\n');
  const ev = todayEvent();
  
  const takeoutNoteStr = (function () {
    takeoutNote = (takeoutNote || []).filter(t => now() < t.until);
    if (!takeoutNote.length) return '';
    return `\n\n【QUAN TRỌNG: HÀNH ĐỘNG VỪA XẢY RA】\nNgười chơi vừa lấy ${takeoutNote.map(t => t.txt).join(', ')} ra khỏi balo vườn rau, hẳn là định dùng/tặng trong cốt truyện. Hãy tiếp nhận một cách tự nhiên; phần trong ngoặc là hiệu ứng của vật phẩm đó, hãy lấy đó làm chuẩn và có thể sáng tạo thêm trong chừng mực.`;
  })();

  const promptText = `【Vườn rau nhỏ của người chơi】
Người chơi đang trồng một mảnh vườn rau thư giãn trên giao diện SillyTavern (lối chơi tiện ích, tồn tại song song với cốt truyện).
Tình trạng hiện tại:
- Đang trồng: ${field || 'Đất trống'}${ripe ? ` (có ${ripe} cây đã chín chờ thu)` : ''}
${bagTxt ? '- Nông sản tích trữ:\n' + bagTxt : '- Nông sản tích trữ: Trống'}
${ev && ev.flavor ? `- ctx.Sự kiện hôm nay: ${ev.name} —— ${ev.flavor}` : ''}${takeoutNoteStr}

* Hướng dẫn cho AI: Nhân vật trong cốt truyện thỉnh thoảng có thể nhắc tới việc người chơi chăm vườn hay thu hoạch thế nào một cách tự nhiên, nhưng ĐỪNG thao tác vườn rau thay người chơi, cũng ĐỪNG biến vườn rau thành mạch chính của cốt truyện.`;

  setInjection(promptText);
}

/* #17+v0.6b: nhịp tim chạy nền —— cứ 60s chạy settle một lần (tính toán cục bộ, cỡ micro~mili giây): sự kiện tới hạn thì gieo lại, bé làm việc làm việc, kết toán tìm kho báu; mở hay không mở bảng đều có hiệu lực */
export const heartbeat = window.setInterval(() => {
  try { settle(); } catch (e) {}
}, 60 * 1000);

export function initEvents() {
  loadCharState();
  try {
    const chatChangedEvent = ctx.event_types?.CHAT_CHANGED;
    if (ctx.eventSource?.on && chatChangedEvent) {
      ctx.eventSource.on(chatChangedEvent, () => {
        loadCharState();
        All.renderChips(); All.renderBanner(); updateInjection();
        try { if (ctx.S && CS.link) requestDayEvent(); }
        catch (e) { console.warn('[Farm] Lỗi khi đăng ký sự kiện CHAT_CHANGED:', e); }
      });
    } else {
      console.warn('[Farm] ctx.eventSource hoặc ctx.event_types.CHAT_CHANGED không khả dụng, bỏ qua đăng ký sự kiện đổi thẻ.');
    }
  } catch (e) { console.warn('[Farm] Lỗi khi đăng ký sự kiện CHAT_CHANGED:', e); }
}
