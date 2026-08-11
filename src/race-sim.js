/* Toán thuần của minigame Đua Pet.
   File này cố ý CHỈ import từ hai module thuần tuý khác và KHÔNG đụng tới
   DOM hay ctx, để chạy test bằng `node --test` thẳng trên nó — y hệt bet-odds.js.
   Xem docs/superpowers/specs/2026-08-09-dua-pet-design.md để biết vì sao
   từng hằng số ở đây lại mang giá trị đó. */
import { safeAmount } from './bet-odds.js';
import { mulberry32 } from './rng.js';

export { safeAmount, mulberry32 };

/* ---------- Hằng số đường đua ---------- */
export const LANES = 5;
export const TRACK = 1000;              // Độ dài đường đua, đơn vị ảo
export const TICKS_MAX = 160;           // Trần vòng lặp; thực tế đa số về đích quanh tick 70
export const STUMBLE_P = 0.006;         // Xác suất vấp mỗi tick
export const STUMBLE_T = 3;             // Vấp kéo dài mấy tick
export const STUMBLE_V = 0.5;           // Trong lúc vấp chạy nửa tốc
/* Phong độ ngày thi đấu — rút MỘT LẦN mỗi ván cho mỗi làn, nhân thẳng vào base
   suốt ván (xem simulateRace). Lý do bắt buộc phải có, phát hiện khi chạy thử
   thật: nhiễu mỗi tick (volEff ở dưới) bị TRUNG BÌNH HOÁ qua ~70 tick một ván.
   Với vol = 0.11, độ lệch chuẩn của tốc độ TRUNG BÌNH cả ván chỉ còn
   0.11 / sqrt(70) ≈ 1.31% — trong khi base chênh tới 15% giữa tầu nhanh nhất
   (15.0) và chậm nhất (13.0), tức khoảng 11 sigma so với độ lệch chuẩn đã bị
   trung bình hoá đó. Kết quả gần như tất định: đo trên 40 thành phần đường đua
   khi chưa có phong độ, con mạnh nhất thắng trung bình 69.7%, cao nhất 96.9%,
   và 48% cửa Thắng bị khoá vì p < MIN_P — vi phạm thẳng yêu cầu gốc "tỉ lệ cao
   không phải là luôn thắng".
   Một lần rút cho cả ván thì KHÔNG bị trung bình hoá theo cùng cách: nó cộng
   thẳng vào base trước khi mọi tick khác chạy, nên độ lệch chuẩn của nó giữ
   nguyên ở quy mô một ván.

   GIÁ TRỊ ĐO ĐƯỢC, KHÁC ƯỚC LƯỢNG BAN ĐẦU CỦA ĐẶC TẢ (0.08): đặc tả ước lượng
   LUCK_MAX/sqrt(3) ≈ 4.6% là "cùng bậc" với độ tản mát của base nên chọn 0.08,
   nhưng đó là lập luận bậc-độ-lớn, không phải phép đo. Quét trực tiếp bằng
   test 7b (30 thành phần đường đua x 4000 ván) cho kết quả thật:
     LUCK_MAX = 0.08 → r_octo (base 15.0, mạnh nhất đoàn đua) thắng tới 60.3%
                        trong thành phần xấu nhất — VỠ trần 0.55 của test 7b.
     LUCK_MAX = 0.10 → 52.9%
     LUCK_MAX = 0.11 → 50.1%
     LUCK_MAX = 0.12 → 48.2%
     LUCK_MAX = 0.15 → 43.6%
   Nhưng nâng LUCK_MAX cũng dịch chuyển kinh tế: test 4 (biên nhà cái chiến
   lược "chỉ favorite, khô") quét cùng lúc cho thấy trần 10% của chính test đó
   bị vỡ ở 0.115 trở lên (10.03%) và không hồi phục — 0.12 cho 10.21%, 0.125
   cho 10.05%, phụ thuộc phi tuyến vào việc tầu nào lọt/rớt khỏi ngưỡng p>0.30
   khi phân bố xác suất dịch chuyển, không đơn điệu theo LUCK_MAX. Quét cả hai
   test cùng lúc trên lưới 0.08-0.13 để tìm giao của hai ràng buộc: 0.11 là
   điểm cho biên an toàn tốt nhất ở CẢ HAI phía — test 7b 50.1% (cách trần
   0.55 những 4.9 điểm) và test 4 favorite 9.89% (cách trần 10% còn 0.11 điểm,
   nhưng mọi seed trong test đều cố định nên đây là kết quả tất định, không
   phải may rủi giữa các lần chạy). Không chỉnh delta/HOUSE_RETURN/DELTA_MAX/
   MC_N/SAFETY_SIGMA/MIN_P/RUNNERS để đạt việc này — LUCK_MAX là hằng số MỚI
   do chính lần vá này sinh ra, không nằm trong danh sách bất khả xâm phạm đó,
   và kinh tế tự điều chỉnh theo mô hình đua (§4.2 đặc tả) nên đây là cách
   đúng để dung hoà, không phải nới băng kinh tế. */
