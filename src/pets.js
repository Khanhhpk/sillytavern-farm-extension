import { now } from './state.js';
import { ctx } from './store.js';
import * as All from './all.js';
import { BLOCK_PRICE_PG, WEATHERS, TEST_MODE, DAY_MS, CROPS, GROW, MIN, REGROW, FERTS, WATER_CD, REGROW_MAX, POKE_CD, TREASURE_CD, PETS_OUT_MAX, WITCH_STAY, witchGap, SNAP_EDGE, ZONE_NAME } from './data.js';
import { mulberry32, petSVG, spriteSVG, tileURI, warmUpCache, PETS, PASSES, P, LP, PET_P } from './graphics.js';

/* ---------- Thú cưng: render động + chọc chọc (uỷ quyền listener, bong bóng trên đầu, đủ 10 phút mới thật sự rơi tiền) ---------- */
export function petBubble(el, txt) {
  el.querySelector('.pbubble')?.remove();
  const b = document.createElement('span');
  b.className = 'pbubble'; b.textContent = txt;
  el.appendChild(b);
  window.setTimeout(() => b.remove(), 1700);
}
/* #26 (sửa lần 2): hàng dưới cùng (cao bằng một ô ruộng) = tầng đi lại riêng cho loại làm việc, không chạy lên trên; các bé khác đi lang thang tự do trong toàn khu ruộng phía trên hàng dưới, có thể băng ngang qua ruộng
   v0.7①: di chuyển kiểu nhảy —— bé không thuộc nhóm bay sẽ nhích tới điểm đích bằng từng cú nhảy nhỏ (mỗi cú = xê dịch ngang tuyến tính một bước + thân bay lên hạ xuống theo parabol), mây/ma thì trượt */
