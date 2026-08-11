/* Minigame Đua Pet — lớp vỏ giao diện.
   Toàn bộ phần toán và tiền nằm ở race-sim.js; file này chỉ dựng DOM,
   đọc/ghi ctx.S rồi uỷ quyền. Đừng nhét công thức vào đây: phần nào tính
   được thì phải tính được bằng node --test, mà file này thì không. */
import { ctx } from './store.js';
import * as All from './all.js';
import {
  LANES, MIN_BET, PLACE_TOP, safeAmount,
  runnerById, drawEntrants, resolveEntrants, computeOdds, simulateRace,
  newRaceState, applyRaceBet, applyRaceSettle, applyRaceForm, applyRaceRefund, applyRaceVoid, applyRaceStats, betKey,
  playbackTiming, TRACK,
} from './race-sim.js';
import { save } from './state.js';

export let isRaceOpen = false;

/* Dùng khung lớn #race-win chứ KHÔNG dùng openModal():
   openModal() gọi cashOut() của bàn đỏ đen, sẽ gây tác dụng phụ chéo. */
export function openRaceView() {
  if (isRaceOpen) return;
  isRaceOpen = true;
  All.closeWin();

  const win = All.$id('race-win');
  if (win) {
    win.style.display = 'flex';
    All.placeRaceWin(); // đặt vị trí trước khi chạy hiệu ứng popup, kẻo cửa sổ nhảy chỗ
    win.classList.remove('open-anim');
    void win.offsetWidth;                                  // Ép reflow để hiệu ứng popup chạy lại
    win.classList.add('open-anim');
  }
  if (All.raceView) All.raceView.style.display = 'flex';

  const closeBtn = All.$id('race-close');
  if (closeBtn) closeBtn.onclick = () => closeRaceView();

  renderRace();
}

export function closeRaceView() {
  if (!isRaceOpen) return;
  isRaceOpen = false;

  /* Thanh toán TRƯỚC khi đụng gì tới hoạt cảnh/DOM. stopRaceAnim() ngay dưới đây
     gọi cancelAnimationFrame() đồng bộ, nên nhánh "phần tử không còn trong DOM"
     ở đầu step() (xem playRace()) không bao giờ có dịp chạy tới khi đóng cửa sổ
     theo đường này — không có callback nào tự gọi settleNow() nữa. Xem
     settleIfLocked() để biết vì sao chạy lại sim là đủ và an toàn. */
  settleIfLocked();
  stopRaceAnim();

  const win = All.$id('race-win');
  if (win) { win.style.display = 'none'; win.classList.remove('open-anim'); }
  if (All.raceView) { All.raceView.style.display = 'none'; All.raceView.innerHTML = ''; }

  All.$id('win').classList.add('open');
  All.$id('viewToggle').style.display = '';
  All.applyPageSkin();
  All.applyViewState();
  All.renderPager();
  All.renderPlots();
  All.renderToolbar();
}

let sel = null;                      // Cửa đang chọn: { kind, lane } hoặc null

/* Copy hằng số dáng chạy từ pets.js chứ KHÔNG gọi hopStep()/moveTo()/placePet().
   Các hàm đó ghi vào petPos/petTgt/petHopT — dictionary toàn cục keyed theo
   PET ID — và truy vấn #mascots. Con slime đang đi dạo trên ruộng và con slime
   đang chạy trên đường đua sẽ giẫm lên toạ độ của nhau.
   Đường đua giữ store riêng, keyed theo LÀN. */
const RACE_GAITS = { octo: { dur: 260, hy: 4 }, octoCream: { dur: 290, hy: 4 }, _: { dur: 330, hy: 9 } };
const RACE_FLOATY = { cloudMallow: 1, ghostBlob: 1, jellyfish: 1 };
const gaitOf = sp => RACE_GAITS[sp] || RACE_GAITS._;

let animFrame = null;
let animEnd = null;                  // Hàm chạy khi hoạt cảnh kết thúc (hoặc bị bỏ qua)

