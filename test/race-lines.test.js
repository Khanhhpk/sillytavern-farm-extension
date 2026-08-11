import test from 'node:test';
import assert from 'node:assert/strict';
import { EVENTS, EVENT_LINES, RUNNER_LINES, OWN_WEIGHT, EVENT_RANK, pickLine } from '../src/race-lines.js';
import { RUNNERS } from '../src/race-sim.js';

const CRY = ['Bụp bụp~', 'Bựppp!'];

/* Bộ sinh số giả: trả lần lượt các giá trị cho sẵn rồi lặp lại từ đầu.
   pickLine gọi rnd() nhiều hơn một lần nên một hằng số đơn không đủ để
   điều khiển nó tới đúng nhánh muốn kiểm. */
function stubRnd(seq) {
  let i = 0;
  return () => seq[i++ % seq.length];
}

test('test 1 — kho chung đủ dày cho mọi sự kiện', () => {
  for (const ev of EVENTS) {
    const pool = EVENT_LINES[ev];
    assert.ok(Array.isArray(pool), `thiếu kho chung cho sự kiện ${ev}`);
    assert.ok(pool.length >= 5, `sự kiện ${ev} chỉ có ${pool.length} câu, cần ít nhất 5`);
  }
});

test('test 2 — không có tên tầu gõ sai trong bảng giọng riêng', () => {
  const known = new Set(RUNNERS.map(r => r.rid));
  for (const rid of Object.keys(RUNNER_LINES)) {
    assert.ok(known.has(rid), `rid không tồn tại trong RUNNERS: ${rid}`);
  }
});

test('test 2b — không có tên sự kiện gõ sai trong bảng giọng riêng', () => {
  for (const rid of Object.keys(RUNNER_LINES)) {
    for (const ev of Object.keys(RUNNER_LINES[rid])) {
      assert.ok(EVENTS.includes(ev), `sự kiện lạ ${ev} ở tầu ${rid}`);
    }
  }
});

test('test 3 — không câu nào rỗng hay chỉ có khoảng trắng', () => {
  const all = [];
  for (const ev of Object.keys(EVENT_LINES)) all.push(...EVENT_LINES[ev]);
  for (const rid of Object.keys(RUNNER_LINES)) {
    for (const ev of Object.keys(RUNNER_LINES[rid])) all.push(...RUNNER_LINES[rid][ev]);
  }
  assert.ok(all.length > 0);
  for (const s of all) {
    assert.equal(typeof s, 'string');
    assert.ok(s.trim().length > 0, 'có câu rỗng trong kho');
  }
});

test('test 4 — luôn có câu để nói, với mọi đầu vào', () => {
  const rids = RUNNERS.map(r => r.rid).concat(['rid_khong_ton_tai', '', null, undefined]);
  const evs = EVENTS.concat(['su_kien_la', '', null, undefined]);
  for (const rid of rids) {
    for (const ev of evs) {
      for (const cry of [CRY, [], null, undefined]) {
        const s = pickLine(rid, ev, cry, stubRnd([0.1, 0.9, 0.5]));
        assert.equal(typeof s, 'string', `không trả chuỗi: ${rid} / ${ev}`);
        assert.ok(s.trim().length > 0, `trả chuỗi rỗng: ${rid} / ${ev}`);
      }
    }
  }
});

test('test 5 — tất định theo rnd', () => {
  const a = pickLine('r_slime', 'win', CRY, stubRnd([0.2, 0.7]));
  const b = pickLine('r_slime', 'win', CRY, stubRnd([0.2, 0.7]));
  assert.equal(a, b);
});

test('test 6 — cả ba tầng đều được chọn tới', () => {
  // Tầu có giọng riêng cho 'start', nên quét rnd phải chạm được cả ba nguồn câu.
  const rid = Object.keys(RUNNER_LINES).find(k => RUNNER_LINES[k].start);
  assert.ok(rid, 'không tầu nào có giọng riêng cho start — kho giọng riêng rỗng?');

  const own = new Set(RUNNER_LINES[rid].start);
  const shared = new Set(EVENT_LINES.start);
  const farm = new Set(CRY);

  let hitOwn = 0, hitShared = 0, hitFarm = 0;
  for (let i = 0; i <= 100; i++) {
    for (let j = 0; j <= 100; j++) {
      const s = pickLine(rid, 'start', CRY, stubRnd([i / 100, j / 100]));
      if (own.has(s)) hitOwn++;
      else if (shared.has(s)) hitShared++;
      else if (farm.has(s)) hitFarm++;
      else assert.fail('câu lạ không thuộc tầng nào: ' + s);
    }
  }
  assert.ok(hitOwn > 0, 'tầng giọng riêng không bao giờ được chọn');
  assert.ok(hitShared > 0, 'tầng kho chung không bao giờ được chọn');
  assert.ok(hitFarm > 0, 'tầng cry của nông trại không bao giờ được chọn');
});

test('OWN_WEIGHT nằm trong khoảng hợp lệ', () => {
  assert.ok(OWN_WEIGHT > 0 && OWN_WEIGHT < 1);
});

/* EVENT_RANK quyết định sự kiện nào được nói khi nhiều cái cùng nổ trong một
   khung hình. Thiếu một tên thì phép sort so với undefined và thứ tự ưu tiên
   hỏng âm thầm — không có gì báo. */
test('EVENT_RANK phủ đủ mọi sự kiện, không trùng điểm', () => {
  for (const ev of EVENTS) {
    assert.equal(typeof EVENT_RANK[ev], 'number', `thiếu điểm ưu tiên cho ${ev}`);
  }
  assert.equal(Object.keys(EVENT_RANK).length, EVENTS.length, 'EVENT_RANK có tên thừa');
  const scores = EVENTS.map(e => EVENT_RANK[e]);
  assert.equal(new Set(scores).size, scores.length, 'hai sự kiện trùng điểm ưu tiên');
});

test('về đích được ưu tiên hơn mọi sự kiện giữa chặng', () => {
  for (const ev of ['lead', 'burst', 'stumble', 'start']) {
    assert.ok(EVENT_RANK.win > EVENT_RANK[ev]);
    assert.ok(EVENT_RANK.last > EVENT_RANK[ev]);
  }
});

test('cry của nông trại chỉ dùng cho start, không lọt vào sự kiện khác', () => {
  const rid = 'r_slime';
  for (const ev of EVENTS.filter(e => e !== 'start')) {
    for (let i = 0; i <= 40; i++) {
      for (let j = 0; j <= 40; j++) {
        const s = pickLine(rid, ev, CRY, stubRnd([i / 40, j / 40]));
        assert.ok(!CRY.includes(s), `câu cry lọt vào sự kiện ${ev}: ${s}`);
      }
    }
  }
});
