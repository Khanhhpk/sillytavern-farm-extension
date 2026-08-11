/* Kho lời thoại cho minigame Đua Pet.
   File này cố ý KHÔNG import gì và KHÔNG đụng tới DOM, để chạy test bằng
   `node --test` thẳng trên nó — cùng lý do với bet-odds.js và race-sim.js.
   Đặc biệt không được import graphics.js: file đó đụng document nên sẽ nổ
   ngay khi nạp. Mảng `cry` của nông trại vì vậy được truyền vào qua tham số.

   Lời thoại KHÔNG phải toán, nên nó ở riêng đây chứ không nhét vào
   race-sim.js — sửa câu chữ không phải đụng vào logic đua. */

export const EVENTS = ['start', 'stumble', 'burst', 'lead', 'win', 'last', 'overtake'];

/* Tầng 2 — kho chung, mọi tầu dùng được. Lấp chỗ khi tầu không có câu riêng
   cho sự kiện đó. Mỗi sự kiện giữ ít nhất 5 câu để chơi nhiều ván không thấy lặp. */
export const EVENT_LINES = {
  start: [
    'Vào chỗ… vào chỗ nào ta?',
    'Hôm nay chân nhẹ lắm!',
    'Chạy là chạy, hỏi nhiều làm gì.',
    'Ai cho tôi mượn cái chân?',
    'Đừng ai chen nhé!',
  ],
  stumble: [
    'Ối!',
    'Ơ… đường trơn mà!',
    'Tôi cố ý đấy.',
    'Hụt chân rồi!',
    'Đợi tôi tí…',
  ],
  burst: [
    'Chưa hết đâu!',
    'Nãy giờ tôi đi bộ thôi!',
    'Nhường đường!',
    'Giờ mới vào việc.',
    'Bung hết sức!',
  ],
  lead: [
    'Nhất rồi nhé!',
    'Phía sau đông vui không?',
    'Bám kịp thì bám đi.',
    'Gió ở đây mát ghê.',
    'Tôi dẫn đường cho.',
  ],
  win: [
    'Về nhất!',
    'Dễ mà.',
    'Ai đặt cược tôi thì cảm ơn nhé!',
    'Ghi vào sổ đi!',
    'Còn ai muốn thi lại không?',
  ],
  last: [
    'Phù… mệt.',
    'Chờ tôi với…',
    'Về đích là thắng rồi.',
    'Tôi chạy đường dài cơ.',
    'Hôm nay gió ngược.',
  ],
  /* Vượt qua MỘT đối thủ bất kỳ, chưa chắc đã dẫn đầu — khác 'lead' (chiếm ngôi
     nhất). Đo thực tế cho thấy đây là sự kiện dày đặc nhất và trải đều cả chặng
     (xem race.js), nên giọng phải nhẹ, thoáng qua, không hô hào như 'burst'/'lead'. */
  overtake: [
    'Xin lỗi nhé, cho qua!',
    'Một người rồi đó nha.',
    'Nhích lên tí thôi mà.',
    'Đừng buồn, còn dài mà.',
    'Qua mặt rồi đó nhé~',
    'Từ từ vượt lên đây.',
  ],
};

/* Tầng 1 — giọng riêng. Không tầu nào cần đủ sáu sự kiện; chỉ viết cho những
   khoảnh khắc hợp tính cách nó. Tính cách bám theo mô tả và mảng `cry` sẵn có
   của loài đó trong bảng PETS ở graphics.js. */