/* Bốc thăm ván mới. drawSeed và raceSeed tách rời có chủ ý: raceSeed chỉ sinh
   đúng lúc bấm Xuất phát, nên trong lúc người chơi còn đang cân nhắc thì kết quả
   chưa tồn tại ở bất cứ đâu — kể cả trong DevTools. */
export function newRaceSession() {
  const drawSeed = (Math.random() * 0x7fffffff) | 0;
  const refs = drawEntrants(drawSeed);
  const ents = resolveEntrants(refs);
  /* ents không thể null: drawEntrants() bốc rid trực tiếp từ RUNNERS nên mọi rid
     nó trả ra luôn giải được. Vẫn phòng vệ ở đây vì đây là nơi bốc ván mới —
     nếu logic bốc thăm đổi sau này mà lọt rid hỏng, thà không mở ván nào còn
     hơn mở một ván với chỉ số làn lệch pha (xem resolveEntrants ở race-sim.js). */
  if (!ents) { ctx.S.race = null; save(true); return; }
  const cond = { rain: !!All.isRain() };
  const odds = computeOdds(drawSeed ^ 0x5BF03635, ents, cond);
  ctx.S.race = newRaceState(drawSeed, refs, cond, odds);
  sel = null;
  save();
}

function fmt(n) { return safeAmount(n).toLocaleString(); }

/* Nhãn cửa "place" dùng chung cho tiêu đề cột và dòng "Đã đặt" — viết một
   lần để hai chỗ không bao giờ trôi lệch khi PLACE_TOP đổi.
   KHÔNG đổi thành "Về hạng nhì"/"hạng 2": cửa này thắng khi tầu về NHẤT
   HOẶC NHÌ (top PLACE_TOP), không phải chỉ đúng hạng 2 — ghi "hạng nhì" sẽ
   khiến người chơi tưởng mình thua khi tầu thực ra về nhất. */
const PLACE_LABEL = `Về top ${PLACE_TOP}`;

function formCell(rid) {
  const f = ctx.S.raceForm && ctx.S.raceForm[rid];
  if (!f || !f.runs) return '<span class="race-form">—</span>';
  const last = f.last5.length ? f.last5.join('-') : '—';
  const rate = Math.round((f.wins / f.runs) * 100);
  return `<span class="race-form">${last}</span>`
       + `<span class="race-form" style="margin-left:6px;opacity:.75">${rate}%</span>`;
}

function oddsCell(kind, lane, g) {
  /* title giải thích rõ đây là trạng thái CỐ Ý khoá (xác suất thắng quá thấp),
     không phải ô bị lỗi hiển thị/thiếu chữ. */
  if (g.locked) return `<span class="odds-cell off" title="Khả năng thắng quá thấp — không thể đặt cược cửa này">—</span>`;
  const on = sel && sel.kind === kind && sel.lane === lane ? ' sel' : '';
  return `<span class="odds-cell${on}" data-kind="${kind}" data-lane="${lane}">×${g.mult.toFixed(2)}</span>`;
}

