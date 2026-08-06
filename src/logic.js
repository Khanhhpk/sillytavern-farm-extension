import { now } from './state.js';
import { ctx } from './store.js';
import * as All from './all.js';
import { BLOCK_PRICE_PG, WEATHERS, TEST_MODE, DAY_MS, CROPS, GROW, MIN, REGROW, FERTS, WATER_CD, REGROW_MAX, POKE_CD, TREASURE_CD, PETS_OUT_MAX, WITCH_STAY, witchGap, SNAP_EDGE, ZONE_NAME } from './data.js';
import { mulberry32, petSVG, spriteSVG, tileURI, warmUpCache, PETS, PASSES, P, LP, PET_P } from './graphics.js';
import { toast } from './witch.js';
import { isRain, gameDay } from './utils.js';
import { todayEvent } from './events.js';
import { curPlots, save, blockPrice, curBlocks, addBlock } from './state.js';
import { renderPlots, renderAll, renderStatus } from './render.js';
import { plotEmote } from './ui.js';
import { openPanel } from './shop.js';

/* ---------- Logic game ---------- */
export const fmtDur = m => m < 60 ? m + ' phút' : (m % 60 === 0 ? (m / 60) + ' giờ' : (m / 60).toFixed(1) + ' giờ');
export function growMs(cropId) { return TEST_MODE ? GROW : (CROPS[cropId]?.grow || 30) * MIN; }
export function regrowMs(cropId) { const c = CROPS[cropId] || {}; return TEST_MODE ? REGROW : (c.regrowM || Math.round((c.grow || 30) * 0.6)) * MIN; }
export function plant(pi, cropId) {
  if ((ctx.S.seeds[cropId] || 0) <= 0) return toast('Hết hạt giống này rồi');
  let realId = cropId;
  if (cropId === 'mystery') {                           // #29/#49: hộp mù hai lớp —— random ra họ × biến hình theo khu
    const fam = ['dream', 'key', 'fang'][Math.floor(Math.random() * 3)];
    realId = fam + (ctx.S.page === 2 ? 'W' : ctx.S.page === 3 ? 'M' : 'G');
  }
  else {
    const c = CROPS[cropId];
    if (!c) {
      toast('Hạt giống này đã hỏng (không tồn tại trong phiên bản này)!');
      ctx.S.seeds[cropId] = 0;
      return;
    }
    const z = c.zone || 1;                  // v0.8: cây kén đất
    if (z !== ctx.S.page) return toast(c.name + ' phải trồng ở ' + ZONE_NAME[z] + ' (trang ' + z + ')');
  }
  ctx.S.seeds[cropId]--;
  const g = growMs(realId);
  const c = { id: realId, matureAt: now() + g, wateredUntil: 0, fertUsed: {} };
  if (CROPS[realId] && CROPS[realId].regrow) c.left = REGROW_MAX;
  if (isRain()) { c.matureAt = now() + g * 0.9; c.rainDay = gameDay(); }   // Sửa #10: trồng vào ngày mưa được giảm thẳng 10%
  const ev = todayEvent();                                                  // Sự kiện thế giới quan: trồng trong ngày cũng được hưởng
  if (ev && ev.time_mult !== 1 && (!ev.favored_crop || (CROPS[realId] && CROPS[realId].name === ev.favored_crop))) {
    c.matureAt = now() + Math.round((c.matureAt - now()) * ev.time_mult);   // Sự kiện thế giới quan: hệ số thời gian sinh trưởng (<1 = nhanh hơn = tích cực)
    c.evDay = gameDay();
  }
  curPlots()[pi].crop = c;
  save(); renderPlots();
  return true;
}
export function water(pi) {
  const c = curPlots()[pi].crop;
  if (!c) return toast('Ô này chưa trồng gì');
  if (now() >= c.matureAt) return toast('Chín rồi, thu nhanh đi!');
  if (now() < c.wateredUntil) return toast('Vừa tưới xong mà');
  c.matureAt = now() + (c.matureAt - now()) * 0.75;
  c.wateredUntil = now() + WATER_CD;
  save(); renderPlots(); toast('Tưới nước xong, cây mọc nhanh hơn!');
}
export function fertilize(pi, fid, quiet) {
  const c = curPlots()[pi].crop;
  if (!c) return toast('Ô này chưa trồng gì');
  if ((ctx.S.ferts[fid] || 0) <= 0) return toast('Hết loại phân này rồi');
  if (!c.fertUsed) c.fertUsed = {};
  if (c.fertUsed[fid]) return toast('Vụ này đã bón ' + FERTS[fid].name + ' rồi');   // Sửa #3
  if (fid === 'compost') {
    if (now() >= c.matureAt) return toast('Chín rồi, khỏi bón phân');
    c.matureAt = now() + (c.matureAt - now()) * 0.75;
  } else c.shiny = true;                             // v1.0 B′: khi thu hoạch kết toán 25% giá bán thành vàng (thay cho cơ chế +1 sản lượng cũ)
  c.fertUsed[fid] = true;
  ctx.S.ferts[fid]--;
  save(); renderPlots();
  if (!quiet) plotEmote(pi, fid === 'compost' ? (Math.random() < 0.5 ? 'emLeaf' : 'emNote') : (Math.random() < 0.5 ? 'emHeart' : 'emStar'));   // Sửa #15
  return true;
}
export function rollMutation(c, pi) {                          // Mỗi vụ gieo một lần; nhịp tim settle và cửa thu hoạch dùng chung (chặn tranh chấp tốc độ tay giữa lúc chín và lúc tung xúc xắc)
  if (c.mutRolled) return;
  c.mutRolled = true;
  const ev = todayEvent();
  if (!ev || !(ev.mutate_on_fert > 0)) return;
  const fertN = (c.fertUsed && c.fertUsed.compost ? 1 : 0) + (c.fertUsed && c.fertUsed.shiny ? 1 : 0);
  if (Math.random() < ev.mutate_on_fert * (0.3 + 0.35 * fertN)) {
    const prefix = (ev.mutate_prefix || 'đột biến').slice(0, 20);
    let mutCode = prefix;
    if (!ctx.S.mutDesc) ctx.S.mutDesc = {};
    const cname = CROPS[c.id].name;                     // #19: mô tả chức năng lưu theo cây (tiền tố@cây)
    const dsc = ev.mutate_desc && (ev.mutate_desc[cname] || ev.mutate_desc['*']);
    
    if (dsc) {
      let attempt = 1;
      let descKey = mutCode + '@' + cname;
      // Tránh đè description: tách ra ngăn riêng biệt ẩn danh, không lộ số đếm ra giao diện
      while (ctx.S.mutDesc[descKey] && ctx.S.mutDesc[descKey] !== dsc) {
        attempt++;
        mutCode = prefix + '@' + attempt;
        descKey = mutCode + '@' + cname;
      }
      ctx.S.mutDesc[descKey] = dsc;
    }
    
    c.mut = mutCode;
    if (pi != null) { try { plotEmote(pi, 'emStar'); } catch (e) {} }
  }
}
export function bagName(key) {
  if (key.startsWith('unique@')) {
    return ctx.S.uniques?.[key]?.name || 'Vật phẩm Gacha';
  }
  const parts = key.split('@');
  return (parts[1] ? parts[1] + '·' : '') + (CROPS[parts[0]] || { name: '?' }).name;   // Dự phòng: id lạ cũng không làm nổ balo
}
export function bagPrice(key) {
  if (key.startsWith('unique@')) {
    return ctx.S.uniques?.[key]?.sell || 0;
  }
  const parts = key.split('@');
  return Math.round((CROPS[parts[0]] || { sell: 0 }).sell * (parts[1] ? 1.25 : 1));   // Hàng đột biến bán được ×1.25
}
export function mutDescOf(bagKey) {                            // #19: lấy mô tả chức năng (tương thích khoá chỉ có tiền tố của save cũ)
  if (bagKey.startsWith('unique@')) {
    return ctx.S.uniques?.[bagKey]?.desc || '';
  }
  const parts = bagKey.split('@');
  if (!parts[1] || !ctx.S.mutDesc) return '';
  const mutCode = parts.slice(1).join('@');
  return ctx.S.mutDesc[mutCode + '@' + (CROPS[parts[0]] || { name: '' }).name] || ctx.S.mutDesc[parts[1]] || '';
}
export function harvest(pi, quiet) {
  const c = curPlots()[pi].crop;
  if (!c || now() < c.matureAt) return null;
  rollMutation(c, pi);                                  // Cửa thu hoạch gieo bù (chống việc bấm quá nhanh trong 1 giây sau khi chín làm bỏ qua bước xét)
  const def = CROPS[c.id];
  let n = 1;                      // v1.1: hệ số sản lượng nghỉ hưu (sự kiện chỉ ảnh hưởng thời gian sinh trưởng)
  const dev = todayEvent();
  if (dev && dev.double_yield && (!dev.favored_crop || def.name === dev.favored_crop)) n *= 2;   // v1.1: ngày bội thu gấp đôi (phúc lợi dân may)
  const key = c.mut ? c.id + '@' + c.mut : c.id;
  const shownName = (c.mut ? c.mut + '·' : '') + def.name;
  ctx.S.bag[key] = (ctx.S.bag[key] || 0) + n;
  let shinyGain = 0;                                    // Phân lấp lánh v1.0 B′: khi thu hoạch kết toán 25% giá bán thành vàng
  if (c.shiny) { shinyGain = Math.ceil(def.sell * 0.25) * n; ctx.S.coins += shinyGain; delete c.shiny; }
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
export function shovel(pi) {
  if (!curPlots()[pi].crop) return;
  curPlots()[pi].crop = null;
  save(); renderPlots(); toast('Đã xới bỏ');
}
export function buyBlock(bi) {
  const price = blockPrice(bi);
  if (ctx.S.coins < price) return toast('Không đủ vàng');
  if (bi !== curBlocks()) return;
  ctx.S.coins -= price; addBlock();
  save(); renderAll(); toast('Khai hoang thành công! Có ruộng mới rồi');
}
export function sell(key, n) {
  const have = ctx.S.bag[key] || 0;
  n = Math.min(n, have);
  if (n <= 0) return;
  const gain = bagPrice(key) * n;
  ctx.S.bag[key] = have - n;
  if (ctx.S.bag[key] === 0) delete ctx.S.bag[key];
  ctx.S.coins += gain; ctx.S.totalSales += gain;
  save(); renderStatus(); openPanel('bag'); toast('Bán được ' + gain + ' G');
}

export function sellSeed(id, n) {
  const have = ctx.S.seeds[id] || 0;
  n = Math.min(n, have);
  if (n <= 0) return;
  const def = CROPS[id] || { seed: 100 };
  const gain = Math.floor((def.seed || 100) * 0.5) * n;
  ctx.S.seeds[id] = have - n;
  if (ctx.S.seeds[id] === 0) delete ctx.S.seeds[id];
  ctx.S.coins += gain; ctx.S.totalSales += gain;
  save(); renderStatus(); openPanel('bag'); toast('Bán hạt giống thu được ' + gain + ' G');
}

