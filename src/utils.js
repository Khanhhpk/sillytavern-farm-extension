import { now } from './state.js';
import { ctx } from './store.js';
import * as All from './all.js';
import { BLOCK_PRICE_PG, WEATHERS, TEST_MODE, DAY_MS, CROPS, GROW, MIN, REGROW, FERTS, WATER_CD, REGROW_MAX, POKE_CD, TREASURE_CD, PETS_OUT_MAX, WITCH_STAY, witchGap, SNAP_EDGE, ZONE_NAME } from './data.js';
import { mulberry32, petSVG, spriteSVG, tileURI, warmUpCache, PETS, PASSES, P, LP, PET_P } from './graphics.js';
import { CS, eventFresh, eventPending, requestDayEvent } from './events.js';
import { save, eachPage } from './state.js';
import { renderWitch, witchArrive, toast } from './witch.js';
import { sh } from './ui.js';
import { rollMutation } from './logic.js';
import { renderStatus } from './render.js';

/* ---------- Tiện ích ---------- */
export const gameDay = () => Math.floor((now() - ctx.S.day0) / DAY_MS) + 1;
export const weatherOf = d => WEATHERS[Math.floor(mulberry32(d * 7919)() * WEATHERS.length)];
export const isRain = () => weatherOf(gameDay()) === 'Mưa nhỏ';
export function settle() {
  if (CS.link && !eventFresh() && !eventPending) requestDayEvent();   // #17: sự kiện hết hạn là gieo lại ngay (tính giờ theo mốc neo)
  /* v0.8b: lịch ghé thăm của phù thuỷ tròn (cần vé vùng nước; đến giờ thì rời đi; lỡ 2 lượt thì bảo hiểm) */
  if (ctx.S.passes.water && ctx.S.witch) {
    const wz = ctx.S.witch;
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
    rollMutation(c, pg === ctx.S.page ? pi : null);         // Bong bóng chỉ nổi ở trang hiện tại
  }));
  if (mutChanged) save();
  /* ===== v0.6b: thú làm việc (chỉ có hiệu lực khi ra sân) + tìm kho báu ===== */
  let wChanged = false;
  const outed = id => ctx.S.petsOut.indexOf(id) >= 0;
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
  let tGain = 0, tSeed = '', tMyst = '', tPrism = 0, tStar = 0;            // Loại tìm kho báu (thú ra sân không có job): định kỳ nhặt tiền, thỉnh thoảng tha hạt giống về
  ctx.S.petsOut.forEach(id => {
    const pd = PETS[id];
    if (!pd || pd.job) return;
    if (ctx.S.petFind[id] == null) { ctx.S.petFind[id] = now(); wChanged = true; return; }   // Lần đầu chỉ khởi động bộ đếm
    
    const elapsed = now() - ctx.S.petFind[id];

    // Xử lý riêng cho Chim cánh cụt (stack vé theo giờ)
    if (id === 'penguin') {
      const PENGUIN_CD = 60 * 60 * 1000;
      if (elapsed >= PENGUIN_CD) {
        const hours = Math.floor(elapsed / PENGUIN_CD);
        ctx.S.petFind[id] += hours * PENGUIN_CD;
        
        if (!ctx.S.tickets) ctx.S.tickets = { norm: 0, spec: 0, super: 0 };
        let normGained = 0;
        let specGained = 0;
        for (let i = 0; i < hours; i++) {
          if (Math.random() < 0.3) specGained++;
          else normGained++;
        }
        
        ctx.S.tickets.norm = (ctx.S.tickets.norm || 0) + normGained;
        ctx.S.tickets.spec = (ctx.S.tickets.spec || 0) + specGained;
        
        const msg = [];
        if (normGained > 0) msg.push(`${normGained} Vé Thường`);
        if (specGained > 0) msg.push(`${specGained} Vé Đặc Biệt`);
        toast(`Chú chim cánh cụt vừa đi xa về mang tặng bạn: ${msg.join(' và ')}!`);
        wChanged = true;
      }
      return; // Cánh cụt chuyên đi nhặt vé, không nhặt vàng rác nữa
    }

    // Xử lý cho các pet nhặt kho báu bình thường
    if (elapsed < TREASURE_CD) return;
    ctx.S.petFind[id] = now();
    tGain += 10 + Math.floor(Math.random() * 41);      // v1.0:10~50G
    if ((id === 'impBlob' || id === 'angelBlob') && Math.random() < 0.2) {    // #29: quỷ/thiên thần độc quyền · hạt giống bí ẩn (v1.0: 20%)
      ctx.S.seeds.mystery = (ctx.S.seeds.mystery || 0) + 1;
      tMyst = id;
    }
    if (id === 'prismBlob' && Math.random() < 0.2) { ctx.S.shards.prism++; tPrism++; }   // v1.0: mảnh lăng quang (đổi đơn)
    if (id === 'starBell' && Math.random() < 0.15) { ctx.S.shards.star++; tStar++; }     // v1.0: mảnh ngôi sao (triệu hồi phù thuỷ, quý hơn)
    if (!tSeed && !tMyst && Math.random() < 0.1) {
      const ids = Object.keys(CROPS).filter(k => !CROPS[k].hidden);   // #34: họ bí ẩn không đi theo đường tìm kho báu thường
      tSeed = ids[Math.floor(Math.random() * ids.length)];
      ctx.S.seeds[tSeed] = (ctx.S.seeds[tSeed] || 0) + 1;
    }
    wChanged = true;
  });
  if (tGain) {
    ctx.S.coins += tGain;
    toast('Các bé tròn đi tìm kho báu về: +' + tGain + ' G' + (tSeed ? ', còn tha về cả hạt giống ' + CROPS[tSeed].name + '!' : '') +
      (tMyst ? (tMyst === 'impBlob' ? ', bé quỷ nhỏ tha về một hạt giống bí ẩn đen sì…' : ', bé thiên thần ngậm về một hạt giống bí ẩn ánh lên lấp lánh…') : '') +
      (tPrism ? ', bé lăng quang nhả ra ' + tPrism + ' mảnh lăng quang' : '') + (tStar ? ', bé chuông sao rung rơi ' + tStar + ' mảnh ngôi sao✦' : ''));
    renderStatus();
  }
  if (wChanged) save();
  /* Sửa #10: ngày mưa giảm một lần 10% thời gian còn lại của cây chưa chín (#27 sửa kèm: bù lại const d bị mất); v0.8 ba trang cùng mưa */
  if (!isRain()) return;
  const d = gameDay();
  let rChanged = false;
  eachPage(plots => plots.forEach(p => {
    const c = p.crop;
    if (!c || now() >= c.matureAt || c.rainDay === d) return;
    c.matureAt = now() + (c.matureAt - now()) * 0.9;
    c.rainDay = d;
    rChanged = true;
  }));
  if (rChanged) save();
}
  export const pageUnlocked = p => p === 1 || (p === 2 && ctx.S.passes.water) || (p === 3 && ctx.S.passes.mine);

export const fmtLeft = ms => {
  if (ms <= 0) return 'Thu hoạch được';
  const m = Math.ceil(ms / MIN);
  return m >= 60 ? Math.floor(m / 60) + 'g' + (m % 60) + 'p' : m + 'p';
};

