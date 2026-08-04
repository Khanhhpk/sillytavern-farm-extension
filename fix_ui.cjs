const fs = require('fs');
let text = fs.readFileSync('src/ui.js', 'utf8');

const chunk1 = `ctx.ui.addEventListener('click', e => {                     // Bấm bất cứ đâu ngoài pager = thu quả cầu lại (giai đoạn capture, chạy trước các xử lý click khác)
  const pager = $id('pager');
  if (pager && pager.classList.contains('open') && !e.target.closest('#pager')) pager.classList.remove('open');
}, true);
$id('pager') && $id('pager').addEventListener('click', e => {
  const pager = $id('pager');
  const t = e.target.closest('[data-pg]');
  if (!t) { pager.classList.toggle('open'); return; }    // Bấm quả cầu = bung ra, bấm chỗ trống trên thanh = thu lại
  const pg = +t.dataset.pg;
  if (!pageUnlocked(pg)) return toast('Cần mua vé ' + (pg === 2 ? 'vùng nước' : 'khu mỏ') + ' ở cửa hàng trước đã');
  if (pg === ctx.S.page) { pager.classList.remove('open'); return; }   // Bấm đúng trang hiện tại = tiện tay thu lại
  ctx.S.page = pg; save();
  mode = null;                                          // Đổi trang thì thoát chế độ công cụ, tránh thao tác nhầm sang trang khác
  pager.classList.remove('open');                        // Chọn xong thì tự co về quả cầu
  applyPageSkin(); renderPager(); renderPlots(); renderStatus(); renderToolbar();
});
/* Phương án 3: vuốt trái phải ở khu ruộng để đổi trang (dùng thử song song với thanh viên nang của phương án 2; nếu bỏ thì xoá cả khối này) */
export let swX = null, swY = null;
fieldEl.addEventListener('touchstart', e => { if (e.touches.length === 1) { swX = e.touches[0].clientX; swY = e.touches[0].clientY; } }, { passive: true });
fieldEl.addEventListener('touchend', e => {
  if (swX == null) return;
  const dx = e.changedTouches[0].clientX - swX, dy = e.changedTouches[0].clientY - swY;
  swX = swY = null;
  if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.5) return;   // Phải là vuốt ngang chiếm ưu thế mới tính là lật trang
  const dir = dx < 0 ? 1 : -1;                          // Vuốt sang trái = trang sau
  let pg = ctx.S.page + dir;
  while (pg >= 1 && pg <= 3 && !pageUnlocked(pg)) pg += dir;   // Bỏ qua các trang chưa mở khoá
  if (pg < 1 || pg > 3 || pg === ctx.S.page) return;
  ctx.S.page = pg; save();
  mode = null;                                          // Đổi trang thì thoát chế độ công cụ (giống như bấm tab đổi trang)
  applyPageSkin(); renderPager(); renderPlots(); renderStatus(); renderToolbar();
  toast(pg === 1 ? 'Về đồng cỏ~' : pg === 2 ? 'Tới vùng nước~' : 'Tới khu mỏ~');
}, { passive: true });`;

const chunk2 = `(function () {                                        // ctx.Sửa #13: trang trí chỉ ở phần đất trống hai bên (màn hẹp thì dời xuống dải xanh dưới đáy)
  const drnd = mulberry32(20260717);
  function addDeco(o, cls, pos) {
    const el = document.createElement('span');
    el.className = cls;
    el.style.cssText = 'position:absolute;' + pos;
    el.innerHTML = spriteSVG(o.n, o.s | 0);
    decoLayer.appendChild(el);
  }
  /* #44: bụi cây nghỉ hưu —— cả ba trang đều không giữ (chen vào trang 2/3 quá lạc quẻ, cỏ hoa trên thảm cỏ trang 1 là đủ) */
  /* Màn rộng: hoa cỏ hồng ở phần đất trống hai bên */
  const side = [];
  for (let i = 0; i < 3; i++) side.push({ n: 'pinkgrass', s: 28 + drnd() * 8, x: 0.4 + drnd() * 1.5, y: 8 + i * 17 + drnd() * 6 });
  for (let i = 0; i < 2; i++) side.push({ n: 'pinkgrass', s: 28 + drnd() * 8, x: 90 + drnd() * 3, y: 24 + i * 17 + drnd() * 6 });
  side.forEach(o => addDeco(o, 'dside', \`left:\${o.x}%;top:\${o.y}%;\`));
  /* Màn hẹp: hoa cỏ hồng dời xuống dải xanh dưới đáy */
  for (let i = 0; i < 3; i++) addDeco({ n: 'pinkgrass', s: 28 + drnd() * 6 }, 'dbot', \`left:\${9 + i * 16 + drnd() * 5}%;bottom:4px;\`);
})();`;

text = text.replace(chunk1, 'export let swX = null, swY = null;');
text = text.replace(chunk2, '');

text += `\n\nexport function initUI() {\n`;
text += chunk1.replace('export let swX = null, swY = null;', '  swX = null; swY = null;') + '\n';
text += chunk2 + '\n';
text += `}\n`;

fs.writeFileSync('src/ui.js', text);
console.log('Fixed ui.js accurately');