function renderRace() {
  if (!All.raceView) return;
  /* Lưới an toàn: renderRace() dựng lại toàn bộ innerHTML (đường đua, bảng, khu
     đặt cược) mỗi lần gọi, kể cả từ những nơi không liên quan gì tới ô nhập tiền
     (vd hoàn ván lỗi dữ liệu ở dưới). Nếu ô #raceAmt đang tồn tại và người chơi
     đang gõ dở, đọc lại giá trị đó ngay bây giờ rồi dùng lại nó khi dựng markup
     mới — đừng luôn tính mặc định. Xem bet.js (hàm render() khu đặt cược Đỏ Đen)
     cho đúng lỗi này ở chỗ khác: nó né bằng cách không dựng lại ô nhập nếu đã có;
     ở đây bảng phải vẽ lại toàn bộ nên ta giữ giá trị thay vì né vẽ lại. */
  const prevAmtEl = All.$id('raceAmt');
  const keptAmt = prevAmtEl ? prevAmtEl.value : null;
  if (!ctx.S.race || ctx.S.race.phase === 'settled') {
    newRaceSession();
  } else if (!resolveEntrants(ctx.S.race.entrants)) {
    /* Ván đang mở (betting/locked) nhưng ít nhất một rid đã lưu không còn giải
       được — kịch bản có thật nếu một bản cập nhật đổi/xoá rid trong RUNNERS
       trong khi save của người chơi đang giữ ván dở dang. Không đoán mò tiếp
       trên state hỏng: hoàn hết tiền đã cược của ván cũ rồi bốc ván mới. */
    const back = applyRaceVoid(ctx.S);
    save(true);
    if (back > 0) All.toast('Ván đua cũ lỗi dữ liệu, đã hoàn ' + fmt(back) + ' G');
    newRaceSession();
  }
  const r = ctx.S.race;
  const betting = r.phase === 'betting';

  const rows = r.entrants.map(e => {
    const run = runnerById(e.rid);
    return `<tr>
      <td>${e.lane + 1}</td>
      <td>${run.name}</td>
      <td>${formCell(e.rid)}</td>
      <td>${oddsCell('win', e.lane, r.odds.win[e.lane])}</td>
      <td>${oddsCell('place', e.lane, r.odds.place[e.lane])}</td>
    </tr>`;
  }).join('');

  const daBet = Object.keys(r.bets).length
    ? '<div class="note">Đã đặt: ' + Object.keys(r.bets).map(k => {
        const [kind, lane] = k.split(':');
        const nm = runnerById(r.entrants[Number(lane)].rid).name;
        return `${nm} ${kind === 'win' ? 'Thắng' : PLACE_LABEL} ${fmt(r.bets[k])} G`;
      }).join(' · ') + '</div>'
    : '';

  /* <details open> không đặt điều kiện được bằng CSS thuần (không có cách nào
     viết "mặc định mở khi > 640px" chỉ bằng media query lên một thuộc tính
     HTML), nên quyết định mở/đóng ngay lúc dựng markup. Ngưỡng 640 khớp với
     @media (max-width: 640px) đã dùng sẵn trong style.js cho toàn bộ giao diện
     — màn rộng hơn thì mở sẵn cho tiện đọc, màn hẹp bằng hoặc dưới ngưỡng đó
     thì thu lại để nhường chỗ cho đường đua, người chơi tự bấm khi cần. */
  const helpOpen = window.innerWidth > 640;

  All.raceView.innerHTML = `
    <div class="race-hud">
      <span>${r.cond.rain ? '🌧 Đường trơn — kết quả loạn hơn' : '☀ Đường khô'}</span>
      <span>Vàng: <b id="raceCoins">${fmt(ctx.S.coins)}</b> G</span>
    </div>
    <div class="race-track" id="raceTrack"></div>
    <div class="race-result" id="raceResult"></div>
    ${daBet}
    <table class="race-tbl">
      <tr><th>Làn</th><th>Tầu</th><th>Phong độ · T.thắng</th><th>Thắng</th><th>${PLACE_LABEL}</th></tr>
      ${rows}
    </table>
    <div class="race-betrow" id="raceBetRow">
      <input class="inp" id="raceAmt" type="number" min="${MIN_BET}" value="${keptAmt !== null ? keptAmt : Math.max(MIN_BET, Math.min(100, safeAmount(ctx.S.coins)))}" style="width:100px">
      <span class="buy plain" data-quick="4">¼</span>
      <span class="buy plain" data-quick="2">½</span>
      <span class="buy plain" data-quick="1">Max</span>
      <span class="buy" id="raceBet">Đặt cược</span>
      <span class="buy" id="raceGo">Xuất phát</span>
    </div>
    ${betting ? `
    <details class="race-help"${helpOpen ? ' open' : ''}>
      <summary>Cách chơi</summary>
      <ol>
        <li>Bấm vào ô tỉ lệ để chọn cửa (ô sẽ sáng vàng)</li>
        <li>Nhập số vàng muốn cược, hoặc bấm ¼ · ½ · Max</li>
        <li>Bấm <b>Đặt cược</b></li>
        <li>Đặt được nhiều cửa trong cùng một ván; xong thì bấm <b>Xuất phát</b></li>
      </ol>
      <div><b>Thắng</b> — tầu về nhất. <b>${PLACE_LABEL}</b> — tầu về nhất hoặc nhì. Hệ số ×N nghĩa là trúng thì nhận về số vàng đã cược nhân N; ô "—" là cửa không đặt được vì khả năng thắng quá thấp.</div>
      <div><b>Phong độ · T.thắng</b>: thứ hạng 5 ván gần nhất, và tỉ lệ thắng tích luỹ của tầu đó qua toàn bộ số ván bạn đã xem.</div>
      <div>Trời mưa làm kết quả loạn hơn, khó đoán hơn.</div>
      <div class="race-help-note">Lưu ý: kết quả được chốt ngay khi bấm Xuất phát. Đóng cửa sổ hay tải lại trang giữa chừng vẫn được thanh toán đầy đủ, chỉ là không xem được hoạt cảnh.</div>
    </details>` : ''}`;

  drawTrack();
  if (!betting) All.raceView.querySelectorAll('.buy,.inp').forEach(el => el.classList.add('off'));

  /* Chọn cửa là thao tác THUẦN HIỂN THỊ — không đổi state game nào (chưa trừ
     vàng, chưa ghi bets). Vì vậy KHÔNG gọi renderRace() ở đây: renderRace() dựng
     lại toàn bộ innerHTML kể cả ô #raceAmt, nên nếu người chơi vừa gõ xong số
     tiền rồi mới bấm chọn cửa, gọi renderRace() sẽ tạo ô nhập mới với giá trị
     mặc định — xoá mất số vừa gõ (đúng lỗi đã có tiền lệ ở bet.js, xem comment
     trong renderRace()). Chỉ cần cập nhật biến `sel` rồi bật/tắt class 'sel'
     trên đúng các ô liên quan là đủ, không đụng gì tới DOM khác. */
  const oddsCells = All.raceView.querySelectorAll('.odds-cell[data-kind]');
  oddsCells.forEach(el => {
    el.addEventListener('click', () => {
      if (ctx.S.race.phase !== 'betting') return;
      sel = { kind: el.dataset.kind, lane: Number(el.dataset.lane) };
      oddsCells.forEach(c => {
        c.classList.toggle('sel', c.dataset.kind === sel.kind && Number(c.dataset.lane) === sel.lane);
      });
    });
  });

  All.raceView.querySelectorAll('[data-quick]').forEach(b => b.addEventListener('click', () => {
    const amt = All.$id('raceAmt');
    if (amt) amt.value = String(Math.max(MIN_BET, Math.floor(safeAmount(ctx.S.coins) / Number(b.dataset.quick))));
  }));

  const betBtn = All.$id('raceBet');
  if (betBtn) betBtn.addEventListener('click', onBet);
  const goBtn = All.$id('raceGo');
  if (goBtn) goBtn.addEventListener('click', onGo);
}

