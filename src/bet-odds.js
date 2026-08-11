/* Toán thuần của trò cược Lớn/Nhỏ.
   File này cố ý KHÔNG import gì và KHÔNG đụng tới DOM hay ctx,
   để chạy test bằng `node --test` thẳng trên nó. */

export const POT_CAP = 800000000;        // Trần tiền trên bàn, chặn tràn số
export const INITIAL_BET_CAP = 200000000; // Sàn cược lúc đầu (200M) để khích lệ chuỗi
export const HOUSE_RETURN = 97;          // Tử số công thức hệ số: nhà cái giữ lại 3%
export const MIN_MULT = 1.01;            // Sàn hệ số: thắng mà vẫn lỗ thì rất phản cảm

/* Dải hợp lệ cho SỐ GỐC (anchor) — KHÔNG áp dụng cho roll phân định thắng thua, roll đó
   vẫn phải là 1..100 đầy đủ (xem rollD100 bên dưới).
   VÌ SAO không được để số gốc chạm 1 hoặc 100:
   - Số gốc = 1: cửa LỚN có wins = 100 - 1 = 99, tức là roll < 1 để thua là bất khả thi —
     cửa này không có kết cục thua nào, chỉ Thắng (99%) hoặc Hoà (1%, giữ nguyên tiền).
     Hệ số đáng lẽ là 97/99 ≈ 0.98 nhưng bị sàn MIN_MULT = 1.01 nâng lên trên mức hoà vốn,
     nên kỳ vọng mỗi ván là 1,0099 — lãi chắc chắn 1%, rủi ro bằng không (in tiền vô hạn).
   - Số gốc = 100: cửa NHỎ đối xứng y hệt (wins = 100 - 1 = 99).
   Giới hạn 5..96 đã được kiểm chứng: trong dải này mọi cửa (cả LỚN lẫn NHỎ, mọi số gốc)
   đều còn ít nhất một kết cục thua, sàn MIN_MULT không bao giờ phải can thiệp, và biên nhà cái
   luôn dương (~1,63%–2,43%). ĐỪNG "dọn dẹp" hai hằng số này về lại 1..100 nếu không hiểu rõ
   lý do trên — làm vậy sẽ mở lại đúng lỗ hổng in tiền đã vá.
   Xem test/bet-odds.test.js để kiểm chứng bằng số. */
export const ANCHOR_MIN = 5;
export const ANCHOR_MAX = 96;

export function rollD100(rnd = Math.random) {
  const n = 1 + Math.floor(rnd() * 100);
  return Math.min(100, Math.max(1, n));
}

/* Sinh SỐ GỐC cho một ván mới, giới hạn trong ANCHOR_MIN..ANCHOR_MAX (xem giải thích ở trên).
   Tuyệt đối không dùng rollD100() trực tiếp để làm số gốc — chỉ dùng nó cho roll phân định
   thắng thua, nếu không tỉ lệ hiện trên nút sẽ không khớp với tỉ lệ thắng thật. */
export function rollAnchor(rnd = Math.random) {
  const span = ANCHOR_MAX - ANCHOR_MIN + 1;
  const n = ANCHOR_MIN + Math.floor(rnd() * span);
  return Math.min(ANCHOR_MAX, Math.max(ANCHOR_MIN, n));
}

/* Kẹp một số về lại dải an toàn ANCHOR_MIN..ANCHOR_MAX. Dùng khi số gốc ván sau được lấy từ
   một roll thắng liên tiếp (roll đó là 1..100 đầy đủ nên có thể rơi ngoài dải an toàn) —
   số gốc ván sau BẮT BUỘC phải nằm trong dải này, nếu không sẽ mở lại đúng lỗ hổng kỳ vọng
   dương đã vá ở rollAnchor(). */
export function clampAnchor(n) {
  const v = Math.floor(Number(n));
  if (!Number.isFinite(v)) return ANCHOR_MIN;
  return Math.min(ANCHOR_MAX, Math.max(ANCHOR_MIN, v));
}

/* Số tiền an toàn: chuỗi, NaN, âm, vô cực đều quy về 0.
   Mọi cửa kiểm tra tiền phải đi qua đây trước khi so sánh —
   `x < NaN` luôn là false và từng làm lọt cửa kiểm tra vàng ở gacha. */