export const LUCK_MAX = 0.11;

/* ---------- Mặt sân ----------
   Chỉ nhân vol lên là KHÔNG đủ để mưa đổi được thứ hạng: dòng số ngẫu nhiên của
   mỗi làn không đổi theo thời tiết, nên nhân vol chỉ co giãn cùng một độ lệch
   theo cùng một chiều cho mọi làn — tương quan gần như hoàn toàn. Đo thực tế
   chỉ 24/2000 ván đổi con về nhất, tức mưa gần như chỉ là hiệu ứng hình ảnh.
   Vấp mới là nguồn hỗn loạn thật vì nó là biến cố rời rạc giáng vào đúng một
   làn tại đúng một thời điểm — nhân xác suất vấp lên 3 đưa con số lên 202/2000. */
export const RAIN_VOL_MULT = 1.35;      // Đường trơn: biên độ dao động rộng hơn
export const RAIN_STUMBLE_MULT = 3;     // Đường trơn: trượt chân nhiều hơn
export const RAIN_FLOATY_MULT = 0.96;   // Gió mưa cản nhóm bay lơ lửng

/* ---------- Hằng số kinh tế ----------
   BẤT BIẾN BẮT BUỘC: HOUSE_RETURN / (1 - DELTA_MAX) < 1.
   Nếu vi phạm, tồn tại một cửa có kỳ vọng dương và người chơi kiên nhẫn
   sẽ tìm ra nó — đúng lỗ hổng in tiền đã vá ở bet-odds.js.
   0.90 / 0.92 = 0.978, tức cửa ngon nhất trong game vẫn lỗ 2,2%. */
/* Biên nhà cái đo theo nhóm xác suất KHÔNG đồng đều, và đó là chủ ý chứ không
   phải lỗi cân bằng: favorite (p > 0.30) chỉ ~6% vì đó đúng là chỗ các delta âm
   phát huy tác dụng; nhóm giữa (p 0.05-0.30) rơi vào khoảng 12-17% vì biên an
   toàn Monte Carlo tỉ lệ với độ bất định của p, mà nhóm giữa vẫn còn đủ bất định
   để bị thổi lên. Đây là thiên lệch longshot (longshot bias) ngoài đời thật của
   nhà cái thể thao: cửa càng khó đoán càng bị ăn biên nặng, đẩy người chơi khôn
   ngoan về phía cửa cần suy luận (favorite, delta) thay vì cửa cầu may. */
export const HOUSE_RETURN = 0.90;       // Nhà cái giữ 10%
export const DELTA_MAX = 0.08;          // Trần định giá lệch
/* MC_N và SAFETY_SIGMA cùng quyết định sai số của SẢN PHẨM (hệ số giao tới người
   chơi), không chỉ sai số phép đo. se/p tại một cửa xác suất p tỉ lệ 1/sqrt(p*N),
   nên longshot (p nhỏ) luôn chịu sai số tương đối lớn hơn nhiều so với cửa kèo chẵn.
   Đo thực tế trên máy này:
     N=8000  : ~48ms/bảng,  se/p tại p=0.02 là 7.8%, tại p=0.20 là 2.2%
     N=30000 : ~141ms/bảng, se/p tại p=0.02 là 4.0%, tại p=0.20 là 1.2%
   Ở N=8000, SAFETY_SIGMA=0.5 chỉ gọt được 0.5*7.8%=3.9% — không đủ phủ hết dải
   nhiễu, nên một lần Monte Carlo xui (lệch 2-3 sigma, hoàn toàn có thể xảy ra ở
   seed cố định) đủ đẩy kỳ vọng thật của cửa longshot vượt 0.98 dù công thức p_dùng
   đã cộng biên an toàn. Nâng N lên 30000 và SAFETY_SIGMA lên 1.5: tại p=0.02, sai
   số còn 4.0% trong khi biên an toàn gọt 1.5*4.0%=6.0% — phủ kín, nhiễu phải dao
   động tới 2.5 sigma (thay vì ~1 sigma trước đó) mới đủ vượt hoà vốn. Đây là lựa
   chọn đánh đổi thời gian tính (141ms/bảng, chấp nhận được với tần suất mở cửa
   cược) lấy biên an toàn kinh tế thật, không phải vá bằng cách chỉnh delta —
   chỉnh delta không triệt để vì độ lệch chuẩn tỉ lệ 1/sqrt(p) chứ không tuyến
   tính với delta. */