export const petPos = {}, petTgt = {}, petHopT = {};            // Toạ độ / điểm đến / bộ đếm nhảy liên tiếp lúc chạy, không ghi vào save
export const WORK_BAND = 74;                                    // Chiều cao hàng dưới ≈ một ô ruộng (dành cho loại làm việc, loại đi dạo tính từ phía trên nó)
export const FLOATY = { cloudMallow: 1, ghostBlob: 1, bunny: 1 };   // Danh sách bay: không nhảy, trượt đều (#43: bé sứa xoăn nhập hội, thành bộ ba bay lơ lửng)
export const GAITS = {                                          // Dáng đi: len = độ dài một bước nhảy, dur = chu kỳ một cú nhảy (ms), hy = độ cao nhảy
  octo:      { len: 8,  dur: 260, hy: -4 },              // Bạch tuộc: bước lắt nhắt bò sát đất
  octoCream: { len: 8,  dur: 290, hy: -4 },              // Bạch tuộc kem: bò còn chậm rì hơn nữa
  _:         { len: 14, dur: 330, hy: -9 },              // Mặc định: kiểu nảy chuẩn của dòng slime
};
export const gaitOf = id => GAITS[id] || GAITS._;
export const stopHop = id => { if (petHopT[id]) { window.clearTimeout(petHopT[id]); delete petHopT[id]; } };
export function petSpot(id) {
  const ov = All.$id('mascots'), W = ov.clientWidth, H = ov.clientHeight;
  if (PETS[id] && PETS[id].job) {                        // Loại làm việc (sửa lần 3): đứng cố định thành hàng ở góc dưới phải, nhún nhảy tại chỗ chứ không đi
    const workers = ctx.S.petsOut.filter(p => PETS[p] && PETS[p].job);
    const anchor = W - 64 - Math.max(0, workers.indexOf(id)) * 62;
    return { x: Math.max(4, anchor - 10 + Math.random() * 20), y: Math.random() * 4 };
  }
  const x = 4 + Math.random() * Math.max(20, W - 64);
  return { x, y: WORK_BAND + 6 + Math.random() * Math.max(20, H - WORK_BAND - 70) };
}
export function placePet(el, p, instant) {                      // Đặt vị trí: instant = dịch chuyển tức thì; nếu không thì trượt đều (dành riêng cho bé bay)
  if (instant) el.style.transitionProperty = 'transform';
  else {
    const old = petPos[el.dataset.pet] || p;
    const dist = Math.hypot(p.x - old.x, p.y - old.y);
    const dur = dist < 40 ? .5 : Math.min(11, Math.max(3, dist / 18));
    el.style.transitionProperty = 'transform, left, bottom';
    el.style.transitionDuration = '.12s, ' + dur + 's, ' + dur + 's';
    el.style.transitionTimingFunction = 'ease, linear, ease';
    el.classList.toggle('flip', p.x < old.x);
  }
  el.style.left = p.x + 'px'; el.style.bottom = p.y + 'px';
  petPos[el.dataset.pet] = p;
}
export function hopStep(el) {                                   // Một cú nhảy: nhích một bước về phía đích, tới nơi thì nghỉ
  const id = el.dataset.pet;
  if (!el.isConnected) { stopHop(id); return; }
  const cur = petPos[id], tgt = petTgt[id], g = gaitOf(id);
  if (!cur || !tgt || Math.hypot(tgt.x - cur.x, tgt.y - cur.y) < 3) {
    delete petTgt[id]; el.classList.remove('walk'); stopHop(id);
    const cb = petArrive[id]; delete petArrive[id]; if (cb) cb();   // v0.7③: callback khi tới nơi (dùng cho việc dàn cảnh tiểu phẩm)
    return;
  }
  const dx = tgt.x - cur.x, dy = tgt.y - cur.y, dist = Math.hypot(dx, dy);
  const len = Math.min(g.len, dist);
  const p = { x: cur.x + dx / dist * len, y: cur.y + dy / dist * len };
  el.classList.toggle('flip', dx < 0);
  el.classList.add('walk');
  el.style.setProperty('--hopd', g.dur + 'ms');
  el.style.setProperty('--hy', g.hy + 'px');
  el.style.transitionProperty = 'transform, left, bottom';
  el.style.transitionDuration = '.12s, ' + g.dur + 'ms, ' + g.dur + 'ms';
  el.style.transitionTimingFunction = 'ease, linear, linear';
  el.style.left = p.x + 'px'; el.style.bottom = p.y + 'px';
  petPos[id] = p;
  petHopT[id] = window.setTimeout(() => hopStep(el), g.dur);
}
export function moveTo(el, p) {                                 // Lên đường tới p: bé bay thì trượt, còn lại thì nhảy liên tiếp
  const id = el.dataset.pet;
  if (FLOATY[id]) return placePet(el, p, false);
  petTgt[id] = p;
  if (!petHopT[id]) hopStep(el);
}
/* v0.7②: ngủ —— bé đi dạo rảnh mãi rồi nằm bẹp xuống thả chữ Z (bé làm việc đang trong ca thì không ngủ); chọc = giật mình tỉnh dậy kêu "?!", không ai chọc thì cũng tự tỉnh */
export const petSleepT = {};
export function sleepPet(el) {
  const id = el.dataset.pet;
  el.classList.add('sleep');
  el.insertAdjacentHTML('beforeend', '<span class="zzz">Z</span><span class="zzz z2">z</span>');
  petSleepT[id] = window.setTimeout(() => wakePet(el, false), 40000 + Math.random() * 40000);
}
export function wakePet(el, startled) {
  const id = el.dataset.pet;
  if (petSleepT[id]) { window.clearTimeout(petSleepT[id]); delete petSleepT[id]; }
  el.classList.remove('sleep');
  el.querySelectorAll('.zzz').forEach(z => z.remove());
  const mate = pileWith[id];                             // Bạn ngủ chung: một bé bị đánh thức thì bé kia cũng bật dậy theo
  delete pileWith[id];
  if (mate) {
    delete pileWith[mate];
    const me = petEl(mate);
    if (startled && me && me.classList.contains('sleep')) window.setTimeout(() => wakePet(me, true), 260);
  }
  if (startled) petBubble(el, '?!');
}
/* v0.7③: kho tương tác trứng phục sinh —— tiểu phẩm ngẫu nhiên tần suất thấp (đụng đầu nảy ra / lây ngáp / ngủ chồng đống / rượt đuổi):
   chọn diễn viên rồi khoá lại (tuần tra không giành người), diễn xong ai về nhà nấy; render lại bảng = tắt đèn giải tán; cùng một vở không diễn liên tiếp */