function onBet() {
  const r = ctx.S.race;
  if (!r || r.phase !== 'betting') return;
  if (!sel) return All.toast('Bấm vào ô tỉ lệ để chọn cửa đã');
  const g = r.odds[sel.kind][sel.lane];
  if (g.locked) return All.toast('Cửa này không đặt được');
  const want = safeAmount(All.$id('raceAmt') && All.$id('raceAmt').value);
  if (want < MIN_BET) return All.toast('Cược tối thiểu ' + MIN_BET + ' G');
  const got = applyRaceBet(ctx.S, betKey(sel.kind, sel.lane), want);
  if (!got) return All.toast('Không đủ vàng, bạn chỉ có ' + fmt(ctx.S.coins) + ' G');
  if (got < want) All.toast('Chỉ đủ ' + fmt(got) + ' G, đã hạ xuống');
  save();
  All.renderStatus();
  renderRace();
}

/* Chốt cửa. Từ giây này kết quả là hàm thuần của raceSeed: đóng cửa sổ, F5,
   sập nguồn đều không đổi được gì — nên save(true) ngay, không debounce. */
function onGo() {
  const r = ctx.S.race;
  if (!r || r.phase !== 'betting') return;
  if (!r.staked) return All.toast('Đặt cược đã rồi hãy xuất phát');

  r.raceSeed = (Math.random() * 0x7fffffff) | 0;
  r.phase = 'locked';
  save(true);

  const ents = resolveEntrants(r.entrants);
  if (!ents) {
    /* rid hỏng ngay lúc xuất phát: không có ván thật nào để mô phỏng, mọi
       order sinh ra từ đây sẽ lệch pha chỉ số làn (xem resolveEntrants ở
       race-sim.js). Hoàn tiền đã cược, xoá ván, không chạy sim mù. */
    const back = applyRaceVoid(ctx.S);
    save(true);
    All.toast('Ván đua lỗi dữ liệu, đã hoàn ' + fmt(back) + ' G');
    renderRace();
    return;
  }
  const { order, finishTicks, lapLog } = simulateRace(r.raceSeed, ents, r.cond, true);

  // Khoá khu đặt cược và đổi nút thành Bỏ qua trong lúc chạy
  const row = All.$id('raceBetRow');
  if (row) row.innerHTML = '<span class="buy" id="raceSkip">Bỏ qua</span>';
  const skip = All.$id('raceSkip');
  if (skip) skip.addEventListener('click', () => { if (animEnd) animEnd(); });

  const box = All.$id('raceResult');
  if (box) box.textContent = 'Xuất phát!';

  playRace(lapLog, finishTicks, () => settleNow(order));
}