export const MC_N = 30000;              // Số lần sim để ước lượng xác suất
export const SAFETY_SIGMA = 1.5;        // p_dùng = p_ước + 1.5 * sai số chuẩn
/* MIN_P không chỉ chặn vùng sai số Monte Carlo lớn hơn chính giá trị ước lượng
   (p nhỏ thì se/p lớn) — lý do CHÍNH là đo thực tế cho thấy ở p < 0.03 biên an
   toàn (SAFETY_SIGMA * se) thổi biên nhà cái của nhóm longshot lên tới 19.9%,
   gần gấp đôi mục tiêu 8-13%. Khoá hẳn vùng đó cắt phần biên bất thường, trong
   khi vẫn giữ nguyên cửa hệ số cao ở nhóm 0.03-0.15 (hệ số vẫn lên tới x20-x30)
   — người chơi vẫn có cửa ăn to, chỉ là không phải cửa bất định nhất. */
export const MIN_P = 0.03;              // Cửa dưới ngưỡng này bị khoá — xem RUNNERS phía dưới
export const MIN_MULT = 1.01;           // Hệ số thấp hơn mức này thì KHOÁ cửa — tuyệt đối không nâng lên
export const PLACE_TOP = 2;             // "Về hạng" = lọt top 2 trong 5 làn
export const MIN_BET = 10;

/* ---------- Hằng số phát lại ----------
   Con về nhất LUÔN cán vạch ở giây 16,5 nên cao trào rơi đúng một điểm cố định.
   Không dùng ms/tick cố định: tick về đích dao động 60..115 tuỳ ván,
   thời lượng sẽ chênh nhau gấp đôi và trượt khỏi khoảng 15-20 giây. */
export const WIN_AT_MS = 16500;
export const HARD_CAP_MS = 20000;

/* ---------- Đoàn đua ----------
   12 tầu cố định, mỗi ván bốc 5. Giá trị dưới đây được tinh chỉnh cho tới khi
   test "không cửa nào in tiền" và "biên nhà cái" xanh — đừng sửa lẻ tẻ mà không chạy lại test.
   sp   : id loài trong bảng PETS của graphics.js, dùng để vẽ sprite
   base : tốc độ nền (đơn vị/tick)
   sta  : sức bền, 1.0 = không tụt tốc cuối đường
   vol  : độ dao động — tầu vol cao thắng thất thường, chính là thứ khiến
          cửa odds cao không đồng nghĩa cửa yếu
   style: đường cong tốc độ theo quãng đường
   delta: định giá lệch. delta < 0 = nhà cái định giá THẤP tầu này,
          tức cửa có lợi cho người chơi (nhưng vẫn lỗ, xem bất biến ở trên)
   floaty: loài bay lơ lửng — hoạt cảnh cho trượt đều thay vì nhảy,
          và mưa gió cản chúng nhiều hơn (xem simulateRace) */