export const petArrive = {};                                    // Callback khi nhảy tới nơi
export const pileWith = {};                                     // Bảng ghép cặp bạn ngủ chung
export const petTouch = {}, touchBase = now();                  // Thời điểm bị chọc gần nhất (bé làm việc 5 phút không ai đoái hoài → cho phép ngủ gật)
export let scene = null, lastScene = '';
export let nextSceneAt = now() + (TEST_MODE ? 30 * 1000 : 45 * MIN);
export const sceneBusy = id => !!(scene && scene.ids.indexOf(id) >= 0);
export const sceneTimer = (fn, ms) => { if (scene) scene.timers.push(window.setTimeout(fn, ms)); };
export function endScene() { if (!scene) return; scene.timers.forEach(t => window.clearTimeout(t)); scene = null; }
export function petEl(id) { return sh.querySelector('#mascots .pet[data-pet="' + id + '"]'); }
export function walkTo(el, p, cb) {                             // Dàn vị trí: tới nơi thì gọi cb (bé bay thì ước lượng theo thời gian trượt)
  const id = el.dataset.pet;
  if (FLOATY[id]) {
    const old = petPos[id] || p;
    const dur = Math.min(11, Math.max(3, Math.hypot(p.x - old.x, p.y - old.y) / 18));
    placePet(el, p, false);
    if (cb) sceneTimer(cb, dur * 1000 + 80);
    return;
  }
  petTgt[id] = p;
  if (cb) petArrive[id] = cb;
  if (!petHopT[id]) hopStep(el);
}
export function tryScene() {
  const idle = [], asleep = [], workIdle = [];
  sh.querySelectorAll('#mascots .pet').forEach(el => {
    const id = el.dataset.pet;
    if (petTgt[id]) return;                              // Bé đang trên đường thì không kéo vào đoàn kịch
    if (PETS[id].job) { if (!el.classList.contains('sleep')) workIdle.push(id); return; }   // Bé làm việc chỉ vào kho ngáp (đang trong ca thì ngáp tại chỗ chứ không đi)
    (el.classList.contains('sleep') ? asleep : idle).push(id);
  });
  const pool = [];
  if (idle.length >= 2) pool.push('bump');
  if (idle.length + workIdle.length >= 2) pool.push('yawn');
  if (idle.filter(i => !FLOATY[i]).length >= 2) pool.push('chase');
  if (idle.length >= 1 && asleep.length >= 1) pool.push('pile');
  const picks = pool.filter(a => a !== lastScene);
  if (!picks.length) return;                             // Không gom đủ diễn viên, nhịp sau thử lại (không tốn hồi chiêu)
  const act = picks[Math.floor(Math.random() * picks.length)];
  lastScene = act;
  nextSceneAt = now() + (TEST_MODE ? 45 * 1000 + Math.random() * 90 * 1000 : 60 * MIN + Math.random() * 120 * MIN);
  const shuffle = a => a.sort(() => Math.random() - .5);
  const ov = All.$id('mascots'), W = ov.clientWidth, H = ov.clientHeight;
  const clampX = x => Math.max(4, Math.min(W - 60, x));
  const midY = () => WORK_BAND + 20 + Math.random() * Math.max(20, H - WORK_BAND - 100);
  if (act === 'bump') {                                  // Đụng đầu nảy ra: đâm sầm vào nhau, cả hai bật ra, mỗi bé kêu một tiếng
    const [a, b] = shuffle(idle.slice());
    const ea = petEl(a), eb = petEl(b);
    const mx = clampX(60 + Math.random() * Math.max(40, W - 180)), my = midY();
    scene = { ids: [a, b], timers: [] };
    let met = 0;
    const meet = () => {
      if (++met < 2 || !scene) return;
      petBubble(ea, PETS[a].cry[0]); petBubble(eb, PETS[b].cry[0]);
      walkTo(ea, { x: clampX(petPos[a].x - 32), y: petPos[a].y });
      walkTo(eb, { x: clampX(petPos[b].x + 32), y: petPos[b].y });
      sceneTimer(endScene, 1600);
    };
    walkTo(ea, { x: clampX(mx - 26), y: my }, meet);
    walkTo(eb, { x: clampX(mx + 26), y: my }, meet);
    sceneTimer(endScene, 30000);                         // Giải tán dự phòng
  } else if (act === 'yawn') {                           // Lây ngáp: một bé ngáp, bé kia ngáp theo, cả hai cùng ngủ (bé làm việc cũng bị lây)
    const [a, b] = shuffle(idle.concat(workIdle));
    const ea = petEl(a), eb = petEl(b);
    scene = { ids: [a, b], timers: [] };
    petBubble(ea, '(ngáp…)');
    sceneTimer(() => petBubble(eb, '(ngáp theo…)'), 1300);
    sceneTimer(() => sleepPet(ea), 2500);
    sceneTimer(() => { sleepPet(eb); pileWith[a] = b; pileWith[b] = a; endScene(); }, 3300);
  } else if (act === 'pile') {                           // Ngủ chồng đống: mò tới nằm cạnh bé đang ngủ để ngủ cùng, giật mình thì cùng dậy
    const b = asleep[Math.floor(Math.random() * asleep.length)];
    const a = idle[Math.floor(Math.random() * idle.length)];
    const ea = petEl(a), eb = petEl(b);
    scene = { ids: [a, b], timers: [] };
    const side = petPos[b].x > 70 ? -1 : 1;
    walkTo(ea, { x: clampX(petPos[b].x + side * 34), y: petPos[b].y }, () => {
      sleepPet(ea); pileWith[a] = b; pileWith[b] = a; endScene();
    });
    sceneTimer(endScene, 30000);
  } else if (act === 'chase') {                          // Rượt đuổi: ba chặng đi về, bé bị đuổi thỉnh thoảng ngoái lại, cuối cùng cắt đuôi được
    const hop = shuffle(idle.filter(i => !FLOATY[i]));
    const a = hop[0], b = hop[1];                        // a đuổi b
    const ea = petEl(a), eb = petEl(b);
    scene = { ids: [a, b], timers: [] };
    let leg = 0;
    const run = () => {
      if (!scene) return;
      if (++leg > 3) { petBubble(eb, '(phù… cắt đuôi rồi)'); return endScene(); }
      const p = { x: clampX(20 + Math.random() * Math.max(40, W - 100)), y: midY() };
      walkTo(eb, p);
      sceneTimer(() => walkTo(ea, { x: clampX(p.x - 22), y: p.y }, run), 380);
    };
    petBubble(ea, '(thình thịch thịch!)'); petBubble(eb, '(oaa!)');
    run();
    sceneTimer(endScene, 45000);
  }
}
export function renderPets() {
  endScene();                                            // Dựng lại DOM = tắt đèn giải tán
  Object.keys(petHopT).forEach(stopHop);                 // Cắt các cú nhảy đang dở, tránh bộ đếm ma
  for (const k in petTgt) delete petTgt[k];
  for (const k in petArrive) delete petArrive[k];
  for (const k in pileWith) delete pileWith[k];
  Object.keys(petSleepT).forEach(k => { window.clearTimeout(petSleepT[k]); delete petSleepT[k]; });
  All.$id('mascots').innerHTML = ctx.S.petsOut.map(id => PETS[id]
    ? `<span class="pet" data-pet="${id}" title="Chọc chọc ${PETS[id].name}"><span class="pbody" style="animation-delay:-${(Math.random() * 1.8).toFixed(2)}s">${petSVG(id, 48)}</span></span>` : '').join('');
  sh.querySelectorAll('#mascots .pet').forEach(el => {
    const id = el.dataset.pet;
    placePet(el, petPos[id] || petSpot(id), true);
  });
}
export let wander = window.setInterval(() => {                  // Nhịp tuần tra: cứ 7s lại giao điểm đến / ru ngủ / mở tiểu phẩm cho các bé đang rảnh
  if (!ctx.win || !ctx.win.classList.contains('open')) return;           // Tối ưu: Dừng tuần tra và tính toán vị trí khi bảng bị ẩn
  if (!scene && now() >= nextSceneAt) tryScene();
  sh.querySelectorAll('#mascots .pet').forEach(el => {
    const id = el.dataset.pet;
    if (sceneBusy(id) || petTgt[id] || el.classList.contains('sleep')) return;   // Đang diễn / đang đi / đang ngủ thì đừng làm phiền
    if (!PETS[id].job && Math.random() < 0.08) return sleepPet(el);   // Rảnh lâu quá thì chợp mắt một giấc
    if (PETS[id].job && now() - (petTouch[id] || touchBase) > 5 * MIN && Math.random() < 0.08) return sleepPet(el);   // Bé làm việc 5 phút không ai đoái hoài thì đứng ngủ (tưới tự động không bị ảnh hưởng, mây ngủ vẫn mưa nhé)
    if (Math.random() < 0.35) moveTo(el, petSpot(id));
  });
}, 7000);
All.$id('mascots').addEventListener('click', e => {
  const el = e.target.closest('.pet'); if (!el) return;
  const id = el.dataset.pet, def = PETS[id];
  if (!def) return;
  petTouch[id] = now();                                  // Ghi lại một lần "được để ý" (dùng để xét ngủ gật của bé làm việc)
  if (el.classList.contains('sleep')) return wakePet(el, true);   // Bé đang ngủ: chọc = giật mình tỉnh, cú này không tính là chọc chọc
  const cry = def.cry[Math.floor(Math.random() * def.cry.length)];
  if (def.job === 'plant') return petPlant(el, cry);    // Nghề tốn tiền: chọc để kích hoạt làm hàng loạt
  if (def.job === 'fert') return petFert(el, cry);
  if (def.job === 'harvest') return petHarvest(el, cry);// #27: thu hoạch cũng đổi sang chọc mới chạy, khỏi quay lại mà ngơ ngác
  if (def.job) return petBubble(el, cry);               // Loại tưới nước: bị động trong ca, chọc = chào hỏi
  let txt = cry;                                        // Loại tìm kho báu: chọc chọc là rơi tiền
  if (now() - (ctx.S.petPoke[id] || 0) >= POKE_CD) {
    ctx.S.petPoke[id] = now();
    const gain = 1 + Math.floor(Math.random() * 5);
    ctx.S.coins += gain;
    txt += id === 'prismBlob' ? ' rũ ra ' + gain + ' G ánh vụn!'
      : id === 'starBell' ? ' lắc ra ' + gain + ' G bụi sao!'
      : ' rơi ra ' + gain + ' G!';                        // Loại sản xuất có lời thoại riêng khi bị chọc (mảnh vỡ vẫn theo vòng tìm kho báu 2h, chọc không ra đâu nhé)
    save(); renderStatus();
  }
  petBubble(el, txt);
});
export function petPlant(el, cry) {                            // Bé mầm sương: chọc một cái là gieo khắp ruộng (#42: mỗi lần đều chọn lại, chỉ liệt kê thứ trồng được ở trang này)
  const empty = [];
  for (let pi = 0; pi < curBlocks() * 4; pi++) if (!curPlots()[pi].crop) empty.push(pi);
  if (!empty.length) return petBubble(el, cry + ' hết chỗ trống rồi');
  const usable = {};
  Object.keys(ctx.S.seeds).forEach(id => {
    if (!(ctx.S.seeds[id] > 0) || !CROPS[id]) return;
    if (id === 'mystery' || (CROPS[id].zone || 1) === ctx.S.page) usable[id] = ctx.S.seeds[id];
  });
  if (!Object.keys(usable).length) return petBubble(el, cry + ' không có hạt nào trồng được ở ' + ZONE_NAME[ctx.S.page] + '…');
  pickFrom('Bé mầm sương: lần này trồng gì đây?', usable, x => CROPS[x].name, sid => {
    let k = 0;
    for (const pi of empty) { if (!(ctx.S.seeds[sid] > 0)) break; if (plant(pi, sid)) k++; }
    const pe = sh.querySelector('.pet[data-pet="dewSprout"]') || el;
    petBubble(pe, cry + ' đã trồng ' + k + ' ô ' + CROPS[sid].name + (k < empty.length ? ' (hết hạt giống rồi)' : '!'));
  });
}
export function petHarvest(el, cry) {                          // Bé sứa xoăn: chọc một cái là xúc tu cuộn rau chín vào balo (#27; v0.8 chỉ thu ở trang hiện tại)
  const got = {};
  curPlots().forEach((p, pi) => {
    const c = p.crop;
    if (!c || now() < c.matureAt) return;
    const r = harvest(pi, true);
    if (r) got[r.name] = (got[r.name] || 0) + r.n;
  });
  const ks = Object.keys(got);
  if (!ks.length) return petBubble(el, cry + ' chưa có rau nào chín');
  petBubble(el, cry + ' cuộn về được: ' + ks.map(k => k + '×' + got[k]).join(', '));
}
export function petFert(el, cry) {                             // Bé bí ẩn: chọc một cái là bón phân hàng loạt (#42: mỗi lần đều chọn lại)
  pickFrom('Bé bí ẩn: dùng loại phân nào?', ctx.S.ferts, x => FERTS[x].name, fid => {
    let k = 0;
    for (let pi = 0; pi < curBlocks() * 4 && ctx.S.ferts[fid] > 0; pi++) {
      const c = curPlots()[pi].crop;
      if (!c || now() >= c.matureAt || (c.fertUsed && c.fertUsed[fid])) continue;
      if (fertilize(pi, fid, true)) k++;
    }
    const pe = sh.querySelector('.pet[data-pet="batBlob"]') || el;
    petBubble(pe, cry + (k ? ' đã bón ' + k + ' ô ' + FERTS[fid].name + '!' : ' không có ô nào cần bón phân'));
  });
}