/* Chạy đúng một lần lúc khởi động, ngay cạnh cashOut(true) của bàn đỏ đen.
   Vì kết quả là hàm thuần của raceSeed, sim lại lúc boot cho ĐÚNG kết quả cũ —
   không mất vàng, không tạo vàng.
   Phải chạy được cả khi giao diện chưa dựng xong. */
export function settleRaceOnBoot() {
  const r = ctx.S && ctx.S.race;
  if (!r) return;

  /* Lớp phòng vệ 1 (trong chính hàm này): chạy trước initUI() và không có
     try/catch nào ở nơi gọi trong initFarm() ban đầu — chính là kịch bản mà
     bug này gây ra (xem task-10-review.md). Mọi nhánh dưới đây PHẢI thoát êm
     thay vì ném, kể cả khi gặp đúng loại state hỏng mà tính năng này sinh ra
     để chống đỡ (ghi dở giữa lúc sập nguồn, schema đổi giữa các bản, sửa tay
     file settings...). Bọc thêm try/catch tổng ở ngoài cùng làm lưới cuối cho
     những kiểu hỏng chưa lường hết (vd phần tử null lẫn trong mảng entrants). */
  try {
    if (r.phase === 'settled') { ctx.S.race = null; save(true); return; }

    if (r.phase === 'betting') {                    // Chưa chốt cửa = ván chưa thành hình
      if (!r.bets || typeof r.bets !== 'object') {   // bets hỏng: applyRaceRefund() gọi thẳng
        /* Object.keys(r.bets) sẽ ném nếu null/undefined, nên không gọi thẳng
           applyRaceRefund() ở đây được — nhưng vẫn phải đi qua MỘT đường hoàn
           tiền nào đó thay vì tự tay xoá. applyRaceVoid() coi bets không phải
           object là {} (an toàn, không ném), nên dùng nó: nếu vẫn còn cách nào
           đọc ra số tiền đã cược thật thì nó hoàn, nếu bets hỏng tới mức không
           đọc được gì thì hoàn 0 — không tệ hơn xoá trắng, chỉ có thể bằng. */
        const back = applyRaceVoid(ctx.S);
        save(true);
        if (back > 0) { try { All.toast('Ván đua dở dang lỗi dữ liệu, đã hoàn ' + fmt(back) + ' G'); } catch (e) {} }
        return;
      }
      const back = applyRaceRefund(ctx.S);
      save(true);
      if (back > 0) { try { All.toast('Ván đua dở dang, đã hoàn ' + fmt(back) + ' G'); } catch (e) {} }
      return;
    }

    // phase === 'locked' (hoặc phase lạ khác): kết quả đã cố định, thanh toán ngay
    /* entrants hỏng ở dạng THÔ (undefined/null/rỗng) thì resolveEntrants() còn
       chưa kịp chạy tới, và raceSeed không phải số hữu hạn thì sim ra một kết
       quả không khớp gì với ván người chơi thực sự đã thấy trên màn hình. Cả
       hai đều là state không cứu được để mà THANH TOÁN (không có order nào
       đáng tin) — nhưng đó không phải lý do để XOÁ MÀ KHÔNG HOÀN.
       "entrants/raceSeed hỏng thì r.bets chắc cũng không tin được" là lập luận
       không đứng vững: applyRaceVoid() cộng dồn qua safeAmount(r.bets[k]), nên
       rác đầu vào (NaN, chuỗi, undefined...) cho ra 0, không ném lỗi. Xấu nhất
       là hoàn 0 đồng — đúng bằng xoá trắng, không bao giờ tệ hơn. Còn nếu bets
       vẫn là số thật (trường hợp thường gặp nhất: chỉ mỗi entrants/raceSeed bị
       hỏng, ví dụ ghi dở giữa lúc sập nguồn) thì người chơi lấy lại đúng số
       vàng đã trừ lúc đặt cược, thay vì mất trắng. Vì vậy: hoàn tiền luôn, dù
       state hỏng nặng tới đâu — không đoán mò kết quả, không xoá tay. */
    if (!Array.isArray(r.entrants) || !r.entrants.length || !Number.isFinite(r.raceSeed)) {
      const back = applyRaceVoid(ctx.S);
      save(true);
      if (back > 0) { try { All.toast('Ván đua dở dang lỗi dữ liệu, đã hoàn ' + fmt(back) + ' G'); } catch (e) {} }
      return;
    }

    const refs = r.entrants;
    const ents = resolveEntrants(refs);
    if (!ents) {
      /* Guard ngay phía trên chỉ bắt được entrants rỗng/thô sai kiểu — entrants
         có đủ 5 phần tử nhưng một rid không giải được (vd RUNNERS đổi tên/xoá
         pet giữa hai bản trong khi save đang ở phase 'locked') vẫn lọt qua nó.
         resolveEntrants() trả null ở đây đúng là trường hợp đó: order sinh từ
         một mảng đã bị lọc âm thầm sẽ lệch pha số làn, có thể trả tiền cho cửa
         không tồn tại hoặc nuốt tiền cược. Hoàn tiền, không thanh toán mù. */
      const back = applyRaceVoid(ctx.S);
      save(true);
      if (back > 0) { try { All.toast('Ván đua dở dang lỗi dữ liệu, đã hoàn ' + fmt(back) + ' G'); } catch (e) {} }
      return;
    }
    const { order } = simulateRace(r.raceSeed, ents, r.cond, false);
    const res = applyRaceSettle(ctx.S, order);
    if (!res) { ctx.S.race = null; save(true); return; }
    applyRaceForm(ctx.S, refs, order);
    applyRaceStats(ctx.S, res);

    ctx.S.race = null;
    save(true);
    try {
      const nhat = runnerById(refs[order[0]].rid).name;
      All.toast(`Ván đua bỏ dở: ${nhat} về nhất · nhận ${fmt(res.payout)} G`);
    } catch (e) {}
  } catch (e) {
    // Lưới cuối: state hỏng theo kiểu chưa lường hết vẫn không được làm sập boot.
    // Phải ghi log thay vì nuốt lặng: đây là mã xử lý tiền người chơi — một lỗi thật
    // lúc thanh toán ván đua sẽ bị nuốt không dấu vết, và không ai biết ván đã không
    // được thanh toán. Log giúp phát hiện lỗi trong thống kê cảnh báo sớm.
    console.error('[Farm] settleRaceOnBoot lỗi lúc thanh toán ván đua dở dang, bỏ qua để không chặn khởi động:', e);
    /* Lưới cuối cũng phải hoàn tiền, không chỉ xoá: nếu lỗi ném ra TRƯỚC khi
       applyRaceSettle() kịp chạy (vd simulateRace ném trên ents dị dạng chưa
       lường hết), r.bets vẫn là tiền cược thật chưa được xử lý — xoá tay ở đây
       sẽ tái hiện đúng lỗi mất tiền đang vá. applyRaceVoid() tự no-op nếu ván
       đã 'settled' rồi (idempotent, không hoàn hai lần), nên gọi thẳng luôn an toàn. */
    try { applyRaceVoid(ctx.S); save(true); } catch (e2) {}
  }
}