export const RUNNERS = [
  { rid: 'r_slime',   sp: 'slime',        name: 'Bụp Sấm',     base: 14.2, sta: 0.85, vol: 0.09, style: 'pace',   delta:  0.05, floaty: false },
  { rid: 'r_octo',    sp: 'octo',         name: 'Tám Tay Tím', base: 15.0, sta: 0.55, vol: 0.11, style: 'front',  delta: -0.06, floaty: false },
  { rid: 'r_pink',    sp: 'slimePink',    name: 'Dâu Bay',     base: 13.8, sta: 0.80, vol: 0.13, style: 'closer', delta:  0.03, floaty: false },
  { rid: 'r_cream',   sp: 'octoCream',    name: 'Kem Ì Ạch',   base: 13.0, sta: 0.95, vol: 0.06, style: 'pace',   delta: -0.04, floaty: false },
  { rid: 'r_cloud',   sp: 'cloudMallow',  name: 'Bông Gió',    base: 14.5, sta: 0.70, vol: 0.15, style: 'front',  delta:  0.07, floaty: true  },
  { rid: 'r_ghost',   sp: 'ghostBlob',    name: 'Bóng Đêm',    base: 14.8, sta: 0.60, vol: 0.14, style: 'closer', delta: -0.08, floaty: true  },
  { rid: 'r_mystery', sp: 'mystery_blob', name: 'Dấu Hỏi',     base: 13.5, sta: 0.90, vol: 0.16, style: 'closer', delta:  0.02, floaty: false },
  { rid: 'r_jelly',   sp: 'jellyfish',    name: 'Xoăn Trôi',   base: 14.0, sta: 0.75, vol: 0.10, style: 'pace',   delta: -0.03, floaty: true  },
  { rid: 'r_imp',     sp: 'impBlob',      name: 'Quỷ Lỏi',     base: 14.6, sta: 0.65, vol: 0.12, style: 'front',  delta:  0.06, floaty: false },
  { rid: 'r_angel',   sp: 'angelBlob',    name: 'Cánh Trắng',  base: 13.6, sta: 0.92, vol: 0.07, style: 'pace',   delta: -0.05, floaty: false },
  { rid: 'r_peach',   sp: 'peach_soda',   name: 'Sủi Đào',     base: 14.3, sta: 0.78, vol: 0.11, style: 'closer', delta:  0.04, floaty: false },
  { rid: 'r_penguin', sp: 'penguin',      name: 'Trượt Băng',  base: 14.9, sta: 0.58, vol: 0.08, style: 'front',  delta: -0.07, floaty: false },
];

const RUNNER_MAP = {};
RUNNERS.forEach(r => { RUNNER_MAP[r.rid] = r; });
export function runnerById(rid) { return RUNNER_MAP[rid] || null; }

/* ---------- PRNG ----------
   Mỗi làn có dòng số riêng. Nhờ vậy thứ tự duyệt trong vòng for của simulateRace
   KHÔNG THỂ ảnh hưởng tới kết quả — tính chất này đúng theo cấu trúc chứ không
   nhờ cẩn thận. Test "không thiên vị làn" canh đúng chỗ này. */
export function laneRng(seed, lane) {
  return mulberry32((seed ^ Math.imul(lane + 1, 2654435761)) | 0);
}

/* ---------- Đường cong tốc độ ---------- */
export function curveOf(style, u) {
  if (style === 'front') return 1.10 - 0.18 * u;
  if (style === 'closer') return 0.90 + 0.20 * u;
  return 1.00;
}

export function fatigueOf(sta, u) {
  return 1 - (1 - sta) * 0.18 * u * u;
}

/* ---------- Bốc thăm ---------- */
export function drawEntrants(drawSeed) {
  const rnd = mulberry32(drawSeed);
  const pool = RUNNERS.slice();
  for (let i = pool.length - 1; i > 0; i--) {          // Fisher-Yates, không thiên vị
    const j = Math.floor(rnd() * (i + 1));
    const t = pool[i]; pool[i] = pool[j]; pool[j] = t;
  }
  return pool.slice(0, LANES).map((r, lane) => ({ rid: r.rid, lane }));
}

/* .filter(Boolean) kiểu cũ lọc âm thầm: nếu một rid không giải được (vd RUNNERS
   đổi tên/xoá pet giữa hai bản trong khi save của người chơi đang giữ rid cũ ở
   phase 'locked' — xem petRenameMap trong loadState() của state.js, đây KHÔNG
   phải chuyện chỉ có trên lý thuyết), mảng trả về ngắn hơn refs. simulateRace()
   chạy trên mảng ngắn đó vẫn sinh order là CHỈ SỐ 0..n-1 của chính mảng ngắn,
   nhưng mọi nơi khác (betKey, applyRaceSettle, applyRaceForm) coi order là SỐ
   LÀN GỐC trong mảng 5 phần tử ban đầu — hai mảng lệch ý nghĩa chỉ số nhưng bị
   dùng lẫn cho nhau, mà số làn chính là khoá của mọi cửa cược. Hậu quả tái hiện
   được: cược vào cửa của con thú không còn trong ván mô phỏng vẫn được trả
   tiền (chỉ số trùng hợp), hoặc khi mọi rid đều hỏng thì order rỗng làm tiền
   cược mất trắng, không đi qua nhánh hoàn tiền nào.
   Vì vậy hàm này giờ nói thật: có bất kỳ rid nào không giải được thì trả null
   nguyên khối, để mọi nơi gọi buộc phải coi đó là state hỏng (hoàn tiền, không
   thanh toán) thay vì âm thầm đua tiếp trên một đoàn đua thiếu người. */