export const RUNNER_LINES = {
  r_slime: {
    start: ['Bụp! Sẵn sàng bụp!'],
    burst: ['Bụp nhanh! Bụp nhanh!'],
    overtake: ['Bụp qua luôn nhé!'],
    win: ['Tổ tiên bé tròn không thua!'],
  },
  r_octo: {
    lead: ['Tám chân, tám lần nhanh hơn.'],
    stumble: ['Rối chân rồi… tám cái lận!'],
    overtake: ['Tám chân len qua khe hẹp là được.'],
    win: ['Ục bốp! Tôi nhất!'],
  },
  r_pink: {
    start: ['Thơm mùi dâu chưa?'],
    burst: ['Hì hì, bay đây!'],
    last: ['Dâu chín chậm mà ngọt.'],
  },
  r_cream: {
    start: ['Từ từ… đã ai chạy đâu.'],
    burst: ['Ơ, tôi cũng nhanh được đấy chứ?'],
    overtake: ['Ơ, vượt được một người kìa.'],
    last: ['Chậm rì rì… nhưng vẫn về.'],
  },
  r_cloud: {
    start: ['Bông bông~ để tôi nổi lên đã.'],
    lead: ['Bay thì nhanh hơn chạy mà.'],
    stumble: ['Gió thổi lệch mất rồi!'],
  },
  r_ghost: {
    burst: ['Xuyên qua luôn nhé!'],
    lead: ['Uuu~ ai thấy tôi không?'],
    win: ['Ma thì không biết mệt.'],
  },
  r_mystery: {
    start: ['……?'],
    stumble: ['(nghiêng đầu khó hiểu)'],
    lead: ['(vẫn không nói gì)'],
    win: ['……!'],
  },
  r_jelly: {
    stumble: ['Xúc tu quấn vào nhau rồi!'],
    burst: ['Cuộn cuộn… trôi nhanh!'],
    last: ['Trôi tới đâu hay tới đó.'],
  },
  r_imp: {
    stumble: ['Hư! Ai vừa đẩy tôi?'],
    lead: ['Hì hì, tôi có bí quyết.'],
    overtake: ['Lén qua mặt, không ai để ý đâu.'],
    win: ['Không ai thấy gì đúng không?'],
  },
  r_angel: {
    lead: ['Xin phép đi trước nhé.'],
    stumble: ['Ting… xin lỗi vì làm phiền.'],
    overtake: ['Xin phép vượt lên một chút.'],
    win: ['Chúc phúc cho các bạn về sau.'],
  },
  r_peach: {
    start: ['Xì~ sủi bọt cái đã.'],
    burst: ['Bốp——! Ga hết cỡ!'],
    last: ['Hết ga rồi…'],
  },
  r_penguin: {
    start: ['Trượt tuyết nào!'],
    stumble: ['Núp núp… à không, ngã.'],
    burst: ['Nằm sấp trượt nhanh hơn!'],
    win: ['Pingu nhất!'],
  },
};

/* Tầu có câu riêng cho sự kiện thì phần lớn thời gian dùng câu đó, nhưng
   không phải luôn luôn — mỗi tầu chỉ có một hai câu mỗi sự kiện nên dùng
   tuyệt đối sẽ nghe lặp rất nhanh. */
export const OWN_WEIGHT = 0.6;

/* Điểm ưu tiên khi nhiều sự kiện cùng nổ trong một khung hình: điểm cao được
   nói trước, cái thua BỎ LUÔN chứ không xếp hàng — một câu "Ối!" hiện ba giây
   sau cú vấp còn tệ hơn là không hiện.
   Để ở đây cạnh EVENTS thay vì trong race.js, để test canh được rằng nó phủ
   đủ tên sự kiện; race.js không chạy dưới node --test. */
/* overtake nổ dày và trải đều cả chặng (xem race.js) nên phải đứng thấp nhất
   trong các sự kiện GIỮA CHẶNG — chỉ trên 'start' — để luôn nhường chỗ cho
   vấp, bung tốc, đổi ngôi và về đích. Thứ tự tương đối của các sự kiện cũ
   giữ nguyên, chỉ dịch lên một bậc để chừa chỗ cho overtake ở đáy. */
export const EVENT_RANK = { win: 6, last: 5, lead: 4, burst: 3, stumble: 2, overtake: 1, start: 0 };

const FALLBACK = '…';

function usable(a) {
  return Array.isArray(a) ? a.filter(s => typeof s === 'string' && s.trim().length > 0) : [];
}

/* cryLines truyền vào từ ngoài chứ không import: mảng `cry` nằm trong PETS của
   graphics.js, mà file đó đụng document. race.js có sẵn runnerById(rid).sp để tra.

   rnd nhận qua tham số để test bốc được câu tất định. Hàm thường gọi rnd()
   đúng hai lần: một lần chọn tầng, một lần chọn câu trong tầng. Riêng nhánh
   kho rỗng hoàn toàn (pool.length === 0) thoát sớm bằng return FALLBACK
   TRƯỚC lần rút thứ hai, nên chỉ gọi rnd() một lần — vô hại vì nhánh đó trả
   hằng số cố định, không cần ngẫu nhiên để chọn.

   PHẢI trả chuỗi khác rỗng với mọi đầu vào, kể cả rid lạ và cryLines rỗng —
   bong bóng trống là lỗi hiển thị rất khó truy ngược. */
export function pickLine(rid, event, cryLines, rnd = Math.random) {
  const r = typeof rnd === 'function' ? rnd : Math.random;

  const own = usable(RUNNER_LINES[rid] && RUNNER_LINES[rid][event]);
  const shared = usable(EVENT_LINES[event]);
  // Câu kêu của nông trại chỉ hợp lúc xuất phát, khi chưa có kịch tính gì để bình luận
  const farm = event === 'start' ? usable(cryLines) : [];

  const other = shared.concat(farm);
  let pool;
  if (own.length && other.length) pool = r() < OWN_WEIGHT ? own : other;
  else if (own.length) { r(); pool = own; }            // Rút đều hai lần để tất định không phụ thuộc nhánh
  else { r(); pool = other; }

  if (!pool.length) return FALLBACK;
  const i = Math.min(pool.length - 1, Math.floor(r() * pool.length));
  return pool[i];
}
