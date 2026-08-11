import { openModal } from './shop.js';
import { ctx } from './store.js';
import { save } from './state.js';
import { toast } from './witch.js';
import { renderStatus } from './render.js';
import { safeAmount, applyCashOut, rollD100, rollAnchor, clampAnchor, oddsOf, resolveRoll, nextPot, resolveStake, resultLabel, POT_CAP, INITIAL_BET_CAP } from './bet-odds.js';
import * as All from './all.js';

/* Tiền trên bàn nằm ở đúng một trường trong save. Không lưu số gốc, không lưu chuỗi roll —
   mở lại cửa sổ là phiên mới. Mục đích duy nhất là để tiền không bốc hơi khi F5 giữa chừng. */
export function getPot() { return safeAmount(ctx.S.betPot); }
export function setPot(v) { ctx.S.betPot = safeAmount(v); }

let anchor = 0;                                         // Số gốc của ván hiện tại
let chain = [];                                         // Chuỗi roll để hiển thị, tối đa 8 số
let busy = false;                                       // Chặn bấm chồng khi đang chạy hiệu ứng roll
let spinTimer = null;                                   // id của setInterval hiệu ứng quay, cấp module để dọn được từ bên ngoài
let holdTimer = null;                                   // id của setTimeout giữ số roll trên màn hình sau khi vòng quay dừng
let shown = null;                                       // { roll, kq, mult } đang được giữ trên màn hình, null = đang hiện số gốc
const HOLD_MS = 1000;                                   // Giữ đủ lâu để đọc được số vừa roll trước khi chuyển sang số gốc ván tới
const HOLD_LOSE_MS = 3000;                              // Thua thì giữ lâu hơn: mất trắng còn kéo theo reset chuỗi và số gốc mới,
                                                        // liếc 1 giây không kịp thấy mình thua vì số nào

/* Huỷ hẳn hiệu ứng quay đang treo (nếu có) và trả cờ busy về false.
   Phải gọi TRƯỚC bất kỳ đường rời bàn cược nào, kể cả khi pot đang bằng 0 —
   người chơi hoàn toàn có thể đóng bảng đúng lúc số đang quay, trước khi finish() kịp chạy.
   Không đụng tới chain/anchor ở đây: phiên mới tự quyết định lại chúng ở openBetModal
   dựa trên getPot(), và vì applyCashOut() luôn đưa pot về 0 nên phiên sau chắc chắn được reset sạch. */
function stopSpin() {
  if (spinTimer !== null) {
    window.clearInterval(spinTimer);
    spinTimer = null;
  }
  clearHold();
  busy = false;
}

/* Thôi giữ số roll trên màn hình. Gọi khi rời bàn, và khi người chơi bấm cược ván mới
   trước lúc hết thời gian giữ — lúc đó vòng quay mới sẽ chiếm ô số, giữ tiếp là vô nghĩa. */
function clearHold() {
  if (holdTimer !== null) {
    window.clearTimeout(holdTimer);
    holdTimer = null;
  }
  shown = null;
}

/* Vỏ mỏng quanh applyCashOut: phần tính toán đã có test riêng trong bet-odds.js,
   ở đây chỉ thêm phần lưu, vẽ lại và báo cho người chơi.
   Phải chạy được cả lúc giao diện chưa dựng (khởi động) lẫn lúc đang gỡ (destroy). */
export function cashOut(quiet, immediate) {
  stopSpin();                                           // Dọn trước, kể cả khi thoát sớm bên dưới vì pot = 0
  const pot = applyCashOut(ctx.S);
  if (pot <= 0) return 0;
  try { save(immediate); } catch (e) {}                 // destroy() cần lưu ngay vì trang có thể bị gỡ trước 500ms
  try { renderStatus(); } catch (e) {}
  if (!quiet) { try { toast('Đã rút ' + pot.toLocaleString() + ' G về ví'); } catch (e) {} }
  return pot;
}

function newRound() { anchor = rollAnchor(); }

function fmt(n) { return safeAmount(n).toLocaleString(); }