export function resolveEntrants(refs) {
  // refs rỗng cũng phải báo hỏng: [].every(Boolean) trả true một cách vô nghĩa
  // (đúng theo logic rỗng), nhưng một ván 0 làn không phải một ván đua thật.
  if (!Array.isArray(refs) || refs.length === 0) return null;
  const out = refs.map(e => runnerById(e && e.rid));
  return out.every(Boolean) ? out : null;
}

/* Hoàn tiền và huỷ ván khi entrants không giải được (rid hỏng), bất kể đang ở
   phase nào. Khác applyRaceRefund() (chỉ chạy khi phase 'betting', tức ván
   CHƯA thành hình): hàm này còn phải chạy được cả khi phase đã 'locked', vì
   resolveEntrants() có thể trả null sau khi cửa đã chốt — lúc đó order không
   còn tin được nữa (xem resolveEntrants ở trên) nhưng r.bets vẫn là tiền cược
   thật của người chơi nên vẫn hoàn được, chỉ là không thể thanh toán theo một
   kết quả không có thật. Nguyên tắc: hoàn tiền, không thanh toán, không đoán
   mò kết quả từ state không tin được.
   PHẢI idempotent giống applyRaceSettle: nếu đã 'settled' rồi thì không làm
   gì, kẻo hoàn tiền hai lần. */
export function applyRaceVoid(state) {
  const r = state && state.race;
  if (!r || r.phase === 'settled') return 0;
  let back = 0;
  const bets = (r.bets && typeof r.bets === 'object') ? r.bets : {};
  Object.keys(bets).forEach(k => { back += safeAmount(bets[k]); });
  state.coins = safeAmount(state.coins) + back;
  state.race = null;      // Đúng mẫu applyRaceRefund: race về null là cơ chế chống hoàn hai lần
  return back;
}

/* Một ván đua. Hàm này là nguồn sự thật DUY NHẤT của kết quả:
   Monte Carlo tính odds gọi nó với withLog = false, ván thật gọi với true.
   Khác nhau đúng một cờ — không tồn tại đường nào để odds lệch khỏi kết quả thật.

   cond được đóng băng vào S.race lúc mở cửa cược: thời tiết đổi giữa chừng
   không được phép làm lệch kết quả so với bảng odds đã công bố. */