/* Thanh toán ngay nếu ván đang chốt cửa (phase 'locked') nhưng chưa từng vào
   settleNow() — dùng chung cho closeRaceView() (đóng giữa hoạt cảnh) và
   destroy() (thoát ứng dụng giữa hoạt cảnh). settleRaceOnBoot() ở trên là bản
   dành riêng cho lúc khởi động: nó KHÔNG gọi settleNow() vì settleNow() đụng
   DOM không phòng vệ (All.renderStatus() ghi thẳng vào #coins, không có
   `if (el)` bọc ngoài) — lúc khởi động initUI()/initRender() còn chưa chạy,
   nên gọi settleNow() ở đây sẽ ném lỗi. settleRaceOnBoot() vì vậy nhân bản lại
   đúng phần tính tiền (không đụng DOM) từ settleNow(), không phải vì lười tái
   dùng.
   Từ lúc phase = 'locked', order là hàm thuần của raceSeed (xem simulateRace
   trong race-sim.js), nên chạy lại sim ở đây cho ĐÚNG kết quả mà hoạt cảnh
   đang phát dở — không tạo vàng, không mất vàng, không cần lapLog hay bất cứ
   trạng thái hoạt cảnh nào còn sống.
   An toàn khi gọi trùng đường settle bình thường: applyRaceSettle() chốt
   phase = 'settled' TRƯỚC khi cộng đồng nào, nên nếu hoạt cảnh vừa kịp tự chạy
   xong (settleNow đã chạy) thì phase không còn 'locked' nữa và hàm này no-op. */