export function safeAmount(v) {
  const n = Math.floor(Number(v));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/* side: 'hi' = cược Lớn, 'lo' = cược Nhỏ */
export function oddsOf(anchor, side) {
  const n = Math.floor(Number(anchor));
  const wins = side === 'hi' ? 100 - n : n - 1;
  if (!Number.isFinite(wins) || wins <= 0) {
    return { wins: 0, chance: 0, mult: 0, locked: true };   // cửa bất khả thi, khoá nút
  }
  /* Trong 100 kết cục của roll (1..100) luôn có đúng 1 ván hoà (roll === anchor),
     phần còn lại chia cho thắng và thua: soVanThua = 99 - wins.
     Nếu wins đạt 99 thì soVanThua = 0 — cửa này không có đường thua, tức là
     đặt cược vào đây chỉ có thể Thắng hoặc Hoà, KHÔNG BAO GIỜ Thua.
     Đây chính là lỗ hổng in tiền: sàn MIN_MULT vẫn cho hệ số >= 1.01 dù không có
     rủi ro nào bù lại, khiến kỳ vọng mỗi ván > 1 một cách chắc chắn. Phải khoá
     cửa này ngay tại đây, không được trông chờ số gốc luôn được kẹp đúng
     trước khi gọi tới oddsOf() — xem ANCHOR_MIN/ANCHOR_MAX ở trên để biết vì
     sao lỗ hổng này từng lọt qua ở bước sinh số gốc. */
  const soVanThua = 99 - wins;
  if (soVanThua <= 0) {
    return { wins: 0, chance: 0, mult: 0, locked: true };   // cửa không có đường thua, khoá nút
  }
  return {
    wins,
    chance: wins / 100,
    mult: Math.max(MIN_MULT, Math.round((HOUSE_RETURN / wins) * 100) / 100),
    locked: false,
  };
}

export function resolveRoll(anchor, side, roll) {
  if (roll === anchor) return 'push';                   // hoà: giữ nguyên tiền, chọn lại
  return (side === 'hi') === (roll > anchor) ? 'win' : 'lose';
}

/* Số tiền hợp lệ đặt lên bàn ở ván đầu: làm sạch đầu vào rồi kẹp theo cả
   số vàng đang có lẫn POT_CAP. Ván đầu không đi qua nextPot() (chỉ dùng cho
   đường thắng liên tiếp) nên phải tự kẹp trần ở đây, nếu không người chơi
   nạp thẳng hơn 100 triệu vàng vào ô cược sẽ phá trần ngay từ đầu. */
export function resolveStake(want, coins) {
  return Math.min(safeAmount(want), safeAmount(coins), INITIAL_BET_CAP);
}

export function nextPot(pot, mult) {
  const m = Number.isFinite(Number(mult)) && Number(mult) > 0 ? Number(mult) : 0;
  return safeAmount(Math.min(POT_CAP, Math.floor(safeAmount(pot) * m)));
}

/* Cộng tiền trên bàn về ví rồi xoá. Nhận state qua tham số (không dùng ctx trực tiếp)
   để test chạy thẳng trên chính hàm này, không phải trên một bản sao.
   Gọi bao nhiêu lần cũng an toàn vì pot = 0 thì thoát sớm. */
export function applyCashOut(state) {
  const pot = safeAmount(state.betPot);
  state.betPot = 0;
  if (pot <= 0) return 0;
  state.coins = safeAmount(state.coins) + pot;
  return pot;
}

/* Nhãn kết quả một ván, hiện ngay dưới ô số lớn.
   Lý do phải có: ô số lớn vốn hiển thị số gốc của ván tới, nhưng khi vòng quay vừa dừng
   thì thứ người chơi cần đọc lại là số vừa roll. Hai thứ đó KHÁC NHAU sau khi thua
   (số gốc được roll lại) và sau khi thắng với roll rơi ngoài dải an toàn (số gốc bị kẹp).
   Trước đây màn hình nhảy thẳng sang số gốc mới nên mâu thuẫn với thông báo "Ra 73". */
export function resultLabel(roll, kq, mult, nextAnchor) {
  const r = Number.isFinite(Number(roll)) ? Math.floor(Number(roll)) : '?';
  const m = Number.isFinite(Number(mult)) ? Number(mult).toFixed(2) : '?';
  const phan = kq === 'win' ? 'Thắng ×' + m
    : kq === 'lose' ? 'Mất trắng'
    : kq === 'push' ? 'Hoà, tiền giữ nguyên'
    : 'Xong';
  // Chỉ nhắc số gốc ván tới khi nó khác số vừa roll, nếu không thì thừa và rối
  const khac = Number.isFinite(Number(nextAnchor)) && Math.floor(Number(nextAnchor)) !== r;
  return 'Ra ' + r + ' · ' + phan + (khac ? ' · ván tới từ ' + Math.floor(Number(nextAnchor)) : '');
}