export function simulateRace(seed, entrants, cond, withLog) {
  const n = entrants.length;
  const rain = !!(cond && cond.rain);
  const pos = new Float32Array(n);
  const stumble = new Uint8Array(n);
  const finishTicks = new Array(n).fill(-1);
  const overshoot = new Float32Array(n);
  const rng = new Array(n);
  const tie = new Float32Array(n);        // Phân định về đích cùng tick — KHÔNG dùng chỉ số làn
  const luck = new Float32Array(n);       // Phong độ ngày thi đấu, rút một lần mỗi ván (xem LUCK_MAX)
  for (let i = 0; i < n; i++) {
    rng[i] = laneRng(seed, i);
    tie[i] = laneRng(seed ^ 0x9E3779B9, i)();
    // Hằng số băm riêng, khác cả seed trần lẫn 0x9E3779B9 của tie[]: dùng chung
    // một dòng số với rng[] hay tie[] sẽ lệch pha toàn bộ dòng đó và trộn lẫn
    // hai nguồn ngẫu nhiên độc lập vào nhau.
    luck[i] = 1 + (laneRng(seed ^ 0x2545F491, i)() * 2 - 1) * LUCK_MAX;
  }
  const lapLog = withLog ? [] : null;
  /* Đường trơn không chỉ làm nhiễu tốc độ lớn hơn — nó còn làm VẤP dễ xảy ra hơn.
     Nếu chỉ nhân volEff mà bỏ qua vế này, mưa gần như không đổi được thứ hạng khi
     một tầu có lợi thế tốc độ nền rõ rệt (bộ số RUNNERS thật có những cặp cách nhau
     tới ~1 đơn vị/tick): nhiễu liên tục quá nhỏ để lật kèo, còn vấp thì lại xảy ra ở
     đúng cùng tick bất kể mưa hay không (cùng dòng rStumble từ cùng seed) nên chẳng
     đóng góp gì cho sự khác biệt. Nhân riêng xác suất vấp theo mưa mới thật sự tạo
     ra khác biệt giữa hai điều kiện — test "mưa loạn hơn" canh đúng chỗ này. */
  const stumbleP = STUMBLE_P * (rain ? RAIN_STUMBLE_MULT : 1);

  let done = 0;
  for (let t = 0; t < TICKS_MAX && done < n; t++) {
    for (let i = 0; i < n; i++) {
      if (finishTicks[i] >= 0) continue;
      const e = entrants[i];
      const u = pos[i] / TRACK;
      const volEff = e.vol * (rain ? RAIN_VOL_MULT : 1);
      const baseEff = e.base * luck[i] * (rain && e.floaty ? RAIN_FLOATY_MULT : 1);

      // Rút đủ hai số mỗi tick bất kể nhánh nào chạy, để dòng số không lệch pha giữa các làn
      const rNoise = rng[i]();
      const rStumble = rng[i]();

      let v = baseEff * curveOf(e.style, u) * fatigueOf(e.sta, u);
      v *= 1 + (rNoise * 2 - 1) * volEff;
      if (stumble[i] === 0 && rStumble < stumbleP) stumble[i] = STUMBLE_T;
      if (stumble[i] > 0) { v *= STUMBLE_V; stumble[i]--; }
      if (v < 0) v = 0;

      pos[i] += v;
      if (pos[i] >= TRACK) { finishTicks[i] = t; overshoot[i] = pos[i] - TRACK; done++; }
    }
    if (lapLog) { const snap = new Float32Array(n); snap.set(pos); lapLog.push(snap); }
  }

  // Ai chưa về trong trần tick thì coi như về ở đúng trần, xếp theo quãng đường đã đi
  for (let i = 0; i < n; i++) {
    if (finishTicks[i] < 0) { finishTicks[i] = TICKS_MAX; overshoot[i] = pos[i] - TRACK; }
  }

  const order = [];
  for (let i = 0; i < n; i++) order.push(i);
  order.sort((a, b) => {
    if (finishTicks[a] !== finishTicks[b]) return finishTicks[a] - finishTicks[b];
    if (overshoot[a] !== overshoot[b]) return overshoot[b] - overshoot[a];
    return tie[a] - tie[b];                                      // Không bao giờ so bằng chỉ số làn
  });

  return { order, finishTicks, lapLog };
}

/* Sim chạy bằng tick trừu tượng: con về nhất có thể cán vạch ở tick 60 hoặc 115
   tuỳ ván. Phát lại với ms/tick cố định sẽ cho thời lượng chênh nhau gấp đôi và
   trượt khỏi khoảng 15-20 giây.
   Cách chốt: co giãn để con về nhất LUÔN cán vạch ở WIN_AT_MS. Cao trào rơi đúng
   một điểm cố định, người chơi quen nhịp. Nhóm về sau lê thêm tối đa 3,5 giây rồi
   bị cắt cứng ở HARD_CAP_MS. */
export function playbackTiming(finishTicks) {
  let winTick = Infinity, lastTick = 0;
  for (const t of finishTicks) {
    if (t < winTick) winTick = t;
    if (t > lastTick) lastTick = t;
  }
  if (!Number.isFinite(winTick)) winTick = 1;
  winTick = Math.max(1, winTick);                 // Về đích ngay tick 0 vẫn phải chia được
  lastTick = Math.max(winTick, lastTick);
  const msPerTick = WIN_AT_MS / winTick;
  const totalMs = Math.min(HARD_CAP_MS, lastTick * msPerTick);
  return { msPerTick, totalMs, winTick, lastTick };
}

/* Luôn làm tròn XUỐNG. bet-odds.js dùng Math.round; ở đây khác đi có chủ ý —
   làm tròn lên ở một cửa xác suất thấp đủ để lật dấu biên nhà cái. */
export function floor2(x) { return Math.floor(x * 100) / 100; }