export function initPets() {
  wander = window.setInterval(() => {                  // Nhịp tuần tra: cứ 7s lại giao điểm đến / ru ngủ / mở tiểu phẩm cho các bé đang rảnh
  if (!ctx.win || !ctx.win.classList.contains('open')) return;           // Tối ưu: Dừng tuần tra và tính toán vị trí khi bảng bị ẩn
  if (!scene && now() >= nextSceneAt) tryScene();
  sh.querySelectorAll('#mascots .pet').forEach(el => {
    const id = el.dataset.pet;
    if (sceneBusy(id) || petTgt[id] || el.classList.contains('sleep')) return;   // Đang diễn / đang đi / đang ngủ thì đừng làm phiền
    if (!PETS[id].job && Math.random() < 0.08) return sleepPet(el);   // Rảnh lâu quá thì chợp mắt một giấc
    if (PETS[id].job && now() - (petTouch[id] || touchBase) > 5 * MIN && Math.random() < 0.08) return sleepPet(el);   // Bé làm việc 5 phút không ai đoái hoài thì đứng ngủ (tưới tự động không bị ảnh hưởng, mây ngủ vẫn mưa nhé)
    if (Math.random() < 0.35) moveTo(el, petSpot(id));
  });
}, 7000);
All.$id('mascots').addEventListener('click', e => {
  const el = e.target.closest('.pet'); if (!el) return;
  const id = el.dataset.pet, def = PETS[id];
  if (!def) return;
  petTouch[id] = now();                                  // Ghi lại một lần "được để ý" (dùng để xét ngủ gật của bé làm việc)
  if (el.classList.contains('sleep')) return wakePet(el, true);   // Bé đang ngủ: chọc = giật mình tỉnh, cú này không tính là chọc chọc
  const cry = def.cry[Math.floor(Math.random() * def.cry.length)];
  if (def.job === 'plant') return petPlant(el, cry);    // Nghề tốn tiền: chọc để kích hoạt làm hàng loạt
  if (def.job === 'fert') return petFert(el, cry);
  if (def.job === 'harvest') return petHarvest(el, cry);// #27: thu hoạch cũng đổi sang chọc mới chạy, khỏi quay lại mà ngơ ngác
  if (def.job) return petBubble(el, cry);               // Loại tưới nước: bị động trong ca, chọc = chào hỏi
  let txt = cry;                                        // Loại tìm kho báu: chọc chọc là rơi tiền
  if (now() - (ctx.S.petPoke[id] || 0) >= POKE_CD) {
    ctx.S.petPoke[id] = now();
    const gain = 1 + Math.floor(Math.random() * 5);
    ctx.S.coins += gain;
    txt += id === 'prismBlob' ? ' rũ ra ' + gain + ' G ánh vụn!'
      : id === 'starBlob' ? ' rơi ra ' + gain + ' G ánh sao!'
      : ' rơi ra ' + gain + ' G';
    save(); All.renderStatus();
  }
  petBubble(el, txt);
  wakePet(el, true);
});
}