export function openBetModal() {
  if (getPot() <= 0) { chain = []; newRound(); }         // Không có tiền treo = phiên mới

  // keepBetTable = true: mở/vẽ lại chính bàn cược không được rút tiền treo trên bàn,
  // nếu không ván cược sẽ bị phân định sai (xem giải thích ở openModal trong shop.js).
  openModal('Hi-Lo', `
    <div class="betwrap">
      <div class="note" id="betCoins"></div>
      <div class="betnum" id="betNum">${anchor}</div>
      <div class="betresult" id="betResult"></div>
      <div class="betchain" id="betChain"></div>
      <div id="betStake"></div>
      <div class="betsides">
        <div class="betside hi" data-side="hi">▲ LỚN<span class="mult" id="betMultHi"></span><span class="chance" id="betChanceHi"></span></div>
        <div class="betside lo" data-side="lo">▼ NHỎ<span class="mult" id="betMultLo"></span><span class="chance" id="betChanceLo"></span></div>
      </div>
    </div>`, true);

  const render = () => {
    if (!All.$id('betCoins')) return;                    // Phòng vệ: bàn đã bị đóng/thay nội dung, không còn gì để vẽ
    const pot = getPot();
    All.$id('betCoins').textContent = 'Vàng: ' + fmt(ctx.S.coins) + ' G';
    // Đang giữ kết quả thì ô số lớn hiện SỐ VỪA ROLL, hết giữ mới chuyển sang số gốc ván tới.
    // Nếu để render() luôn ghi đè bằng anchor thì màn hình mâu thuẫn với thông báo "Ra 73".
    All.$id('betNum').textContent = String(shown ? shown.roll : anchor);
    All.$id('betNum').classList.toggle('res', !!shown);
    All.$id('betResult').textContent = shown
      ? resultLabel(shown.roll, shown.kq, shown.mult, anchor)
      : 'Số gốc — cược Lớn hay Nhỏ cho lần quay tới';
    All.$id('betChain').textContent = chain.length ? 'Chuỗi: ' + chain.join(' → ') : '';

    // Chỉ dựng lại khu đặt cược khi thật sự cần. render() còn được gọi lại lúc hết giờ giữ
    // số roll, mà lúc đó người chơi có thể đang gõ dở số tiền — ghi đè innerHTML sẽ xoá mất.
    // Listener gắn NGAY tại chỗ vừa dựng phần tử, không gắn ở cuối render().
    // Vì nhánh dưới có thể bỏ qua việc dựng lại, gắn ở cuối sẽ chồng thêm một listener mỗi lần vẽ.
    if (pot > 0) {                                       // Có tiền trên bàn: số tiền đổi mỗi ván nên phải vẽ lại
      All.$id('betStake').innerHTML =
        `<div class="betpot">Trên bàn: ${fmt(pot)} G</div>
         <span class="buy" id="betCash">Rút ${fmt(pot)} G</span>`;
      All.$id('betCash').addEventListener('click', () => {
        if (busy) return;
        cashOut(); chain = []; newRound(); render();
      });
    } else if (!All.$id('betAmt')) {                     // Chưa có ô nhập thì mới dựng, có rồi thì để yên kẻo xoá mất số đang gõ dở
      All.$id('betStake').innerHTML =
        `<div style="display:flex;gap:6px;align-items:center;justify-content:center;flex-wrap:wrap;margin:8px 0 2px">
           <input class="inp" id="betAmt" type="number" min="1" value="${Math.min(100, safeAmount(ctx.S.coins)) || 1}" style="width:110px">
           <span class="buy plain" data-quick="4">¼</span>
           <span class="buy plain" data-quick="2">½</span>
           <span class="buy plain" data-quick="1">Max</span>
         </div>`;
      All.$id('betStake').querySelectorAll('[data-quick]').forEach(b => b.addEventListener('click', () => {
        const amt = All.$id('betAmt');
        if (amt) amt.value = String(Math.max(1, Math.floor(Math.min(INITIAL_BET_CAP, safeAmount(ctx.S.coins)) / Number(b.dataset.quick))));
      }));
    }

    ['hi', 'lo'].forEach(side => {
      const o = oddsOf(anchor, side);
      const el = All.$id('betMult' + (side === 'hi' ? 'Hi' : 'Lo'));
      const ch = All.$id('betChance' + (side === 'hi' ? 'Hi' : 'Lo'));
      el.textContent = o.locked ? '—' : '×' + o.mult.toFixed(2);
      ch.textContent = o.locked ? 'không thể thắng' : Math.round(o.chance * 100) + '%';
      All.$id('mbody').querySelector('.betside.' + side).classList.toggle('off', o.locked);
    });

    if (getPot() >= POT_CAP) {                           // Chạm trần: cược tiếp vô nghĩa vì không tăng thêm được nữa
      All.$id('mbody').querySelectorAll('.betside').forEach(el => el.classList.add('off'));
    }

  };

  const play = side => {
    if (busy) return;
    clearHold();                                        // Cược ván mới khi còn đang giữ kết quả cũ:
                                                        // bỏ giữ ngay, kẻo bộ đếm cũ bắn giữa vòng quay mới và ghi đè số đang chạy
    const o = oddsOf(anchor, side);
    if (o.locked) return toast('Cửa này không có khả năng thắng nào');
    if (getPot() >= POT_CAP) return toast('Đã chạm trần, rút tiền ra đã');

    if (getPot() <= 0) {                                 // Ván đầu: lấy tiền từ ô nhập, trừ ví
      const el = All.$id('betAmt');
      const want = safeAmount(el && el.value);
      const coins = safeAmount(ctx.S.coins);
      if (want <= 0) return toast('Nhập số vàng muốn cược đã');
      if (want > coins) return toast('Không đủ vàng, bạn chỉ có ' + fmt(coins) + ' G');
      const stake = resolveStake(want, coins);             // Kẹp cả theo ví lẫn POT_CAP
      if (stake < want) toast('Vượt trần, đã hạ xuống ' + fmt(POT_CAP) + ' G');
      ctx.S.coins = safeAmount(coins - stake);
      setPot(stake);
      save();
    }

    busy = true;
    const num = All.$id('betNum');
    num.classList.add('rolling');
    const roll = rollD100();
    let tick = 0;
    spinTimer = window.setInterval(() => {                // Hiệu ứng số chạy ~600ms rồi dừng ở kết quả
      // Phòng vệ thứ hai: nếu bàn đã bị đóng/vẽ lại giữa chừng mà lỡ chưa kịp dọn ở cashOut(),
      // phần tử này sẽ không còn trong DOM nữa — huỷ nhịp quay tại chỗ, không đụng gì thêm.
      const numNow = All.$id('betNum');
      if (!numNow) {
        window.clearInterval(spinTimer);
        spinTimer = null;
        busy = false;
        return;
      }
      numNow.textContent = String(rollD100());
      if (++tick >= 12) {
        window.clearInterval(spinTimer);
        spinTimer = null;
        numNow.classList.remove('rolling');
        numNow.textContent = String(roll);
        finish(roll, side, o);
      }
    }, 50);
  };

  const finish = (roll, side, o) => {
    const kq = resolveRoll(anchor, side, roll);
    chain = chain.concat(roll).slice(-8);

    if (kq === 'push') {
      toast('Hoà! Ra đúng ' + roll + ', tiền giữ nguyên');
    } else if (kq === 'win') {
      const truoc = getPot();
      setPot(nextPot(truoc, o.mult));
      anchor = clampAnchor(roll);                         // Nối chuỗi: số vừa roll thành số gốc ván sau,
                                                           // kẹp về dải an toàn ANCHOR_MIN..ANCHOR_MAX vì roll
                                                           // gốc là 1..100 đầy đủ, có thể rơi ngoài dải
      toast('Thắng! ' + fmt(truoc) + ' → ' + fmt(getPot()) + ' G');
      if (getPot() >= POT_CAP) toast('Chạm trần ' + fmt(POT_CAP) + ' G, rút thôi!');
    } else {
      setPot(0);
      toast('Mất trắng! Ra ' + roll);
      chain = [];
      newRound();
    }
    shown = { roll, kq, mult: o.mult };                  // Giữ số vừa roll trên màn hình để đọc kịp
    save();
    busy = false;
    renderStatus();
    render();
    holdTimer = window.setTimeout(() => {                // Hết giữ thì mới chuyển ô số sang số gốc ván tới
      holdTimer = null;
      shown = null;
      render();
    }, kq === 'lose' ? HOLD_LOSE_MS : HOLD_MS);
  };

  All.$id('mbody').querySelectorAll('[data-side]').forEach(b =>
    b.addEventListener('click', () => play(b.dataset.side)));
  render();
}