/* Odds sinh từ CHÍNH hàm sim sẽ chạy thật, không có bảng viết tay.

   Sai số Monte Carlo là cái bẫy chính ở đây: mult = HOUSE_RETURN / p, nên khi p
   ước lượng lỡ thấp hơn p thật thì nhà cái trả dư. Bù bằng cách dùng ước lượng
   thiên về phía nhà cái: p_dùng = p_ước + SAFETY_SIGMA * se.

   Sau đó áp định giá lệch delta của từng tầu. delta < 0 đẩy hệ số LÊN, tạo ra
   cửa có lợi cho người chơi — nhưng vẫn lỗ, vì HOUSE_RETURN/(1-DELTA_MAX) < 1.
   Đó là toàn bộ lý do lớp suy luận tồn tại được mà không thành máy in tiền. */
export function computeOdds(mcSeed, entrants, cond, n) {
  const N = n || MC_N;
  const L = entrants.length;
  const winCount = new Int32Array(L);
  const placeCount = new Int32Array(L);

  for (let k = 0; k < N; k++) {
    const s = (Math.imul(mcSeed ^ (k + 1), 2246822519) ^ (k << 13)) | 0;
    const { order } = simulateRace(s, entrants, cond, false);
    winCount[order[0]]++;
    for (let j = 0; j < PLACE_TOP && j < L; j++) placeCount[order[j]]++;
  }

  const gate = (count, delta) => {
    const p = count / N;
    if (p < MIN_P) return { p, pPub: 0, mult: 0, locked: true };
    const se = Math.sqrt(Math.max(p * (1 - p), 1e-9) / N);
    const pPub = (p + SAFETY_SIGMA * se) * (1 + delta);
    const mult = floor2(HOUSE_RETURN / pPub);
    // Hệ số dưới sàn thì KHOÁ, tuyệt đối không nâng lên sàn.
    // Nâng sàn khi không có rủi ro bù lại chính là lỗ hổng in tiền của bet-odds.js.
    if (!(mult >= MIN_MULT)) return { p, pPub, mult: 0, locked: true };
    return { p, pPub, mult, locked: false };
  };

  return {
    win: entrants.map((e, i) => gate(winCount[i], e.delta)),
    place: entrants.map((e, i) => gate(placeCount[i], e.delta)),
  };
}

/* ---------- Biến đổi state ----------
   Nhận state qua tham số (không dùng ctx trực tiếp) để test chạy thẳng trên
   chính hàm này chứ không phải trên một bản sao — đúng mẫu applyCashOut. */

export function betKey(kind, lane) { return kind + ':' + lane; }

export function newRaceState(drawSeed, refs, cond, odds) {
  return {
    drawSeed,
    raceSeed: null,          // Chỉ sinh đúng lúc bấm Xuất phát, xem ghi chú trong kế hoạch
    phase: 'betting',
    entrants: refs.map(e => ({ rid: e.rid, lane: e.lane })),
    cond: { rain: !!(cond && cond.rain) },
    odds,
    bets: {},
    staked: 0,
    result: null,
  };
}

export function applyRaceBet(state, key, want) {
  const r = state && state.race;
  if (!r || r.phase !== 'betting') return 0;
  const coins = safeAmount(state.coins);
  const amt = Math.min(safeAmount(want), coins);
  if (amt < MIN_BET) return 0;
  state.coins = coins - amt;
  r.bets[key] = safeAmount(r.bets[key]) + amt;
  r.staked = safeAmount(r.staked) + amt;
  return amt;
}

/* Ván chưa chốt cửa thì chưa thành hình — hoàn nguyên toàn bộ rồi xoá.
   Chỉ dùng lúc khởi động, khi phát hiện một ván dở dang còn ở phase betting. */
export function applyRaceRefund(state) {
  const r = state && state.race;
  if (!r || r.phase !== 'betting') return 0;
  let back = 0;
  Object.keys(r.bets).forEach(k => { back += safeAmount(r.bets[k]); });
  state.coins = safeAmount(state.coins) + back;
  state.race = null;
  return back;
}

/* Thanh toán. PHẢI idempotent: boot-settle và settle của giao diện có thể chạy
   trùng nhau, cộng vàng hai lần là lỗi tệ nhất có thể có.
   Cờ chốt là chính phase — chuyển sang 'settled' TRƯỚC khi cộng bất cứ đồng nào. */