export function settleIfLocked() {
  const r = ctx.S.race;
  if (!r || r.phase !== 'locked') return;
  const ents = resolveEntrants(r.entrants);
  if (!ents) {
    // rid hỏng giữa ván đã khoá: order sinh trên mảng bị lọc âm thầm sẽ lệch pha
    // số làn (xem resolveEntrants ở race-sim.js). Hoàn tiền, không đoán mò kết quả.
    const back = applyRaceVoid(ctx.S);
    save(true);
    try { if (back > 0) All.toast('Ván đua lỗi dữ liệu, đã hoàn ' + fmt(back) + ' G'); } catch (e) {}
    return;
  }
  const { order } = simulateRace(r.raceSeed, ents, r.cond, false);
  settleNow(order);
}

export function settleNow(order) {
  const r = ctx.S.race;
  if (!r) return;
  const refs = r.entrants;
  const res = applyRaceSettle(ctx.S, order);
  if (!res) return;
  applyRaceForm(ctx.S, refs, order);
  applyRaceStats(ctx.S, res);

  save(true);
  All.renderStatus();

  const nhat = runnerById(refs[order[0]].rid).name;
  const loi = res.payout - res.staked;
  All.toast(`Về nhất: ${nhat} · ${loi >= 0 ? 'Lãi' : 'Lỗ'} ${fmt(Math.abs(loi))} G`);

  /* KHÔNG gọi renderRace() ở đây. renderRace() bốc ván mới khi phase đã 'settled',
     nên bảng sẽ nhảy sang 5 tầu khác trong khi khung kết quả vẫn ghi tên tầu ván cũ.
     Cập nhật tại chỗ, để người chơi tự bấm "Đua ván mới". */
  const coinEl = All.$id('raceCoins');
  if (coinEl) coinEl.textContent = fmt(ctx.S.coins);

  const box = All.$id('raceResult');
  if (box) {
    box.innerHTML = order.map((lane, i) => `${i + 1}. ${runnerById(refs[lane].rid).name}`).join(' · ')
      + `<br>Nhận về ${fmt(res.payout)} G trên ${fmt(res.staked)} G đã cược`;
  }

  if (All.raceView) All.raceView.querySelectorAll('.odds-cell').forEach(el => el.classList.add('off'));

  const row = All.$id('raceBetRow');
  if (row) {
    row.innerHTML = '<span class="buy" id="raceAgain">Đua ván mới</span>';
    const again = All.$id('raceAgain');
    if (again) again.addEventListener('click', () => { newRaceSession(); renderRace(); });
  }
}