export function applyRaceSettle(state, order) {
  const r = state && state.race;
  if (!r || r.phase === 'settled') return null;
  r.phase = 'settled';                    // Chốt phase TRƯỚC khi cộng đồng nào — cơ chế idempotent
  /* Hàm này tuyệt đối không được throw: phase đã chốt sang 'settled' ở dòng trên,
     nên nếu bất cứ bước nào sau đây ném lỗi trên state dị dạng (bets/odds thiếu
     trường, order không phải mảng...), tiền đã trừ lúc đặt cược sẽ không bao giờ
     được hoàn — mọi lần gọi lại sau đó chỉ trả null êm re vì đã settled. Vì vậy
     lấy dữ liệu một cách phòng vệ ngay từ đây thay vì để throw giữa chừng. */
  const safeOrder = Array.isArray(order) ? order : [];
  r.result = safeOrder.slice();
  const bets = (r.bets && typeof r.bets === 'object') ? r.bets : {};

  const top = safeOrder.slice(0, PLACE_TOP);
  let payout = 0;
  Object.keys(bets).forEach(key => {
    const amt = safeAmount(bets[key]);
    if (amt <= 0) return;
    const cut = key.indexOf(':');
    const kind = key.slice(0, cut);
    const lane = Number(key.slice(cut + 1));
    const gates = r.odds && r.odds[kind];
    const g = Array.isArray(gates) ? gates[lane] : undefined;
    /* mult phải là số hữu hạn và không âm mới được dùng. safeAmount() không hợp
       ở đây vì nó làm tròn xuống thành số nguyên, còn mult là số thực (vd 4.20).
       mult hỏng (NaN do state lỗi, âm do persist cũ...) đúng loại lỗi safeAmount()
       vốn được sinh ra để chặn ở chỗ khác: x < NaN luôn false nên nếu để lọt qua
       đây thì mọi cửa kiểm tiền phía sau (kể cả safeAmount cuối) coi NaN là hợp lệ
       khi cộng — coi cửa này như cửa bị khoá: hoàn nguyên, không nhân, không nuốt. */
    const multOk = g && Number.isFinite(g.mult) && g.mult >= 0;
    if (!g || g.locked || !multOk) { payout += amt; return; }
    const hit = kind === 'win' ? safeOrder[0] === lane : top.indexOf(lane) >= 0;
    if (hit) payout += Math.floor(amt * g.mult);
  });

  // Lớp lưới thứ hai: dù mọi cửa kiểm ở trên có sai sót gì, payout cuối vẫn phải
  // là một số nguyên không âm trước khi cộng vào state.coins.
  payout = safeAmount(payout);
  state.coins = safeAmount(state.coins) + payout;
  return { payout, staked: safeAmount(r.staked) };
}

/* Phong độ: nguồn duy nhất của hai cột "Phong độ" và "T.thắng" trên bảng.
   Tỉ lệ thắng tích luỹ mới là tín hiệu thật — 5 ván gần nhất quá nhiễu để
   suy ra một delta cỡ 8%. */
export function applyRaceForm(state, refs, order) {
  if (!state.raceForm) state.raceForm = {};
  const rank = new Array(order.length);
  order.forEach((lane, i) => { rank[lane] = i + 1; });
  refs.forEach(e => {
    const f = state.raceForm[e.rid] || (state.raceForm[e.rid] = { runs: 0, wins: 0, places: 0, last5: [] });
    const pos = rank[e.lane];
    f.runs++;
    if (pos === 1) f.wins++;
    if (pos <= PLACE_TOP) f.places++;
    f.last5 = f.last5.concat(pos).slice(-5);
  });
}

/* Cộng dồn thống kê một ván vào raceStats. Tách ra khỏi race.js vì logic này
   được settleNow() (đường UI) và settleRaceOnBoot() (đường khởi động) gọi y
   hệt nhau — chép tay hai lần dễ trôi lệch nếu sau này ai sửa công thức ở một
   chỗ mà quên chỗ kia. Nhận state qua tham số, đúng mẫu applyRaceSettle/
   applyRaceForm ở trên, để test chạy thẳng bằng node --test.
   Mọi số tiền đi qua safeAmount() trước khi cộng, vì res (kết quả sim) có thể
   tới từ state đã bị hỏng ở nơi gọi. */
export function applyRaceStats(state, res) {
  const st = state.raceStats || (state.raceStats = { plays: 0, staked: 0, won: 0, net: 0, best: 0 });
  const payout = safeAmount(res && res.payout);
  const staked = safeAmount(res && res.staked);
  st.plays++;
  st.staked = safeAmount(st.staked) + staked;
  st.won = safeAmount(st.won) + payout;
  st.net = (Number(st.net) || 0) + payout - staked;
  if (payout > safeAmount(st.best)) st.best = payout;
  return st;
}