/* Đường đua tĩnh. Task 9 thay bằng bản có hoạt cảnh. */
function drawTrack() {
  const tr = All.$id('raceTrack');
  if (!tr) return;
  const r = ctx.S.race;
  tr.innerHTML = r.entrants.map(e =>
    `<div class="race-lane"><span class="race-runner" data-lane="${e.lane}">${All.petSVG(runnerById(e.rid).sp, 36)}</span></div>`
  ).join('') + '<div class="race-finish"></div>';
}

export function stopRaceAnim() {
  if (animFrame !== null) { window.cancelAnimationFrame(animFrame); animFrame = null; }
  animEnd = null;
}

/* Phát lại kết quả ĐÃ CÓ. Hàm này không quyết định gì cả — nó chỉ vẽ.
   Bỏ qua giữa chừng cũng cho đúng kết quả đó, vì kết quả cố định từ trước. */
function playRace(lapLog, finishTicks, onDone) {
  stopRaceAnim();
  const { msPerTick, totalMs } = playbackTiming(finishTicks);
  const tr = All.$id('raceTrack');
  if (!tr) return onDone();

  const r = ctx.S.race;
  const els = [];
  for (let lane = 0; lane < r.entrants.length; lane++) {
    els.push(tr.querySelector('.race-runner[data-lane="' + lane + '"]'));
  }
  const width = Math.max(60, tr.clientWidth - 52);        // Chừa chỗ cho con thú và vạch đích
  const t0 = performance.now();
  let ended = false;

  const finish = () => {
    if (ended) return;
    ended = true;
    stopRaceAnim();
    onDone();
  };
  animEnd = finish;

  const step = () => {
    const el0 = All.$id('raceTrack');
    if (!el0) return finish();                            // Cửa sổ bị đóng giữa chừng
    const elapsed = performance.now() - t0;
    const tick = elapsed / msPerTick;
    const i0 = Math.min(lapLog.length - 1, Math.floor(tick));
    const i1 = Math.min(lapLog.length - 1, i0 + 1);
    const frac = tick - Math.floor(tick);

    for (let lane = 0; lane < els.length; lane++) {
      const el = els[lane];
      if (!el) continue;
      const a = lapLog[i0][lane], b = lapLog[i1][lane];
      const pos = Math.min(TRACK, a + (b - a) * frac);
      const x = (pos / TRACK) * width;

      const sp = runnerById(r.entrants[lane].rid).sp;
      let y = 0;
      if (!RACE_FLOATY[sp]) {                             // Nhóm không bay thì nhảy parabol
        const g = gaitOf(sp);
        const ph = (elapsed % g.dur) / g.dur;
        y = -Math.sin(ph * Math.PI) * g.hy;
      }
      el.style.transform = `translate(${x}px, ${y}px)`;

      const stalled = Math.abs(b - a) < 0.35 && pos < TRACK;   // Đứng gần như tại chỗ = đang vấp
      el.classList.toggle('stumble', stalled);
      el.classList.toggle('burst', pos / TRACK > 0.75 && (b - a) > 15);
    }

    if (elapsed >= totalMs) return finish();
    animFrame = window.requestAnimationFrame(step);
  };
  animFrame = window.requestAnimationFrame(step);
}
